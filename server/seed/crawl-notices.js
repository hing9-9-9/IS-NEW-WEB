/**
 * 기존 홈페이지(is.hanyang.ac.kr) 학과 공지사항 크롤러
 * 2024년 1월 1일 이후 게시글 + 첨부파일 크롤링
 *
 * Usage: node server/seed/crawl-notices.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'http://is.hanyang.ac.kr';
const LIST_PATH = '/%ED%95%99%EA%B3%BC-%EA%B3%B5%EC%A7%80/%ED%95%99%EA%B3%BC-%EA%B3%B5%EC%A7%80';
const CUTOFF_DATE = new Date('2024-01-01');
const ATTACHMENTS_DIR = path.join(__dirname, 'attachments');
const OUTPUT_FILE = path.join(__dirname, 'notices-seed.json');

// Delay between requests to be polite
const DELAY_MS = 500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch a URL, ignoring SSL errors
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const options = { rejectUnauthorized: false };

    mod.get(url, options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          redirectUrl = BASE_URL + redirectUrl;
        }
        return fetchUrl(redirectUrl).then(resolve).catch(reject);
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Parse date string like "2024.03.15" to Date
function parseDate(dateStr) {
  const cleaned = dateStr.trim();
  const parts = cleaned.split('.');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(cleaned);
}

// Download file to disk
async function downloadFile(url, destPath) {
  try {
    const data = await fetchUrl(url);
    fs.writeFileSync(destPath, data);
    return true;
  } catch (err) {
    console.error(`  Failed to download: ${url} - ${err.message}`);
    return false;
  }
}

// 1. Get all post links from list pages
async function crawlListPages() {
  const posts = [];
  let page = 1;
  let shouldContinue = true;

  while (shouldContinue) {
    const url = `${BASE_URL}${LIST_PATH}?pageid=${page}`;
    console.log(`Fetching list page ${page}...`);

    try {
      const html = (await fetchUrl(url)).toString('utf-8');
      const $ = cheerio.load(html);

      const rows = $('tr.kboard-list-notice, tr:not(.kboard-list-notice)').filter(function () {
        return $(this).find('td.kboard-list-title a').length > 0;
      });

      if (rows.length === 0) {
        console.log(`  No posts found on page ${page}, stopping.`);
        break;
      }

      let foundOldPost = false;

      rows.each(function () {
        const $row = $(this);
        const isNotice = $row.hasClass('kboard-list-notice');
        const $titleLink = $row.find('td.kboard-list-title a').first();
        const title = $titleLink.find('.kboard-default-cut-strings').text().trim()
          .replace(/\s+/g, ' ')
          .replace(/\s*$/, '');
        const href = $titleLink.attr('href');
        const dateStr = $row.find('td.kboard-list-date').text().trim();
        const author = $row.find('td.kboard-list-user').text().trim();
        const views = parseInt($row.find('td.kboard-list-view').text().trim()) || 0;

        // Extract uid from href
        const uidMatch = href && href.match(/uid=(\d+)/);
        const uid = uidMatch ? uidMatch[1] : null;

        if (!uid || !dateStr) return;

        const postDate = parseDate(dateStr);

        // Check if post is before cutoff
        if (postDate < CUTOFF_DATE) {
          // Notice posts appear on every page, skip them for date checking
          if (!isNotice) {
            foundOldPost = true;
          }
          return;
        }

        // Avoid duplicates (notices repeat on each page)
        if (posts.find((p) => p.uid === uid)) return;

        posts.push({
          uid,
          title: title.replace(/\s*$/, ''),
          date: dateStr,
          author,
          views,
          isPinned: isNotice,
          href,
        });
      });

      if (foundOldPost) {
        console.log(`  Found posts before 2024-01-01 on page ${page}, stopping list crawl.`);
        shouldContinue = false;
      } else {
        page++;
      }
    } catch (err) {
      console.error(`  Error on page ${page}: ${err.message}`);
      shouldContinue = false;
    }

    await sleep(DELAY_MS);
  }

  return posts;
}

// 2. Crawl individual post for content and attachments
async function crawlPost(post) {
  let url = post.href;
  if (url.startsWith('/')) {
    url = BASE_URL + url;
  }
  // Decode HTML entities in URL
  url = url.replace(/&#038;/g, '&').replace(/&amp;/g, '&');

  console.log(`  Fetching post uid=${post.uid}: ${post.title.substring(0, 50)}...`);

  try {
    const html = (await fetchUrl(url)).toString('utf-8');
    const $ = cheerio.load(html);

    // Extract content
    const $content = $('.kboard-content');
    // Get inner HTML of content
    let contentHtml = $content.html() || '';
    // Also get text version
    let contentText = $content.text().trim();

    // Extract attachments
    const attachments = [];
    $('.kboard-attach .kboard-button-download').each(function () {
      const $btn = $(this);
      const fileName = $btn.attr('title')?.replace('Download ', '') || $btn.text().trim();
      const onclickStr = $btn.attr('onclick') || '';
      const hrefMatch = onclickStr.match(/window\.location\.href='([^']+)'/);
      let downloadUrl = hrefMatch ? hrefMatch[1] : '';

      if (downloadUrl.startsWith('/')) {
        downloadUrl = BASE_URL + downloadUrl;
      }
      downloadUrl = downloadUrl.replace(/&#038;/g, '&').replace(/&amp;/g, '&');

      if (fileName) {
        attachments.push({ fileName, downloadUrl });
      }
    });

    // Also check for images in content (hosted on the site)
    const contentImages = [];
    $content.find('img').each(function () {
      let src = $(this).attr('src');
      if (src && src.includes('is.hanyang.ac.kr')) {
        contentImages.push(src);
      } else if (src && src.startsWith('/')) {
        contentImages.push(BASE_URL + src);
      }
    });

    return {
      contentHtml: contentHtml.trim(),
      contentText,
      attachments,
      contentImages,
    };
  } catch (err) {
    console.error(`  Error fetching post uid=${post.uid}: ${err.message}`);
    return { contentHtml: '', contentText: '', attachments: [], contentImages: [] };
  }
}

// 3. Download attachments
async function downloadAttachments(post) {
  if (!post.attachments || post.attachments.length === 0) return;

  const postDir = path.join(ATTACHMENTS_DIR, post.uid);
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }

  for (const att of post.attachments) {
    const safeName = att.fileName.replace(/[/\\?%*:|"<>]/g, '_');
    const destPath = path.join(postDir, safeName);

    if (fs.existsSync(destPath)) {
      console.log(`    Skipping (exists): ${safeName}`);
      att.localPath = path.relative(path.join(__dirname, '..'), destPath);
      continue;
    }

    console.log(`    Downloading: ${safeName}`);
    const success = await downloadFile(att.downloadUrl, destPath);
    if (success) {
      att.localPath = path.relative(path.join(__dirname, '..'), destPath);
    }
    await sleep(300);
  }
}

// Main
async function main() {
  console.log('=== IS-WEB Notice Crawler ===');
  console.log(`Cutoff date: ${CUTOFF_DATE.toISOString().slice(0, 10)}`);
  console.log('');

  // Ensure attachments dir exists
  if (!fs.existsSync(ATTACHMENTS_DIR)) {
    fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
  }

  // Step 1: Crawl list pages
  console.log('Step 1: Crawling list pages...');
  const posts = await crawlListPages();
  console.log(`\nFound ${posts.length} posts since ${CUTOFF_DATE.toISOString().slice(0, 10)}\n`);

  // Step 2: Crawl individual posts for content + attachments info
  console.log('Step 2: Crawling individual posts...');
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const detail = await crawlPost(post);
    post.contentHtml = detail.contentHtml;
    post.contentText = detail.contentText;
    post.attachments = detail.attachments;
    post.contentImages = detail.contentImages;

    // Progress
    if ((i + 1) % 10 === 0) {
      console.log(`  Progress: ${i + 1}/${posts.length}`);
    }

    await sleep(DELAY_MS);
  }

  // Step 3: Download attachments
  console.log('\nStep 3: Downloading attachments...');
  for (const post of posts) {
    await downloadAttachments(post);
  }

  // Step 4: Save seed data
  console.log('\nStep 4: Saving seed data...');

  // Clean up for seed format
  const seedData = posts.map((post) => ({
    uid: post.uid,
    title: post.title,
    content: post.contentHtml,
    contentText: post.contentText,
    category: '학과',
    author: post.author,
    date: post.date,
    views: post.views,
    isPinned: post.isPinned,
    attachments: (post.attachments || []).map((a) => ({
      fileName: a.fileName,
      localPath: a.localPath || null,
      originalUrl: a.downloadUrl,
    })),
    contentImages: post.contentImages || [],
  }));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  console.log(`\nDone! Saved ${seedData.length} posts to ${OUTPUT_FILE}`);

  // Summary
  const withAttachments = seedData.filter((p) => p.attachments.length > 0).length;
  console.log(`  Posts with attachments: ${withAttachments}`);
  const totalAttachments = seedData.reduce((sum, p) => sum + p.attachments.length, 0);
  console.log(`  Total attachments: ${totalAttachments}`);
}

main().catch(console.error);
