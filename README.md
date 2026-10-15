# PIXELREALM

**PIXELREALM** is a browser-based pixel-art world simulator built with plain HTML, CSS, and JavaScript. Five kingdoms evolve across a procedural map and make political decisions of their own.

## Run locally

Download `index.html` and `game.js` into the same folder, then open `index.html` in a modern browser. No build step or external libraries are required.

## Features

- Procedural pixel world with grassland, forests, mountains, and water
- Five kingdoms, settlements, territory growth, population, economy, food, and technology
- **City development:** build roads, farms, mines, and markets, and upgrade settlements into level 2 and level 3 cities
- **Working economy:** farms increase food stores, mines and markets generate treasury income, and upgraded or road-linked cities improve population growth
- **Kingdom AI development:** realms gradually invest treasury into new farms, roads, markets, mines, and city upgrades
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
3. Use the **City development** tools to build on the selected realm's land: roads cost 10 gold, farms 25, mines 40, and markets 60.
4. Farms require empty grassland and add food each year. Mines require a mountain or an ore tile and add treasury income. Markets require a settlement and improve trade income and food stores.
5. Click **Upgrade city** on a settlement to raise it from level 1 to 2 (90 gold), then level 2 to 3 (160 gold). Higher-level cities improve food, income, and population growth.
6. AI kingdoms also invest in development over time. The selected realm panel shows its counts of roads, farms, mines, markets, and city upgrades.
7. Use **Recruit army** to spend 80 treasury and 40 reserve troops to raise a new force.
8. Choose a target realm in the diplomacy panel and use **March to target** to muster at a nearby frontier in peacetime, or move toward its territory during war.
9. Use **Return home** to order an army back to its realm's capital. **Disband army** returns half its remaining troops to the reserve.
10. Use **Play** or **Advance year** to progress the simulation, and **Save world** to download a JSON save that can be imported later.

## Prototype limitations

This is an early client-side prototype. Armies are represented as compact map markers, not detailed animated soldiers. Battle outcomes and political events use lightweight simulation rules rather than a full historical or economic model. There is no multiplayer, cloud save, user account system, or online community backend yet.
