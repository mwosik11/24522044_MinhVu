# AI_FAILURE_AUDIT — Lab 4 (Ex1_W4)

> Nhật ký các lỗi do code / chỉ dẫn **AI sinh ra** mà em phát hiện trong quá trình review,
> cách chứng minh (test, DevTools, git diff) và cách sửa thủ công.
> Bằng chứng ảnh / log nằm trong `docs/evidence/`.
> Cột **Commit** ghi commit message; hash xem bằng `git log --oneline`.

## Tổng hợp

| #   | Nhóm         | Lỗi                                                                                                          | Phát hiện bằng                   | Commit sửa                                                   |
| --- | ------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------ |
| 01  | Routing      | Route `:id` bị đặt sai cấp → `/people` hiểu thành `id="people"`                                              | Vitest DOM dump                  | `feat(router): add detail route handling with 404 guard`     |
| 02  | Tooling      | Cấu hình Vitest (`test:` trong `vite.config.js`) không nằm trong commit setup → test chỉ pass trên máy local | `git diff`                       | `test(setup): add Vitest jsdom config to vite.config`        |
| 03  | Tooling      | AI cài `react-router` "latest" → ra **v8**, vi phạm đề yêu cầu v7                                            | `npm view react-router version`  | `chore(init): scaffold React 19 + Vite client` (ghim `@7`)   |
| 04  | Test         | Test server dùng `beforeEach` như global → `ReferenceError`                                                  | Chạy `vitest`                    | `test(api): add failing specs for messages API`              |
| 05  | Async / Hook | Hook mẫu (slide 26) không kiểm tra `res.ok`, không reset `loading` khi đổi kênh                              | Unit test + Network              | `feat(hook): add useForumMessages with AbortController`      |
| 06  | A11y / Form  | Context mẫu (slide 14) gọi `useId()` một lần ở Provider → mọi field trùng id                                 | Đọc code + test `getByLabelText` | `feat(form): add input field validation with useId and aria` |
| 07  | Contract     | 3 đường dẫn API khác nhau trong slide + CORS origin hard-code                                                | Đối chiếu slide 16/25/27         | `feat(api): add messages endpoints with validation and CORS` |

---

## Failure #01 — Route `:id` đặt sai cấp (Routing)

- **Prompt**: "Thêm route detail `:id` cho PersonDetail vào router."
- **AI output**: chỉ đưa một đoạn `children: [ { index… }, { path: ':id', … } ]` và bảo "đổi `children`" mà **không nói rõ children của route nào**. Khi áp vào, đoạn này thay `children` của route gốc `/`:
  ```jsx
  { path: '/', element: <RootLayout />, children: [
      { index: true, element: <PeopleIndex /> },
      { path: ':id', element: <PersonDetail people={SMART_PEOPLE} /> },   // ❌ con trực tiếp của "/"
  ] }
  ```
- **Bug**: route `people` và route `*` biến mất. `/people` khớp `:id` → render `404: Person Not Found` với ID "people"; `/people/sp-2` không khớp route nào → rơi vào `errorElement` (mất cả header).
- **Bằng chứng**: Vitest in DOM: `Không có hồ sơ với ID “people”` và trang 404 **không có `<header>`** → `docs/evidence/ex1-route-bug.txt`.
- **Engineering fix**: lồng đúng 3 cấp `/` → `people` → `:id` để `<Outlet />` của `PeopleLayout` có chỗ render; khôi phục route `*`. 6/6 test xanh.
- **Bài học**: không nhận patch "một mảnh" từ AI; yêu cầu AI đưa **toàn bộ file** hoặc chỉ rõ vị trí, rồi chạy test ngay.

## Failure #02 — Commit setup thiếu cấu hình Vitest (Tooling)

- **Prompt**: "Chia scaffold thành các commit: init → docs → test setup."
- **AI output**: đưa `vite.config.js` bản rút gọn ở commit 1, bản đầy đủ (có khối `test:`) ở commit 3, nhưng **lệnh `git add` của commit 3 không liệt kê `vite.config.js`**.
- **Bug**: khối `test: { environment: 'jsdom', globals: true, setupFiles }` chỉ tồn tại trên máy local. Repo sạch clone về sẽ lỗi `describe is not defined` → "works on my machine".
- **Bằng chứng**: `git status` báo `modified: vite.config.js` sau nhiều commit; `git diff vite.config.js` cho thấy toàn bộ khối `test:` chưa từng được commit → `docs/evidence/git-diff-vite-config.png`.
- **Engineering fix**: commit riêng cấu hình còn thiếu, thêm newline cuối file. Không dùng `git restore` (sẽ xoá mất cấu hình đang chạy).
- **Bài học**: trước mỗi commit chạy `git status` + `git diff`, đối chiếu đúng danh sách file trong `TASK_DECOMPOSITION.md`.

## Failure #03 — Cài nhầm React Router v8 (Version drift)

- **Prompt**: "Cài React Router cho dự án."
- **AI output (mặc định)**: `npm i react-router` / `react-router-dom` không ghim phiên bản.
- **Bug**: thời điểm làm bài, `latest` của `react-router` là **8.x** → lệch yêu cầu đề (v7) và lệch tài liệu slide.
- **Bằng chứng**: `npm view react-router version` → `8.5.1`; `npm view react-router@7 version` → `7.18.5`.
- **Engineering fix**: `npm i react-router@7`; `package.json` ghi `^7.18.5` (khoá major 7). Đồng thời **không chạy `npm audit fix --force`** vì lệnh này có thể nâng major.

## Failure #04 — Test server giả định Vitest globals (Test)

- **Prompt**: "Viết supertest cho GET/POST `/api/messages/:forum`."
- **AI output**: file test dùng `beforeEach`, `describe`, `it` mà không import — sao chép thói quen từ client (client bật `globals: true`, server **không có** cấu hình đó).
- **Bug**: `ReferenceError: beforeEach is not defined` — suite không chạy, 0 test.
- **Bằng chứng**: output `vitest run` trong `server/`.
- **Engineering fix**: import tường minh `import { beforeEach, describe, expect, it } from 'vitest'` → 8/8 xanh, không phụ thuộc config ẩn.

## Failure #05 — Hook fetch mẫu bỏ qua `res.ok` & stale loading (Async)

- **Nguồn**: code tham chiếu `useForumMessages` (slide 26) — đúng kiểu code AI thường sinh.
  ```js
  const res = await fetch(url, { signal });
  const result = await res.json(); // ❌ 404/500 vẫn bị coi là thành công
  if (!controller.signal.aborted) setData(result);
  // ❌ loading chỉ set true lúc khởi tạo → đổi kênh lần 2 không có trạng thái LOADING
  ```
- **Bug**: kênh `notNasa` (404) hiển thị `{ error: … }` như một danh sách; chuyển kênh vẫn hiện dữ liệu kênh cũ cho tới khi response mới về.
- **Bằng chứng**: test `moves to ERROR with the server message when res.ok is false`; Network tab `notNasa → 404` → `docs/evidence/ex3-notnasa-error.png`.
- **Engineering fix**: kiểm tra `res.ok` + đọc `{ error }` từ server; FSM `LOADING | SUCCESS | ERROR`; mỗi kết quả gắn key `forumId#reloadTick` → LOADING được **suy ra** khi key lệch (không `setState` đồng bộ trong effect), không bao giờ hiển thị dữ liệu kênh cũ; giữ guard `signal.aborted` thay cho cờ `didCancel`.

## Failure #06 — `useId()` dùng chung cho cả form (A11y)

- **Nguồn**: `FormProvider` mẫu (slide 14): `const fieldId = useId();` truyền qua Context.
- **Bug**: mọi `<input>` nhận **cùng một id** → `<label htmlFor>` chỉ trỏ tới field đầu tiên; screen reader đọc sai nhãn; `aria-describedby` trỏ nhầm lỗi. Vi phạm WCAG 1.3.1 / 4.1.2.
- **Bằng chứng**: test `binds every input to a visible label via useId` dùng `getByLabelText` cho từng nhãn; DevTools → Accessibility tree cho thấy mỗi textbox có tên riêng → `docs/evidence/ex2-aria-error.png`.
- **Engineering fix**: gọi `useId()` **trong từng `InputField`**; id lỗi = `${id}-error`; `aria-invalid` + `aria-describedby` chỉ bật khi field đã touched hoặc đã submit.

## Failure #07 — Hợp đồng API không nhất quán & CORS hard-code (Contract)

- **Nguồn**: slide 16 dùng `/api/channels/:id/messages`, slide 26 dùng `/api/forums/:id/messages`, slide 27 (server) dùng `/api/messages/:forum`; server mẫu `cors({ origin: 'http://localhost:5173' })`.
- **Bug**: ghép nguyên văn → client gọi endpoint không tồn tại (404 hàng loạt); origin cứng → đổi port/domain phải sửa code.
- **Engineering fix**: chốt **một** contract `/api/messages/:forum` cho cả client, server và test; `CLIENT_ORIGIN`, `PORT`, `API_DELAY_MS` đọc từ `process.env` (khai báo trong `.env.example`, `.env` bị `.gitignore`); client gọi `/api` cùng origin qua Vite proxy.

---

## Sự cố quy trình (lỗi thao tác của em, không phải do AI)

| Sự cố                                                                   | Hậu quả                                                               | Cách sửa                                                                              |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Đặt tên file `PeopleDetail.jsx` thay vì `PersonDetail.jsx`              | Router import không khớp tên file                                     | `git rm` + `git add` → commit `refactor(people): rename PeopleDetail to PersonDetail` |
| Đặt file test sai thư mục (`features/__test__/`)                        | `../../../router.jsx` trỏ ra ngoài `src` → `Failed to resolve import` | Xoá bản trùng, giữ `features/people/__tests__/`                                       |
| Commit message dính dấu `"` ở đầu/cuối                                  | Sai chuẩn Conventional Commits                                        | Commit **chưa push** → `git filter-branch --msg-filter` giới hạn `origin/main..HEAD`  |
| `git stash -u` trước khi rewrite → thư mục `src/components/` "biến mất" | Tưởng mất code                                                        | `git stash pop` sau khi rewrite xong                                                  |

**Nguyên tắc rút ra**: commit đã push thì không rewrite (sửa bằng commit mới); commit chưa push có thể dọn lại nhưng phải kiểm tra `git status` / `git log` trước và sau.

---

## Quy trình kiểm chứng đã áp dụng

1. **Contract → Fail test → Implement → Refactor**: mỗi sprint có commit `test(...)` đỏ trước commit `feat(...)`.
2. **Tự động**: client 25 test (Vitest + Testing Library), server 8 test (supertest); `npm run lint` với `eslint-plugin-react-hooks`.
3. **Thủ công**: DevTools Network (Slow 3G, request `(canceled)`), Accessibility tree, Device Toolbar 375px, React Profiler (1 commit / phím gõ).
4. **Git**: `git status` + `git diff` trước mỗi commit; `git log --oneline` đối chiếu `TASK_DECOMPOSITION.md`.
