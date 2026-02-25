const express = require('express');
const router = express.Router();
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://m.hanyang.ac.kr/',
        'User-Agent': 'Mozilla/5.0 (compatible)',
      },
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

router.get('/', async (req, res) => {
  const { apiUrl = '/HYRC/A202200006.json', gygj_cd, slg_sosok_cd = 'H0002867', lang_gb = 'ko' } = req.query;

  try {
    const url = new URL('https://m.hanyang.ac.kr/commonAjaxCall.json');
    url.searchParams.set('apiUrl', apiUrl);
    if (gygj_cd) url.searchParams.set('gygj_cd', gygj_cd);
    url.searchParams.set('slg_sosok_cd', slg_sosok_cd);
    url.searchParams.set('lang_gb', lang_gb);

    const { status, body } = await fetchJson(url.toString());

    if (status !== 200) {
      return res.status(status).json({ error: 'Failed to fetch curriculum data' });
    }

    res.json(body);
  } catch (err) {
    console.error('Curriculum fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch curriculum data' });
  }
});

module.exports = router;
