/**
 * 기존 홈페이지(is.hanyang.ac.kr) 통합 크롤러
 * - 대학원 공지: 2024-01-01 이후
 * - 자료실: 전체
 * - 연구실 소개: 전체
 *
 * Usage: node server/seed/crawl-all.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'http://is.hanyang.ac.kr';
const ATTACHMENTS_DIR = path.join(__dirname, 'attachments');
const DELAY_MS = 500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redir = res.headers.location;
        if (redir.startsWith('/')) redir = BASE_URL + redir;
        return fetchUrl(redir).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseDate(s) {
  const p = s.trim().split('.');
  if (p.length === 3) return new Date(+p[0], +p[1] - 1, +p[2]);
  return new Date(s);
}

async function downloadFile(url, dest) {
  try {
    fs.writeFileSync(dest, await fetchUrl(url));
    return true;
  } catch (e) {
    console.error(`    DL fail: ${e.message}`);
    return false;
  }
}

// ─── KBoard notice crawler (reusable) ───

async function crawlKboardList(listPath, category, cutoffDate) {
  const posts = [];
  let page = 1;
  let go = true;

  while (go) {
    const url = `${BASE_URL}${listPath}?pageid=${page}`;
    console.log(`  Page ${page}...`);
    try {
      const $ = cheerio.load((await fetchUrl(url)).toString('utf-8'));
      const rows = $('tr').filter(function () {
        return $(this).find('td.kboard-list-title a').length > 0;
      });
      if (rows.length === 0) break;

      let foundOld = false;
      rows.each(function () {
        const $r = $(this);
        const isNotice = $r.hasClass('kboard-list-notice');
        const $a = $r.find('td.kboard-list-title a').first();
        const title = $a.find('.kboard-default-cut-strings').text().trim().replace(/\s+/g, ' ');
        const href = $a.attr('href');
        const dateStr = $r.find('td.kboard-list-date').text().trim();
        const author = $r.find('td.kboard-list-user').text().trim();
        const views = parseInt($r.find('td.kboard-list-view').text().trim()) || 0;
        const uidMatch = href && href.match(/uid=(\d+)/);
        const uid = uidMatch ? uidMatch[1] : null;
        if (!uid || !dateStr) return;

        const postDate = parseDate(dateStr);
        if (cutoffDate && postDate < cutoffDate) {
          if (!isNotice) foundOld = true;
          return;
        }
        if (posts.find((p) => p.uid === uid)) return;
        posts.push({ uid, title, date: dateStr, author, views, isPinned: isNotice, href, category });
      });
      if (foundOld) go = false;
      else page++;
    } catch (e) {
      console.error(`  Error page ${page}: ${e.message}`);
      go = false;
    }
    await sleep(DELAY_MS);
  }
  return posts;
}

async function crawlPostDetail(post) {
  let url = post.href;
  if (url.startsWith('/')) url = BASE_URL + url;
  url = url.replace(/&#038;/g, '&').replace(/&amp;/g, '&');
  try {
    const $ = cheerio.load((await fetchUrl(url)).toString('utf-8'));
    const contentHtml = ($('.kboard-content').html() || '').trim();
    const contentText = $('.kboard-content').text().trim();
    const attachments = [];
    $('.kboard-attach .kboard-button-download').each(function () {
      const fileName = $(this).attr('title')?.replace('Download ', '') || $(this).text().trim();
      const onclick = $(this).attr('onclick') || '';
      const m = onclick.match(/window\.location\.href='([^']+)'/);
      let dlUrl = m ? m[1] : '';
      if (dlUrl.startsWith('/')) dlUrl = BASE_URL + dlUrl;
      dlUrl = dlUrl.replace(/&#038;/g, '&').replace(/&amp;/g, '&');
      if (fileName) attachments.push({ fileName, downloadUrl: dlUrl });
    });
    return { contentHtml, contentText, attachments };
  } catch (e) {
    console.error(`  Detail error uid=${post.uid}: ${e.message}`);
    return { contentHtml: '', contentText: '', attachments: [] };
  }
}

async function downloadPostAttachments(post) {
  if (!post.attachments?.length) return;
  const dir = path.join(ATTACHMENTS_DIR, post.uid);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const att of post.attachments) {
    const safe = att.fileName.replace(/[/\\?%*:|"<>]/g, '_');
    const dest = path.join(dir, safe);
    if (fs.existsSync(dest)) {
      att.localPath = path.relative(path.join(__dirname, '..'), dest);
      continue;
    }
    console.log(`    ${safe}`);
    if (await downloadFile(att.downloadUrl, dest))
      att.localPath = path.relative(path.join(__dirname, '..'), dest);
    await sleep(300);
  }
}

async function crawlNoticeBoard(label, listPath, category, cutoffDate) {
  console.log(`\n=== ${label} ===`);
  console.log('Step 1: list pages...');
  const posts = await crawlKboardList(listPath, category, cutoffDate);
  console.log(`Found ${posts.length} posts`);

  console.log('Step 2: post details...');
  for (let i = 0; i < posts.length; i++) {
    const d = await crawlPostDetail(posts[i]);
    Object.assign(posts[i], d);
    if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${posts.length}`);
    await sleep(DELAY_MS);
  }

  console.log('Step 3: attachments...');
  for (const p of posts) await downloadPostAttachments(p);

  return posts.map((p) => ({
    uid: p.uid,
    title: p.title,
    content: p.contentHtml || '',
    contentText: p.contentText || '',
    category: p.category,
    author: p.author || '정보시스템학과',
    date: p.date,
    views: p.views || 0,
    isPinned: p.isPinned || false,
    attachments: (p.attachments || []).map((a) => ({
      fileName: a.fileName,
      localPath: a.localPath || null,
      originalUrl: a.downloadUrl,
    })),
  }));
}

// ─── Lab crawler ───

async function crawlLabs() {
  console.log('\n=== 연구실 소개 ===');
  const url = `${BASE_URL}/%ED%95%99%EA%B3%BC%EC%86%8C%EA%B0%9C/%EC%97%B0%EA%B5%AC%EC%8B%A4-%EC%86%8C%EA%B0%9C`;
  const html = (await fetchUrl(url)).toString('utf-8');
  const $ = cheerio.load(html);

  const labs = [];
  $('.lab-item').each(function () {
    const $item = $(this);
    const image = $item.find('img.uniform-image').attr('src') || '';

    // Lab name: first h2.lab-name
    const nameEn = $item.find('h2.lab-name').text().trim();
    // Korean name in h3.lab-name if present
    const nameKo = $item.find('h3.lab-name').text().trim().replace(/[()]/g, '');
    // Website link
    const website = $item.find('.lab-link a').attr('href') || '';
    // Descriptions
    const descEn = $item.find('.lab-description-en').text().trim();
    const descKo = $item.find('.lab-description-ko').text().trim();

    labs.push({
      name: nameEn,
      nameKo,
      image,
      website,
      descriptionEn: descEn,
      descriptionKo: descKo,
    });
  });

  // Sort alphabetically by name
  labs.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

  console.log(`Found ${labs.length} labs (sorted alphabetically)`);
  labs.forEach((l, i) => console.log(`  ${i + 1}. ${l.name}`));

  return labs;
}

// ─── Main ───

async function main() {
  console.log('=== IS-WEB 통합 크롤러 ===\n');
  if (!fs.existsSync(ATTACHMENTS_DIR)) fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });

  const CUTOFF = new Date('2024-01-01');

  // 1. 대학원 공지 (2024-01-01~)
  const gradNotices = await crawlNoticeBoard(
    '대학원 공지',
    '/%ED%95%99%EA%B3%BC-%EA%B3%B5%EC%A7%80/%EB%8C%80%ED%95%99%EC%9B%90-%EA%B3%B5%EC%A7%80',
    '대학원',
    CUTOFF
  );
  fs.writeFileSync(
    path.join(__dirname, 'grad-notices-seed.json'),
    JSON.stringify(gradNotices, null, 2),
    'utf-8'
  );
  console.log(`Saved ${gradNotices.length} graduate notices`);

  // 2. 자료실 (전체)
  const archiveNotices = await crawlNoticeBoard(
    '자료실',
    '/%ED%95%99%EA%B3%BC-%EA%B3%B5%EC%A7%80/%EC%9E%90%EB%A3%8C%EC%8B%A4',
    '자료실',
    null // no cutoff
  );
  fs.writeFileSync(
    path.join(__dirname, 'archive-notices-seed.json'),
    JSON.stringify(archiveNotices, null, 2),
    'utf-8'
  );
  console.log(`Saved ${archiveNotices.length} archive notices`);

  // 3. 연구실
  const labs = await crawlLabs();
  fs.writeFileSync(
    path.join(__dirname, 'labs-seed.json'),
    JSON.stringify(labs, null, 2),
    'utf-8'
  );
  console.log(`Saved ${labs.length} labs`);

  // Summary
  console.log('\n=== 크롤링 완료 ===');
  console.log(`대학원 공지: ${gradNotices.length}개`);
  console.log(`자료실: ${archiveNotices.length}개`);
  console.log(`연구실: ${labs.length}개`);
}

main().catch(console.error);
