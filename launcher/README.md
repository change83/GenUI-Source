# Agent Launcher prototype

```bash
npm install
npm run dev
```

## Layout

- **Pinned area** (left): widgets and pinned agent outputs. Press and drag the frosted panel to move it anywhere; hover and click **Edit** to reorder, remove or add widgets.
- **Dynamic area** (right): unread outputs, the ongoing conversation, and suggested tasks. It stays top-aligned with the pinned area, 80px to its right, and moves with it.
- **Task drawer** (right edge): push the pointer against the right screen edge to reveal it. **In progress** cards show the percentage, the current step ("Step 3 of 4 · Comparing specs and pricing") and a progress bar. **Completed** cards show the deliverable's thumbnail and open it on click; tasks with no deliverable state the result in text. Sample tasks are `backgroundTasks` and `finishedNotes` in `src/data.ts`.
- **Agent ball** (bottom): a WebGL liquid-glass pane (reused from `liquid-glass.html`) that morphs between states with spring physics. Page background and glass refraction share `public/bg.jpg`.

## Agent states

| State | How it appears |
| --- | --- |
| Listening | Default animated ball; with the mic on, its motion follows your voice |
| Keyboard | Start typing anywhere, or tap the ball; expands into a text field |
| Camera | Camera button in the text field; a live preview with a single recognition tag. Click outside or press Esc to close |
| Collaboration | A confirmation card when a running task needs your decision |
| Caption | With the speaker off (top-right), agent replies appear as a one-line caption |
| Phone call | The ball becomes a "Calling ..." card; once connected the call window splits off to the top-left |
| Reservation | The ball becomes the shop agent's reservation reply, with Ordering Menu and Directions |
| Fridge | The ball becomes the fridge agent's check for tonight's dish, with Buy now and Find substitutes |

The **Agent states** panel (bottom left) jumps to any state for demos.

## Referring

Say or type a word that is on screen and the agent pill flies to the card or widget that shows it, docking on the edge nearest that word, while rings ripple outward from the card. Typing `competitor` (or the misspelt `conpetior`) sends it to the "Competitor Analysis for Wearable Products" card.

- **Typed**: matched as you type in the text field; the field itself moves and sits just outside the card. Clearing the word, submitting or pressing Esc sends it home.
- **Spoken**: while listening with the mic on (click **Listening**), using the browser's speech recognition; the ball stays for 5s after the last mention. Recognition is English by default; add `?lang=zh-CN` for another language.
- **Without a microphone**: `?say=competitor` plays that phrase as if it had been heard, once you click **Listening**. Chrome's speech recognition needs to reach Google's service, so use this (or typing) where that is blocked.

Matching (`src/reference.ts`) reads the text of the feed cards and pinned widgets, tolerates plurals, word prefixes while typing and small misspellings, and lets the latest on-screen word decide.

## Phone call

Tell the agent to call someone: type or say `call mom`, `给妈妈打电话`, `打电话给老妈` or `phone Alex Chen`.

- **Dialing**: the ball morphs into a "Calling ..." card with the contact's avatar, name and a red hang-up button. It rings for about 3s.
- **Connected**: the call window (timer, remote video, your camera in the corner, hang-up) splits off the card and floats to the desktop's top-left, while the pill shrinks back into the ball. You can keep using the agent during the call.
- **Hanging up**: the red button, Esc while dialing, or typing/saying `hang up` / `挂断`.

Your own camera shows in the corner when the browser grants it; otherwise a still stands in. Contacts live in `src/data.ts`; an unknown name gets an initials avatar and a voice-only view. Parsing is in `src/call.ts`. Without a microphone, `?say=call%20mom` works like the referring demo above.

## Reservation

Book through a shop's agent: type or say `bluebird`, `蓝鸟`, `reserve`, `book a table`, `预约` or `预订`. The ball turns into Bluebird cafe's reply: "Your reserved seat for 3 p.m. has been confirmed."

- **Left alone**: after 6s the Ordering Menu and Directions buttons fade and the card shrinks to just the reply; 4s later it returns to the ball. Hovering the card holds it.
- **Ordering Menu**: the card grows into the menu; add items and pre-order them for 3 p.m.
- **Directions**: a route map with walk / drive / bus times and a start button.
- Back returns to the reply; Esc or a click outside closes it. Menu and directions stay until you close them.
- Spoken requests open the card once the sentence is finished: when the recognizer marks it final, or after 1.2s without new words.

The shop, menu and routes are in `src/booking.ts`; the card is `src/components/BookingCard.tsx`.

## Fridge

Ask a cooking question or say what you want to cook, typed or spoken: `I want to make tiramisu tonight`, `what can I cook tonight`, `what should I make for dinner`, `今晚做什么菜好`, `我想做提拉米苏`, `冰箱里还有什么`. Dish names (tiramisu, including recognizer spellings like "tira misu", cake, pasta, soup…) count, while "make a poster" and similar requests still run as tasks. As with reservations, a spoken question opens the card only after the sentence is finished.

The ball turns into the fridge agent's confirmation card. It shows "You're almost ready to make tiramisu tonight!" with the ingredient check (eggs, cheese, sugar, coffee), the missing Mascarpone Cheese 225 g at $5.99, and two buttons:

- **Buy now**: the card shrinks to "Mascarpone is on its way, arriving by 5 p.m. today." and returns to the ball after 4s.
- **Find substitutes**: three options. Greek yogurt + heavy cream is already in the fridge; cream cheese + heavy cream and blended ricotta can be bought. The button changes to "Use what I have" or "Buy · $price".

The card waits for a decision. Esc or a click outside closes it. The fridge's contents are in `src/fridge.ts`; the card is `src/components/FridgeCard.tsx`.
