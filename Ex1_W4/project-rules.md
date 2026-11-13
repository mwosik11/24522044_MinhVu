# UIT S3T — LAB 4 AI GOVERNANCE RULES

> AI assistant PHẢI đọc file này trước khi đề xuất bất kỳ thay đổi nào.

## 1. Stack

- Client: React 19 + Vite 8 + React Router **v7** (`react-router`, data mode `createBrowserRouter`).
- Server: Node 22 + Express 5 (ESM). Test: Vitest + Testing Library + supertest.
- Ngôn ngữ: JavaScript ES2024 + JSDoc contract. Không thêm thư viện ngoài danh sách trên khi chưa ghi vào WBS.

## 2. Banned APIs (AI hay sinh ra — reject ngay)

- Router v5: `<Switch>`, `<Redirect>`, `exact`, `component={}`, `activeClassName`, `react-router-dom` v5.
- `ReactDOM.render`, class component, `defaultProps`, `import * as React`.
- `var`, `keyCode`/`keypress`, `window.alert`, `innerHTML`, `dangerouslySetInnerHTML`, inline `onclick=`.
- Material-UI v4, `react-media`, `typeface-roboto`, Bootstrap/Tailwind/CDN.
- Cờ `didCancel`; Mongoose callback `(err, doc) => …`; secret/URI hardcode trong code.

## 3. Semantic & A11y

- Zero div-soup: dùng `<main>` (duy nhất 1, ở RootLayout), `<section>`, `<article>`, `<nav>`, `<dl>/<dt>/<dd>`, `<output>`.
- Mỗi route đúng 1 `<h1>`, không nhảy cấp heading.
- Mỗi `<input>` có `<label htmlFor>` với id từ `useId()` **trong chính component field**.
- Lỗi form: `aria-invalid` + `aria-describedby`. Nút icon-only bắt buộc `aria-label`.
- 375px không scroll ngang; contrast ≥ 4.5:1.

## 4. State hygiene

- Derived state (validation, filter, sort) tính **đồng bộ trong render**. CẤM useEffect để sync/validate.
- Immutable update: spread, `.filter`, `.toSorted`. Không `.push`/`.sort` lên state.
- Key = ID ổn định, không dùng index / `Math.random()`.

## 5. Effects & async

- Mọi effect có fetch/timer/listener PHẢI trả cleanup; fetch dùng `AbortController` + guard `signal.aborted`.
- Kiểm tra `res.ok` trước khi `res.json()`. Không để unhandled promise rejection.

## 6. Server

- Config qua `process.env` (`PORT`, `CLIENT_ORIGIN`); chỉ commit `.env.example`.
- Validate payload phía server giống phía client (parity). Lỗi trả JSON `{ error }` + status đúng (400/404/201).

## 7. Workflow

- Contract → Fail test → Implement → Refactor. Mỗi bước = 1 commit Conventional Commits.
- Một prompt chỉ cho MỘT sub-task trong `TASK_DECOMPOSITION.md`.
