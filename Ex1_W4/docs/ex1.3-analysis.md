# Ex 1.3 — Phân tích anti-pattern: Validation Waterfall bằng 5 useEffect

## 1. Code legacy (mô phỏng InputField + SimpleForm cũ)

```jsx
// ❌ InputField giữ state RIÊNG rồi sync lên cha
function InputField({ name, onSync, error }) {
  const [local, setLocal] = useState('');
  useEffect(() => { onSync(name, local); }, [local]);            // #1 syncToParent (thiếu deps onSync, name)
  useEffect(() => { if (error) ref.current.scrollIntoView(); }, [error]); // #5 autoScrollToError
  return <input value={local} onChange={(e) => setLocal(e.target.value)} />;
}

// ❌ SimpleForm lưu errors/isValid như STATE rồi tính lại bằng effect
function SimpleForm() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [childErrors, setChildErrors] = useState({});
  useEffect(() => { setErrors(validate(values)); }, [values]);                 // #2 validateField
  useEffect(() => { setIsValid(Object.keys(errors).length === 0); }, [errors]); // #3 calcFormValidity
  useEffect(() => { setChildErrors(errors); }, [errors]);                      // #4 syncErrorsToChild
  ...
}
```

## 2. Render trace cho 1 phím gõ

| Bước          | Nguyên nhân                            | Render        |
| ------------- | -------------------------------------- | ------------- |
| onChange('a') | `setLocal`                             | InputField #1 |
| effect #1     | `onSync` → `setValues`                 | SimpleForm #2 |
| effect #2     | `setErrors`                            | SimpleForm #3 |
| effect #3, #4 | `setIsValid`, `setChildErrors` (batch) | SimpleForm #4 |
| effect #5     | errors đổi ở con → scroll / setState   | InputField #5 |

→ **~5 render / 1 keystroke**, mỗi render tạo lại toàn bộ VNode tree (Lab 2: cascading re-render).

## 3. Ba lỗi kiến trúc

1. **Redundant state**: `errors`, `isValid`, `childErrors` đều _suy ra được_ từ `values` → lưu thành state là trùng lặp (2 nguồn sự thật).
2. **Race condition / stale value**: giữa render #1 và #3 UI hiển thị `errors` của giá trị CŨ; gõ nhanh → các effect chạy xen kẽ, lỗi nhấp nháy sai.
3. **Infinite loop risk**: `onSync` là arrow function mới mỗi render; nếu thêm vào deps (đúng luật exhaustive-deps) → effect #1 chạy mỗi render → `setValues` → render → … → _Maximum update depth exceeded_.

## 4. Thiết kế mới (Sprint 2)

| Legacy                              | Mới                                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| State ở cả InputField và SimpleForm | **Một nguồn sự thật**: `values` trong `FormProvider` (Context)                   |
| `useEffect` → `setErrors`           | `errors = useMemo(() => validateForm(values), [values])` — **tính trong render** |
| `useEffect` → `setIsValid`          | `isValid = Object.keys(errors).length === 0` — biến thường                       |
| Prop drilling `error` xuống con     | Con đọc `useFormContext()`                                                       |
| `id` hard-code / thiếu label        | `useId()` + `<label htmlFor>` + `aria-invalid` + `aria-describedby`              |

**Kết quả đo được:** test `re-renders exactly once per keystroke` dùng `<Profiler onRender>` xác nhận **1 commit / 1 phím gõ** (trước: ~5).

## 5. Cách chứng minh khi bảo vệ

- React DevTools → Profiler → Record → gõ 1 ký tự → chỉ 1 commit.
- `grep -rn "useEffect" src/features/form` → 0 kết quả trong code.
