/**
 * Door.js — Locked/unlocked door for Cyber Heist
 * Requires matching keycard or hacking to open.
 */
class Door {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} color - Keycard color required ('red', 'blue', 'gold'), or 'hack' for hackable
     * @param {boolean} [isHorizontal=true] - Orientation
     */
    constructor(scene, x, y, color, isHorizontal = true) {
        this.scene = scene;
        this.color = color;
        this.isOpen = false;
        this.isHorizontal = isHorizontal;

        // Door colors
        const colorMap = {
            red: CONSTANTS.COLORS.KEYCARD_RED,
            blue: CONSTANTS.COLORS.KEYCARD_BLUE,
            gold: CONSTANTS.COLORS.KEYCARD_GOLD,
            hack: CONSTANTS.COLORS.NEON_GREEN,
            none: 0x888888,
        };
        this.doorColor = colorMap[color] || colorMap.none;

        // Create door sprite
        const w = isHorizontal ? CONSTANTS.TILE_SIZE : 8;
        const h = isHorizontal ? 8 : CONSTANTS.TILE_SIZE;
        this.sprite = scene.add.rectangle(x, y, w, h, this.doorColor, 1);
        this.sprite.setDepth(300);

        // Lock indicator
        this.lockIcon = scene.add.text(x, y - 12, '🔒', { fontSize: '10px' });
        this.lockIcon.setOrigin(0.5);
        this.lockIcon.setDepth(301);

        // Physics body for collision
        scene.physics.add.existing(this.sprite, true); // static body

        // Glow effect
        this.glow = scene.add.rectangle(x, y, w + 4, h + 4, this.doorColor, 0);
        this.glow.setStrokeStyle(1, this.doorColor, 0.3);
        this.glow.setDepth(299);
    }

    /**
     * Try to open the door.
     * @param {Player} player
     * @returns {string} 'opened' | 'need_keycard' | 'need_hack' | 'already_open'
     */
    tryOpen(player) {
        if (this.isOpen) return 'already_open';

        if (this.color === 'hack') {
            return 'need_hack';
        }

        if (this.color === 'none') {
            this.open();
            return 'opened';
        }

        if (player.hasKeycard(this.color)) {
            this.open();
            return 'opened';
        }

        return 'need_keycard';
    }

    /**
     * Open the door.
     */
    open() {
        if (this.isOpen) return;
        this.isOpen = true;

        // Animate opening
        this.scene.tweens.add({
            targets: [this.sprite, this.glow],
            alpha: 0.15,
            duration: 300,
            ease: 'Power2',
        });

        // Disable collision
        this.sprite.body.enable = false;

        // Change lock icon
        this.lockIcon.setText('🔓');
        this.scene.tweens.add({
            targets: this.lockIcon,
            alpha: 0,
            duration: 500,
        });

        if (this.scene.audioSystem) this.scene.audioSystem.playDoorOpen();
        if (this.scene.particleSystem) this.scene.particleSystem.smoke(this.sprite.x, this.sprite.y);
    }

    /**
     * Check if player is in interaction range.
     * @param {Player} player
     * @returns {boolean}
     */
    isInRange(player) {
        return MathUtils.distance(this.sprite.x, this.sprite.y, player.x, player.y) < CONSTANTS.PLAYER.INTERACT_RANGE;
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    destroy() {
        this.sprite.destroy();
        this.lockIcon.destroy();
        this.glow.destroy();
    }
}

/**
 * Keycard.js — Collectible keycard for Cyber Heist
 */
class Keycard {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} color - 'red', 'blue', 'gold'
     */
    constructor(scene, x, y, color) {
        this.scene = scene;
        this.color = color;
        this.collected = false;

        const colorMap = {
            red: CONSTANTS.COLORS.KEYCARD_RED,
            blue: CONSTANTS.COLORS.KEYCARD_BLUE,
            gold: CONSTANTS.COLORS.KEYCARD_GOLD,
        };
        const hexColor = colorMap[color] || 0xffffff;

        // Card shape (small rectangle)
        this.sprite = scene.add.rectangle(x, y, 12, 8, hexColor, 0.9);
        this.sprite.setDepth(350);

        // Glow ring
        this.glow = scene.add.circle(x, y, 12, hexColor, 0);
        this.glow.setStrokeStyle(1.5, hexColor, 0.4);
        this.glow.setDepth(349);

        // Floating animation
        scene.tweens.add({
            targets: [this.sprite, this.glow],
            y: y - 3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Enable physics for overlap detection
        scene.physics.add.existing(this.sprite, true);
    }

    /**
     * Collect this keycard.
     * @param {Player} player
     */
    collect(player) {
        if (this.collected) return;
        this.collected = true;

        player.addKeycard(this.color);

        // Collect animation
        this.scene.tweens.add({
            targets: [this.sprite, this.glow],
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 300,
            onComplete: () => {
                this.sprite.destroy();
                this.glow.destroy();
            },
        });
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    destroy() {
        if (!this.collected) {
            this.sprite.destroy();
            this.glow.destroy();
        }
    }
}

/**
 * DataTerminal.js — Hackable data terminal for Cyber Heist
 * Interaction triggers hacking mini-game.
 */
class DataTerminal {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} [id='terminal'] - Unique identifier
     * @param {boolean} [isBossTerminal=false] - Boss fight terminal
     */
    constructor(scene, x, y, id = 'terminal', isBossTerminal = false) {
        this.scene = scene;
        this.id = id;
        this.hacked = false;
        this.isBossTerminal = isBossTerminal;

        // Terminal base
        this.sprite = scene.add.rectangle(x, y, 18, 18, 0x222244, 1);
        this.sprite.setDepth(310);

        // Screen
        this.screen = scene.add.rectangle(x, y - 2, 12, 8, CONSTANTS.COLORS.TERMINAL_GREEN, 0.7);
        this.screen.setDepth(311);

        // Glow
        this.glow = scene.add.circle(x, y, 16, CONSTANTS.COLORS.TERMINAL_GREEN, 0);
        this.glow.setStrokeStyle(1, CONSTANTS.COLORS.TERMINAL_GREEN, 0.3);
        this.glow.setDepth(309);

        // Pulse animation
        scene.tweens.add({
            targets: this.glow,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
        });

        // Data stream particles
        this._streamTimer = 0;
    }

    /**
     * Check if player is in interaction range.
     */
    isInRange(player) {
        return MathUtils.distance(this.sprite.x, this.sprite.y, player.x, player.y) < CONSTANTS.PLAYER.INTERACT_RANGE;
    }

    /**
     * Mark as hacked.
     */
    hack() {
        if (this.hacked) return;
        this.hacked = true;

        this.screen.setFillStyle(0x0066ff, 0.7);
        this.glow.setStrokeStyle(1, 0x0066ff, 0.3);

        if (this.scene.particleSystem) {
            this.scene.particleSystem.sparks(this.sprite.x, this.sprite.y, CONSTANTS.COLORS.NEON_GREEN, 10);
        }
    }

    /**
     * Update data stream effect.
     */
    update(dt) {
        if (this.hacked) return;
        this._streamTimer -= dt;
        if (this._streamTimer <= 0) {
            this._streamTimer = 2 + Math.random() * 2;
            if (this.scene.particleSystem) {
                this.scene.particleSystem.dataStream(this.sprite.x, this.sprite.y);
            }
        }
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    destroy() {
        this.sprite.destroy();
        this.screen.destroy();
        this.glow.destroy();
    }
}

/**
 * LaserTrap.js — Pulsing laser beam trap for Cyber Heist
 */
class LaserTrap {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     * @param {number} [onDuration] - ms laser is ON
     * @param {number} [offDuration] - ms laser is OFF
     */
    constructor(scene, x1, y1, x2, y2, onDuration, offDuration) {
        this.scene = scene;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.onDuration = onDuration || CONSTANTS.LASER.ON_DURATION;
        this.offDuration = offDuration || CONSTANTS.LASER.OFF_DURATION;
        this.active = true;
        this.isOn = true;
        this.disabled = false;
        this.timer = 0;

        // Laser line graphics
        this.gfx = scene.add.graphics();
        this.gfx.setDepth(320);

        // Emitter points (small circles at endpoints)
        this.emitter1 = scene.add.circle(x1, y1, 3, CONSTANTS.COLORS.LASER_RED, 0.8);
        this.emitter1.setDepth(321);
        this.emitter2 = scene.add.circle(x2, y2, 3, CONSTANTS.COLORS.LASER_RED, 0.8);
        this.emitter2.setDepth(321);

        // Physics body for collision (invisible rectangle along laser line)
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const len = MathUtils.distance(x1, y1, x2, y2);
        const isHoriz = Math.abs(y2 - y1) < Math.abs(x2 - x1);
        const w = isHoriz ? len : 4;
        const h = isHoriz ? 4 : len;

        this.hitbox = scene.add.rectangle(midX, midY, w, h, 0xff0000, 0);
        scene.physics.add.existing(this.hitbox, true);
        this.hitbox.setDepth(319);
    }

    /**
     * Disable this laser permanently (via hacking).
     */
    disable() {
        this.disabled = true;
        this.isOn = false;
        this.hitbox.body.enable = false;
        this.gfx.clear();
        this.emitter1.setAlpha(0.2);
        this.emitter2.setAlpha(0.2);
    }

    /**
     * Update laser state.
     * @param {number} dt
     */
    update(dt) {
        if (this.disabled) return;

        this.timer += dt * 1000;
        const cycleDuration = this.onDuration + this.offDuration;
        const cyclePos = this.timer % cycleDuration;

        const wasOn = this.isOn;
        this.isOn = cyclePos < this.onDuration;

        // Enable/disable hitbox
        this.hitbox.body.enable = this.isOn;

        // Draw laser
        this.gfx.clear();
        if (this.isOn) {
            // Main beam
            this.gfx.lineStyle(2, CONSTANTS.COLORS.LASER_RED, 0.8);
            this.gfx.lineBetween(this.x1, this.y1, this.x2, this.y2);
            // Glow
            this.gfx.lineStyle(6, CONSTANTS.COLORS.LASER_RED, 0.15);
            this.gfx.lineBetween(this.x1, this.y1, this.x2, this.y2);

            this.emitter1.setAlpha(0.8);
            this.emitter2.setAlpha(0.8);
        } else {
            this.emitter1.setAlpha(0.3);
            this.emitter2.setAlpha(0.3);
        }
    }

    /**
     * Check if laser is on and can damage player.
     */
    canDamage() {
        return this.isOn && !this.disabled;
    }

    destroy() {
        this.gfx.destroy();
        this.emitter1.destroy();
        this.emitter2.destroy();
        this.hitbox.destroy();
    }
}

/**
 * Upgrade.js — Collectible upgrade pickup for Cyber Heist
 */
class Upgrade {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} upgradeId - Key matching CONSTANTS.UPGRADES
     */
    constructor(scene, x, y, upgradeId) {
        this.scene = scene;
        this.upgradeId = upgradeId;
        this.collected = false;

        const def = Object.values(CONSTANTS.UPGRADES).find(u => u.id === upgradeId);
        this.name = def ? def.name : upgradeId;

        // Hexagonal upgrade icon
        this.sprite = scene.add.polygon(x, y,
            [0, -8, 7, -4, 7, 4, 0, 8, -7, 4, -7, -4],
            CONSTANTS.COLORS.NEON_PURPLE, 0.8
        );
        this.sprite.setDepth(350);

        // Glow
        this.glow = scene.add.circle(x, y, 14, CONSTANTS.COLORS.NEON_PURPLE, 0);
        this.glow.setStrokeStyle(1.5, CONSTANTS.COLORS.NEON_PURPLE, 0.4);
        this.glow.setDepth(349);

        // Rotation animation
        scene.tweens.add({
            targets: this.sprite,
            angle: 360,
            duration: 4000,
            repeat: -1,
        });

        // Float animation
        scene.tweens.add({
            targets: [this.sprite, this.glow],
            y: y - 4,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Physics
        scene.physics.add.existing(this.sprite, true);

        // Check if already collected
        if (scene.saveSystem) {
            const data = scene.saveSystem.loadGame();
            if (data.upgrades.includes(upgradeId)) {
                this.collected = true;
                this.sprite.setVisible(false);
                this.glow.setVisible(false);
            }
        }
    }

    /**
     * Collect this upgrade.
     * @param {Player} player
     */
    collect(player) {
        if (this.collected) return;
        this.collected = true;

        player.applyUpgrade(this.upgradeId);

        if (this.scene.audioSystem) this.scene.audioSystem.playPickup();
        if (this.scene.particleSystem) {
            this.scene.particleSystem.sparks(this.sprite.x, this.sprite.y, CONSTANTS.COLORS.NEON_PURPLE, 12);
        }

        // Animate collection
        this.scene.tweens.add({
            targets: [this.sprite, this.glow],
            alpha: 0,
            scaleX: 3,
            scaleY: 3,
            duration: 400,
            onComplete: () => {
                this.sprite.destroy();
                this.glow.destroy();
            },
        });

        // Show upgrade name
        const txt = this.scene.add.text(this.sprite.x, this.sprite.y - 20, `+ ${this.name}`, {
            fontSize: '11px', fontFamily: 'monospace', color: '#d400ff',
            stroke: '#000', strokeThickness: 2,
        });
        txt.setOrigin(0.5);
        txt.setDepth(1000);
        txt.setScrollFactor(0);
        this.scene.tweens.add({
            targets: txt,
            y: txt.y - 30,
            alpha: 0,
            duration: 1500,
            onComplete: () => txt.destroy(),
        });
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    destroy() {
        if (!this.collected) {
            this.sprite.destroy();
            this.glow.destroy();
        }
    }
}

/**
 * ExitZone.js — Level exit trigger for Cyber Heist
 */
class ExitZone {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     */
    constructor(scene, x, y) {
        this.scene = scene;

        // Exit pad
        this.sprite = scene.add.rectangle(x, y, 28, 28, CONSTANTS.COLORS.NEON_GREEN, 0.15);
        this.sprite.setStrokeStyle(2, CONSTANTS.COLORS.NEON_GREEN, 0.5);
        this.sprite.setDepth(200);

        // Arrow indicator
        this.arrow = scene.add.text(x, y, '⬆', { fontSize: '14px' });
        this.arrow.setOrigin(0.5);
        this.arrow.setDepth(201);

        // Pulse
        scene.tweens.add({
            targets: this.sprite,
            alpha: 0.4,
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        // Physics
        scene.physics.add.existing(this.sprite, true);
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    destroy() {
        this.sprite.destroy();
        this.arrow.destroy();
    }
}
