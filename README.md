# PIXELREALM

**PixelRealm** is a browser-based pixel-art world simulator prototype built with plain HTML, CSS, and JavaScript. Five kingdoms evolve across a procedurally generated map, negotiate treaties, fight wars, develop technology, manage food supplies, and pass power through royal dynasties.

## Run locally

Download both `index.html` and `game.js` from the repository and keep them in the same folder. Open `index.html` in a modern browser. No build step, package manager, or external library is required.

## Current features

- Procedurally generated tile map with grasslands, forests, mountains, and water
- Five kingdoms with territory, settlements, treasury, military, population, and stability
- World play/pause, advance-year, and simulation-speed controls
- Terrain editor, settlement placement, and manual territory claims
- **Diplomacy:** improve relations, propose alliances, and form or end trade pacts
- **Trade routes:** visible dotted lines on the map and recurring treasury income
- **War system:** declare war, track war scores, lose military strength, capture border districts, and negotiate peace
- **Dynasties:** rulers, heirs, aging, succession, and disputed successions
- **Civilization systems:** food stores, shortages, stability, rebel secession, and technology research
- Historical chronicle and active-war counter
- Browser autosave (where browser storage is available)
- Downloadable JSON world saves and save-file import
- Responsive interface

## Controls

1. Choose a world tool on the left, then click a map tile.
2. Select a realm on the right and choose a target realm in the diplomacy panel.
3. Improve relations (cost: 25 treasury) to unlock alliances; trade pacts also improve relations.
4. Declare war to start a tracked conflict. The war advances each world year and may end in victory or concessions.
5. Use **Save world** to download a JSON save that can be imported later.

## Current limitations

This is an early client-side prototype. Simulation rules are intentionally lightweight. Armies are represented by realm-level strength rather than individual units. There is no online multiplayer, cloud save, account system, persistent server, or live community gallery yet. Browser autosave depends on local browser storage behavior.
