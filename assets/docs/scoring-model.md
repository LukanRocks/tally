# Scoring model

---

Every session logged in Tally awards points to all participating players. The model is built around two ideas:

1. **Participation matters** — just showing up should always be worth something.
2. **Winning matters more** — first place should always have a meaningful edge over second.

## The formula

```
points = N - (P - 1) + (P === 1 ? 1 : 0)
```

| Variable | Meaning |
|---|---|
| `N` | Total number of players in the session |
| `P` | Finish position — `1` is first place (winner), `N` is last |

### Breaking it down

**Base score: `N - (P - 1)`**

You start with `N` points and lose one for each player who finished ahead of you. The more players in the game, the more points are in play — a win in a 6-player game is worth more than a win in a 3-player game.

**Win bonus: `+ 1 if P === 1`**

The winner gets an extra point on top of the base score. This ensures that 1st place always scores strictly more than 2nd place, not just by one.

**Minimum 2 players**

Sessions with fewer than 2 participants award 0 points to everyone. A solo play doesn't count toward the leaderboard.

## Examples

### 4-player game

| Place | Calculation | Points |
|---|---|---|
| 1st | 4 − 0 + 1 (win bonus) | **5** |
| 2nd | 4 − 1 | **3** |
| 3rd | 4 − 2 | **2** |
| 4th | 4 − 3 | **1** |

### 6-player game

| Place | Calculation | Points |
|---|---|---|
| 1st | 6 − 0 + 1 (win bonus) | **7** |
| 2nd | 6 − 1 | **5** |
| 3rd | 6 − 2 | **4** |
| 4th | 6 − 3 | **3** |
| 5th | 6 − 4 | **2** |
| 6th | 6 − 5 | **1** |

Notice that last place always scores exactly **1 point**, regardless of how many players were in the game.

## Why this model?

The simplest approach would be to award points purely for each player you beat — but that leaves last place at 0 every time.

Over a long series of game nights, a player who shows up consistently but rarely wins would fall far behind someone who appeared once and won. That discourages regular participation, which is exactly the opposite of what Tally is for.

We love competition but having friends around to compete is more important! The +1 floor means **showing up always counts**. The win bonus means **winning still counts more**. The gap between 1st and 2nd (2 points) is always larger than the gap between any other two adjacent places (1 point), so there's always something real at stake at the top.

## A note on historical scores

Points are calculated and stored at the time a session is logged. If you edit a session later, the scores are recalculated — but past sessions you haven't touched remain exactly as they were. This means future changes to the formula (if any) won't silently rewrite history.
