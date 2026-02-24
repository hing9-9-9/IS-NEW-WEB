/**
 * 기존 홈페이지(is.hanyang.ac.kr) 취업 게시판 크롤러
 * 2024년 1월 1일 이후 모든 게시글 + 첨부파일 크롤링
 *
 * Usage: node server/seed/crawl-jobs.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'http://is.hanyang.ac.kr';
// 취업-게시판 (URL-encoded)
const LIST_PATH = '/%EC%B7%A8%EC%97%85-%EA%B2%8C%EC%8B%9C%ED%8C%90';
const CUTOFF_DATE = new Date('2024-01-01');
const ATTACHMENTS_DIR = path.join(__dirname, 'attachments-jobs');
const OUTPUT_FILE = path.join(__dirname, 'jobs-seed.json');

const DELAY_MS = 500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── HTTP fetch (redirect 처리, SSL 무시) ───

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

function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const encodedUrl = encodeURI(decodeURI(url));

    mod.get(encodedUrl, { rejectUnauthorized: false, timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redir = res.headers.location;
        if (redir.startsWith('/')) redir = BASE_URL + redir;
        downloadFile(redir, destPath).then(resolve);
        return;
      }
      if (res.statusCode !== 200) {
        console.error(`    DL fail: HTTP ${res.statusCode} for ${url}`);
        resolve(false);
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => { fileStream.close(); resolve(true); });
      fileStream.on('error', (err) => {
        console.error(`    DL write error: ${err.message}`);
        resolve(false);
      });
    }).on('error', (err) => {
      console.error(`    DL fail: ${err.message}`);
      resolve(false);
    }).on('timeout', function () {
      this.destroy();
      console.error(`    DL timeout: ${url}`);
      resolve(false);
    });
  });
}

// ─── 제목에서 회사명 추출 ───

function extractCompany(title) {
  // [회사명] 패턴
  const bracketMatch = title.match(/^\[([^\]]+)\]/);
  if (bracketMatch) return bracketMatch[1].trim();

  // 한양대학교 × 회사명 패턴
  const crossMatch = title.match(/한양대학교\s*[×x×]\s*(.+?)[\s\-–—]/i);
  if (crossMatch) return crossMatch[1].trim();

  // "회사명 채용/공채/모집" 앞부분 (첫 단어)
  const firstWord = title.split(/[\s\-\[\(]/)[0].trim();
  if (firstWord.length > 1 && firstWord.length <= 20) return firstWord;

  return '';
}

// ─── 제목·내용에서 카테고리 분류 ───

function detectCategory(title) {
  const t = title.toLowerCase();
  if (t.includes('인턴')) return '인턴';
  if (
    t.includes('채용') ||
    t.includes('공채') ||
    t.includes('모집') ||
    t.includes('recruit') ||
    t.includes('hiring') ||
    t.includes('job fair') ||
    t.includes('취업박람회')
  )
    return '채용';
  return '기타';
}

// ─── 제목에서 마감일 추출 ───
// 예) (~10/1), (~2024.10.01), (10/1 마감), ~10/1 등

function extractDeadline(title, postDateStr) {
  // (~MM/DD) 또는 (~YYYY.MM.DD)
  const m1 = title.match(/[~～]\s*(\d{1,4})[./](\d{1,2})(?:[./](\d{1,2}))?/);
  if (m1) {
    const a = parseInt(m1[1]);
    const b = parseInt(m1[2]);
    const c = m1[3] ? parseInt(m1[3]) : null;

    if (c !== null) {
      // YYYY.MM.DD
      if (a > 100) return `${a}.${String(b).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
      // MM.DD.?? — ignore malformed
    } else {
      // MM/DD — year from post date
      const postYear = postDateStr ? parseInt(postDateStr.split('.')[0]) : new Date().getFullYear();
      return `${postYear}.${String(a).padStart(2, '0')}.${String(b).padStart(2, '0')}`;
    }
  }
  return null;
}

// ─── 1. 목록 페이지 크롤링 ───

async function crawlListPages() {
  const posts = [];
  let page = 1;
  let go = true;

  while (go) {
    const url = `${BASE_URL}${LIST_PATH}?pageid=${page}`;
    console.log(`  목록 페이지 ${page} 요청...`);
    try {
      const html = (await fetchUrl(url)).toString('utf-8');
      const $ = cheerio.load(html);

      const rows = $('tr').filter(function () {
        return $(this).find('td.kboard-list-title a').length > 0;
      });

      if (rows.length === 0) {
        console.log(`  페이지 ${page}에 게시글 없음 → 중단`);
        break;
      }

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
        if (postDate < CUTOFF_DATE) {
          if (!isNotice) foundOld = true;
          return;
        }

        // 중복 방지
        if (posts.find((p) => p.uid === uid)) return;

        posts.push({
          uid,
          title,
          date: dateStr,
          author,
          views,
          isPinned: isNotice,
          href,
        });
      });

      if (foundOld) {
        console.log(`  2024-01-01 이전 게시글 발견 → 목록 크롤 종료`);
        go = false;
      } else {
        page++;
      }
    } catch (e) {
      console.error(`  페이지 ${page} 오류: ${e.message}`);
      go = false;
    }
    await sleep(DELAY_MS);
  }

  return posts;
}

// ─── 2. 개별 게시글 상세 크롤링 ───

async function crawlPostDetail(post) {
  let url = post.href;
  if (url.startsWith('/')) url = BASE_URL + url;
  url = url.replace(/&#038;/g, '&').replace(/&amp;/g, '&');

  console.log(`  [uid=${post.uid}] ${post.title.substring(0, 50)}...`);

  try {
    const html = (await fetchUrl(url)).toString('utf-8');
    const $ = cheerio.load(html);

    const $content = $('.kboard-content');
    const contentHtml = ($content.html() || '').trim();
    const contentText = $content.text().trim();

    // 첨부파일
    const attachments = [];
    $('.kboard-attach .kboard-button-download').each(function () {
      const $btn = $(this);
      const fileName =
        $btn.attr('title')?.replace(/^Download\s*/i, '').trim() || $btn.text().trim();
      const onclick = $btn.attr('onclick') || '';
      const m = onclick.match(/window\.location\.href='([^']+)'/);
      let dlUrl = m ? m[1] : '';
      if (dlUrl.startsWith('/')) dlUrl = BASE_URL + dlUrl;
      dlUrl = dlUrl.replace(/&#038;/g, '&').replace(/&amp;/g, '&');
      if (fileName && dlUrl) attachments.push({ fileName, downloadUrl: dlUrl });
    });

    // 링크 첨부파일 (일부 게시판은 <a> 태그 방식)
    if (attachments.length === 0) {
      $('.kboard-attach a[href]').each(function () {
        const $a = $(this);
        const fileName = $a.text().trim();
        let dlUrl = $a.attr('href') || '';
        if (dlUrl.startsWith('/')) dlUrl = BASE_URL + dlUrl;
        dlUrl = dlUrl.replace(/&#038;/g, '&').replace(/&amp;/g, '&');
        if (fileName && dlUrl && !dlUrl.includes('pageid')) {
          attachments.push({ fileName, downloadUrl: dlUrl });
        }
      });
    }

    // 본문 내 이미지
    const contentImages = [];
    $content.find('img').each(function () {
      let src = $(this).attr('src') || '';
      if (!src) return;
      if (src.startsWith('/')) src = BASE_URL + src;
      if (src.includes('is.hanyang.ac.kr') || src.startsWith(BASE_URL)) {
        contentImages.push(src);
      }
    });

    return { contentHtml, contentText, attachments, contentImages };
  } catch (e) {
    console.error(`  상세 오류 uid=${post.uid}: ${e.message}`);
    return { contentHtml: '', contentText: '', attachments: [], contentImages: [] };
  }
}

// ─── 3. 첨부파일 다운로드 ───

async function downloadAttachments(post) {
  if (!post.attachments?.length) return;
  const dir = path.join(ATTACHMENTS_DIR, post.uid);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const att of post.attachments) {
    const safe = att.fileName.replace(/[/\\?%*:|"<>]/g, '_');
    const dest = path.join(dir, safe);
    if (fs.existsSync(dest)) {
      console.log(`    스킵 (이미 존재): ${safe}`);
      att.localPath = path.relative(path.join(__dirname, '..'), dest);
      continue;
    }
    console.log(`    다운로드: ${safe}`);
    if (await downloadFile(att.downloadUrl, dest)) {
      att.localPath = path.relative(path.join(__dirname, '..'), dest);
    }
    await sleep(300);
  }
}

// ─── Main ───

async function main() {
  console.log('=== IS-WEB 취업 게시판 크롤러 ===');
  console.log(`기준일: ${CUTOFF_DATE.toISOString().slice(0, 10)} 이후 모든 게시글`);
  console.log('');

  if (!fs.existsSync(ATTACHMENTS_DIR)) fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });

  // Step 1: 목록 크롤링
  console.log('Step 1: 목록 페이지 크롤링...');
  const posts = await crawlListPages();
  console.log(`\n수집된 게시글: ${posts.length}개\n`);

  // Step 2: 개별 게시글 상세 크롤링
  console.log('Step 2: 게시글 상세 크롤링...');
  for (let i = 0; i < posts.length; i++) {
    const detail = await crawlPostDetail(posts[i]);
    Object.assign(posts[i], detail);
    if ((i + 1) % 10 === 0) console.log(`  진행: ${i + 1}/${posts.length}`);
    await sleep(DELAY_MS);
  }

  // Step 3: 첨부파일 다운로드
  console.log('\nStep 3: 첨부파일 다운로드...');
  for (const post of posts) {
    await downloadAttachments(post);
  }

  // Step 4: JSON 저장
  console.log('\nStep 4: 데이터 저장...');

  const seedData = posts.map((p) => ({
    uid: p.uid,
    title: p.title,
    company: extractCompany(p.title),
    category: detectCategory(p.title),
    content: p.contentHtml || '',
    contentText: p.contentText || '',
    date: p.date,
    deadline: extractDeadline(p.title, p.date),
    link: (() => {
      let l = p.href || '';
      if (l.startsWith('/')) l = BASE_URL + l;
      return l.replace(/&#038;/g, '&').replace(/&amp;/g, '&');
    })(),
    views: p.views || 0,
    isPinned: p.isPinned || false,
    attachments: (p.attachments || []).map((a) => ({
      fileName: a.fileName,
      localPath: a.localPath || null,
      originalUrl: a.downloadUrl,
    })),
    contentImages: p.contentImages || [],
  }));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  console.log(`\n완료! ${seedData.length}개 게시글 → ${OUTPUT_FILE}`);

  // 요약
  const withAttachments = seedData.filter((p) => p.attachments.length > 0).length;
  const totalAttachments = seedData.reduce((s, p) => s + p.attachments.length, 0);
  const withDeadline = seedData.filter((p) => p.deadline).length;
  const categories = seedData.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  console.log(`  첨부파일 있는 게시글: ${withAttachments}개`);
  console.log(`  총 첨부파일: ${totalAttachments}개`);
  console.log(`  마감일 추출: ${withDeadline}개`);
  console.log(`  카테고리별: ${JSON.stringify(categories)}`);
}

main().catch(console.error);
