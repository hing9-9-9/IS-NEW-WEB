# 한양대학교 정보시스템학과 웹사이트

> is.hanyang.ac.kr 대체 웹사이트 — Next.js + Express.js + MongoDB

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Express.js, Mongoose |
| Database | MongoDB |
| Rich Text Editor | Tiptap (테이블·색상·이미지 업로드 지원) |
| Process Manager | PM2 |

## 사전 요구사항

- **Node.js** 20 이상
- **MongoDB** 7.x 이상 (로컬 또는 Atlas)
- **PM2** (프로덕션 배포 시): `npm install -g pm2`

## 환경변수 설정

### Backend (`server/.env`)

```env
MONGO_URI=mongodb://localhost:27018/is-web
SESSION_SECRET=your-secret-key-here
PORT=8070
NODE_ENV=production
CLIENT_URL=http://localhost:3001

# Admin 계정 (최대 3개)
ADMIN_USER_1_ID=admin1
ADMIN_USER_1_PW=password1
ADMIN_USER_2_ID=admin2
ADMIN_USER_2_PW=password2
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8070
```

## 개발 환경 설정

```bash
# 1. 의존성 설치
npm install
npm run server:install

# 2. 환경변수 파일 생성 (위 템플릿 참고)
cp server/.env.example server/.env   # 필요시 수정
cp .env.local.example .env.local     # 필요시 수정

# 3. 개발 서버 실행 (프론트 3001 + 백엔드 8070)
npm run dev:all
```

개발 서버:
- Frontend: http://localhost:3001
- Backend API: http://localhost:8070
- Admin: http://localhost:3001/admin

> `/uploads/*` 경로는 `next.config.ts`의 rewrite 설정으로 자동으로 Express 서버(8070)로 프록시됩니다.

## DB 시딩

MongoDB가 실행 중인 상태에서 실행합니다.

### 크롤링 (시드 파일 생성)

```bash
# 공지사항 크롤링 → notices-seed.json + seed/attachments/
node server/seed/crawl-notices.js

# 취업 게시판 크롤링 → jobs-seed.json + seed/attachments-jobs/
node server/seed/crawl-jobs.js
```

### 시딩

```bash
# 교수진 데이터
node server/seed/seed-faculty.js

# 연구실 데이터
node server/seed/seed-labs.js

# 행정직원 데이터
node server/seed/seed-staff.js

# 공지사항
node server/seed/seed-notices.js
node server/seed/seed-notices.js --dry-run   # 미리보기

# 취업공고
node server/seed/seed-jobs.js
node server/seed/seed-jobs.js --dry-run      # 미리보기

# 졸업요건 콘텐츠 (대학원)
node server/seed/seed-graduation-content.js

# 졸업요건 콘텐츠 (학부)
node server/seed/seed-graduation-undergraduate.js
```

## 이미지 · 첨부파일 마이그레이션

DB에 저장된 외부 이미지 URL과 로컬 첨부파일을 `server/uploads/`로 이관합니다.
**시딩이 먼저 완료된 상태에서 실행해야 합니다.**

```bash
# 미리보기 (파일/DB 변경 없음)
node server/seed/migrate-images.js --dry-run

# 실행
node server/seed/migrate-images.js
```

| Stage | 대상 | 소스 | 목적지 |
|-------|------|------|--------|
| A | 모델 이미지 (교수진·연구실·직원·히어로·학생회) | `is.hanyang.ac.kr` 외부 URL | `uploads/images/{model}/` |
| B | 공지사항 첨부파일 | `seed/attachments/{uid}/` | `uploads/files/notices/` |
| C | 공지사항 인라인 이미지 | `is.hanyang.ac.kr` 외부 URL | `uploads/images/notices/` |
| D | 취업공고 첨부파일 | `seed/attachments-jobs/{uid}/` | `uploads/files/jobs/` |

마이그레이션 후 이미지가 표시되지 않으면 (파일 다운로드 실패 시):

```bash
# 누락된 이미지만 재다운로드
node server/seed/redownload-images.js
```

## 프로덕션 빌드 & 배포

### 빌드

```bash
npm run build
```

### PM2로 실행

```bash
# 시작
pm2 start ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 재시작
pm2 restart all

# 중지
pm2 stop all

# 시스템 부팅 시 자동 시작
pm2 startup
pm2 save
```

## Nginx 설정

PM2로 서버를 띄운 뒤 nginx를 리버스 프록시로 사용합니다.

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Express: API 요청
    location /api/ {
        proxy_pass         http://localhost:8070;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Express: 업로드 파일 정적 서빙
    location /uploads/ {
        proxy_pass         http://localhost:8070;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Next.js: 프론트엔드
    location / {
        proxy_pass         http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 프로덕션 환경변수 체크리스트

| 파일 | 항목 | 값 |
|------|------|-----|
| `server/.env` | `CLIENT_URL` | `https://your-domain.com` |
| `server/.env` | `SESSION_SECRET` | 충분히 긴 랜덤 문자열 |
| `server/.env` | `NODE_ENV` | `production` |
| `.env.local` | `NEXT_PUBLIC_API_URL` | `https://your-domain.com` |

> **주의:** `app.set('trust proxy', 1)` 설정이 `server/index.js`에 포함되어 있어, nginx가 HTTPS를 종단(SSL termination)하더라도 세션 쿠키의 `Secure` 플래그가 정상 작동합니다.

## npm 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm run dev` | 프론트엔드 개발 서버 (포트 3001) |
| `npm run dev:server` | 백엔드 개발 서버 (포트 8070, nodemon) |
| `npm run dev:all` | 프론트 + 백엔드 동시 실행 |
| `npm run build` | Next.js 프로덕션 빌드 |
| `npm start` | Next.js 프로덕션 서버 (포트 3001) |
| `npm run server:install` | 백엔드 의존성 설치 |

## 디렉토리 구조

```
├── public/                   # 정적 파일 (로고 등)
├── src/
│   ├── app/
│   │   ├── admin/            # 관리자 페이지 (세션 인증 필요)
│   │   │   ├── notices/      # 공지사항 CRUD
│   │   │   ├── jobs/         # 취업정보 CRUD
│   │   │   ├── requirements/ # 졸업요건 (학부/대학원 리치텍스트)
│   │   │   └── ...
│   │   ├── about/            # 소개 (교수진, 연구실, 위치 등)
│   │   ├── academic/         # 학사 안내 (일정, 졸업요건)
│   │   ├── curriculum/       # 교과안내 (학교 API 프록시)
│   │   └── ...
│   ├── components/
│   │   └── ui/
│   │       ├── RichTextEditor.tsx  # Tiptap 에디터 (테이블·색상·이미지)
│   │       ├── LoadingSpinner.tsx
│   │       └── PageHeader.tsx
│   ├── data/                 # 네비게이션 등 정적 데이터
│   └── lib/
│       ├── api.ts            # API 클라이언트 (타입 포함)
│       └── utils.ts          # 공통 유틸리티 (formatDate 등)
├── server/
│   ├── index.js              # Express 서버 진입점
│   ├── models/               # Mongoose 모델
│   ├── routes/               # API 라우트
│   │   ├── upload.js         # 에디터 이미지 업로드 (POST /api/upload/image)
│   │   └── ...
│   ├── middleware/            # 인증 미들웨어 (express-session)
│   ├── seed/                 # 시딩/마이그레이션 스크립트
│   └── uploads/              # 업로드 파일 저장소
│       ├── images/
│       │   ├── editor/       # 에디터에서 업로드한 이미지
│       │   └── notices/      # 공지 인라인 이미지 (마이그레이션)
│       └── files/
│           ├── notices/      # 공지사항 첨부파일 (마이그레이션)
│           └── jobs/         # 취업공고 첨부파일 (마이그레이션)
├── next.config.ts            # /uploads/* → Express 프록시 rewrite
├── ecosystem.config.js       # PM2 설정
└── package.json
```
