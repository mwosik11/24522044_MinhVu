# AI_FAILURE_AUDIT.md — Lab 4 HW2: Card-Swipe Deck

Real defects produced by AI-generated code or configuration while building this project.
Items 1–3 were hit on the developer machine and captured as screenshots; items 4–6 come from
the first AI draft that followed the lab's slide contracts and were caught by tests.

| # | Area | Severity | Caught by | Evidence / regression test |
|---|---|---|---|---|
| 1 | Server dev loop | Medium | Terminal | `docs/evidence/01-watch-restart-loop.png` |
| 2 | Test infrastructure | Medium | Vitest | `docs/evidence/02-memory-server-timeout.png` |
| 3 | Dev proxy | High | Browser UI | `docs/evidence/03-proxy-502.png` |
| 4 | Pointer gesture | High | Code review + test | `a short drag snaps back; a drag past the threshold likes` |
| 5 | API security | High | supertest | `ignores unknown fields`, `blocks NoSQL operator injection` |
| 6 | Undo persistence race | High | Vitest | `undo waits for the in-flight POST before sending DELETE` |

---

## 1. `node --watch` restart loop triggered by `node_modules`

**AI output:** `"dev": "node --watch --env-file=.env src/index.js"`

**Symptom:** the server restarted over and over with
`Change detected in '.../node_modules/mongoose/.../server_description.js'` and never printed
`MongoDB connected`.

**Root cause:** `--watch` watches every imported file, including dependencies. On macOS, npm
installs and Spotlight indexing touch those files and trigger restarts.

**Fix:** watch only our own code: `node --watch-path=./src --env-file=.env src/index.js`.

---

## 2. In-memory MongoDB hook timed out after 120 s

**AI output:** `MongoMemoryServer.create()` with the default configuration.

**Symptom:** `HookTimeoutError: Hook timed out in 120000ms` — all 12 API tests *skipped*,
not failed, so the suite gave no signal at all.

**Root cause:** on first run the library downloads a ~100 MB `mongod` binary; the download
did not finish within the hook timeout (npm also skipped the package's postinstall script).

**Fix:** `server/vitest.config.js` loads `server/.env` and the developer sets
`MONGOMS_SYSTEM_BINARY` to the locally installed `mongod` (`which mongod`). Suite now runs in ~1 s.
The variable is documented (commented out) in `.env.example`, never hard-coded.

---

## 3. Vite proxy returned 502 for every `/api` call

**AI output:** `proxy: { '/api': 'http://localhost:4000' }`

**Symptom:** the UI rendered but showed `Could not load profiles: Request failed (502)` and
`Could not restore your previous swipes: Request failed (502)`; every swipe button was disabled.
`http://localhost:4000/api/health` opened fine in the browser.

**Root cause:** Node 17+ resolves `localhost` to IPv6 `::1` first; the proxy and the API
did not meet on the same address family.

**Fix:** explicit IPv4 target `http://127.0.0.1:4000` (overridable via `API_PROXY_TARGET`).
The client-side error handling worked as designed — the failure was visible, not silent.

---

## 4. Drag start stored in state → crash / stuck card

**AI output:**
```jsx
const [startPos, setStartPos] = useState(null);
const handlePointerUp = (e) => {
  const dx = e.clientX - startPos.x; // TypeError when pointerdown never fired on the card
  ...
};
<div tabIndex={0} onKeyDown={handleKey} onPointerDown={...} onPointerUp={handlePointerUp}>
```

**Symptoms:**
- `TypeError: Cannot read properties of null (reading 'x')` when a drag starts outside the
  card and ends on it.
- Releasing the mouse outside the card never fires `pointerup` on it → card stuck mid-drag.
- Keyboard only works after clicking the div; Backspace would also fire inside text inputs.

**Fix:** start position in a `ref` + null guard + `pointerId` check, `setPointerCapture`,
`pointercancel` reset, `touch-action: none`; keyboard moved to a `window` listener
(`useKeyboardSwipe`) that ignores `e.repeat`, modifier keys and typing targets.

---

## 5. `Swipe.create(req.body)` — mass assignment and NoSQL injection

**AI output:**
```js
app.post('/api/swipe', async (req, res) => {
  const record = await Swipe.create(req.body);
  res.status(201).json(record);
});
```

**Symptoms (supertest):** extra fields such as `isAdmin` were passed to the model, and
`{ "profileSlug": { "$ne": null } }` made `Profile.exists()` match *any* profile.
Duplicate swipes and invalid actions returned **500** instead of 409 / 400.

**Fix:** whitelist `{ clientId, sessionId, profileSlug, action }`, reject non-string
`profileSlug` before querying, schema `enum` + `match`, unique index
`{ sessionId, profileSlug }`, and a central error handler mapping
ValidationError → 400, E11000 → 409, malformed JSON → 400, unknown → 500 without stack trace.

---

## 6. Undo sent DELETE before the POST finished

**AI output:**
```js
function undo() {
  const last = history.at(-1);
  dispatch({ type: 'UNDO' });
  api.deleteSwipe(last.clientId, sessionId);
}
```

**Symptom:** swipe then press Backspace immediately → DELETE reaches the server first
(nothing to delete, 204), then the POST arrives and stores the swipe. After a refresh the
"undone" card is gone again.

**Fix:** `pendingPosts` map (`clientId → Promise<boolean>`); undo awaits that entry's POST,
skips the DELETE if the POST failed, and pushes the entry back (`RESTORE_ENTRY`) if the
DELETE fails. Locked in by the race-guard integration test with a held POST.

---

## Lessons → prompt rules
1. Ask the AI to name **every** network address, file watcher and download its config relies on.
2. Never accept `Model.create(req.body)`; require a field whitelist in the prompt.
3. For optimistic UIs, ask: "what if request B arrives before request A?"
4. A skipped test suite is a failure — read the summary line, not just the colour.