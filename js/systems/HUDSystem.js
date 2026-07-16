/**
 * HUDSystem.js — Cyberpunk heads-up display for Cyber Heist
 * Renders health, energy, inventory, minimap, objectives, and timer.
 * All drawn with Phaser Graphics for maximum performance.
 */
class HUDSystem {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;

        // Container group at fixed screen position
        this.container = scene.add.container(0, 0);
        this.container.setDepth(1000);
        this.container.setScrollFactor(0);

        this.gfx = scene.add.graphics();
        this.gfx.setScrollFactor(0);
        this.gfx.setDepth(1000);

        // ── Health Bar ──
        this.healthLabel = this._makeText(12, 10, 'HEALTH', 10, CONSTANTS.CSS_COLORS.NEON_CYAN);
        this.healthText = this._makeText(145, 10, '100', 10, '#fff');

        // ── Energy Bar ──
        this.energyLabel = this._makeText(12, 32, 'ENERGY', 10, CONSTANTS.CSS_COLORS.NEON_CYAN);
        this.energyText = this._makeText(145, 32, '100', 10, '#fff');

        // ── Inventory ──
        this.inventoryLabel = this._makeText(12, 62, 'INVENTORY', 9, CONSTANTS.CSS_COLORS.NEON_CYAN);
        this.inventoryTexts = [];

        // ── Objectives ──
        this.objectivesLabel = this._makeText(CONSTANTS.GAME_WIDTH - 200, 10, 'OBJECTIVES', 10, CONSTANTS.CSS_COLORS.NEON_CYAN);
        this.objectiveTexts = [];

        // ── Timer ──
        this.timerText = this._makeText(CONSTANTS.GAME_WIDTH / 2, 10, '', 18, '#ff1744');
        this.timerText.setOrigin(0.5, 0);
        this.timerVisible = false;

        // ── Level Name ──
        this.levelText = this._makeText(CONSTANTS.GAME_WIDTH / 2, 580, '', 10, CONSTANTS.CSS_COLORS.NEON_CYAN);
        this.levelText.setOrigin(0.5, 1);
        this.levelText.setAlpha(0.5);

        // ── Minimap ──
        this.minimapGfx = scene.add.graphics();
        this.minimapGfx.setScrollFactor(0);
        this.minimapGfx.setDepth(1001);
        this.minimapX = CONSTANTS.GAME_WIDTH - 110;
        this.minimapY = CONSTANTS.GAME_HEIGHT - 110;
        this.minimapSize = 100;
        this.minimapScale = 0.06;

        // ── Alert indicator ──
        this.alertText = this._makeText(CONSTANTS.GAME_WIDTH / 2, 40, '⚠ DETECTED ⚠', 14, '#ff1744');
        this.alertText.setOrigin(0.5, 0);
        this.alertText.setVisible(false);

        // ── Interaction prompt ──
        this.promptText = this._makeText(CONSTANTS.GAME_WIDTH / 2, CONSTANTS.GAME_HEIGHT - 60, '', 12, CONSTANTS.CSS_COLORS.NEON_GREEN);
        this.promptText.setOrigin(0.5, 0.5);
        this.promptText.setVisible(false);
    }

    /**
     * Create a styled text object.
     */
    _makeText(x, y, content, size, color) {
        const t = this.scene.add.text(x, y, content, {
            fontSize: size + 'px',
            fontFamily: '"Courier New", monospace',
            color: color,
            stroke: '#000',
            strokeThickness: 2,
        });
        t.setScrollFactor(0);
        t.setDepth(1002);
        return t;
    }

    /**
     * Update HUD with current game state.
     * @param {object} state - { health, maxHealth, energy, maxEnergy, keycards, upgrades, objectives, timer, detected, levelName, player, guards, walls }
     */
    update(state) {
        this.gfx.clear();

        // ── HUD Background panels ──
        // Top-left panel
        this.gfx.fillStyle(0x000000, 0.5);
        this.gfx.fillRoundedRect(6, 6, 165, 52, 4);
        this.gfx.lineStyle(1, CONSTANTS.COLORS.NEON_CYAN, 0.4);
        this.gfx.strokeRoundedRect(6, 6, 165, 52, 4);

        // ── Health Bar ──
        const hpPct = MathUtils.clamp(state.health / state.maxHealth, 0, 1);
        // Background
        this.gfx.fillStyle(0x330000, 0.8);
        this.gfx.fillRect(60, 12, 80, 10);
        // Fill
        const hpColor = hpPct > 0.5 ? CONSTANTS.COLORS.NEON_GREEN
            : hpPct > 0.25 ? CONSTANTS.COLORS.NEON_YELLOW
                : CONSTANTS.COLORS.NEON_RED;
        this.gfx.fillStyle(hpColor, 0.9);
        this.gfx.fillRect(60, 12, 80 * hpPct, 10);
        // Border
        this.gfx.lineStyle(1, hpColor, 0.6);
        this.gfx.strokeRect(60, 12, 80, 10);
        this.healthText.setText(Math.ceil(state.health));

        // ── Energy Bar ──
        const enPct = MathUtils.clamp(state.energy / state.maxEnergy, 0, 1);
        this.gfx.fillStyle(0x002233, 0.8);
        this.gfx.fillRect(60, 34, 80, 10);
        this.gfx.fillStyle(CONSTANTS.COLORS.NEON_CYAN, 0.9);
        this.gfx.fillRect(60, 34, 80 * enPct, 10);
        this.gfx.lineStyle(1, CONSTANTS.COLORS.NEON_CYAN, 0.6);
        this.gfx.strokeRect(60, 34, 80, 10);
        this.energyText.setText(Math.ceil(state.energy));

        // ── Inventory ──
        // Clear old inventory texts
        this.inventoryTexts.forEach(t => t.destroy());
        this.inventoryTexts = [];

        if (state.keycards && state.keycards.length > 0) {
            // Inventory panel
            this.gfx.fillStyle(0x000000, 0.5);
            this.gfx.fillRoundedRect(6, 58, 165, 14 + state.keycards.length * 14, 4);
            this.gfx.lineStyle(1, CONSTANTS.COLORS.NEON_CYAN, 0.3);
            this.gfx.strokeRoundedRect(6, 58, 165, 14 + state.keycards.length * 14, 4);

            state.keycards.forEach((kc, i) => {
                const colorName = kc.charAt(0).toUpperCase() + kc.slice(1);
                const t = this._makeText(20, 74 + i * 14, `🔑 ${colorName} Keycard`, 9, '#fff');
                this.inventoryTexts.push(t);
            });
        }

        // ── Objectives ──
        this.objectiveTexts.forEach(t => t.destroy());
        this.objectiveTexts = [];

        if (state.objectives && state.objectives.length > 0) {
            const ox = CONSTANTS.GAME_WIDTH - 205;
            this.gfx.fillStyle(0x000000, 0.5);
            this.gfx.fillRoundedRect(ox, 6, 199, 16 + state.objectives.length * 16, 4);
            this.gfx.lineStyle(1, CONSTANTS.COLORS.NEON_CYAN, 0.3);
            this.gfx.strokeRoundedRect(ox, 6, 199, 16 + state.objectives.length * 16, 4);

            state.objectives.forEach((obj, i) => {
                const prefix = obj.completed ? '✓' : '○';
                const color = obj.completed ? '#39ff14' : '#cccccc';
                const t = this._makeText(ox + 6, 20 + i * 16, `${prefix} ${obj.text}`, 9, color);
                this.objectiveTexts.push(t);
            });
        }

        // ── Timer ──
        if (state.timer !== null && state.timer !== undefined) {
            this.timerText.setVisible(true);
            const mins = Math.floor(state.timer / 60);
            const secs = Math.floor(state.timer % 60);
            this.timerText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);

            // Flash red when low
            if (state.timer < 15) {
                this.timerText.setAlpha(0.5 + Math.sin(Date.now() * 0.01) * 0.5);
            } else {
                this.timerText.setAlpha(1);
            }
        } else {
            this.timerText.setVisible(false);
        }

        // ── Alert indicator ──
        if (state.detected) {
            this.alertText.setVisible(true);
            this.alertText.setAlpha(0.5 + Math.sin(Date.now() * 0.008) * 0.5);
        } else {
            this.alertText.setVisible(false);
        }

        // ── Level name ──
        if (state.levelName) {
            this.levelText.setText(state.levelName);
        }

        // ── Minimap ──
        this.drawMinimap(state);
    }

    /**
     * Draw the minimap radar.
     */
    drawMinimap(state) {
        const mx = this.minimapX;
        const my = this.minimapY;
        const ms = this.minimapSize;
        const scale = this.minimapScale;

        this.minimapGfx.clear();

        // Background
        this.minimapGfx.fillStyle(0x000000, 0.6);
        this.minimapGfx.fillRoundedRect(mx - 2, my - 2, ms + 4, ms + 4, 4);
        this.minimapGfx.lineStyle(1, CONSTANTS.COLORS.NEON_CYAN, 0.5);
        this.minimapGfx.strokeRoundedRect(mx - 2, my - 2, ms + 4, ms + 4, 4);

        if (!state.player) return;

        const px = state.player.x;
        const py = state.player.y;

        // Draw walls
        if (state.walls) {
            this.minimapGfx.fillStyle(CONSTANTS.COLORS.DARK_WALL, 0.8);
            state.walls.getChildren().forEach(wall => {
                const wx = mx + ms / 2 + (wall.x - px) * scale;
                const wy = my + ms / 2 + (wall.y - py) * scale;
                if (wx > mx && wx < mx + ms && wy > my && wy < my + ms) {
                    this.minimapGfx.fillRect(wx - 1, wy - 1, 2, 2);
                }
            });
        }

        // Draw guards
        if (state.guards) {
            state.guards.forEach(g => {
                const gx = mx + ms / 2 + (g.x - px) * scale;
                const gy = my + ms / 2 + (g.y - py) * scale;
                if (gx > mx && gx < mx + ms && gy > my && gy < my + ms) {
                    this.minimapGfx.fillStyle(CONSTANTS.COLORS.NEON_RED, 0.9);
                    this.minimapGfx.fillRect(gx - 1.5, gy - 1.5, 3, 3);
                }
            });
        }

        // Draw player (center)
        this.minimapGfx.fillStyle(CONSTANTS.COLORS.NEON_CYAN, 1);
        this.minimapGfx.fillCircle(mx + ms / 2, my + ms / 2, 2.5);

        // Crosshairs
        this.minimapGfx.lineStyle(0.5, CONSTANTS.COLORS.NEON_CYAN, 0.2);
        this.minimapGfx.lineBetween(mx + ms / 2, my, mx + ms / 2, my + ms);
        this.minimapGfx.lineBetween(mx, my + ms / 2, mx + ms, my + ms / 2);
    }

    /**
     * Show an interaction prompt.
     * @param {string} text
     */
    showPrompt(text) {
        this.promptText.setText(text);
        this.promptText.setVisible(true);
    }

    /**
     * Hide the interaction prompt.
     */
    hidePrompt() {
        this.promptText.setVisible(false);
    }

    /**
     * Clean up all HUD elements.
     */
    destroy() {
        this.gfx.destroy();
        this.minimapGfx.destroy();
        this.healthLabel.destroy();
        this.healthText.destroy();
        this.energyLabel.destroy();
        this.energyText.destroy();
        this.inventoryLabel.destroy();
        this.inventoryTexts.forEach(t => t.destroy());
        this.objectivesLabel.destroy();
        this.objectiveTexts.forEach(t => t.destroy());
        this.timerText.destroy();
        this.alertText.destroy();
        this.promptText.destroy();
        this.levelText.destroy();
        this.container.destroy();
    }
}
