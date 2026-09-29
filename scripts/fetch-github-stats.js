import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const REPOS = [
  'elrincondeebano',
  'portfolio-manager-server',
  'chile-hub',
  'Monedario',
  'stop-spam-linkedin',
  'conciliador_bancario',
  'rutificador',
  'DNSpect',
  'polla',
  'noticiencias'
];

const PRIVATE_REPOS = ['Monedario'];

export async function fetchStats({
  fetchImpl = fetch,
  writeImpl = writeFileSync,
  statsFilePath = join(process.cwd(), 'src/data/github-stats.json'),
  repos = REPOS,
  token = process.env.GITHUB_TOKEN,
} = {}) {
  const stats = {};

  // Load existing stats as fallback
  let fallback = {};
  try {
    fallback = JSON.parse(readFileSync(statsFilePath, 'utf8'));
  } catch (e) {
    console.warn('No existing github-stats.json found to use as fallback:', e.message);
  }

  const headers = {
    'User-Agent': 'Tooltician-Portfolio-Builder',
    'Accept': 'application/vnd.github.v3+json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('Fetching GitHub repository stats...');
  let liveCount = 0;
  let fallbackCount = 0;
  const results = await Promise.all(repos.map(async (repo) => {
    if (PRIVATE_REPOS.includes(repo) && !token) {
      return { repo, skipped: true };
    }
    try {
      const res = await fetchImpl(`https://api.github.com/repos/cortega26/${repo}`, { headers, signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      return {
        repo,
        stars: typeof data.stargazers_count === 'number' ? data.stargazers_count : (fallback[repo]?.stars ?? 0),
        forks: typeof data.forks_count === 'number' ? data.forks_count : (fallback[repo]?.forks ?? 0),
        live: true
      };
    } catch (e) {
      return { repo, error: e.message, live: false };
    }
  }));

  for (const result of results) {
    const { repo } = result;
    if (result.skipped) {
      stats[repo] = fallback[repo] || { stars: 0, forks: 0 };
      console.log(`ℹ Skipping fetch for private repo ${repo} (no GITHUB_TOKEN), using fallback`);
      fallbackCount++;
    } else if (result.live) {
      stats[repo] = { stars: result.stars, forks: result.forks };
      console.log(`✓ Fetched ${repo}: ${stats[repo].stars} stars, ${stats[repo].forks} forks`);
      liveCount++;
    } else {
      console.warn(`✗ Failed to fetch ${repo}, using fallback:`, result.error);
      stats[repo] = fallback[repo] || { stars: 0, forks: 0 };
      fallbackCount++;
    }
  }

  console.log(`${liveCount}/${repos.length} live, ${fallbackCount}/${repos.length} fallback`);
  if (fallbackCount > repos.length / 2 && token) {
    console.warn(`WARNING: ${fallbackCount} of ${repos.length} repos used fallback data despite GITHUB_TOKEN being set — counts may be stale. Build continues with fallback values.`);
  }

  if (liveCount === 0) {
    console.log('All repos used fallback — leaving src/data/github-stats.json untouched');
    return;
  }

  try {
    writeImpl(statsFilePath, JSON.stringify(stats, null, 2), 'utf8');
    console.log('Successfully wrote src/data/github-stats.json');
  } catch (e) {
    console.error('Error writing github-stats.json file:', e);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  fetchStats();
}
