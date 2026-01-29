# PMO Suite Server README

## 1. 프로젝트 개요 (Project Overview)

본 프로젝트는 PMO-Suite 애플리케이션의 백엔드 서버입니다. Node.js, Express, TypeScript를 기반으로 구축되었으며, 데이터베이스로는 PostgreSQL을 사용합니다.

주요 역할은 프로젝트, 인력, 투입 현황 등 PMO(Project Management Office) 활동에 필요한 데이터를 관리하고 관련 API를 제공하는 것입니다.

## 2. 기술 스택 (Tech Stack)

- **런타임**: Node.js
- **프레임워크**: Express.js
- **언어**: TypeScript
- **데이터베이스**: PostgreSQL
- **테스팅**: Jest, Supertest
- **기타**:
  - `ts-node-dev`: 개발 환경에서 TypeScript 코드를 실시간으로 재시작
  - `pg`: PostgreSQL 드라이버
  - `cors`: Cross-Origin Resource Sharing 처리
  - `dotenv`: 환경 변수 관리

## 3. 설치 및 실행 (Installation and Execution)
```
    npm install
```
    
### 3.1. 환경 변수 설정 (Environment Variables)

프로젝트 루트 디렉터리에 `.env` 파일을 생성하고 아래와 같이 데이터베이스 연결 정보 및 서버 포트를 설정해야 합니다.

```
PORT=7070
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=pmo
```

### 3.2. 의존성 설치 (Dependencies Installation)

프로젝트에 필요한 모든 패키지를 설치합니다.

```bash
npm install
```

### 3.3. 데이터베이스 초기화 (Database Initialization)

아래 명령어를 실행하여 데이터베이스 및 테이블을 생성하고 초기 데이터를 자동으로 삽입합니다.

```bash
npm run db:init
```

이 명령어는 다음 작업을 수행합니다.
- `.env` 파일에 명시된 `DB_DATABASE` 이름으로 데이터베이스가 없는 경우 새로 생성합니다.
- `src/database/ddl.sql` 파일을 읽어 모든 테이블과 제약 조건을 설정합니다.
- `position_levels`, `projects`, `members`, `assignments` 테이블에 대한 초기 데이터를 삽입합니다.

### 3.4. 개발 서버 실행 (Running the Dev Server)

개발 모드에서는 코드 변경 시 서버가 자동으로 재시작됩니다.

```bash
npm run dev
```

서버는 `.env` 파일에 설정된 `PORT` (기본값 7070)에서 실행됩니다.

### 3.5. 프로덕션 빌드 및 실행 (Production Build & Run)

1.  TypeScript 코드를 JavaScript로 컴파일합니다.
    ```bash
    npm run build
    ```
2.  빌드된 JavaScript 코드로 서버를 실행합니다.
    ```bash
    npm start
    ```

## 4. API 엔드포인트 (API Endpoints)

모든 API는 `/api` 경로 아래에 위치합니다.

### 4.1. 직급 (Position Levels)

- `GET /position-levels`
  - **설명**: 시스템에 등록된 모든 직급 목록을 조회합니다. `sort_order` 순서에 따라 정렬되어 반환됩니다.
  - **응답**: `string[]` (예: `["Junior", "Senior", "Lead", ...]`)

### 4.2. 프로젝트 (Projects)

- `GET /projects`: 모든 프로젝트 목록 조회
- `GET /projects/:id`: 특정 ID의 프로젝트 정보 조회
- `POST /projects`: 신규 프로젝트 생성
- `PUT /projects/:id`: 특정 ID의 프로젝트 정보 수정
- `DELETE /projects/:id`: 특정 ID의 프로젝트 삭제

### 4.3. 인력 (Members)

- `GET /members`: 모든 인력 목록과 각 인력의 보유 기술(skills) 조회
- `GET /members/:id`: 특정 ID의 인력 정보와 보유 기술 조회
- `POST /members`: 신규 인력 및 보유 기술 정보 생성
- `PUT /members/:id`: 특정 ID의 인력 정보 및 보유 기술 수정
- `DELETE /members/:id`: 특정 ID의 인력 정보 삭제

### 4.4. 투입 현황 (Assignments)

- `GET /assignments`: 모든 투입 정보 목록 조회
- `GET /assignments/:id`: 특정 ID의 투입 정보 조회
- `POST /assignments`: 신규 투입 정보 생성
- `PUT /assignments/:id`: 특정 ID의 투입 정보 수정
- `DELETE /assignments/:id`: 특정 ID의 투입 정보 삭제

## 5. 테스트 (Testing)

Jest를 사용하여 API 엔드포인트에 대한 통합 테스트를 수행할 수 있습니다.

```bash
npm test
```
