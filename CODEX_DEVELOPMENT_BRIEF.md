# Codex Development Brief

## Codex Execution Lock

This section has highest priority. If any later requirement conflicts with this section, follow this section first.

### 1. MVP First Goal

The first playable version must achieve this flow:

```text
用户进入首页 -> 30秒内开始完成任务 -> 获得星星反馈
```

Do not continue expanding other modules until this flow works.

### 2. Locked V1 Scope

Codex must not build these in V1:

- Login system.
- Cloud sync.
- Complex AI reasoning.
- Multi-character story expansion.
- Advanced animation engine.
- Complex shop/economy system.

### 3. Required Core Loop First

Implement this loop before map depth, parent depth, or visual polish:

```text
任务列表
  -> 点击完成
  -> +星星反馈
  -> 怪兽掉血
  -> 奖励可兑换
```

### 4. Child-First UI Constraints

- Core actions must fit within one primary screen whenever possible.
- User should not need more than 3 taps to complete the core loop.
- All buttons must be visual, card-like, and touch-friendly.
- Avoid dense text pages.
- The child should understand what to tap without reading instructions.

### 5. Failure Criteria

The build fails if:

- User must read a guide before using the app.
- User needs a tutorial to complete the first task.
- User must type text to play.
- The task -> star -> reward loop requires more than 2 screens.

### 6. Product Layering Rule

Treat the product as three layers:

| Layer | Purpose | Required First |
| --- | --- | --- |
| Level 1: 行为层 | 今天做什么 | Yes |
| Level 2: 反馈层 | 做了就得到星星 | Yes |
| Level 3: 情绪层 | 做得好就打怪兽 | Yes |

Everything else is decorative or administrative until the core loop is playable.

### 7. First Implementation Limit

The first engineering pass should build only:

- UI skeleton.
- Home page.
- Task list.
- Task completion.
- Star feedback.
- Basic reward redemption.
- Minimal monster HP reaction.
- `localStorage` persistence.

Do not start full map, full parent mode, or advanced monster progression until this first loop is verified.

## Project

**Name:** 振予 Builder Quest (V1)  
**Positioning:** 儿童版 Habit RPG + 任务系统 + 游戏化成长操作系统  
**One-line Definition:** 一个儿童触屏版人生 RPG 游戏系统，通过「任务 -> 星星 -> 奖励 -> 怪兽挑战」循环，让孩子把暑假生活游戏化。

## 1. MVP Goals

The MVP must support:

- iPad-first touch UI.
- Helper selection: 小螺丝 / 小螺母.
- Daily task completion with star rewards.
- Reward shop with star redemption.
- Four monsters plus Boss.
- Monster 5-level growth system.
- Summer map event nodes.
- Persistent local progress via `localStorage`.
- Parent mode control panel.

## 2. Required Tech Stack

### Frontend

- Next.js 14+
- React
- TypeScript
- Tailwind CSS

### State Management

- Use React `useState` / `useReducer`.
- Do not introduce Zustand, Redux, Jotai, MobX, or other state libraries in V1.

### Storage

- Use `localStorage`.
- Storage key: `bq_game_state`.

### Deployment

- Recommended: Vercel.

## 3. Routes

Implement these 8 routes:

| Route | Purpose |
| --- | --- |
| `/home` | 首页控制台 |
| `/helper` | 小帮手选择 |
| `/guide` | 游戏说明 |
| `/map` | 暑假地图 |
| `/tasks` | 今日任务 |
| `/rewards` | 奖励商店 |
| `/monsters` | 怪兽系统 |
| `/parent` | 家长模式 |

Default entry may redirect `/` to `/home`.

## 4. Core Game Loop

```text
完成任务
  -> 获得星星
  -> 攻击怪兽
  -> 推进怪兽进度
  -> 解锁 Boss
  -> 兑换奖励
  -> 第二天重复
```

## 5. Data Models

### 5.1 Player

```ts
type Player = {
  name: "振予";
  stars: number;
  level: number;
  selectedHelper: "screw" | "nut";
  monsterStage: 1 | 2 | 3 | 4 | 5;
};
```

### 5.2 Task

```ts
type Task = {
  id: string;
  title: string;
  type: "focus" | "english" | "clean" | "extra";
  stars: number;
  completed: boolean;
  date: string;
};
```

Default daily tasks:

| Type | Default Task |
| --- | --- |
| `focus` | 专注任务 |
| `english` | 英语任务 |
| `clean` | 整理任务 |
| `extra` | 自选任务 |

### 5.3 Reward

```ts
type Reward = {
  id: string;
  name: string;
  cost: number;
  claimed: boolean;
};
```

Required reward order:

1. 乐高零件袋
2. 和爸爸一起玩乐高
3. 我的世界乐高
4. 机器人设计挑战
5. 周末亲子活动
6. 小天才 Z12 手表

### 5.4 Monster

```ts
type Monster = {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  hp: number;
  defeated: boolean;
};
```

Required monsters:

- 拖拖怪
- 分心怪
- 乱乱怪
- 急急怪
- Boss: 混乱大魔王

### 5.5 MapNode

```ts
type MapNode = {
  id: string;
  name: string;
  status: "locked" | "active" | "done";
  date?: string;
};
```

Required map nodes:

- 任务基地
- 普吉岛英语岛
- VEX工厂
- 跆拳道能量塔
- 北京探索
- 7.5 游泳比赛（50m自由泳）
- 练字修炼营
- 高尔夫训练营（8.17-8.21）

### 5.6 Persisted State

```ts
type GameState = {
  player: Player;
  tasks: Task[];
  rewards: Reward[];
  monsters: Monster[];
  map: MapNode[];
};
```

Persist the full state:

```ts
localStorage.setItem("bq_game_state", JSON.stringify(gameState));
```

## 6. Monster System

### 6.1 Small Monsters

The game has four small monsters:

- 拖拖怪
- 分心怪
- 乱乱怪
- 急急怪

### 6.2 Boss

Boss name: 混乱大魔王.

Boss rules:

- Boss stays locked until all four small monsters are defeated.
- Boss has separate HP.
- Boss uses the same 5-level form system.
- When Boss is defeated, start next round with higher difficulty.

### 6.3 Five-Level Form System

| Level | Description |
| --- | --- |
| 1 | 初始形态 |
| 2 | 原始石器（石头/木棍） |
| 3 | 青铜/普通刀剑 |
| 4 | 铁甲装备 |
| 5 | 现代科技武器 |

### 6.4 Damage Rules

MVP damage rules:

- Completing one task grants stars and deals damage to the current active monster.
- Completing all daily tasks triggers a bonus and additional monster damage.
- Monster is defeated when `hp <= 0`.
- After one monster is defeated, the next undefeated monster becomes active.
- After all four small monsters are defeated, unlock Boss.

## 7. Task System

### Completion Flow

When user taps a task:

1. Set `completed = true`.
2. Add task stars to `player.stars`.
3. Deal monster damage.
4. Save updated state to `localStorage`.
5. Show immediate visual feedback.

### Full Completion Bonus

When all daily tasks are complete:

- Show "今日通关" celebration animation.
- Add bonus stars.
- Deal bonus damage to active monster.
- Save state.

## 8. Reward System

### Redemption Rules

- User can redeem only if `player.stars >= reward.cost`.
- On redemption:
  - subtract `reward.cost` from `player.stars`;
  - set `reward.claimed = true`;
  - disable the reward button;
  - save state.

### Required Reward Order

The UI must preserve this exact sequence:

1. 乐高零件袋
2. 和爸爸玩乐高
3. 我的世界乐高
4. 机器人挑战
5. 周末亲子
6. 小天才Z12

## 9. Helper System

### NPCs

| ID | Name | Personality |
| --- | --- | --- |
| `screw` | 小螺丝 | 鼓励型 |
| `nut` | 小螺母 | 策略型 |

### Rules

- Player chooses one helper at the start.
- Player may switch helper later.
- `/home` displays the current helper and a short voice-style prompt.

## 10. Map System

### Node Status

Map nodes progress:

```text
locked -> active -> done
```

### MVP Rules

- At least one node is active on first load.
- Parent mode can mark nodes as `locked`, `active`, or `done`.
- UI should make node status visually obvious.

## 11. Page Requirements

### `/home`

Show:

- Total stars.
- Current level.
- Current helper.
- Helper prompt.
- Quick entry buttons to core pages.

### `/helper`

Support:

- Select 小螺丝.
- Select 小螺母.
- Save selection to local state.
- Show selected state clearly.

### `/guide`

Show a concise child-friendly explanation:

- 做任务得星星.
- 星星可以换奖励.
- 完成任务可以打怪兽.
- 打败怪兽可以解锁 Boss.

### `/tasks`

Support:

- Daily task list.
- Tap to complete.
- Star reward display.
- Completion state.
- Full completion feedback.

### `/rewards`

Support:

- Reward list.
- Cost display.
- Redeem button.
- Claimed/disabled state.

### `/monsters`

Show:

- Four monsters.
- Boss.
- Current level.
- HP bar.
- Defeated state.
- Boss locked/unlocked state.

### `/map`

Show:

- Summer path.
- Required event nodes.
- Node status.

### `/parent`

Support:

- Modify task titles and star values.
- Add/subtract stars.
- Reset progress.
- Control monster HP/defeated state.
- Control map node status.

## 12. UI/UX Rules

Child-first design requirements:

- Large touch targets.
- Big, clear buttons.
- Strong visual feedback after taps.
- Card-based layout.
- Minimal text.
- Friendly colors and playful motion.
- Avoid complex forms.
- iPad-first responsive layout.

Implementation expectations:

- Buttons should feel tappable.
- Cards should be easy to scan.
- Use clear status colors for complete, locked, active, done, defeated, and claimed.
- Avoid dense admin-style UI on child-facing pages.
- Parent mode can be denser but must remain simple.

## 13. Suggested Component Tree

```text
src/
  app/
    layout.tsx
    page.tsx
    home/page.tsx
    helper/page.tsx
    guide/page.tsx
    map/page.tsx
    tasks/page.tsx
    rewards/page.tsx
    monsters/page.tsx
    parent/page.tsx
  components/
    AppShell.tsx
    BottomNav.tsx
    StatPill.tsx
    HelperCard.tsx
    TaskCard.tsx
    RewardCard.tsx
    MonsterCard.tsx
    HpBar.tsx
    MapNodeCard.tsx
    ParentPanel.tsx
  lib/
    gameTypes.ts
    defaultState.ts
    gameReducer.ts
    storage.ts
    gameRules.ts
```

## 14. State Design

Use `useReducer` for game actions:

```ts
type GameAction =
  | { type: "SELECT_HELPER"; helper: "screw" | "nut" }
  | { type: "COMPLETE_TASK"; taskId: string }
  | { type: "CLAIM_REWARD"; rewardId: string }
  | { type: "ADD_STARS"; amount: number }
  | { type: "SET_TASK"; taskId: string; title: string; stars: number }
  | { type: "SET_MONSTER_HP"; monsterId: string; hp: number }
  | { type: "SET_MONSTER_DEFEATED"; monsterId: string; defeated: boolean }
  | { type: "SET_MAP_NODE_STATUS"; nodeId: string; status: "locked" | "active" | "done" }
  | { type: "RESET_GAME" };
```

Storage behavior:

- Load default state if `localStorage` is empty.
- Load saved state from `bq_game_state` if available.
- Save after every reducer state change.
- Never lose progress after refresh.

## 15. MVP Sprint Breakdown

### Sprint 1: UI Skeleton

Deliverables:

- Create Next.js project scaffold.
- Add Tailwind CSS.
- Add app routes.
- Build shared layout.
- Build child-friendly navigation.
- Create empty page shells for all required pages.

Acceptance:

- All 8 routes load.
- `/` redirects or links to `/home`.
- Layout works on iPad-sized viewport.

### Sprint 2: Core Loop

Deliverables:

- Add core types.
- Add default game state.
- Add reducer and storage.
- Implement task completion.
- Implement star gain.
- Implement reward redemption.
- Persist state in `localStorage`.

Acceptance:

- User can complete a task.
- Stars increase.
- User can redeem a reward if enough stars.
- Refresh keeps stars, task states, and claimed rewards.

### Sprint 3: Monster System

Deliverables:

- Add four monsters and Boss.
- Add HP bars.
- Add monster damage on task completion.
- Add full daily completion bonus damage.
- Add monster defeat logic.
- Unlock Boss after four monsters are defeated.
- Add next-round difficulty behavior after Boss defeat.

Acceptance:

- Completing tasks damages monsters.
- Monsters can be defeated.
- Boss unlocks only after all four small monsters are defeated.
- Monster level and HP are visible.

### Sprint 4: Map + Parent Mode

Deliverables:

- Add summer map nodes.
- Add node statuses.
- Build parent controls for tasks, stars, monsters, map, and reset.
- Ensure all parent actions persist.

Acceptance:

- User can view map progress.
- Parent can edit task title/star value.
- Parent can add/subtract stars.
- Parent can control monster and map state.
- Parent can reset game.

## 16. Codex Execution Order

Codex must follow this order:

1. Output project structure.
2. Output code-level page UI sketch.
3. Implement Task -> Star -> Reward loop.
4. Implement Monster system.
5. Implement Map + Parent Mode.

## 17. Final Acceptance Criteria

The V1 build is accepted only if:

- Tasks can be tapped and completed.
- Stars can be earned.
- Rewards can be redeemed.
- Monsters can be attacked.
- Monsters can level/progress.
- Boss can unlock.
- Map can be viewed.
- Parent mode can control game state.
- Refresh does not lose data.
- UI is usable on iPad touch screens.

## 18. Non-Goals for V1

Do not implement in V1 unless explicitly requested:

- Backend database.
- Login/accounts.
- Multiplayer.
- Cloud sync.
- Complex animation engine.
- External state management library.
- Payment or real purchase flow.
- AI/OCR features.

## 19. Immediate First Task for Codex

Start by generating:

1. Folder structure.
2. Component tree.
3. Type definitions.
4. Default state.
5. Reducer action list.
6. Route skeleton.

Then proceed to Sprint 1 implementation.
