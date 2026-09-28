# Tailfins & Tyrants

A 1-8 player browser beat 'em up with muscle cars and dinosaurs. It's an original spiritual successor to the 90s arcade brawlers: all art, music and characters are new and generated in code. There are no image or audio files.

## Play
Open `index.html` in a browser. No install or build step.

## Controls
| | Move | Attack | Jump | Special | Start / join |
|---|---|---|---|---|---|
| Keyboard A | WASD | J | K | L | Enter |
| Keyboard B | Arrows | Z or , | X or . | C or / | Right Shift |
| Gamepads (up to 4) | Stick / D-pad | X | A | B | Start |
| Phone | Left thumb stick | HIT | JUMP | SPEC | II |

M mutes. Esc or P pauses. Any free controller can press Start mid-game to join, up to 8 players.

## Content
- 8 heroes, 5 stages, a story told in cutscenes, a bonus driving stage in "The Duchess", 5 bosses, and a final Tyrant.
- Grab and throw, weapons with limited ammo, empty guns you can throw, food, and a saved high score table.
- Dinosaurs start calm (green). Hit one and it turns red and bites whoever hit it. Keeping them alive earns a Mercy bonus.

## Files
- `game.js`: engine, combat, AI, stages, story, UI
- `art.js`: procedural characters, dinosaurs, car, items
- `backgrounds.js`: 5 parallax stage backdrops
- `audio.js`: synthesized music and sound effects (Web Audio)
