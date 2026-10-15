# PIXELREALM

**PIXELREALM** is a browser-based pixel-art world simulator built with plain HTML, CSS, and JavaScript. Five kingdoms evolve across a procedural map and make political decisions of their own.

## Run locally

Download `index.html` and `game.js` into the same folder, then open `index.html` in a modern browser. No build step or external libraries are required.

## Features

- Procedural pixel world with hand-drawn 16×16 pixel-art terrain, shoreline sand, water highlights, grass flecks, pine clusters, and snowy mountain tiles
- Crisp low-resolution sprites rendered without smoothing, including homes, upgraded city skylines, markets, farms, mines, forts, and realm-colored field soldiers
- Pixel-art presentation with hard-edge panels, squared HUD controls, and a monospace interface
- Five kingdoms, settlements, territory growth, population, economy, food, and technology
- **City development:** build roads, farms, mines, and markets, and upgrade settlements into level 2 and level 3 cities
- **Residential, commercial, and industrial zoning:** lay out town districts on owned land near settlements or roads; each zone has distinct pixel-art buildings and can be upgraded to density level 3
- **Dynamic city growth:** AI kingdoms expand districts around their towns and roads, then invest in denser districts over time
- **Working economy:** farms increase food stores, mines and markets generate treasury income, commercial/industrial districts earn recurring gold, and residential districts increase housing capacity and population growth
- **City visuals:** higher-level settlements gain taller structures; zone sprites visibly grow more dense at levels 2 and 3
- **Kingdom AI development:** realms gradually invest treasury into new farms, roads, markets, mines, city upgrades, and town districts
- Play/pause, simulation speed, advance-year, and terrain editing
- Diplomacy, relationship management, alliances, and AI-negotiated treaties
- Trade pacts with visible routes and recurring income
- Campaign-based wars with military attrition, war score, war exhaustion, and peace treaties
- **Field armies:** visible pixel units move across passable land using pathfinding
- **Army commands:** recruit a 40-troop army, choose a target frontier, return an army to its capital, or disband it to return some troops to reserve
- **Formations:** balanced, offensive, and defensive; offensive armies can advance farther each year and receive an attack bonus, while defensive formations improve local defense
- **Field battles:** armies can fight over contested land, lose troops and morale, retreat, or capture a territory
- **Siege warfare:** armies must reach fortified frontier districts before sieges can progress; successful sieges capture the target tile
- **Political AI:** kingdoms can negotiate trade, form alliances, declare war, and betray former partners
- **Royal dynasties:** rulers, heirs, aging, and disputed succession
- **Civil wars:** rebellions may spread, be suppressed, or force rebel districts to secede
- **Kingdom collapse** after total territorial loss
- Historical chronicle, active-war and field-army counters, and map overlays for sieges and rebel-held districts
- Browser autosave when supported, plus downloadable/importable JSON world saves
- Backward migration for older local save files

## Controls

1. Choose a world tool on the left and click a map tile.
2. Select a realm on the right. The **Field armies** section lets you select a unit and change its formation.
3. Use the **City development** tools on land owned by the selected realm: roads cost 10 gold, farms 25, mines 40, and markets 60.
4. Farms require empty grassland and add food each year. Mines require a mountain or an ore tile and add treasury income. Markets require a settlement and improve trade income and food stores.
5. Use **Homes** (15 gold), **Shops** (25 gold), and **Industry** (35 gold) to zone empty land; commercial zones must connect to a settlement, road, or existing commercial district.
6. Use **Upgrade city / district** on a settlement to raise it from level 1 to 2 (90 gold), then level 2 to 3 (160 gold). On a zoned district, upgrades cost 50 gold then 100 gold. More homes increase housing capacity; shops and industry provide yearly income.
7. AI kingdoms automatically zone land near towns and roads and may upgrade districts. The selected realm panel shows counts for each zone and its housing capacity.
8. Use **Recruit army** to spend 80 treasury and 40 reserve troops to raise a new force.
9. Choose a target realm in the diplomacy panel and use **March to target** to muster at a nearby frontier in peacetime, or move toward its territory during war.
10. Use **Return home** to order an army back to its realm's capital. **Disband army** returns half its remaining troops to the reserve.
11. Use **Play** or **Advance year** to progress the simulation, and **Save world** to download a JSON save that can be imported later.

## Prototype limitations

This is an early client-side prototype. Terrain and building graphics are handmade pixel patterns drawn directly on the canvas, rather than external sprite images. Armies use small pixel-art soldier markers; individual soldiers are not yet animated. Battle outcomes and political events use lightweight simulation rules rather than a full historical or economic model. There is no multiplayer, cloud save, user account system, or online community backend yet.
