/**
 * 기존 홈페이지(is.hanyang.ac.kr) 행정직원 크롤러
 *
 * Usage: node server/seed/crawl-staff.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'http://is.hanyang.ac.kr';
const OUTPUT_FILE = path.join(__dirname, 'staff-seed.json');

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

async function main() {
  console.log('=== 행정직원 크롤러 ===\n');

  const url = `${BASE_URL}/%ED%95%99%EA%B3%BC%EC%86%8C%EA%B0%9C/%ED%96%89%EC%A0%95%EC%A7%81%EC%9B%90-%EC%86%8C%EA%B0%9C`;
  console.log('Fetching:', url);
  const html = (await fetchUrl(url)).toString('utf-8');
  const $ = cheerio.load(html);

  const staff = [];

  // Look for all text content to find staff info
  const bodyText = $('body').text();
  console.log('\n=== Page text (first 2000 chars) ===');
  console.log(bodyText.substring(0, 2000));

  // Try to find structured data
  $('.entry-content').find('p, div, table').each(function () {
    const text = $(this).text().trim();
    if (text.includes('@') || text.includes('선생님')) {
      console.log('\n=== Potential staff info ===');
      console.log(text.substring(0, 300));
    }
  });

  // Save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(staff, null, 2), 'utf-8');
  console.log(`\nSaved ${staff.length} staff to ${OUTPUT_FILE}`);
}

main().catch(console.error);
