require('dotenv').config();
const mongoose = require('mongoose');
const SiteSetting = require('../models/SiteSetting');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27108/is-web';

const content = `<div style="background:#0a2d5e;color:#fff;padding:16px 20px;margin-bottom:24px;border-left:4px solid #f59e0b;">
  <p style="font-size:13px;color:#fbbf24;font-weight:bold;margin-bottom:6px;">⚠ 필수 확인 사항</p>
  <p style="font-size:15px;font-weight:bold;line-height:1.6;">HY-IN 로그인 → MY홈 → 성적/졸업사정조회 → 졸업사정조회 → <u>필수과목이수조회</u></p>
  <p style="font-size:12px;color:#cbd5e1;margin-top:6px;">본인의 졸업 요건은 반드시 HY-IN 포털에서 직접 확인하시기 바랍니다.</p>
</div>

<h2>1. 졸업자격</h2>
<p>졸업을 하고자 하는 자는 다음 각항의 졸업사정기준을 모두 충족하여야 합니다.</p>

<h3>가. 유효학기</h3>
<ul>
  <li>4년(8학기) 이상 <em>(※ 공과대학 건축학부의 경우 5년(10학기) 이상)</em></li>
  <li>2학년 편입생의 경우 3년(6학기) 이상</li>
  <li>3학년 편입생의 경우 2년(4학기) 이상 유효성적학기가 있는 자</li>
  <li>조기졸업의 경우 6학기 이상 <em>(단, 공과대학 건축학부, 의과대학, 음악대학, 간호학부를 제외)</em></li>
</ul>

<h3>나. 단과대학 및 학과(부) 별 최소 졸업이수 학점 및 전공이수학점</h3>
<ul>
  <li>최소 졸업이수 학점 기준 및 전공이수학점은 단과대학별 / 본인이 적용받는 교육과정에 따라 적용됨</li>
  <li>본인이 적용받는 교육과정은 HY-IN 로그인 후 '졸업사정' 조회를 통해 확인 가능</li>
  <li>단일전공자와 다중(부)전공자 전공이수학점 기준은 상이함 (다중전공 전공이수기준 확인)</li>
  <li>다중(부)전공을 중도 포기하거나 낙제한 자는 주전공 이수학점 요건이 단일전공자 기준으로 상향 적용됨</li>
</ul>

<h3>다. 교양 이수학점 충족여부 및 핵심교양 영역별 이수학점 충족여부</h3>
<ol>
  <li>단과대학, 학과(부) 별로 핵심교양 영역 상이함</li>
  <li>2005~2008학번 학생의 경우 주의 (교양초과학점 졸업이수학점 불인정)<br>
  : 총 교양이수학점이 36학점을 초과 시 초과학점은 평점계산에는 포함되나, 졸업이수학점으로는 미인정.</li>
</ol>

<h3>라. 전체 누적평점 1.75 이상 여부</h3>
<ul>
  <li>2013년 신입생까지는 F 포함 2.00 이상</li>
  <li>조기졸업 해당자는 학번과 관계없이 누적평점 4.0 이상</li>
</ul>
<p><em>※ 졸업평점은 성적증명서 상 평점과 상이할 수 있으므로 증명용으로는 사용 불가</em></p>

<h3>마. 필수과목 및 택필과목, 선수강 교과목 이수여부</h3>

<h3>바. 사회봉사 이수 여부</h3>
<p><em>(단, 간호학부 간호학전공(야), 산업융합학부 제외)</em></p>

<h3>사. 영어전용강좌 의무이수</h3>
<ol>
  <li>영어전용강좌 3과목 의무이수 대상: 2006학번 이후 신입학생 및 2006학번 이후 편입학생 (2007학년도 이후 2학년 편입자 및 2008학년도 이후 3학년 편입학자)</li>
  <li>영어전용강좌 5과목 의무이수 대상: 2009학번 이후 신입학 및 2학년 특례편입학자</li>
  <li>의무이수 제외학과: 의과대학, 음악대학, 체육대학, 예술학부, 국제학부, 응용시스템학과</li>
</ol>

<h3>아. 인턴십 의무이수제</h3>
<p>2013학번 이후 신입생부터 적용 <em>(의과대학, 사범대학, 간호학부 제외)</em></p>

<h3>자. 교직이수자</h3>
<p>별도의 졸업사정 기준 적용 — 교직과에 문의 필요 (02-2220-1095)</p>

<h3>차. 단과대학 또는 전공별 별도 졸업사정 기준</h3>
<ul>
  <li>졸업논문(공학대학, 자연과학대학), 교직이수(사범대학) 등 단과대학별 졸업기준 필수 체크</li>
  <li>발표회, 연주회, 인증, 자격증 제출 등 단과대학 또는 전공별 졸업요건이 있을 경우 충족 필수</li>
</ul>

<h3>카. 학사운영팀 '졸업사정' 통과</h3>
<ul>
  <li>정규학기 재학 중 학사운영팀에서 진행하는 졸업사정을 통과하여야 졸업 가능</li>
  <li>휴학 중 졸업 불가 — 반드시 복학하여 정규학기 재학하여야 졸업예정자로 졸업사정 가능</li>
  <li>졸업사정 시기: 2월 초 (매학년도 전기 졸업 - 2월 학위수여), 8월 초 (매학년도 후기 졸업 - 8월 학위수여)</li>
</ul>

<h2>2. 대학별 졸업 이수학점 및 전공·교양 졸업요건 안내</h2>
<p><a href="https://www.hanyang.ac.kr/web/www/75">https://www.hanyang.ac.kr/web/www/75</a></p>

<h2>3. 졸업학점별 수료 기준</h2>
<ul>
  <li>수료여부는 이수학점만을 기준으로 하며, 해당 학년의 필수과목 이수여부 및 평점과는 무관</li>
  <li>학년별 수료기준 미충족 시 다음 학년 진급 등에 불이익은 없으며, 단순히 수료증명서를 미발급함</li>
  <li>각종 자격시험의 응시나 자격증 취득요건으로 특정 학년 수료를 필요로 하는 경우가 있으니 미리 확인하여 차질이 없도록 주의</li>
</ul>`;

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await SiteSetting.findOneAndUpdate(
    { key: 'graduation_content_학부' },
    { key: 'graduation_content_학부', value: content },
    { upsert: true, new: true }
  );
  console.log('학부 graduation content seeded');

  await mongoose.disconnect();
  console.log('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
