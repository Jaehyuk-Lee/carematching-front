# CareMatching: 요양사-환자 매칭 플랫폼 (프론트엔드)

요양사와 환자를 연결하는 매칭 플랫폼 서비스의 프론트엔드 레포지토리입니다.

> **프로젝트의 자세한 내용은 [carematching-backend의 README](https://github.com/Jaehyuk-Lee/carematching-backend#readme)를 참고하세요.**

## 📘 프로젝트 소개

CareMatching은 요양사와 환자를 효율적으로 연결하는 매칭 플랫폼입니다.  
검색, 채팅, 결제까지 한 번에 처리할 수 있는 원스톱 서비스를 제공합니다.

- **프로젝트 기간:** 2025.02.10 ~ 2025.03.09 (4주)
- **백엔드 레포지토리:** [carematching-backend](https://github.com/Jaehyuk-Lee/carematching-backend)

### 배경 및 기대효과

- **배경:** 고령 인구의 증가로 요양사 수요가 빠르게 확대
- **기대효과:** 쉽고 빠른 매칭, 실시간 소통, 간편 결제 등 편리한 사용자 경험 제공

---

## 🛠️ 기술 스택

### 프론트엔드

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat)
![SockJS](https://img.shields.io/badge/SockJS-000000?style=flat)
![STOMP](https://img.shields.io/badge/STOMP-000000?style=flat)
![Toss Payments](https://img.shields.io/badge/Toss_Payments-0064FF?style=flat)
![SweetAlert2](https://img.shields.io/badge/SweetAlert2-FF6F61?style=flat)
![Lucide React](https://img.shields.io/badge/Lucide_React-000000?style=flat)

### 백엔드

- Spring Boot, MariaDB, Redis, JWT, WebSocket 등  
  → [백엔드 프로젝트 바로가기](https://github.com/Jaehyuk-Lee/carematching-backend)

---

## ✨ 주요 기능

- 회원가입/로그인, 프로필 관리
- 요양사 자격 인증
- 실시간 채팅
- 커뮤니티 게시판 (일반/요양사 전용)
- 결제 시스템 (토스페이먼츠)

---

## 🗂️ 프로젝트 구조

```
carematching-front/
├── public/           # 정적 파일
├── src/              # 소스 코드
│   ├── api/          # 백엔드 API 통신을 위한 모듈 (JWT 작업 포함)
│   ├── components/   # 재사용 컴포넌트
│   ├── community/    # 커뮤니티 컴포넌트
│   ├── user/         # 사용자 인증 및 프로필 컴포넌트
│   └── ...
├── deployment/       # 배포 관련 설정 (Docker)
├── .github/          # GitHub Actions 워크플로우
└── ...
```

---

## ⚙️ 설치 및 실행 방법

1. **프로젝트 클론**
    ```bash
    git clone https://github.com/Jaehyuk-Lee/carematching-front.git
    cd carematching-front
    ```

2. **의존성 설치**
    ```bash
    npm install
    # 또는
    yarn install
    ```

3. **개발 서버 실행**
    ```bash
    npm start
    # 또는
    yarn start
    ```

4. **프로덕션 빌드**
    ```bash
    npm run build:prod
    # 또는
    yarn build:prod
    ```

---

## ⚙️ 환경 설정

- 개발 환경 실행: `npm start` (기본값: http://localhost:3000)
- 프로덕션 빌드: `npm run build:prod` (환경 변수: `.env.production`)

---

## 🚀 배포

- 프로젝트는 GitHub Actions를 통해 자동 배포됩니다.
- `.github`과 `deployment` 디렉토리에서 배포 관련 설정을 확인할 수 있습니다.
- 단, Github Action은 AWS 사용이 중지됨에 따라 Github Packages까지만 자동 배포되도록 변경했습니다.
