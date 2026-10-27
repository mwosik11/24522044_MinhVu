# Project Rules — HW2 Audio Visualizer

## Technology

- Use TypeScript, HTML5, CSS, and native browser APIs.
- Use Vite for local development and production builds.
- Use the Web Audio API for audio loading, decoding, playback, and analysis.
- Do not introduce unnecessary external audio libraries.

## Engineering Constraints

- Define type contracts before implementing modules.
- Use const by default and let only when reassignment is required.
- Do not inject untrusted input using innerHTML.
- Use DOM APIs and textContent for dynamic text.
- Handle asynchronous failures and cancellation explicitly.
- Preserve FIFO processing order.
- Stop and disconnect audio nodes when no longer needed.
- Cancel animation frames and release resources during cleanup.
- Verify each functional slice before integration.
- Keep Git commits atomic and use Conventional Commits.
