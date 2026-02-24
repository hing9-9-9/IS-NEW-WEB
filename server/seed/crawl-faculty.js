/**
 * 기존 홈페이지(is.hanyang.ac.kr) 교수진 크롤러
 *
 * Usage: node server/seed/crawl-faculty.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'http://is.hanyang.ac.kr';
const OUTPUT_FILE = path.join(__dirname, 'faculty-seed.json');

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
  console.log('=== 교수진 크롤러 ===\n');

  const url = `${BASE_URL}/%ED%95%99%EA%B3%BC%EC%86%8C%EA%B0%9C/%EA%B5%90%EC%88%98%EC%A7%84-%EC%86%8C%EA%B0%9C`;
  console.log('Fetching:', url);
  const html = (await fetchUrl(url)).toString('utf-8');
  const $ = cheerio.load(html);

  const faculty = [];

  // Parse .professor-card elements
  $('.professor-card').each(function () {
    const $card = $(this);

    // Name & position from h3
    const h3Text = $card.find('.card-header h3').text().trim();
    // Pattern: "오현옥 교수" or "Arne Holger Kutzner 교수" or "김은찬 조교수"
    const nameMatch = h3Text.match(/^(.+?)\s*(교수|부교수|조교수)$/);
    const name = nameMatch ? nameMatch[1].trim() : h3Text;
    const position = nameMatch ? nameMatch[2].trim() : '교수';

    // Image
    const image = $card.find('.card-content img').attr('src') || '';

    // Research areas - individual li items
    const researchAreas = [];
    $card.find('.details ul li').each(function () {
      const text = $(this).text().trim().replace(/\s+/g, ' ');
      if (text) researchAreas.push(text);
    });

    // Footer: location/phone, email, homepage
    const footerPs = $card.find('.card-footer p');
    let location = '';
    let phone = '';
    let email = '';
    let homepage = '';

    footerPs.each(function () {
      const text = $(this).text().trim();
      // Location/phone: "산학기술관 501호 / 02-2220-1087"
      const locMatch = text.match(/^([A-Za-z가-힣]+관\s*\d+호)\s*\/?\s*([\d-]+)$/);
      if (locMatch) {
        location = locMatch[1].trim();
        phone = locMatch[2].trim();
        return;
      }
      // Email: "이메일: xxx@xxx"
      const emailMatch = text.match(/이메일:\s*([\w.@-]+)/);
      if (emailMatch) {
        email = emailMatch[1].trim();
        return;
      }
    });

    // Homepage link
    const homeLink = $card.find('.card-footer a.footer-button').attr('href') || '';
    if (homeLink && homeLink !== '#') {
      homepage = homeLink;
    }

    const prof = {
      name,
      position,
      email,
      image,
      researchAreas,
      location,
      phone,
      homepage,
      category: '교수진',
    };
    faculty.push(prof);
    console.log(`${faculty.length}. ${name} (${position})`);
    console.log(`   Email: ${email}`);
    console.log(`   Location: ${location} / ${phone}`);
    console.log(`   Homepage: ${homepage}`);
    console.log(`   Research: ${researchAreas.join(', ').substring(0, 100)}`);
    console.log('');
  });

  // Also check for elementor-based cards (박현석, 김은찬 may be in elementor)
  // If they were not captured by .professor-card, capture them separately
  const crawledNames = faculty.map((f) => f.name);

  // Check for elementor professors not in professor-card
  $('img').each(function () {
    const alt = $(this).attr('alt') || '';
    const src = $(this).attr('src') || '';
    if (!alt.includes('교수') && !alt.includes('조교수')) return;

    // Extract name from alt: "박현석 교수 사진" or "김은찬-교수"
    let imgName = alt.replace(/[-_]/g, ' ').replace(/\s*(교수|부교수|조교수)\s*사진?/, '').trim();
    if (crawledNames.includes(imgName)) return;

    // Walk up to find context
    let container = $(this);
    for (let i = 0; i < 15; i++) {
      container = container.parent();
      const text = container.text().trim();
      if (text.includes('@') && text.includes('연구분야')) break;
    }

    const sectionText = container.text().trim();
    const nameMatch2 = sectionText.match(/([\w\s가-힣]+?)\s*(교수|부교수|조교수)/);
    const name = nameMatch2 ? nameMatch2[1].trim() : imgName;
    if (crawledNames.includes(name)) return;

    const position = nameMatch2 ? nameMatch2[2].trim() : '교수';
    const emailMatch = sectionText.match(/이메일:\s*([\w.@-]+)/);
    const email = emailMatch ? emailMatch[1].trim() : '';

    // Try to get research areas from list items near image
    const researchAreas = [];
    container.find('li').each(function () {
      const text = $(this).text().trim().replace(/\s+/g, ' ');
      if (text && !text.includes('이메일') && !text.includes('관') && text.length < 100) {
        researchAreas.push(text);
      }
    });

    // Location/phone
    let location = '';
    let phone = '';
    const locMatch = sectionText.match(/([A-Za-z가-힣]+관\s*\d+호)\s*\/?\s*([\d-]+)/);
    if (locMatch) {
      location = locMatch[1].trim();
      phone = locMatch[2].trim();
    }

    // Homepage
    let homepage = '';
    container.find('a').each(function () {
      const href = $(this).attr('href') || '';
      if (href && href !== '#' && !href.includes('mailto:')) {
        homepage = href;
      }
    });

    const prof = {
      name,
      position,
      email,
      image: src,
      researchAreas,
      location,
      phone,
      homepage,
      category: '교수진',
    };
    faculty.push(prof);
    crawledNames.push(name);
    console.log(`${faculty.length}. ${name} (${position}) [elementor]`);
    console.log(`   Email: ${email}`);
    console.log(`   Location: ${location} / ${phone}`);
    console.log(`   Homepage: ${homepage}`);
    console.log(`   Research: ${researchAreas.join(', ').substring(0, 100)}`);
    console.log('');
  });

  // Add 겸임교수진
  const adjunctProfessors = [
    { name: '이훈희', email: 'hlee5698@naver.com', position: '겸임교수', category: '교수진', subcategory: '겸임교수진', image: '', researchAreas: [], location: '', phone: '', homepage: '' },
    { name: '김봉규', email: 'alexbongkyu@naver.com', position: '겸임교수', category: '교수진', subcategory: '겸임교수진', image: '', researchAreas: [], location: '', phone: '', homepage: '' },
    { name: '김낙일', email: 'master@nisoft.kr', position: '겸임교수', category: '교수진', subcategory: '겸임교수진', image: '', researchAreas: [], location: '', phone: '', homepage: '' },
  ];

  console.log('--- 겸임교수진 ---');
  for (const prof of adjunctProfessors) {
    faculty.push(prof);
    console.log(`${faculty.length}. ${prof.name} (${prof.position}) - ${prof.email}`);
  }

  // Add 자문교수
  const advisoryProfessors = [
    { name: '백인섭', email: 'uxdesigner@daum.net', position: '자문교수', category: '자문교수', image: '', researchAreas: [], location: '', phone: '', homepage: '' },
    { name: '이규한', email: 'kyuhanlee@korea.ac.kr', position: '자문교수', category: '자문교수', image: '', researchAreas: [], location: '', phone: '', homepage: '' },
    { name: '김규태', email: 'kimx1591@gmail.com', position: '자문교수', category: '자문교수', image: '', researchAreas: [], location: '', phone: '', homepage: '' },
    { name: '박준하', email: 'junha@tossbank.com', position: '자문교수', category: '자문교수', image: '', researchAreas: [], location: '', phone: '', homepage: '' },
    { name: '장윤상', email: 'ysjang@koreacb.com', position: '자문교수', category: '자문교수', image: '', researchAreas: [], location: '', phone: '', homepage: '' },
    { name: '신현진', email: 'hyunjin.shin@hudson-ai.com', position: '자문교수', category: '자문교수', image: '', researchAreas: [], location: '', phone: '', homepage: '' },
  ];

  console.log('\n--- 자문교수 ---');
  for (const prof of advisoryProfessors) {
    faculty.push(prof);
    console.log(`${faculty.length}. ${prof.name} (${prof.position}) - ${prof.email}`);
  }

  // Save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(faculty, null, 2), 'utf-8');
  console.log(`\nSaved ${faculty.length} faculty members to ${OUTPUT_FILE}`);
  console.log(`  교수진 (크롤링): ${faculty.filter((f) => f.category === '교수진' && !f.subcategory).length}`);
  console.log(`  겸임교수진: ${adjunctProfessors.length}`);
  console.log(`  자문교수: ${advisoryProfessors.length}`);
}

main().catch(console.error);
