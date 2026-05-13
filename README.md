# 공동구매 서비스 — Frontend

마켓뱅 공동구매 v2 MVP 프론트엔드

## 프로젝트 구조

```
├── admin-front/     # 어드민 관리 화면 (Vue 3 + CoreUI + Vue CLI)
└── user-front/      # 유저 참여 화면 (Vue 3 + Vite, 모바일 우선)
```

## 기술 스택

### Admin Front
- Vue 3 (Composition API, script setup)
- CoreUI Vue 4.x
- Pinia (상태관리)
- Axios (HTTP)
- Vue CLI 5.x
- SASS (scoped)

### User Front
- Vue 3 (Composition API, script setup)
- Vite
- 마켓뱅 디자인 시스템 (Pretendard, 버건디 #911054, 라임 #7fe816)
- 모바일 우선 레이아웃

## 실행

### Admin Front
```bash
cd admin-front
npm install
npm run serve    # localhost:8081
```

### User Front
```bash
cd user-front
npm install
npm run dev      # localhost:8080
```

## API 연동
- Backend API: `http://localhost:8888`
- Swagger UI: `http://localhost:8888/swagger-ui.html`

## 담당 스토리
- Admin: AS-01 ~ AS-07 (로그인, 공구 등록/목록/상세/수정/취소)
- User: US-01 ~ US-06 (목록/상세/참여/취소/내역/결과확인) + SS-02 (폴링)
