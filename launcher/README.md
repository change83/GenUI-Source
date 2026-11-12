# Agent Launcher prototype

```bash
npm install
npm run dev
```

## Layout

- **Pinned area** (left): widgets and pinned agent outputs. Press and drag the frosted panel to move it anywhere; hover and click **Edit** to reorder, remove or add widgets.
- **Dynamic area** (right): unread outputs, the ongoing conversation, and suggested tasks. It stays top-aligned with the pinned area, 80px to its right, and moves with it.
- **Agent ball** (bottom): a WebGL liquid-glass pane (reused from `liquid-glass.html`) that morphs between states with spring physics. Page background and glass refraction share `public/bg.jpg`.

## Agent states

| State | How it appears |
| --- | --- |
| Listening | Default animated ball; with the mic on, its motion follows your voice |
| Keyboard | Start typing anywhere, or tap the ball; expands into a text field |
| Camera | Camera button in the text field; a live preview with a single recognition tag. Click outside or press Esc to close |
| Collaboration | A confirmation card when a running task needs your decision |
| Caption | With the speaker off (top-right), agent replies appear as a one-line caption |

The **Agent states** panel (bottom left) jumps to any state for demos.
