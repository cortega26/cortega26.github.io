import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const REPOS = [
  'elrincondeebano',
  'portfolio-manager-server',
  'chile-hub',
  'tuplatainforma',
  'stop-spam-linkedin',
  'conciliador_bancario',
  'rutificador',
  'DNSpect',
  'polla',
  'noticiencias'
];

const PRIVATE_REPOS = ['tuplatainforma'];

async function fetchStats() {
  const stats = {};
  const statsFilePath = join(process.cwd(), 'src/data/github-stats.json');

  // Load existing stats as fallback
  let fallback = {};
  try {
    fallback = JSON.parse(readFileSync(statsFilePath, 'utf8'));
  } catch (e) {
    console.warn('No existing github-stats.json found to use as fallback:', e.message);
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    'User-Agent': 'Tooltician-Portfolio-Builder',
    'Accept': 'application/vnd.github.v3+json'
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  console.log('Fetching GitHub repository stats...');
  for (const repo of REPOS) {
    if (PRIVATE_REPOS.includes(repo) && !token) {
      stats[repo] = fallback[repo] || { stars: 0, forks: 0 };
      console.log(`ℹ Skipping fetch for private repo ${repo} (no GITHUB_TOKEN), using fallback`);
      continue;
    }
    try {
      const res = await fetch(`https://api.github.com/repos/cortega26/${repo}`, { headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      stats[repo] = {
        stars: typeof data.stargazers_count === 'number' ? data.stargazers_count : (fallback[repo]?.stars ?? 0),
        forks: typeof data.forks_count === 'number' ? data.forks_count : (fallback[repo]?.forks ?? 0)
      };
      console.log(`✓ Fetched ${repo}: ${stats[repo].stars} stars, ${stats[repo].forks} forks`);
    } catch (e) {
      console.warn(`✗ Failed to fetch ${repo}, using fallback:`, e.message);
      stats[repo] = fallback[repo] || { stars: 0, forks: 0 };
    }
  }

  try {
    writeFileSync(statsFilePath, JSON.stringify(stats, null, 2), 'utf8');
    console.log('Successfully wrote src/data/github-stats.json');
  } catch (e) {
    console.error('Error writing github-stats.json file:', e);
  }
}

fetchStats();
