# CareMatching

CareMatching은 돌봄 서비스를 필요로 하는 사용자와 돌봄 서비스 제공자를 연결하는 웹 기반 매칭 플랫폼입니다.

## 주요 기능

- 회원 관리 (일반 사용자, 돌봄 서비스 제공자)
- 돌봄 서비스 매칭 시스템
- 실시간 채팅 기능
- 결제 시스템 연동 (토스페이먼츠)

## 기술 스택

### 프론트엔드

- React 19.0.0
- React Router DOM 7.2.0
- Axios (HTTP 클라이언트)
- StompJS & SockJS (웹소켓 통신)
- Toss Payments SDK (결제 시스템)
- SweetAlert2 (UI 알림)
- Lucide React (아이콘)

### 백엔드

- Spring Boot - [백엔드 프로젝트](https://github.com/Jaehyuk-Lee/carematching-backend)

## 시작하기

### 필수 조건
- Node.js (최신 LTS 버전 권장)
- npm 또는 yarn

### 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/Jaehyuk-Lee/carematching-front.git
cd carematching-front
```

2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

3. 개발 서버 실행
```bash
npm start
# 또는
yarn start
```

4. 프로덕션 빌드
```bash
npm run build:prod
# 또는
yarn build:prod
```

## 환경 설정

- 개발 환경 실행: `npm start` (기본값: http://localhost:3000)
- 프로덕션 환경: `npm run build:prod` (환경 변수: `.env.production`)

## 배포

프로젝트는 GitHub Actions를 통해 자동 배포됩니다. `.github`과 `deployment` 디렉토리에서 배포 관련 설정을 확인할 수 있습니다.

단, 이 레파지토리의 Github Action은 AWS 사용이 중지됨에 따라 자동 배포 Action을 중지시켰습니다.
