# PIXELREALM

**PIXELREALM** is a browser-based pixel-art world simulator built with plain HTML, CSS, and JavaScript. Five kingdoms evolve across a procedural map and make political decisions of their own.

## Run locally

Download `index.html` and `game.js` into the same folder, then open `index.html` in a modern browser. No build step or external libraries are required.

## Features

- Procedural pixel world with grassland, forests, mountains, and water
- Five kingdoms, settlements, territory growth, population, economy, food, and technology
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
3. Use **Recruit army** to spend 80 treasury and 40 reserve troops to raise a new force.
4. Choose a target realm in the diplomacy panel and use **March to target** to muster at a nearby frontier in peacetime, or move toward its territory during war.
5. Use **Return home** to order an army back to its realm's capital. **Disband army** returns half its remaining troops to the reserve.
6. Use **Play** or **Advance year** to progress the simulation, and **Save world** to download a JSON save that can be imported later.

## Prototype limitations

This is an early client-side prototype. Armies are represented as compact map markers, not detailed animated soldiers. Battle outcomes and political events use lightweight simulation rules rather than a full historical or economic model. There is no multiplayer, cloud save, user account system, or online community backend yet.
