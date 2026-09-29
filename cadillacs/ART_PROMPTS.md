# Art prompts - Tailfins & Tyrants

Prompts for generating the game art in an external image tool (ChatGPT Images).
Generated files go into the Google Drive folder `Tailfins Art` (https://drive.google.com/drive/folders/1Q2dLoKwP5GLZGnSOL8DKdV3lqQRseXT_) with the exact file names below.

## Rules for every image
- Download the original file (largest size). Do not screenshot.
- Keep the file name exactly as listed.
- Sprites use a flat magenta background (#FF00FF). The game removes it in code. This is more reliable than "transparent", which some tools fake with a checkerboard.

## Style block (included in every prompt)
```
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
```

## Pilot (5 images)
Goal: check quality, 4K resolution, and character consistency before generating everything.

### Chat 1 - background for stage 1 (Rust Harbor), 2 layers
The game scrolls the layers at different speeds for real depth.

**`bg1_far.png`**
```
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
Game background FAR layer, straight side view, 16:9 landscape, highest resolution available (4K if possible). A drowned 1979 harbor city at golden-hour sunset: huge tilted art-deco skyscrapers rising from calm turquoise seawater, overgrown with vines and hanging moss, a rusted suspension bridge broken in half, a long-necked dinosaur wading far away, pterosaur silhouettes against enormous glowing clouds, god rays and atmospheric haze. Everything is distant; nothing in the bottom 40% except calm reflective water. No characters, no text. The left and right edges must continue seamlessly so the image can repeat horizontally.
```

**`bg1_near.png`**
```
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
Game background NEAR layer, straight side view, 16:9 landscape, highest resolution available (4K if possible). The background behind the objects must be flat solid magenta #FF00FF (it will be cut out) - no sky, no haze, no gradients in the magenta area. Content: the bottom 45% of the image is a wide, empty, walkable cracked asphalt harbor road seen from a slight top-down angle, with puddles, grass in cracks and faded lane lines, uncluttered so characters can fight on it. Along the top edge of the road: a low concrete sea wall, rusty railings, a broken neon diner sign glowing pink and cyan, a half-sunk 1970s tailfin car, stacked crates, a street lamp. These objects stand in front of the magenta background. No characters, no text. The left and right edges must continue seamlessly so the image can repeat horizontally.
```

### Chat 2 - Cole (hero), 3 images in the SAME chat, in this order

**`cole_design.png`**
```
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
Character design sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Original hero "Cole Harlan", a rugged mechanic in his mid 30s, athletic muscular build, tanned skin, short messy dark curly hair, brass welding goggles pushed up on his forehead, stubble, orange mechanic jumpsuit with the top half tied around his waist by the sleeves, white ribbed tank top with grease stains, heavy brown leather work boots, a big steel wrench hanging from his belt. Show him full body head to boots in four views side by side: front, three-quarter, side profile facing right, back. Same scale in every view, clear gaps between views, no shadows on the ground.
```

**`cole_moves.png`**
```
Using the exact same Cole from the previous image (same face, proportions, colors, outfit), make a game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Row 1: fighting stance fists up, quick jab arm fully extended, powerful rear cross punch, rising uppercut. Row 2: high front kick at head height, jumping with knees tucked, flying jump kick leg extended, grabbing an enemy by the collar (enemy not shown, hands closed on empty air). Row 3: throwing overhead, recoiling after being hit with head snapped back, falling backwards mid-air, lying flat on his back knocked out.
```

**`cole_walk.png`**
```
Using the exact same Cole (same face, proportions, colors, outfit), make an 8-frame walk cycle sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. 2 rows x 4 columns, read left to right then top to bottom, one full stride: contact, down, passing, up, contact (other leg), down, passing, up. Every frame must differ clearly in leg and arm positions, arms swing opposite to legs, the body bobs slightly. Strict side view facing right, identical scale, feet on the same baseline in every frame, wide empty gaps between frames, no ground shadows, no text, no grid lines.
```

## Pilot result
Passed. Output size from ChatGPT: 1672x941 (not 4K). Cole and the stage 1 layers are in the game.

## Batch 2 - enemies (5 images)
One chat for all five. Before the first prompt, attach `cole_moves.png` (the Cole sheet from the pilot) so all enemies match its style.
The pink mohawk from the old punk design is now green, because pink would be cut out together with the magenta background.

**`enemy_punk.png`** - Punk (basic street thug)
```
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a different character. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible head to feet, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple anywhere on the character. Character: original street punk thug in his 20s, lean wiry build, pale skin, tall spiked acid-green mohawk, sleeveless torn black denim vest with metal studs over bare chest, ripped olive cargo pants, scuffed black combat boots, fingerless leather gloves, chain on his belt. Row 1: cocky boxing stance fists up, walking step 1, walking step 2, walking step 3. Row 2: walking step 4, pulling his fist back to punch, wild straight punch with arm fully extended, front kick at stomach height. Row 3: recoiling backwards after being hit with head snapped back, falling backwards mid-air, lying flat on his back knocked out, rising uppercut.
```

**`enemy_knifer.png`** - Knifer (fast, machete)
```
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a different character. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible head to feet, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple anywhere on the character. Character: original lean fast gang fighter in his late 20s, tan skin, short black hair, yellow bandana tied around his forehead, dark red sleeveless shirt, black jeans, worn sneakers, holding a long rusty machete in his front hand in every pose. Row 1: low crouched knife-fighter stance with machete forward, walking step 1, walking step 2, walking step 3. Row 2: walking step 4, machete raised high behind his head, fast diagonal machete slash downward, quick forward stab with the machete. Row 3: recoiling backwards after being hit with head snapped back, falling backwards mid-air, lying flat on his back knocked out, throwing a small knife overhand.
```

**`enemy_brute.png`** - Brute (big, slow, strong)
```
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a different character. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible head to feet, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple anywhere on the character. Character: original huge brawler in his 40s, very tall and wide, heavy belly and massive arms, fair sunburnt skin, brown buzz cut, thick brown beard, stained sleeveless brown undershirt, dark work trousers held by suspenders, heavy black boots, taped knuckles. Row 1: heavy wide stance with big fists raised, walking step 1, walking step 2, walking step 3. Row 2: walking step 4, both fists raised together above his head, huge rising uppercut, running shoulder charge leaning far forward. Row 3: recoiling backwards after being hit with head snapped back, falling backwards mid-air, lying flat on his back knocked out, stomping kick.
```

**`enemy_gunner.png`** - Gunner (rifle)
```
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a different character. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible head to feet, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple anywhere on the character. Character: original mercenary gunman in his 30s, medium build, olive skin, dark stubble, battered steel helmet with a red stripe, cream canvas field jacket, khaki trousers, brown boots, bullet belt across his chest, holding a long wooden bolt-action rifle in every pose. Row 1: standing ready holding the rifle across his body, walking step 1, walking step 2, walking step 3. Row 2: walking step 4, aiming the rifle at shoulder height, firing the rifle with recoil and a small muzzle flash, swinging the rifle butt forward as a club. Row 3: recoiling backwards after being hit with head snapped back, falling backwards mid-air, lying flat on his back knocked out, throwing a stick of dynamite overhand.
```

**`enemy_poacher.png`** - Poacher (shotgun)
```
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a different character. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible head to feet, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple anywhere on the character. Character: original dinosaur poacher in his 40s, stocky build, weathered tan skin, grey stubble, olive baseball cap, olive hunting vest with many pockets over a dirty beige shirt, dark brown trousers, muddy boots, a coiled rope on his hip, holding a short double-barrel shotgun in every pose. Row 1: standing ready holding the shotgun low, walking step 1, walking step 2, walking step 3. Row 2: walking step 4, aiming the shotgun at hip height, firing the shotgun with strong recoil and muzzle flash, swinging the shotgun stock forward as a club. Row 3: recoiling backwards after being hit with head snapped back, falling backwards mid-air, lying flat on his back knocked out, throwing a weighted net overhand.
```

## Still to come
7 heroes, 4 bosses, raptor and T-rex, cars and items, stages 2-5, title screen.
