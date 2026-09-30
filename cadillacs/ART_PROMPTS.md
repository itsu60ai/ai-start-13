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

## Batch 2 - enemies (5 images) - done, in the game
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

## Batch 3 - heroes (13 images) - done, in the game
One new chat per hero. In each chat: attach `cole_moves.png`, paste the setup message, then the two hero messages. Tomas & Pebble is a single full prompt.

**Setup message (paste first in every hero chat)**
```
Reference image attached. Remember this art style for all my next requests in this chat. Do not generate an image now, just reply OK.
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
Every sheet: flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available, match the art style, line weight, shading and level of detail of the reference sheet exactly but draw the hero I describe, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible head to feet, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines, no magenta, pink or purple anywhere on the character.
SHEET A = 3 rows x 4 columns, 12 poses. Row 1: fighting stance, quick jab arm fully extended, powerful rear cross punch, rising uppercut. Row 2: high front kick at head height, jumping with knees tucked, flying jump kick leg extended, grabbing an enemy by the collar (enemy not shown). Row 3: throwing overhead, recoiling after being hit with head snapped back, falling backwards mid-air, lying flat on the back knocked out.
SHEET B = 2 rows x 4 columns, 8 poses. Row 1: walk cycle frames 1 to 4. Row 2: walk cycle frames 5 and 6, then the SPECIAL MOVE pose I describe, then aiming a pistol at shoulder height. The 6 walk frames form one full stride, each clearly different, arms swinging opposite to legs.
```

### Isla Varga - agile scout
**`hero_isla_a.png`**
```
Hero: Isla Varga, original agile scout woman in her late 20s, athletic lean build, mature face, warm brown skin, long black hair in one thick braid, teal cropped utility jacket with rolled sleeves over a sand-colored tank top, dark navy cargo pants, brown lace-up boots, small gold hoop earrings, a telescopic steel baton in her right hand in every pose. Make SHEET A.
```
**`hero_isla_b.png`**
```
Same hero, same face, outfit and proportions as the previous image. Make SHEET B. Special move pose: spinning baton cyclone: body twisting mid-spin, baton swept out horizontally, braid flying.
```

### Dax Okafor - speed kicker
**`hero_dax_a.png`**
```
Hero: Dax Okafor, original speed kicker man in his mid 20s, lean runner's build, dark brown skin, short buzz cut, red zip-up track jacket with a white stripe down each sleeve, black track pants, bright white high-top sneakers. Make SHEET A.
```
**`hero_dax_b.png`**
```
Same hero, same face, outfit and proportions as the previous image. Make SHEET B. Special move pose: whirlwind spinning kick: one leg extended horizontally mid-spin, arms out for balance.
```

### Anvil Kasza - tank grappler
**`hero_anvil_a.png`**
```
Hero: Anvil Kasza, original giant grappler man in his 50s, very tall and broad with a barrel chest and belly, pale skin, short grey buzz cut, thick grey beard, steel-blue work vest open over a bare chest, dark blue work trousers, heavy brown boots, his left arm is a bulky brass-and-steel steam-powered mechanical arm with pistons and a small smoking exhaust. Make SHEET A.
```
**`hero_anvil_b.png`**
```
Same hero, same face, outfit and proportions as the previous image. Make SHEET B. Special move pose: leaping ground slam: airborne with both fists, including the mechanical arm, raised above his head about to smash down.
```

### Juno Park - gunslinger
**`hero_juno_a.png`**
```
Hero: Juno Park, original gunslinger woman in her early 30s, slim build, mature face, light skin, long straight black hair, dark round sunglasses, long dark burgundy leather duster coat, charcoal shirt, dark grey trousers, black boots, gun belt with a silver revolver in a holster (the revolver is in her hand only in the two aiming poses). Make SHEET A.
```
**`hero_juno_b.png`**
```
Same hero, same face, outfit and proportions as the previous image. Make SHEET B. Special move pose: fanning the hammer: revolver held out at hip height, other hand slapping the hammer, bright muzzle flash.
```

### Doc Frost - field medic
**`hero_doc_a.png`**
```
Hero: Doc Frost, original field medic man in his 60s, sturdy build, fair skin, short white hair, neat white beard, round glasses, long off-white medical coat with a red cross patch on the upper arm, blue-grey trousers, black boots, a leather medical satchel across his body. Make SHEET A.
```
**`hero_doc_b.png`**
```
Same hero, same face, outfit and proportions as the previous image. Make SHEET B. Special move pose: spinning satchel swing: turning with the heavy medical satchel swung out wide on its strap, a soft green healing glow around him.
```

### Mara Quill - knife artist
**`hero_mara_a.png`**
```
Hero: Mara Quill, original knife artist woman in her late 20s, wiry build, mature face, olive skin, short fiery red mohawk, red bandana around her neck, black sleeveless top, brown leather trousers, black boots, leather forearm sheaths full of throwing knives, a knife in each hand. Make SHEET A.
```
**`hero_mara_b.png`**
```
Same hero, same face, outfit and proportions as the previous image. Make SHEET B. Special move pose: throwing a fan of three knives forward with a wide sweeping arm, the three knives in the air in front of her.
```

### Tomas & Pebble - kid on a tamed raptor
**`hero_tomas.png`** (one image, own chat, attach `cole_moves.png`)
```
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a different character. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, whole rider and raptor always visible, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines, no magenta, pink or purple anywhere on the characters. Characters: Tomas, an original cheerful boy of about 12, brown skin, messy dark hair under a blue baseball cap, yellow tank top, green shorts, brown sneakers, riding Pebble, his tamed raptor: a slim green raptor about as tall as an adult man, cream belly, dark green stripes on its back, a small leather saddle and rope reins. The boy always sits in the saddle. Row 1: standing ready, running step 1, running step 2, running step 3. Row 2: running step 4, raptor biting forward with its jaws wide open, raptor whipping its tail sideways, raptor pouncing through the air with claws forward. Row 3: recoiling after being hit, both tumbling backwards mid-air, both lying knocked out on the ground, raptor jumping straight up.
```

## Batch 4 - bosses and dinosaurs (7 images)
One chat for bosses, one for dinosaurs. In each chat attach `cole_moves.png` first, paste the style message, then one prompt at a time. The dinosaurs use their own pose list, because they do not punch or kick.

**Style message (first in both chats)**
```
Reference image attached. Remember this art style for all my next requests in this chat. Do not generate an image now, just reply OK.
ART DIRECTION - "Tailfins & Tyrants", a premium 2026 side-scrolling beat 'em up. World: America in 1979, forty years after dinosaurs returned. Tailfin muscle cars, drowned and overgrown cities, rusty neon, jungle reclaiming everything. Look: painterly stylized 3D - hand-painted brush textures over sculpted 3D forms, bold graphic silhouettes, thin dark ink outline, cinematic rim light, rich saturated palette (sunset orange, hot magenta accents, deep teal shadows), subtle film grain. Not photorealistic, not pixel art, not anime. Original designs only, no existing characters, logos or brands. No text, no watermark.
```

### Bosses
**`boss_bram.png`** - Butcher Bram (stage 1 boss)
```
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a different character. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible head to feet, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple anywhere on the character. Character: original boss 'Butcher Bram', a giant brutal butcher in his 50s, very tall and very wide with a huge belly and thick arms, pale ruddy skin, black buzz cut, black stubble beard, sleeveless blood-red tank top under a stained leather apron, dark trousers, black boots, a huge cleaver-like machete in his right hand in every pose. Row 1: menacing wide stance with the machete hanging low, walking step 1, walking step 2, walking step 3. Row 2: walking step 4, machete raised high overhead with both hands, huge overhead machete chop downward, wide horizontal machete slash. Row 3: recoiling backwards after being hit with head snapped back, falling backwards mid-air, lying flat on his back knocked out, charging forward leaning far ahead with the machete trailing.
```

**`boss_gator.png`** - Gator McCain (stage 2 boss)
```
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a different character. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible head to feet, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple anywhere on the character. Character: original boss 'Gator McCain', a swamp hunter in his 40s, tall and broad, tanned leathery skin, messy brown hair under a worn swamp-green cap, braided brown beard, dark green hunting vest over a dirty shirt, muddy brown trousers, tall rubber boots, a long alligator-tooth necklace, holding a pump-action shotgun in every pose. Row 1: relaxed confident stance holding the shotgun low, walking step 1, walking step 2, walking step 3. Row 2: walking step 4, raising the shotgun to aim, firing the shotgun with heavy recoil and a big muzzle flash, swinging the shotgun stock forward as a club. Row 3: recoiling backwards after being hit with head snapped back, falling backwards mid-air, lying flat on his back knocked out, lobbing a lit stick of dynamite overhand.
```

**`boss_holloway.png`** - Major Holloway (stage 4 boss)
```
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a different character. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible head to feet, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple anywhere on the character. Character: original boss 'Major Holloway', a ruthless old army major in his 60s, tall and heavily built, pale skin, slicked-back white hair, white moustache and goatee, long mustard-gold military greatcoat with brass buttons and shoulder boards, dark grey trousers, black polished boots, carrying a heavy black steel club in his right hand in every pose. Row 1: stern upright stance with the club resting on his shoulder, walking step 1, walking step 2, walking step 3. Row 2: walking step 4, club raised high behind his head, huge overhead club smash, running forward charge with the club trailing. Row 3: recoiling backwards after being hit with head snapped back, falling backwards mid-air, lying flat on his back knocked out, stomping kick.
```

**`boss_vane.png`** - Augustine Vane (final human boss)
```
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a different character. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, full body always visible head to feet, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple anywhere on the character. Character: original final boss 'Augustine Vane', an elegant ruthless industrialist in his 50s, tall and slim, very pale skin, slicked-back silver-white hair, thin cold smile, long pristine off-white coat over a white suit, white gloves, tan leather shoes, a gold pocket watch chain, amber-glowing cufflinks; he fights barehanded with fast precise martial arts. Row 1: calm upright duelist stance, one hand forward, walking step 1, walking step 2, walking step 3. Row 2: walking step 4, both hands pulled back gathering amber energy, fast flurry punch with a glowing amber fist, spinning high kick. Row 3: recoiling backwards after being hit with head snapped back, falling backwards mid-air, lying flat on his back knocked out, sweeping both arms out to release an amber shockwave.
```

### Dinosaurs
**`raptor_calm.png`** - Raptor, calm (green)
```
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a dinosaur. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, whole animal always visible including tail and head, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple on the animal. Animal: a slim agile velociraptor about as tall as an adult man, mossy green skin with dark green back stripes, cream belly, yellow eyes, feathery crest on its head and forearms, calm and curious mood. Row 1: standing relaxed, walking step 1, walking step 2, walking step 3. Row 2: walking step 4, head turned looking curious, sniffing the ground, sitting resting. Row 3: recoiling after being hit, falling sideways mid-air, lying knocked out on its side, startled with crest raised.
```

**`raptor_angry.png`** - Raptor, enraged (red)
```
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a dinosaur. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, whole animal always visible including tail and head, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple on the animal. Animal: the same slim velociraptor design but enraged: skin flushed deep red-brown with dark back stripes, cream belly, glaring orange eyes, crest raised, teeth bared. Row 1: aggressive crouched stance, running step 1, running step 2, running step 3. Row 2: running step 4, biting forward with jaws wide open, slashing with a foot claw, pouncing through the air claws forward. Row 3: recoiling after being hit, falling sideways mid-air, lying knocked out on its side, roaring with head thrown back.
```

**`rex.png`** - The Tyrant (final boss)
```
Game sprite sheet on a flat solid magenta #FF00FF background, 16:9 landscape, highest resolution available. Match the art style, line weight, shading and level of detail of the attached reference sheet exactly, but draw a dinosaur. 3 rows x 4 columns, 12 poses, wide empty gaps so no pose touches another, identical scale in every pose, whole animal always visible including tail and head, strict side view facing right, feet of each row on the same baseline, no ground shadows, no text, no grid lines. Do not use magenta, pink or purple on the animal. Animal: original giant tyrannosaur called The Tyrant, enormous and muscular, dark chestnut-brown skin with black stripes down its back and tail, pale sandy belly, scarred snout, one cloudy eye, glowing orange eyes, tiny arms, huge jaws. Row 1: menacing standing stance, heavy walking step 1, heavy walking step 2, heavy walking step 3. Row 2: heavy walking step 4, rearing back to roar with jaws wide open, crushing bite forward, stomping a huge foot down. Row 3: recoiling after being hit, toppling sideways, lying knocked out on its side, lunging forward mid-leap with jaws open.
```

## Still to come
Cars and items, stages 2-5, title screen.
