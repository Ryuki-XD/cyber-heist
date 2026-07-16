/**
 * Constants.js — Game-wide configuration constants for Cyber Heist
 * All tunable gameplay values live here for easy balancing.
 */
const CONSTANTS = {
    // ── Game Dimensions ──
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    TILE_SIZE: 32,

    // ── Player ──
    PLAYER: {
        SPEED: 160,
        SPRINT_MULTIPLIER: 1.8,
        MAX_HEALTH: 100,
        MAX_ENERGY: 100,
        ENERGY_DRAIN_RATE: 30,    // per second while sprinting
        ENERGY_REGEN_RATE: 15,    // per second while not sprinting
        INVINCIBILITY_TIME: 1000, // ms after taking damage
        INTERACT_RANGE: 40,
        SIZE: 14,
    },

    // ── Guard AI ──
    GUARD: {
        PATROL_SPEED: 60,
        CHASE_SPEED: 130,
        SEARCH_SPEED: 80,
        VISION_RANGE: 150,
        VISION_ANGLE: 60,          // degrees, half-angle of cone
        ALERT_DELAY: 500,          // ms before chase begins
        SEARCH_DURATION: 4000,     // ms searching last known position
        WAYPOINT_PAUSE: 1500,      // ms pause at each waypoint
        SIZE: 14,
    },

    // ── Security Camera ──
    CAMERA: {
        SWEEP_ANGLE: 90,          // total sweep arc in degrees
        SWEEP_SPEED: 0.4,         // radians per second
        VISION_RANGE: 130,
        VISION_ANGLE: 45,
        ALERT_DURATION: 3000,
    },

    // ── Boss ──
    BOSS: {
        SPEED: 100,
        CHASE_SPEED: 150,
        VISION_RANGE: 200,
        VISION_ANGLE: 75,
        EMP_RANGE: 120,
        EMP_COOLDOWN: 5000,
        EMP_STUN_DURATION: 2000,
        HEALTH: 3,                 // hits to defeat
        SIZE: 18,
    },

    // ── Laser Trap ──
    LASER: {
        ON_DURATION: 2000,
        OFF_DURATION: 1500,
        DAMAGE: 25,
    },

    // ── Hacking Mini-game ──
    HACKING: {
        SEQUENCE_LENGTH_BASE: 4,
        TIME_LIMIT_BASE: 8000,     // ms
        INPUT_WINDOW: 600,         // ms per input
    },

    // ── Timer / Escape ──
    ESCAPE: {
        BASE_TIME: 60,             // seconds
    },

    // ── Difficulty Multipliers ──
    DIFFICULTY: {
        EASY: {
            label: 'Easy',
            playerHealthMul: 1.5,
            guardSpeedMul: 0.75,
            guardVisionMul: 0.7,
            hackTimeMul: 1.5,
            escapeTimeMul: 1.4,
            damageMultiplier: 0.6,
        },
        NORMAL: {
            label: 'Normal',
            playerHealthMul: 1.0,
            guardSpeedMul: 1.0,
            guardVisionMul: 1.0,
            hackTimeMul: 1.0,
            escapeTimeMul: 1.0,
            damageMultiplier: 1.0,
        },
        HARD: {
            label: 'Hard',
            playerHealthMul: 0.7,
            guardSpeedMul: 1.3,
            guardVisionMul: 1.3,
            hackTimeMul: 0.7,
            escapeTimeMul: 0.7,
            damageMultiplier: 1.5,
        },
    },

    // ── Cyberpunk Color Palette ──
    COLORS: {
        NEON_CYAN: 0x00f0ff,
        NEON_PINK: 0xff00aa,
        NEON_GREEN: 0x39ff14,
        NEON_YELLOW: 0xffe600,
        NEON_RED: 0xff1744,
        NEON_PURPLE: 0xd400ff,
        NEON_ORANGE: 0xff6e00,

        DARK_BG: 0x0a0a1a,
        DARK_PANEL: 0x111128,
        DARK_WALL: 0x1a1a3e,
        FLOOR: 0x0d0d2b,
        FLOOR_ALT: 0x12122e,

        GUARD_BODY: 0xff3333,
        PLAYER_BODY: 0x00f0ff,
        BOSS_BODY: 0xff00aa,

        KEYCARD_RED: 0xff1744,
        KEYCARD_BLUE: 0x2979ff,
        KEYCARD_GOLD: 0xffd600,

        LASER_RED: 0xff0033,
        TERMINAL_GREEN: 0x39ff14,

        VISION_CONE: 0xffff00,
        VISION_CONE_ALERT: 0xff0000,

        HUD_BG: 0x000000,
        HUD_HEALTH: 0xff1744,
        HUD_ENERGY: 0x00f0ff,
    },

    // ── CSS Color Strings ──
    CSS_COLORS: {
        NEON_CYAN: '#00f0ff',
        NEON_PINK: '#ff00aa',
        NEON_GREEN: '#39ff14',
        DARK_BG: '#0a0a1a',
        DARK_PANEL: '#111128',
    },

    // ── Upgrade Types ──
    UPGRADES: {
        SPEED_BOOST: { id: 'speed_boost', name: 'Speed Boost', description: 'Move 20% faster', speedMul: 1.2 },
        SILENT_SPRINT: { id: 'silent_sprint', name: 'Silent Sprint', description: 'Sprinting doesn\'t alert guards', silent: true },
        EXTENDED_VISION: { id: 'extended_vision', name: 'Night Vision', description: 'See further in dark zones' },
        EXTRA_HEALTH: { id: 'extra_health', name: 'Armor Plating', description: '+50 max health', healthBonus: 50 },
        ENERGY_BOOST: { id: 'energy_boost', name: 'Battery Pack', description: '+50% energy capacity', energyMul: 1.5 },
        HACK_BOOST: { id: 'hack_boost', name: 'Hack Assist', description: 'Hacking is 30% easier', hackMul: 1.3 },
    },

    // ── Achievement Definitions ──
    ACHIEVEMENTS: {
        GHOST: { id: 'ghost', name: 'Ghost', description: 'Complete a level without being detected', icon: '👻' },
        SPEED_DEMON: { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a level in under 60 seconds', icon: '⚡' },
        HACKER: { id: 'hacker', name: 'Master Hacker', description: 'Complete 10 hacking puzzles', icon: '💻' },
        COLLECTOR: { id: 'collector', name: 'Data Collector', description: 'Collect all data in a level', icon: '📀' },
        SURVIVOR: { id: 'survivor', name: 'Survivor', description: 'Complete a level with 1 HP remaining', icon: '💀' },
        PACIFIST: { id: 'pacifist', name: 'Pacifist', description: 'Never trigger an alarm in a full playthrough', icon: '☮️' },
        COMPLETIONIST: { id: 'completionist', name: 'Completionist', description: 'Complete all 5 levels', icon: '🏆' },
        BOSS_SLAYER: { id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat the AI Core Boss', icon: '🤖' },
        UNTOUCHABLE: { id: 'untouchable', name: 'Untouchable', description: 'Complete a level without taking damage', icon: '🛡️' },
        EXPLORER: { id: 'explorer', name: 'Explorer', description: 'Find all upgrades across all levels', icon: '🔍' },
        HARD_MODE: { id: 'hard_mode', name: 'Hardcore', description: 'Complete any level on Hard difficulty', icon: '🔥' },
        SPEEDRUN_ALL: { id: 'speedrun_all', name: 'Speedrunner', description: 'Complete all levels in under 10 minutes total', icon: '🏃' },
    },

    // ── Save Keys ──
    SAVE_KEY: 'cyberheist_save',
    SETTINGS_KEY: 'cyberheist_settings',
};
