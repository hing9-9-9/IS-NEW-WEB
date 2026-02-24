import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const apiUrl = searchParams.get('apiUrl') || '/HYRC/A202200006.json';
  const gygj_cd = searchParams.get('gygj_cd');
  const slg_sosok_cd = searchParams.get('slg_sosok_cd') || 'H0002867';
  const lang_gb = searchParams.get('lang_gb') || 'ko';

  try {
    const url = new URL('https://m.hanyang.ac.kr/commonAjaxCall.json');
    url.searchParams.set('apiUrl', apiUrl);
    if (gygj_cd) url.searchParams.set('gygj_cd', gygj_cd);
    url.searchParams.set('slg_sosok_cd', slg_sosok_cd);
    url.searchParams.set('lang_gb', lang_gb);

    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://m.hanyang.ac.kr/',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch curriculum data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Curriculum fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum data' },
      { status: 500 }
    );
  }
}
