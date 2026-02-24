/**
 * Seed graduation requirements HTML content
 * Source: http://is.hanyang.ac.kr/학사-일정/graduation
 *
 * Usage: node server/seed/seed-graduation-content.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SiteSetting = require('../models/SiteSetting');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27108/is-web';

const graduateContent = `<h2>이수학점</h2>
<table>
<tbody>
<tr>
<td colspan="2" style="background:#3057b9;color:#fff;text-align:center;"><strong>석사과정</strong></td>
<td colspan="2" style="background:#3057b9;color:#fff;text-align:center;"><strong>박사과정</strong></td>
<td colspan="2" style="background:#3057b9;color:#fff;text-align:center;"><strong>석‧박사통합과정</strong></td>
</tr>
<tr>
<td colspan="2" style="text-align:center;">27학점 이상</td>
<td colspan="2" style="text-align:center;">38학점 이상</td>
<td colspan="2" style="text-align:center;">59학점 이상</td>
</tr>
<tr>
<td style="background:#dfe6f7;text-align:center;">교과학점</td>
<td>22학점<br>– 전공 11학점 이상<br>– HYPER 한양 1학점<br>– 공통선택+타전공일반선택</td>
<td style="background:#dfe6f7;text-align:center;">교과학점</td>
<td>34학점<br>– 전공 17학점 이상<br>– HYPER 한양 1학점<br>– 공통선택+타전공일반선택</td>
<td style="background:#dfe6f7;text-align:center;">교과학점</td>
<td>52학점<br>– 전공 26학점 이상<br>– HYPER 한양 1학점<br>– 공통선택+타전공일반선택</td>
</tr>
<tr>
<td style="background:#dfe6f7;text-align:center;">연구학점</td>
<td>5학점<br>– 연구선택 3학점<br>– 석사논문연구 2학점</td>
<td style="background:#dfe6f7;text-align:center;">연구학점</td>
<td>4학점<br>– 박사논문연구1 2학점<br>– 박사논문연구2 2학점</td>
<td style="background:#dfe6f7;text-align:center;">연구학점</td>
<td>7학점<br>– 연구선택 3학점<br>– 박사논문연구1 2학점<br>– 박사논문연구2 2학점</td>
</tr>
</tbody>
</table>

<h2>종합시험</h2>
<h3>1. 신청자격</h3>
<table>
<tbody>
<tr>
<td style="background:#3057b9;color:#fff;text-align:center;">구분</td>
<td style="background:#3057b9;color:#fff;text-align:center;">석사과정</td>
<td style="background:#3057b9;color:#fff;text-align:center;">박사과정</td>
<td style="background:#3057b9;color:#fff;text-align:center;">석박사통합과정</td>
</tr>
<tr>
<td style="background:#dfe6f7;text-align:center;">등록</td>
<td style="text-align:center;">–</td>
<td style="text-align:center;">–</td>
<td style="text-align:center;">6기 이상</td>
</tr>
<tr>
<td style="background:#dfe6f7;text-align:center;">학점</td>
<td><u>18학점 이상</u> 취득완료<br>(2007학번까지는 과정이수학점 이상 취득완료)</td>
<td><u>졸업이수학점을 취득</u>하였거나 <u>이번학기까지 취득가능한 자</u><br>(1999학번~2009학번은 60학점이상 취득하였거나 이번학기까지 취득가능한 자)</td>
<td><u>졸업이수학점을 취득</u>하였거나 <u>이번학기까지 취득가능한 자</u></td>
</tr>
<tr>
<td style="background:#dfe6f7;text-align:center;">선수과목</td>
<td style="text-align:center;">이수완료</td>
<td style="text-align:center;">이수완료</td>
<td style="text-align:center;">이수완료</td>
</tr>
<tr>
<td style="background:#dfe6f7;text-align:center;">재학연한</td>
<td style="text-align:center;">입학후 7년이내<br>(휴학기간제외)</td>
<td style="text-align:center;">입학후 9년이내<br>(휴학기간 제외)</td>
<td style="text-align:center;">입학후 9년이내<br>(휴학기간 제외)</td>
</tr>
</tbody>
</table>

<h3>2. 과목선정 및 합격기준</h3>
<table>
<tbody>
<tr>
<td style="background:#3057b9;color:#fff;text-align:center;">과정</td>
<td style="background:#3057b9;color:#fff;text-align:center;">시험과목</td>
<td style="background:#3057b9;color:#fff;text-align:center;">합격기준</td>
<td style="background:#3057b9;color:#fff;text-align:center;">재시험</td>
</tr>
<tr>
<td style="text-align:center;">석사</td>
<td>전공과목 중에서 3과목 이상 선정하며, 2과목을 학과내규로 선정</td>
<td style="text-align:center;">60점 이상</td>
<td rowspan="2">· 1과목 불합격 시 다음 학기 재응시하며 2과목 이상 불합격 시 전과목 재응시 하여야 함<br>· 재응시 시 과목변경가능</td>
</tr>
<tr>
<td style="text-align:center;">박사/석박통합</td>
<td>전공과목 중에서 4과목 이상 선정하며, 학과내규로 선정</td>
<td style="text-align:center;">60점 이상</td>
</tr>
</tbody>
</table>
<p>3. 접수 및 시험 일정은 별도로 대학원 공지사항에 업로드 예정</p>

<h2>외국어시험</h2>
<p>1. 응시대상: 신입생을 포함한 재학생과 수료생</p>
<p>– 장애학생이 응시할 경우 대학원교학팀(02-2220-0222) 혹은 장애학생 지원센터(02-2220-1669)와 협의하여 필요한 지원을 받으시기 바랍니다.</p>
<h3>2. 시험과목</h3>
<table>
<tbody>
<tr>
<td style="background:#3057b9;color:#fff;text-align:center;">과정</td>
<td style="background:#3057b9;color:#fff;text-align:center;">시험과목</td>
</tr>
<tr>
<td style="text-align:center;">석사</td>
<td>영어, 한국어(외국 국적자) 중 1과목을 선택(단, 영어 모국어 국적자는 한국어만 응시 가능)</td>
</tr>
<tr>
<td style="text-align:center;">박사/석박통합</td>
<td>영어, 한국어 중 1과목을 선택하고, 제2외국어 실시학과의 경우 제2외국어 중 1과목 선택하여야 함<br>(단, 모국어가 영어가 아닌 외국인 학생의 경우 제2외국어로 영어를 선택할 수 있음)</td>
</tr>
</tbody>
</table>
<p>· 영어 모국어 해당국가: 가이아나, 뉴질랜드, 미국, 아일랜드, 영국, 오스트레일리아, 캐나다</p>
<h3>3. 유의사항</h3>
<p>대학원생은 다음 항목 중 1가지의 방법으로 어학시험을 이수하여야 학위청구논문 신청 및 졸업이 가능합니다.</p>
<p>(외국어시험 응시 / 공인 외국어 성적표 제출 / 해외 학위 소지자 면제 신청서 제출 / 시험 직전학기 방학 대체영어강좌 수강 합격자)</p>

<h2>학위청구논문</h2>
<h3>1. 신청대상</h3>
<table>
<tbody>
<tr>
<td style="background:#cedeef;text-align:center;">석사과정</td>
<td style="background:#cedeef;text-align:center;">박사/석박통합과정</td>
</tr>
<tr>
<td>
<ul>
<li>4기 이상 등록 (건축설계Ⅰ전공 5기, 건축설계Ⅱ전공 3기 이상)</li>
<li>졸업학점을 취득하였거나 취득가능한 자 (이번학기 수강신청 포함)</li>
<li>외국어시험 합격자</li>
<li>연구계획서 입력 및 승인완료자</li>
<li>재학연한이내: 휴학제외 입학 후 7년</li>
<li>연구지도 교과목 이수 혹은 이수가능한 자 (이번학기 수강신청 포함, 연구지도1,2 및 석사논문연구)</li>
</ul>
</td>
<td>
<ul>
<li>박사: 4기 이상 등록 / 석박통합과정: 6기 이상 등록</li>
<li>졸업학점을 취득하였거나 취득가능한 자 (이번학기 수강신청 포함)</li>
<li>외국어시험 합격자</li>
<li>단과대학 내규 및 학과 내규 충족자</li>
<li>연구계획서 입력 및 승인완료자</li>
<li>재학연한이내: 휴학제외 입학 후 9년</li>
<li>연구지도 교과목 이수 혹은 이수가능한 자 (이번학기 수강신청 포함, 연구지도1,2 및 박사논문연구1,2)</li>
</ul>
</td>
</tr>
</tbody>
</table>
<p>* 공과대학 내규</p>
<p>① 박사학위과정 학생은 전공 관련 학술지에 논문 게재 실적이 200%이상이 있어야 학위청구논문을 제출할 수 있다.</p>
<ul>
<li>A. 지도교수와 본인만의 2인 일 때: 100%</li>
<li>B. 지도교수와 본인포함 3인 일 때: 70%</li>
<li>C. 지도교수와 본인포함 4인 일 때: 50%</li>
<li>D. 지도교수와 본인포함 5인 이상 일 때: 30%</li>
<li>E. 국제저명학술지 중 해당분야 Q1 저널에 주저자(제1저자, 공동제1저자, 교신저자 또는 공동교신저자)로 논문 게재시 저자수와 무관하게 1편당 200%로 인정한다. (개정 2019.09.23.)</li>
<li>F. 국제저명학술지 중 해당분야 Q2 저널에 주저자(제1저자, 공동제1저자, 교신저자 또는 공동교신저자)로 논문 게재 시 저자수와 무관하게 1편당 100%로 인정한다.</li>
</ul>`;

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await SiteSetting.findOneAndUpdate(
    { key: 'graduation_content_대학원' },
    { key: 'graduation_content_대학원', value: graduateContent },
    { upsert: true, new: true }
  );
  console.log('대학원 graduation content seeded');

  await mongoose.disconnect();
  console.log('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
