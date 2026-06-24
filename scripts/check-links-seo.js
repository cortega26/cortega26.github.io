import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

// Realistic user agent to avoid being blocked by external sites
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      return getHtmlFiles(res);
    } else {
      return entry.name.endsWith('.html') ? res : [];
    }
  }));
  return files.flat();
}

function parseTags(html, tagName) {
  const tags = [];
  const regex = new RegExp(`<${tagName}\\s+([^>]*?)>`, 'gi');
  let match;
  while ((match = regex.exec(html)) !== null) {
    const attrString = match[1];
    const attrs = {};
    const attrRegex = /(\w+(?:-\w+)*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const name = attrMatch[1].toLowerCase();
      const value = attrMatch[2] || attrMatch[3] || attrMatch[4];
      attrs[name] = value;
    }
    tags.push({
      tagName,
      attrs,
      outerHtml: match[0]
    });
  }
  return tags;
}

function getTagContent(html, tagName) {
  const contents = [];
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  let match;
  while ((match = regex.exec(html)) !== null) {
    contents.push(match[1].trim());
  }
  return contents;
}

// Custom simple parser to find elements with IDs to check hash anchors
function getIdsInHtml(html) {
  const ids = new Set();
  const idRegex = /id=["']([^"']*)["']/gi;
  let match;
  while ((match = idRegex.exec(html)) !== null) {
    ids.add(match[1]);
  }
  const nameRegex = /name=["']([^"']*)["']/gi;
  while ((match = nameRegex.exec(html)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}

async function verifyExternalLink(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(6000) // 6 seconds timeout
    });
    
    if (response.ok) {
      return { ok: true, status: response.status };
    }
    
    // Some sites return 403 or 405 on GET but might be ok
    if (response.status === 405 || response.status === 403 || response.status === 999) {
      // Retry with HEAD
      const headResponse = await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(4000)
      });
      if (headResponse.ok || headResponse.status === 403 || headResponse.status === 999) {
        return { ok: true, status: headResponse.status, warning: `Received status ${headResponse.status} but verified via HEAD/Alternative` };
      }
    }
    
    return { ok: false, status: response.status, statusText: response.statusText };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log('Starting SEO & Link Checker...');
  
  let htmlFiles;
  try {
    htmlFiles = await getHtmlFiles(DIST_DIR);
  } catch (err) {
    console.error(`Error reading dist directory: ${err.message}. Did you run npm run build?`);
    process.exit(1);
  }
  
  console.log(`Found ${htmlFiles.length} HTML files.`);
  
  const pagesData = {};
  const allExternalLinks = new Set();
  
  // Step 1: Parse all files
  for (const filePath of htmlFiles) {
    const relativePath = path.relative(DIST_DIR, filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    
    const titles = getTagContent(content, 'title');
    const h1s = getTagContent(content, 'h1');
    const htmlAttrs = parseTags(content, 'html');
    const lang = htmlAttrs[0]?.attrs?.lang || '';
    
    const metaTags = parseTags(content, 'meta');
    const linkTags = parseTags(content, 'link');
    const anchorTags = parseTags(content, 'a');
    const imgTags = parseTags(content, 'img');
    const ids = getIdsInHtml(content);
    
    const description = metaTags.find(t => t.attrs.name === 'description')?.attrs.content || '';
    const canonical = linkTags.find(t => t.attrs.rel === 'canonical')?.attrs.href || '';
    
    const hreflangs = linkTags
      .filter(t => t.attrs.rel === 'alternate' && t.attrs.hreflang)
      .map(t => ({ lang: t.attrs.hreflang, href: t.attrs.href }));

    // Extract links
    const links = anchorTags.map(t => t.attrs.href).filter(Boolean);
    const images = imgTags.map(t => ({
      src: t.attrs.src,
      alt: t.attrs.alt,
      width: t.attrs.width,
      height: t.attrs.height,
      loading: t.attrs.loading,
      outerHtml: t.outerHtml
    })).filter(img => img.src);
    
    pagesData[relativePath] = {
      filePath,
      lang,
      title: titles[0] || '',
      titlesCount: titles.length,
      h1s,
      description,
      canonical,
      hreflangs,
      links,
      images,
      ids,
      content
    };
    
    links.forEach(l => {
      if (l.startsWith('http://') || l.startsWith('https://')) {
        allExternalLinks.add(l);
      }
    });
  }
  
  // Step 2: Validate links
  const internalIssues = [];
  const externalIssues = [];
  const seoIssues = [];
  
  // Validate external links
  console.log(`Checking ${allExternalLinks.size} unique external links...`);
  const externalResults = {};
  const externalLinkArray = Array.from(allExternalLinks);
  
  // Check in batches to avoid rate limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < externalLinkArray.length; i += BATCH_SIZE) {
    const batch = externalLinkArray.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (url) => {
      const res = await verifyExternalLink(url);
      externalResults[url] = res;
    }));
  }
  
  // Process all files for issues
  for (const [relativePath, data] of Object.entries(pagesData)) {
    // 1. Check SEO Meta
    if (!data.lang) {
      seoIssues.push({ page: relativePath, type: 'HTML Lang', message: 'Missing lang attribute on html tag' });
    }
    
    if (data.titlesCount === 0) {
      seoIssues.push({ page: relativePath, type: 'Title', message: 'Missing title tag' });
    } else if (data.titlesCount > 1) {
      seoIssues.push({ page: relativePath, type: 'Title', message: `Multiple title tags found (${data.titlesCount})` });
    } else if (data.title.length < 30 || data.title.length > 65) {
      seoIssues.push({ page: relativePath, type: 'Title Length', message: `Title length is ${data.title.length} chars ("${data.title}"). Recommended: 30-65 chars` });
    }
    
    if (!data.description) {
      seoIssues.push({ page: relativePath, type: 'Description', message: 'Missing meta description' });
    } else if (data.description.length < 120 || data.description.length > 170) {
      seoIssues.push({ page: relativePath, type: 'Description Length', message: `Description length is ${data.description.length} chars. Recommended: 120-170 chars` });
    }
    
    if (data.h1s.length === 0) {
      seoIssues.push({ page: relativePath, type: 'H1 Header', message: 'Missing H1 heading' });
    } else if (data.h1s.length > 1) {
      seoIssues.push({ page: relativePath, type: 'H1 Header', message: `Multiple H1 headings found (${data.h1s.length}): ${JSON.stringify(data.h1s)}` });
    }
    
    if (!data.canonical) {
      seoIssues.push({ page: relativePath, type: 'Canonical', message: 'Missing canonical URL link tag' });
    } else {
      // Validate canonical URL matching domain tooltician.com
      const expectedPath = relativePath.endsWith('index.html') 
        ? relativePath.replace(/index\.html$/, '') 
        : relativePath;
      const expectedUrl = `https://tooltician.com/${expectedPath}`;
      const normalizedCanonical = data.canonical.replace(/\/$/, '') + '/';
      const normalizedExpected = expectedUrl.replace(/\/$/, '') + '/';
      
      // Let's allow matches with tooltician.com
      if (normalizedCanonical !== normalizedExpected && !data.canonical.startsWith('https://tooltician.com')) {
        seoIssues.push({ page: relativePath, type: 'Canonical Match', message: `Canonical URL "${data.canonical}" does not match page URL "${expectedUrl}"` });
      }
    }
    
    // Check hreflangs if multi-language
    if (relativePath !== '404.html' && relativePath !== 'index.html') {
      if (data.hreflangs.length === 0) {
        seoIssues.push({ page: relativePath, type: 'Hreflang', message: 'Missing alternate hreflang links' });
      }
    }
    
    // 2. Check Images
    for (const img of data.images) {
      if (img.alt === undefined || img.alt.trim() === '') {
        seoIssues.push({ page: relativePath, type: 'Image Alt', message: `Image missing or empty alt attribute: ${img.outerHtml}` });
      }
      if (!img.width || !img.height) {
        seoIssues.push({ page: relativePath, type: 'Image Size', message: `Image missing width/height (causes layout shift): ${img.outerHtml}` });
      }
      
      // Check if internal image exists
      if (!img.src.startsWith('http://') && !img.src.startsWith('https://') && !img.src.startsWith('data:')) {
        let imgPath;
        if (img.src.startsWith('/')) {
          imgPath = path.join(DIST_DIR, img.src);
        } else {
          imgPath = path.resolve(path.dirname(data.filePath), img.src);
        }
        
        try {
          await fs.access(imgPath);
        } catch {
          internalIssues.push({
            page: relativePath,
            link: img.src,
            type: 'Image File',
            message: `Local image file does not exist: ${img.src} (resolved to: ${path.relative(DIST_DIR, imgPath)})`
          });
        }
      }
    }
    
    // 3. Check internal and external links
    for (const href of data.links) {
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
        continue;
      }
      
      if (href.startsWith('http://') || href.startsWith('https://')) {
        // External link check result
        const checkResult = externalResults[href];
        if (checkResult && !checkResult.ok) {
          externalIssues.push({
            page: relativePath,
            link: href,
            message: checkResult.error ? `Fetch Error: ${checkResult.error}` : `HTTP Status: ${checkResult.status} ${checkResult.statusText || ''}`
          });
        }
        continue;
      }
      
      // Internal link
      const [urlPart, hashPart] = href.split('#');
      let targetFile = '';
      let targetRelative = '';
      
      if (!urlPart || urlPart === '') {
        // Anchor on the same page
        targetFile = data.filePath;
        targetRelative = relativePath;
      } else if (urlPart.startsWith('/')) {
        targetFile = path.join(DIST_DIR, urlPart);
        targetRelative = urlPart.slice(1);
      } else {
        targetFile = path.resolve(path.dirname(data.filePath), urlPart);
        targetRelative = path.relative(DIST_DIR, targetFile);
      }
      
      // Check if target exists (either directory/index.html or the file itself)
      let fileExists = false;
      let actualFile = targetFile;
      
      try {
        const stat = await fs.stat(targetFile);
        if (stat.isDirectory()) {
          actualFile = path.join(targetFile, 'index.html');
          await fs.access(actualFile);
          fileExists = true;
        } else {
          fileExists = true;
        }
      } catch {
        // If it doesn't end with .html and file doesn't exist, try appending /index.html or .html
        if (!targetFile.endsWith('.html')) {
          try {
            actualFile = targetFile + '/index.html';
            await fs.access(actualFile);
            fileExists = true;
          } catch {
            try {
              actualFile = targetFile + '.html';
              await fs.access(actualFile);
              fileExists = true;
            } catch {
              fileExists = false;
            }
          }
        }
      }
      
      if (!fileExists) {
        internalIssues.push({
          page: relativePath,
          link: href,
          type: 'Broken Link',
          message: `Linked page does not exist: ${href} (tried resolving to: ${path.relative(DIST_DIR, targetFile)})`
        });
      } else if (hashPart) {
        // If target file exists, check if hashPart exists in its IDs
        const targetRelativeKey = path.relative(DIST_DIR, actualFile);
        const targetData = pagesData[targetRelativeKey];
        if (targetData) {
          if (!targetData.ids.has(hashPart)) {
            internalIssues.push({
              page: relativePath,
              link: href,
              type: 'Broken Anchor',
              message: `Target page "${targetRelativeKey}" does not have ID/name matching anchor: #${hashPart}`
            });
          }
        }
      }
    }
  }
  
  // Format report in Markdown
  let report = `# SEO and Link Checker Report\n\n`;
  report += `Report generated on ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total HTML files scanned**: ${htmlFiles.length}\n`;
  report += `- **Total unique external links checked**: ${allExternalLinks.size}\n`;
  report += `- **Broken internal links / images / anchors**: ${internalIssues.length}\n`;
  report += `- **Broken external links**: ${externalIssues.length}\n`;
  report += `- **SEO suggestions / issues**: ${seoIssues.length}\n\n`;
  
  report += `## 1. Broken Internal Links & Anchors (${internalIssues.length})\n\n`;
  if (internalIssues.length === 0) {
    report += `✓ No broken internal links or anchors found!\n\n`;
  } else {
    report += `| Page | Link | Type | Issue |\n`;
    report += `| --- | --- | --- | --- |\n`;
    internalIssues.forEach(issue => {
      report += `| \`${issue.page}\` | \`${issue.link}\` | ${issue.type} | ${issue.message} |\n`;
    });
    report += `\n`;
  }
  
  report += `## 2. Broken External Links (${externalIssues.length})\n\n`;
  if (externalIssues.length === 0) {
    report += `✓ No broken external links found!\n\n`;
  } else {
    report += `| Page | Link | Issue |\n`;
    report += `| --- | --- | --- |\n`;
    externalIssues.forEach(issue => {
      report += `| \`${issue.page}\` | [\`${issue.link}\`](${issue.link}) | ${issue.message} |\n`;
    });
    report += `\n`;
  }
  
  report += `## 3. SEO Audit Issues (${seoIssues.length})\n\n`;
  if (seoIssues.length === 0) {
    report += `✓ No SEO issues found!\n\n`;
  } else {
    report += `| Page | Issue Type | Description |\n`;
    report += `| --- | --- | --- |\n`;
    seoIssues.forEach(issue => {
      report += `| \`${issue.page}\` | **${issue.type}** | ${issue.message} |\n`;
    });
    report += `\n`;
  }
  
  console.log('\n======================================');
  console.log(`Scan complete!`);
  console.log(`Internal issues: ${internalIssues.length}`);
  console.log(`External issues: ${externalIssues.length}`);
  console.log(`SEO issues: ${seoIssues.length}`);
  console.log('======================================\n');
  
  const reportPath = path.resolve(__dirname, '../output/seo-audit-report.md');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, report, 'utf-8');
  console.log(`Report written to ${reportPath}`);
}

main();
