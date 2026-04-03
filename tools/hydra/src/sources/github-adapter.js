/**
 * @module github-adapter
 * @description GitHub source adapter for HYDRA.
 * Fetches README.md from repos and GitHub releases, parsing them as content.
 */

import { SourceAdapter } from './adapter-interface.js';

const GITHUB_API = 'https://api.github.com';
const GITHUB_RAW = 'https://raw.githubusercontent.com';

/**
 * Make a GitHub API request with proper headers.
 * @param {string} url - API URL
 * @returns {Promise<any>} JSON response
 */
async function githubFetch(url) {
  const headers = {
    'User-Agent': 'HYDRA/0.1.0',
    Accept: 'application/vnd.github.v3+json',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Try to fetch a raw file from GitHub, returning null on failure.
 * @param {string} repo - owner/repo format
 * @param {string} path - File path in repo
 * @param {string} branch - Branch name
 * @returns {Promise<string|null>} File content or null
 */
async function tryFetchRaw(repo, path, branch) {
  const url = `${GITHUB_RAW}/${repo}/${branch}/${path}`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HYDRA/0.1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    return response.text();
  } catch {
    return null;
  }
}

/**
 * Fetch raw file content from a GitHub repo.
 * Tries all combinations of branch (main/master) and path casing (README.md/readme.md).
 * Also follows GitHub API redirects for renamed/transferred repos.
 * @param {string} repo - owner/repo format
 * @param {string} path - File path in repo
 * @param {string} [branch='main'] - Preferred branch name
 * @returns {Promise<string>} File content
 */
async function fetchRawFile(repo, path, branch = 'main') {
  // Build fallback matrix: try all branch + path combinations
  const branches = branch === 'main' ? ['main', 'master'] : [branch, 'main', 'master'];
  const paths = [path];
  if (path === 'README.md') paths.push('readme.md', 'Readme.md');
  else if (path === 'readme.md') paths.push('README.md', 'Readme.md');
  else if (path.toLowerCase() === 'readme.md' && path !== 'README.md' && path !== 'readme.md') {
    paths.push('README.md', 'readme.md');
  }

  // Try each combination
  for (const b of branches) {
    for (const p of paths) {
      const result = await tryFetchRaw(repo, p, b);
      if (result !== null) return result;
    }
  }

  // Last resort: use GitHub API to resolve the default branch and README path
  try {
    const repoData = await githubFetch(`${GITHUB_API}/repos/${repo}`);
    const defaultBranch = repoData.default_branch;
    // If repo was renamed/transferred, GitHub API returns the new name
    const actualRepo = repoData.full_name;

    if (actualRepo !== repo || !branches.includes(defaultBranch)) {
      console.log(`[GitHub] Repo resolved: ${repo} -> ${actualRepo} (branch: ${defaultBranch})`);
      for (const p of paths) {
        const result = await tryFetchRaw(actualRepo, p, defaultBranch);
        if (result !== null) return result;
      }
    }

    // Try GitHub API contents endpoint which handles case-insensitive paths
    const contents = await githubFetch(`${GITHUB_API}/repos/${actualRepo}/readme`);
    if (contents.download_url) {
      const response = await fetch(contents.download_url, {
        headers: { 'User-Agent': 'HYDRA/0.1.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) return response.text();
    }
  } catch (apiError) {
    // API call failed — repo likely doesn't exist
  }

  throw new Error(`Failed to fetch ${path} from ${repo}: all fallback attempts exhausted`);
}

export class GithubAdapter extends SourceAdapter {
  constructor() {
    super('GitHub Adapter', 'github');
  }

  /**
   * Fetch content from GitHub based on source type.
   * @param {Object} sourceConfig - Source configuration
   * @param {string} sourceConfig.type - 'releases' | 'awesome-list' | 'readme'
   * @param {string} sourceConfig.repo - owner/repo format
   * @param {string} sourceConfig.name - Display name
   * @param {string[]} sourceConfig.domains - Associated domains
   * @returns {Promise<import('./adapter-interface.js').RawContent[]>}
   */
  async fetch(sourceConfig) {
    const { type, repo, name, domains } = sourceConfig;

    try {
      switch (type) {
        case 'releases':
          return await this._fetchReleases(sourceConfig);
        case 'awesome-list':
        case 'readme':
          return await this._fetchReadme(sourceConfig);
        default:
          console.warn(`[GitHub] Unknown source type "${type}" for "${name}"`);
          return [];
      }
    } catch (error) {
      console.error(`[GitHub] FAILED "${name}" (${repo}): ${error.message}`);
      console.error(`[GitHub] Action needed: verify repo exists at https://github.com/${repo}`);
      return [];
    }
  }

  /**
   * Fetch recent releases from a GitHub repo.
   * @param {Object} config - Source config
   * @returns {Promise<import('./adapter-interface.js').RawContent[]>}
   */
  async _fetchReleases(config) {
    const { repo, name, domains } = config;
    const releases = await githubFetch(`${GITHUB_API}/repos/${repo}/releases?per_page=5`);

    return releases.map((release) =>
      this.createRawContent({
        sourceId: `github:${repo}:release:${release.tag_name}`,
        title: `[${repo}] ${release.name || release.tag_name}`,
        contentRaw: release.body || `Release ${release.tag_name} of ${repo}`,
        author: release.author?.login || 'unknown',
        publishedAt: release.published_at || release.created_at,
        url: release.html_url,
        language: 'en',
        metadata: {
          feedName: name,
          repo,
          domains,
          type: 'release',
          tagName: release.tag_name,
          prerelease: release.prerelease,
          authority: config.authority || 4,
        },
      })
    );
  }

  /**
   * Fetch and parse a README.md (especially for awesome-lists).
   * @param {Object} config - Source config
   * @returns {Promise<import('./adapter-interface.js').RawContent[]>}
   */
  async _fetchReadme(config) {
    const { repo, name, domains } = config;
    const readmePath = config.readme_path || 'README.md';
    const readme = await fetchRawFile(repo, readmePath);

    // For awesome-lists, extract individual sections as separate content items
    const sections = this._parseAwesomeListSections(readme);

    if (sections.length === 0) {
      // Return the whole README as one content item
      return [
        this.createRawContent({
          sourceId: `github:${repo}:readme`,
          title: `[${repo}] README`,
          contentRaw: readme,
          author: repo.split('/')[0],
          publishedAt: new Date(),
          url: `https://github.com/${repo}`,
          language: 'en',
          metadata: {
            feedName: name,
            repo,
            domains,
            type: 'readme',
            authority: config.authority || 3,
          },
        }),
      ];
    }

    return sections.map((section, idx) =>
      this.createRawContent({
        sourceId: `github:${repo}:readme:section-${idx}`,
        title: `[${repo}] ${section.heading}`,
        contentRaw: section.content,
        author: repo.split('/')[0],
        publishedAt: new Date(),
        url: `https://github.com/${repo}#${section.anchor}`,
        language: 'en',
        metadata: {
          feedName: name,
          repo,
          domains,
          type: 'awesome-list-section',
          sectionHeading: section.heading,
          authority: config.authority || 3,
        },
      })
    );
  }

  /**
   * Parse an awesome-list README into sections based on H2 headers.
   * @param {string} markdown - README content
   * @returns {{ heading: string, anchor: string, content: string }[]}
   */
  _parseAwesomeListSections(markdown) {
    const lines = markdown.split('\n');
    const sections = [];
    let currentSection = null;

    for (const line of lines) {
      const h2Match = line.match(/^## (.+)/);
      if (h2Match) {
        if (currentSection && currentSection.content.trim().length > 50) {
          sections.push(currentSection);
        }
        const heading = h2Match[1].trim();
        currentSection = {
          heading,
          anchor: heading.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          content: '',
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    // Push last section
    if (currentSection && currentSection.content.trim().length > 50) {
      sections.push(currentSection);
    }

    // Filter out meta sections (TOC, Contributing, License, etc.)
    const skipHeadings = ['contents', 'table of contents', 'contributing', 'license', 'acknowledgments', 'about'];
    return sections.filter((s) => !skipHeadings.includes(s.heading.toLowerCase()));
  }
}
