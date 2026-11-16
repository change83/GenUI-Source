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

## Referring

Say or type a word that is on screen and the agent pill flies to the card or widget that shows it, docking on the edge nearest that word, while rings ripple outward from the card. Typing `competitor` (or the misspelt `conpetior`) sends it to the "Competitor Analysis for Wearable Products" card.

- **Typed**: matched as you type in the text field; the field itself moves and sits just outside the card. Clearing the word, submitting or pressing Esc sends it home.
- **Spoken**: while listening with the mic on (click **Listening**), using the browser's speech recognition; the ball stays for 5s after the last mention. Recognition is English by default; add `?lang=zh-CN` for another language.
- **Without a microphone**: `?say=competitor` plays that phrase as if it had been heard, once you click **Listening**. Chrome's speech recognition needs to reach Google's service, so use this (or typing) where that is blocked.

Matching (`src/reference.ts`) reads the text of the feed cards and pinned widgets, tolerates plurals, word prefixes while typing and small misspellings, and lets the latest on-screen word decide.
