/**
 * LevelBuilder.js — Builds a playable level from LevelData definition
 * Creates walls, floors, spawns entities, and sets up physics groups.
 */
class LevelBuilder {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Build a complete level from a LevelData definition.
     * @param {object} levelDef - Entry from LEVEL_DATA array
     * @param {object} difficulty - Difficulty multipliers
     * @returns {object} Built level entities and metadata
     */
    build(levelDef, difficulty) {
        const T = CONSTANTS.TILE_SIZE;
        const result = {
            player: null,
            walls: null,
            guards: [],
            cameras: [],
            lasers: [],
            doors: [],
            keycards: [],
            terminals: [],
            upgrades: [],
            exitZone: null,
            boss: null,
            worldWidth: 0,
            worldHeight: 0,
        };

        const grid = levelDef.grid;
        const rows = grid.length;
        const cols = grid[0].length;

        result.worldWidth = cols * T;
        result.worldHeight = rows * T;

        // Set world bounds
        this.scene.physics.world.setBounds(0, 0, result.worldWidth, result.worldHeight);

        // ── Create wall group ──
        result.walls = this.scene.physics.add.staticGroup();

        // ── Build tile grid ──
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const tile = grid[r][c];
                const tx = c * T + T / 2;
                const ty = r * T + T / 2;

                if (tile === 1) {
                    // Wall
                    const wall = this.scene.add.rectangle(tx, ty, T, T, CONSTANTS.COLORS.DARK_WALL, 1);
                    wall.setDepth(100);

                    // Wall edge glow (subtle)
                    const hasFloorNeighbor = this._hasNeighborFloor(grid, r, c, rows, cols);
                    if (hasFloorNeighbor) {
                        const edge = this.scene.add.rectangle(tx, ty, T, T, CONSTANTS.COLORS.NEON_CYAN, 0);
                        edge.setStrokeStyle(0.5, CONSTANTS.COLORS.NEON_CYAN, 0.08);
                        edge.setDepth(101);
                    }

                    result.walls.add(wall);
                    this.scene.physics.add.existing(wall, true);
                } else {
                    // Floor
                    const isAlt = (r + c) % 2 === 0;
                    const floorColor = isAlt ? CONSTANTS.COLORS.FLOOR : CONSTANTS.COLORS.FLOOR_ALT;
                    const floor = this.scene.add.rectangle(tx, ty, T, T, floorColor, 1);
                    floor.setDepth(50);

                    // Player spawn
                    if (tile === 2) {
                        result.playerSpawn = { x: tx, y: ty };
                    }

                    // Exit zone
                    if (tile === 3) {
                        result.exitZone = new ExitZone(this.scene, tx, ty);
                    }
                }
            }
        }

        // ── Spawn Player ──
        if (result.playerSpawn) {
            result.player = new Player(this.scene, result.playerSpawn.x, result.playerSpawn.y, difficulty);
        }

        // ── Spawn Guards ──
        if (levelDef.guards) {
            levelDef.guards.forEach(gDef => {
                const gx = gDef.x * T + T / 2;
                const gy = gDef.y * T + T / 2;
                const waypoints = gDef.waypoints.map(wp => ({
                    x: wp.x * T + T / 2,
                    y: wp.y * T + T / 2,
                }));
                const guard = new Guard(this.scene, gx, gy, waypoints, difficulty);
                result.guards.push(guard);

                // Wall collision for guards
                this.scene.physics.add.collider(guard.sprite, result.walls);
            });
        }

        // ── Spawn Boss ──
        if (levelDef.boss) {
            const bx = levelDef.boss.x * T + T / 2;
            const by = levelDef.boss.y * T + T / 2;
            const waypoints = levelDef.boss.waypoints.map(wp => ({
                x: wp.x * T + T / 2,
                y: wp.y * T + T / 2,
            }));
            result.boss = new Boss(this.scene, bx, by, waypoints, difficulty);
            this.scene.physics.add.collider(result.boss.sprite, result.walls);
        }

        // ── Spawn Security Cameras ──
        if (levelDef.cameras) {
            levelDef.cameras.forEach(cDef => {
                const cx = cDef.x * T + T / 2;
                const cy = cDef.y * T + T / 2;
                result.cameras.push(new SecurityCamera(this.scene, cx, cy, cDef.angle, difficulty));
            });
        }

        // ── Spawn Laser Traps ──
        if (levelDef.lasers) {
            levelDef.lasers.forEach(lDef => {
                result.lasers.push(new LaserTrap(
                    this.scene,
                    lDef.x1 * T + T / 2, lDef.y1 * T + T / 2,
                    lDef.x2 * T + T / 2, lDef.y2 * T + T / 2,
                    lDef.onDuration, lDef.offDuration
                ));
            });
        }

        // ── Spawn Doors ──
        if (levelDef.doors) {
            levelDef.doors.forEach(dDef => {
                const dx = dDef.x * T + T / 2;
                const dy = dDef.y * T + T / 2;
                result.doors.push(new Door(this.scene, dx, dy, dDef.color, dDef.horizontal !== false));
            });
        }

        // ── Spawn Keycards ──
        if (levelDef.keycards) {
            levelDef.keycards.forEach(kDef => {
                result.keycards.push(new Keycard(this.scene, kDef.x * T + T / 2, kDef.y * T + T / 2, kDef.color));
            });
        }

        // ── Spawn Terminals ──
        if (levelDef.terminals) {
            levelDef.terminals.forEach(tDef => {
                result.terminals.push(new DataTerminal(
                    this.scene,
                    tDef.x * T + T / 2, tDef.y * T + T / 2,
                    tDef.id,
                    tDef.isBossTerminal || false
                ));
            });
        }

        // ── Spawn Upgrades ──
        if (levelDef.upgrades) {
            levelDef.upgrades.forEach(uDef => {
                result.upgrades.push(new Upgrade(
                    this.scene,
                    uDef.x * T + T / 2, uDef.y * T + T / 2,
                    uDef.upgradeId
                ));
            });
        }

        // ── Player-Wall Collision ──
        if (result.player) {
            this.scene.physics.add.collider(result.player.sprite, result.walls);
        }

        // ── Player-Door Collision ──
        result.doors.forEach(door => {
            if (result.player) {
                this.scene.physics.add.collider(result.player.sprite, door.sprite);
            }
        });

        return result;
    }

    /**
     * Check if a wall tile has a floor neighbor (for edge glow rendering).
     */
    _hasNeighborFloor(grid, r, c, rows, cols) {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (grid[nr][nc] !== 1) return true;
            }
        }
        return false;
    }
}
