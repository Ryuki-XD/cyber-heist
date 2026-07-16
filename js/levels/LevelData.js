/**
 * LevelData.js — All 5 handcrafted levels for Cyber Heist
 *
 * Tile Legend:
 *   0 = Floor
 *   1 = Wall
 *   2 = Player spawn
 *   3 = Exit zone
 *
 * Entity placement is separate from the tile grid.
 */
const LEVEL_DATA = [
    // ══════════════════════════════════════════════════════════
    // LEVEL 1: "Data Breach" — Office Server Room (Tutorial)
    // ══════════════════════════════════════════════════════════
    {
        id: 1,
        name: 'Data Breach',
        subtitle: 'Office Server Room',
        description: 'Infiltrate the server room. Find the keycard, unlock the door, steal the data, and escape.',
        ambientDarkness: 0.3,
        escapeTimer: null, // no timer for tutorial
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,2,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1],
            [1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,3,0,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        guards: [
            {
                x: 10, y: 5,  // grid coords
                waypoints: [
                    { x: 10, y: 3 },
                    { x: 10, y: 11 },
                ],
            },
        ],
        cameras: [],
        lasers: [],
        doors: [
            { x: 17, y: 6, color: 'red', horizontal: false },
        ],
        keycards: [
            { x: 4, y: 12, color: 'red' },
        ],
        terminals: [
            { x: 20, y: 2, id: 'data1' },
        ],
        upgrades: [],
        lights: [
            { x: 4, y: 2, radius: 100 },
            { x: 12, y: 7, radius: 80, flicker: true },
            { x: 20, y: 5, radius: 90 },
        ],
        objectives: [
            { id: 'get_keycard', text: 'Find the Red Keycard', type: 'keycard', keyColor: 'red' },
            { id: 'unlock_door', text: 'Unlock the server room', type: 'door' },
            { id: 'steal_data', text: 'Hack the data terminal', type: 'hack', terminalId: 'data1' },
            { id: 'escape', text: 'Reach the exit', type: 'exit' },
        ],
    },

    // ══════════════════════════════════════════════════════════
    // LEVEL 2: "Neon Labyrinth" — Nightclub Basement
    // ══════════════════════════════════════════════════════════
    {
        id: 2,
        name: 'Neon Labyrinth',
        subtitle: 'Nightclub Basement',
        description: 'Navigate the neon-lit basement. Avoid laser traps and hack the security mainframe.',
        ambientDarkness: 0.5,
        escapeTimer: null,
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1],
            [1,1,1,0,0,1,1,1,0,0,0,0,0,0,1,0,0,1,1,1,0,0,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        guards: [
            {
                x: 4, y: 8,
                waypoints: [{ x: 4, y: 7 }, { x: 4, y: 13 }],
            },
            {
                x: 12, y: 3,
                waypoints: [{ x: 9, y: 3 }, { x: 15, y: 3 }],
            },
            {
                x: 20, y: 10,
                waypoints: [{ x: 20, y: 8 }, { x: 20, y: 13 }],
            },
        ],
        cameras: [],
        lasers: [
            { x1: 9, y1: 7, x2: 15, y2: 7, onDuration: 2000, offDuration: 1500 },
            { x1: 17, y1: 9, x2: 17, y2: 13, onDuration: 1800, offDuration: 2000 },
        ],
        doors: [
            { x: 17, y: 3, color: 'blue', horizontal: false },
            { x: 21, y: 11, color: 'hack', horizontal: false },
        ],
        keycards: [
            { x: 2, y: 9, color: 'blue' },
        ],
        terminals: [
            { x: 22, y: 2, id: 'data2' },
            { x: 21, y: 11, id: 'hack_door2' },
        ],
        upgrades: [
            { x: 12, y: 12, upgradeId: 'speed_boost' },
        ],
        lights: [
            { x: 3, y: 2, radius: 70 },
            { x: 12, y: 5, radius: 60, flicker: true },
            { x: 20, y: 7, radius: 80 },
            { x: 12, y: 12, radius: 50 },
        ],
        objectives: [
            { id: 'find_blue', text: 'Find the Blue Keycard', type: 'keycard', keyColor: 'blue' },
            { id: 'avoid_lasers', text: 'Navigate past laser traps', type: 'info' },
            { id: 'steal_data2', text: 'Hack the data terminal', type: 'hack', terminalId: 'data2' },
            { id: 'escape', text: 'Reach the exit', type: 'exit' },
        ],
    },

    // ══════════════════════════════════════════════════════════
    // LEVEL 3: "Ghost Protocol" — Corporate Tower
    // ══════════════════════════════════════════════════════════
    {
        id: 3,
        name: 'Ghost Protocol',
        subtitle: 'Corporate Tower',
        description: 'Infiltrate the heavily guarded corporate tower. Security cameras watch every corridor.',
        ambientDarkness: 0.65,
        escapeTimer: null,
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,2,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1],
            [1,0,0,0,0,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,1,1,1,1,0,0,0,0,1,0,0,0,0,1],
            [1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        guards: [
            { x: 8, y: 3, waypoints: [{ x: 7, y: 2 }, { x: 7, y: 6 }] },
            { x: 13, y: 8, waypoints: [{ x: 8, y: 8 }, { x: 18, y: 8 }] },
            { x: 3, y: 10, waypoints: [{ x: 2, y: 8 }, { x: 2, y: 13 }] },
            { x: 16, y: 3, waypoints: [{ x: 16, y: 2 }, { x: 16, y: 6 }] },
            { x: 21, y: 10, waypoints: [{ x: 21, y: 8 }, { x: 21, y: 13 }] },
        ],
        cameras: [
            { x: 11, y: 1, angle: 180 },
            { x: 19, y: 7, angle: 270 },
            { x: 5, y: 14, angle: 0 },
        ],
        lasers: [
            { x1: 6, y1: 8, x2: 9, y2: 8, onDuration: 2500, offDuration: 1500 },
        ],
        doors: [
            { x: 5, y: 3, color: 'red', horizontal: false },
            { x: 20, y: 4, color: 'blue', horizontal: false },
            { x: 20, y: 6, color: 'hack', horizontal: true },
        ],
        keycards: [
            { x: 8, y: 6, color: 'red' },
            { x: 3, y: 13, color: 'blue' },
        ],
        terminals: [
            { x: 22, y: 2, id: 'data3' },
            { x: 20, y: 6, id: 'hack_door3' },
        ],
        upgrades: [
            { x: 2, y: 6, upgradeId: 'silent_sprint' },
        ],
        lights: [
            { x: 3, y: 2, radius: 60 },
            { x: 8, y: 5, radius: 50, flicker: true },
            { x: 16, y: 4, radius: 50 },
            { x: 12, y: 10, radius: 70 },
            { x: 22, y: 12, radius: 60 },
        ],
        objectives: [
            { id: 'get_red3', text: 'Find the Red Keycard', type: 'keycard', keyColor: 'red' },
            { id: 'get_blue3', text: 'Find the Blue Keycard', type: 'keycard', keyColor: 'blue' },
            { id: 'steal_data3', text: 'Hack corporate mainframe', type: 'hack', terminalId: 'data3' },
            { id: 'escape', text: 'Escape the tower', type: 'exit' },
        ],
    },

    // ══════════════════════════════════════════════════════════
    // LEVEL 4: "Digital Fortress" — Military Facility (Timed Escape)
    // ══════════════════════════════════════════════════════════
    {
        id: 4,
        name: 'Digital Fortress',
        subtitle: 'Military Facility',
        description: 'High-security military base. Steal the data and escape before the alarm countdown ends!',
        ambientDarkness: 0.55,
        escapeTimer: 75,  // seconds after data is stolen
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,1,1,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,0,0,0,0,1],
            [1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,1,1,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,3,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        guards: [
            { x: 4, y: 7, waypoints: [{ x: 2, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 12 }, { x: 2, y: 12 }] },
            { x: 10, y: 3, waypoints: [{ x: 8, y: 2 }, { x: 12, y: 2 }, { x: 12, y: 6 }, { x: 8, y: 6 }] },
            { x: 10, y: 10, waypoints: [{ x: 8, y: 8 }, { x: 12, y: 8 }, { x: 12, y: 13 }, { x: 8, y: 13 }] },
            { x: 16, y: 5, waypoints: [{ x: 15, y: 2 }, { x: 18, y: 2 }, { x: 18, y: 5 }] },
            { x: 22, y: 7, waypoints: [{ x: 21, y: 5 }, { x: 23, y: 5 }, { x: 23, y: 11 }, { x: 21, y: 11 }] },
        ],
        cameras: [
            { x: 6, y: 1, angle: 180 },
            { x: 13, y: 7, angle: 270 },
            { x: 19, y: 14, angle: 0 },
        ],
        lasers: [
            { x1: 7, y1: 4, x2: 7, y2: 6, onDuration: 2000, offDuration: 2000 },
            { x1: 15, y1: 7, x2: 18, y2: 7, onDuration: 1500, offDuration: 1800 },
            { x1: 20, y1: 9, x2: 20, y2: 11, onDuration: 2200, offDuration: 1600 },
        ],
        doors: [
            { x: 6, y: 3, color: 'red', horizontal: false },
            { x: 13, y: 4, color: 'blue', horizontal: true },
            { x: 19, y: 3, color: 'gold', horizontal: false },
            { x: 16, y: 6, color: 'hack', horizontal: true },
        ],
        keycards: [
            { x: 2, y: 11, color: 'red' },
            { x: 11, y: 12, color: 'blue' },
            { x: 16, y: 2, color: 'gold' },
        ],
        terminals: [
            { x: 22, y: 2, id: 'data4' },
            { x: 16, y: 6, id: 'hack_door4' },
        ],
        upgrades: [
            { x: 2, y: 8, upgradeId: 'extra_health' },
            { x: 17, y: 12, upgradeId: 'energy_boost' },
        ],
        lights: [
            { x: 3, y: 2, radius: 60 },
            { x: 10, y: 4, radius: 50 },
            { x: 10, y: 11, radius: 50 },
            { x: 16, y: 3, radius: 50, flicker: true },
            { x: 22, y: 8, radius: 60 },
        ],
        objectives: [
            { id: 'get_red4', text: 'Find the Red Keycard', type: 'keycard', keyColor: 'red' },
            { id: 'get_blue4', text: 'Find the Blue Keycard', type: 'keycard', keyColor: 'blue' },
            { id: 'get_gold4', text: 'Find the Gold Keycard', type: 'keycard', keyColor: 'gold' },
            { id: 'steal_data4', text: 'Steal classified data', type: 'hack', terminalId: 'data4' },
            { id: 'escape', text: 'Escape before alarm expires!', type: 'exit' },
        ],
    },

    // ══════════════════════════════════════════════════════════
    // LEVEL 5: "Mainframe" — AI Core (Boss Level)
    // ══════════════════════════════════════════════════════════
    {
        id: 5,
        name: 'Mainframe',
        subtitle: 'AI Core',
        description: 'Face the AI security system. Hack the terminals to weaken it, then steal the master encryption key.',
        ambientDarkness: 0.7,
        escapeTimer: 90,
        isBossLevel: true,
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,0,1,1,0,0,1,1,1,1,0,0,1,1,0,0,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        guards: [
            { x: 8, y: 2, waypoints: [{ x: 6, y: 2 }, { x: 14, y: 2 }] },
            { x: 18, y: 5, waypoints: [{ x: 16, y: 5 }, { x: 22, y: 5 }] },
            { x: 3, y: 10, waypoints: [{ x: 2, y: 8 }, { x: 2, y: 13 }] },
        ],
        boss: {
            x: 12, y: 10,
            waypoints: [
                { x: 8, y: 9 }, { x: 16, y: 9 },
                { x: 16, y: 12 }, { x: 8, y: 12 },
            ],
        },
        cameras: [
            { x: 10, y: 7, angle: 270 },
            { x: 15, y: 7, angle: 270 },
        ],
        lasers: [
            { x1: 5, y1: 8, x2: 5, y2: 13, onDuration: 2500, offDuration: 2000 },
            { x1: 20, y1: 8, x2: 20, y2: 13, onDuration: 2000, offDuration: 2500 },
        ],
        doors: [
            { x: 13, y: 7, color: 'gold', horizontal: true },
        ],
        keycards: [
            { x: 22, y: 2, color: 'gold' },
        ],
        terminals: [
            { x: 8, y: 4, id: 'boss_term1', isBossTerminal: true },
            { x: 17, y: 4, id: 'boss_term2', isBossTerminal: true },
            { x: 12, y: 12, id: 'boss_term3', isBossTerminal: true },
            { x: 12, y: 6, id: 'data5' },
        ],
        upgrades: [
            { x: 22, y: 12, upgradeId: 'hack_boost' },
        ],
        lights: [
            { x: 3, y: 2, radius: 60 },
            { x: 12, y: 5, radius: 80 },
            { x: 22, y: 2, radius: 50 },
            { x: 12, y: 10, radius: 100, flicker: true },
            { x: 8, y: 12, radius: 50 },
            { x: 16, y: 12, radius: 50 },
        ],
        objectives: [
            { id: 'get_gold5', text: 'Find the Gold Keycard', type: 'keycard', keyColor: 'gold' },
            { id: 'hack_boss', text: 'Hack 3 terminals to weaken AI (0/3)', type: 'boss_hack', count: 3 },
            { id: 'steal_data5', text: 'Steal master encryption key', type: 'hack', terminalId: 'data5' },
            { id: 'escape', text: 'Escape the AI Core!', type: 'exit' },
        ],
    },
];
