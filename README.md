# Billion Dollar XI

A browser investment game. Every participant gets **$500 million** in 2016/17 to invest in an 11-player football portfolio (4-3-3), built up one season at a time. The most valuable portfolio at the final valuation in summer 2026 wins.

## Play
Open `index.html` in any modern browser. No server or install needed.

## Players
2–4 participants, in any mix of **humans and bots** (easy, normal or hard). With several humans it's **pass-and-play on one device**:
- Before each private turn (a signing or a transfer window), a "pass the device to X" screen appears.
- Each squad is visible only to its owner. In season reviews, every player has a "view privately" button.
- The log and participant list only say things like "Alice signed a Defender".
- Signings go in rounds: one signing each per round, and the first pick rotates every round. With 2 players it's A B | B A | A B…, with 3 it's A B C | B C A | C A B…. The rotation carries on into the transfer windows.

## Online play (friends in other places)
1. **Host:** open the game, choose **Host an online game**, enter your name and click **Create room**. You'll get a 5-character room code.
2. Add bots if you like, and send the code to your friends.
3. **Friends:** open the game, choose **Join an online game**, enter their name and the code.
4. Once everyone's in, the host clicks **Start the game**.

How it works:
- **The host's browser runs the game.** Each friend's browser is sent only that player's own screen, so nobody can see another player's squad, even with developer tools.
- **Connections are peer-to-peer** via [PeerJS](https://peerjs.com). Its free public server only introduces the browsers to each other, and the library loads from unpkg.com the first time you go online. Everyone needs an internet connection; playing locally works offline.
- **If a friend disconnects,** they rejoin with the same code and get their seat back. The host can also hand a missing player's seat to a bot.
- **Season reviews:** everyone clicks "Ready". The host can continue without someone who's away.
- **The host must keep their tab open.** Closing it ends the game for everyone.
- **Friends need the game files too.** Either send them the folder (zip it and share), or host it free on GitHub Pages / Netlify so everyone opens the same link.
- A few strict networks (some offices or schools) block peer-to-peer connections entirely.

### Online play across networks (relay / TURN server)
Players on the **same Wi-Fi** always connect. Players on **different networks** (e.g. one on home Wi-Fi, one on mobile data) often can't connect directly, because their routers block it. The connection then has to go through a **TURN relay server**. Without one, the joining player sees "Found the room but couldn't connect to the host" after about 20 seconds.

To set one up (free):
1. Sign up at [metered.ca/stun-turn](https://www.metered.ca/stun-turn) (the free tier is plenty for this game) and create an app.
2. In `game.js`, fill in near the "Connection servers" section:
   ```js
   const METERED_APP = "yourapp";        // the "yourapp" in yourapp.metered.live
   const METERED_API_KEY = "your-api-key";
   ```
   Or, if you already have a TURN server, add it to `TURN_SERVERS` instead:
   ```js
   const TURN_SERVERS = [{ urls: "turn:turn.example.com:443?transport=tcp", username: "user", credential: "pass" }];
   ```
3. **Everyone needs the updated file.** Easiest is to host the game on GitHub Pages / Netlify so all players open the same link.

Note: the API key ends up in the game files, so anyone with the files can use your relay allowance. That's fine for playing with friends; don't publish it widely.

## Game modes
Pick a mode on the home screen (or in the online room, as host) before starting. The rules shown on screen change with the mode.

- **⏱ Timer mode** (default): you have **30 seconds** for each signing. If you don't choose in time, the first player in the list you can afford is signed for you; if you can't afford any, the turn is skipped. Change the time with `PICK_SECONDS` in `game.js`.
- **🔭 Scout mode:** no timer. On the signing screen each prospect's **league, age and avg rating are locked**. Unlock any of them by paying from your cash. The price rises with how many unlocks you've made over the whole game:

  | Unlock # | 1–5 | 6–10 | 11 | 12 | 13 | … |
  |---|---|---|---|---|---|---|
  | Cost | $10m | $15m | $17m | $19m | $21m | +$2m each |

  Everything you pay counts as your **scouting bills**, shown in your panel and in the final results; since it comes out of cash, it lowers your final portfolio. Only the player who paid sees an unlocked stat. You can only scout with spendable cash (not the amount held back for your other open slots). Change the prices in `scoutPrice` in `game.js`.

### 🕵️ Special scouts (scout mode)
Each prospect card also offers two special scouts. They cost a fixed price, are added to your scouting bills, don't move the unlock price ladder, and are private like normal unlocks.

| Scout | Cost | Uses per game | What it reveals |
|---|---|---|---|
| 🌟 Superstar Scout | $20m | 1 | The valuation trend for the next two seasons (📈📈 big rise, 📈 rising, ➖ stable, 📉 falling, 📉📉 big fall). From 2024/25 on, the last step is the final 2026 valuation. |
| 🧢 Amateur Scout | $3m | 2 | The age as a 3-year range, e.g. 21–23. The real age could be anywhere in that range. Not offered once the exact age is unlocked. |

Prices and uses are in `SPECIAL_SCOUTS` in `game.js`.

### 🃏 Destiny cards (scout mode)
In **2018/19, 2021/22 and 2024/25**, before that season's signings, every participant picks **one of 3 face-down cards**. It's revealed and takes effect at once. **Draws are public:** every participant's card appears in the log and under their name in the Participants list (bots draw at random). Private details, such as which of your signings got injured, stay hidden. Your own active effects are listed in your panel.

| Card | Effect |
|---|---|
| 🎟 Golden Ticket | Next signing costs half price |
| 💀 Curse | Next signing costs double |
| 🏷 Scouting Day | All unlocks this season cost a flat $5m and don't count towards the scouting price ladder |
| ⭐ Star Billing | Next signing's value counts ×1.5 when sold or at the final valuation |
| 🔭 Scouting Network | 30% off all scouting for the rest of the game |
| 😤 Agent Fallout | Next signing costs 10% extra |
| 💰 Sponsor Deal | +$10m cash |
| ⚖ FFP Breach | −$10m cash |
| 🚫 Transfer Ban | No selling in the next transfer window |
| 🤕 Injury Crisis | One random signing loses 15% of their valuation |
| 📰 Leaked Report | Two random locked stats are revealed for free on your next selection (marked 📰 Leaked) |
| 🕵 Scout Poached | Next signing costs an extra $5m |

"Next signing" cards apply to the next player you actually buy; if you keep the cash, they carry over. Cards are defined in `DESTINY_CARDS` in `game.js`, and the seasons in `DESTINY_SEASONS`.

## Rules
1. **Sign players every season:** 2 in 2016/17, then 1 in every season up to 2025/26, so squads reach 11. The game picks each **position** at random from your open slots. You can skip a signing to keep the cash; the slot carries over to the next season. To change the schedule, edit `PICK_SCHEDULE` in `game.js`.
2. For every signing you get **5 hidden players**. You see their age, league, that season's stats (apps, goals, assists, clean sheets, average rating) and price (their market value). You don't see their name, nationality or club. In scout mode, age, league and average rating start locked (see above).
3. 🔒 **Everything stays sealed.** You never learn who you signed and never see value changes. Your players are shown as "Signing #n". Each season's review shows only their age, league and stats. The bot's squad is completely hidden.
4. **Transfer windows: 2019/20, 2023/24, 2025/26.** Sell up to 2 players blind: you get their current market value, revealed only after the sale. Then sign a replacement for each open slot (same hidden 5-player choice) or keep the cash.
5. **Captain:** after the last signings in 2025/26, each player privately picks one signing as captain (still sealed). The captain's value change counts **double**: bought for $20m and worth $50m adds an extra $30m; bought for $50m and worth $20m costs an extra $30m. Bots pick automatically (easy: random, normal: best form, hard: best market gain).
6. **Final valuation (summer 2026):** every player, value and the season-by-season history is revealed. Portfolio = cash + squad value + captain bonus. The biggest portfolio wins.
   - **The reveal:** before the standings, every signing is unmasked one at a time: real name, nationality and club, a chart of their market value across all 10 seasons up to the 2026 valuation (with the price you paid marked), and a stamp showing **You paid / Now worth** with a verdict (💎 Jackpot, ✅ Profit, 📉 Loss, 💀 Disaster). Online, each player steps through their own squad; on one device, everyone watches each human's squad in turn. "Skip to results" jumps straight to the standings, which stay hidden until then.

## Files
| File | Purpose |
|---|---|
| `index.html` | Page layout |
| `styles.css` | Styling |
| `data.js` | Player dataset (121 players × 10 seasons, plus a final 2026 value) and league list |
| `game.js` | Game rules, bot AI, rendering |

## Data
`data.js` holds **approximate** Transfermarkt market values (€m, shown 1:1 as $m) and approximate league stats, written from memory. They're not scraped. To use exact figures or add players, edit the rows:

```js
P("Name", "Country", "GK|DEF|MID|FWD", birthYear, finalValue2026, [
  // one row per season 2016/17..2025/26, or null if not yet a senior regular
  [club, leagueCode, marketValue, apps, goals, assists, cleanSheets, avgRating],
  ...
]);
```

A good source of real data is the open [transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets) project (player valuations and appearances as CSV).
