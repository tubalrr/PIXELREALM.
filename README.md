# PIXELREALM

**PIXELREALM** is a browser-based pixel-art world simulator built with plain HTML, CSS, and JavaScript. Five kingdoms evolve across a procedural map and make political decisions of their own.

## Run locally

Download `index.html` and `game.js` into the same folder, then open `index.html` in a modern browser. No build step or external libraries are required.

## Features

- Procedural pixel world with grassland, forest, mountain, and water
- Five kingdoms, settlements, territory growth, population, economy, food, and technology
- Play/pause, simulation speed, advance-year, and terrain editing
- Diplomacy, relationship management, alliances, and AI-negotiated treaties
- Trade pacts with visible routes and recurring income
- Campaign-based wars with military attrition, war score, war exhaustion, and peace treaties
- Siege progress against fortified frontier districts; successful sieges capture territory
- Political AI that can make alliances, negotiate trade, begin conflicts, and betray old pacts
- Royal dynasties, rulers, heirs, aging, and disputed succession
- Civil wars that can spread, be suppressed, or lead to rebel districts seceding as independent frontier territory
- Kingdom collapse after total territorial loss
- Historical chronicle, active-war indicator, map overlays for sieges and rebel-held districts
- Browser autosave when supported, plus downloadable/importable JSON world saves
- Backward migration for older local save files

## Controls

1. Select a world tool on the left and click a map tile.
2. Select a realm on the right and choose a target realm in the diplomacy panel.
3. Improve relations, propose alliances, establish trade, or declare war.
4. Use **Play** or **Advance year** to progress the simulation and resolve political events.
5. Use **Save world** to download a JSON save and **Load world** to import one later.

## Prototype limitations

This remains an early client-side prototype. Armies and battles are represented by realm-level simulation values rather than individual moving units. There is no multiplayer, cloud save, user account system, or online community backend yet. Political events are based on lightweight simulation rules and randomness, not a full historical or economic model.
