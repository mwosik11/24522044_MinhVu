# TASK_DECOMPOSITION — Lab 4 (WBS)

Quy trình mỗi sub-task: **Contract → Fail test → Implement → Refactor**, mỗi task ↔ 1 commit.

## Block 1 — Setup & Governance

| ID   | Sub-task                             | Contract / Verify                            | Commit                                                      |
| ---- | ------------------------------------ | -------------------------------------------- | ----------------------------------------------------------- |
| T-00 | Scaffold React 19 + Vite + Router v7 | `npm run dev` chạy, không warning            | `chore(init): scaffold React 19 + Vite client`              |
| T-01 | Rules, WBS, env template             | 3 file docs tồn tại, `.env` bị ignore        | `docs(spec): define project rules, WBS and env template`    |
| T-02 | Test & lint toolchain                | `npm test` chạy được, eslint hooks rules bật | `test(setup): configure Vitest, Testing Library and ESLint` |

## Sprint 1 — Router v7 Master-Detail (Ex 1.1, 1.2, 1.2.1, 1.2.2)

| ID   | Sub-task                  | Contract / Verify                                            | Commit                                                        |
| ---- | ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| S1-1 | Spec routes (fail trước)  | 6 test fail vì chưa có `router.jsx`                          | `test(router): add failing specs for people master-detail`    |
| S1-2 | RootLayout + PeopleLayout | `<Outlet/>`, `NavLink` `aria-current`, 1 `<main>`            | `feat(router): add router layout with NavLink and Outlet`     |
| S1-3 | PersonDetail              | `useParams` + `people.find`, 404 `role="alert"`, `<dl>`      | `feat(router): add detail route handling with 404 guard`      |
| S1-4 | Lazy + Suspense (Ex 1.1)  | Chunk `PersonDetail-*.js` riêng, skeleton `aria-busy`, CLS 0 | `perf(router): lazy-load PersonDetail with Suspense skeleton` |
| S1-5 | Responsive grid           | `minmax(280px,1fr) 2fr` ≥768px, 375px không scroll ngang     | `style(people): responsive master-detail grid`                |

## Sprint 2 — Context Form Engine (Ex 1.3 + Sprint 2)

| ID   | Sub-task                           | Contract / Verify                              | Commit                                                     |
| ---- | ---------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| S2-1 | Phân tích anti-pattern 5 useEffect | Ghi trace + lý do vào `docs/ex1.3-analysis.md` | `docs(form): analyse useEffect validation waterfall`       |
| S2-2 | Spec `validateForm` + form (fail)  | Test pure function + 1 render / keystroke      | `test(form): add failing specs for form engine`            |
| S2-3 | FormContext + SimpleForm           | `errors` tính trong render, 0 useEffect        | `feat(form): add form context with synchronous validation` |
| S2-4 | InputField                         | `useId`, `aria-invalid`, `aria-describedby`    | `feat(form): add input field validation`                   |
| S2-5 | ShowData inspector                 | Submit hợp lệ → `<dl>` key/value               | `feat(form): add ShowData inspector output`                |

## Sprint 3 — Full-stack Hook & Express (Ex 1.7.1 + Sprint 3)

| ID   | Sub-task                        | Contract / Verify                                              | Commit                                                   |
| ---- | ------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| S3-1 | Scaffold Express server         | `PORT`/`CLIENT_ORIGIN` từ env                                  | `chore(server): scaffold Express server with env config` |
| S3-2 | Spec API (fail)                 | supertest: GET 200, POST 201, POST thiếu field 400             | `test(api): add failing specs for messages API`          |
| S3-3 | GET/POST `/api/messages/:forum` | CORS, validate payload, `crypto.randomUUID()`                  | `feat(api): add messages endpoints with validation`      |
| S3-4 | Spec hook (fail)                | Đổi kênh → request cũ bị abort, không set state                | `test(hook): add failing specs for useForumMessages`     |
| S3-5 | `useForumMessages`              | AbortController + `signal.aborted` guard + `postMessage`       | `feat(hook): add useForumMessages with AbortController`  |
| S3-6 | Channel switcher UI             | 3 kênh `nasa`/`esports-tribunal`/`notNasa`, Slow 3G (canceled) | `feat(forum): add live channel switcher page`            |

## Block 5 — Audit

| ID  | Sub-task                                       | Commit                              |
| --- | ---------------------------------------------- | ----------------------------------- |
| A-1 | `AI_FAILURE_AUDIT.md` ≥ 3 lỗi + DevTools proof | `docs(audit): add AI failure audit` |

**Tổng dự kiến: 20 commit** (yêu cầu tối thiểu 10).
