/**
 * Player.js — Player entity for Cyber Heist
 * Handles movement, sprinting, health, energy, inventory, and interaction.
 */
class Player {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x - Start X
     * @param {number} y - Start Y
     * @param {object} difficulty - Difficulty settings from CONSTANTS.DIFFICULTY
     */
    constructor(scene, x, y, difficulty) {
        this.scene = scene;
        this.difficulty = difficulty;

        // Create player sprite (circular body)
        this.sprite = scene.add.circle(x, y, CONSTANTS.PLAYER.SIZE, CONSTANTS.COLORS.PLAYER_BODY, 1);
        this.sprite.setDepth(500);

        // Add a glow ring
        this.glowRing = scene.add.circle(x, y, CONSTANTS.PLAYER.SIZE + 3, CONSTANTS.COLORS.NEON_CYAN, 0);
        this.glowRing.setStrokeStyle(2, CONSTANTS.COLORS.NEON_CYAN, 0.4);
        this.glowRing.setDepth(499);

        // Direction indicator
        this.dirIndicator = scene.add.triangle(x + 14, y, 0, -4, 8, 0, 0, 4, CONSTANTS.COLORS.NEON_CYAN, 0.8);
        this.dirIndicator.setDepth(501);

        // Enable physics
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCircle(CONSTANTS.PLAYER.SIZE);
        this.sprite.body.setOffset(-CONSTANTS.PLAYER.SIZE, -CONSTANTS.PLAYER.SIZE);
        this.sprite.body.setCollideWorldBounds(false);

        // ── State ──
        this.maxHealth = Math.round(CONSTANTS.PLAYER.MAX_HEALTH * difficulty.playerHealthMul);
        this.health = this.maxHealth;
        this.maxEnergy = CONSTANTS.PLAYER.MAX_ENERGY;
        this.energy = this.maxEnergy;
        this.speed = CONSTANTS.PLAYER.SPEED;
        this.sprinting = false;
        this.alive = true;
        this.stunned = false;
        this.stunTimer = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.facingAngle = 0;  // radians

        // ── Inventory ──
        this.keycards = [];     // array of color strings
        this.upgrades = [];     // array of upgrade IDs
        this.dataCollected = 0;

        // ── Stats (for achievements) ──
        this.detected = false;
        this.damageTaken = 0;

        // ── Input ──
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = {
            W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ── Touch / Mobile ──
        this.touchVelocity = { x: 0, y: 0 };
        this.touchActive = false;

        // ── Footstep timer ──
        this.footstepTimer = 0;
        this.footstepInterval = 0.3; // seconds between footsteps

        // Apply any upgrades from save
        this._applyUpgrades();
    }

    /**
     * Apply collected upgrades from save data.
     */
    _applyUpgrades() {
        const saveData = this.scene.saveSystem ? this.scene.saveSystem.loadGame() : { upgrades: [] };
        saveData.upgrades.forEach(uid => {
            this.applyUpgrade(uid, true);
        });
    }

    /**
     * Apply an upgrade effect.
     * @param {string} upgradeId
     * @param {boolean} [fromSave=false] - If from save, don't re-save
     */
    applyUpgrade(upgradeId, fromSave = false) {
        if (this.upgrades.includes(upgradeId)) return;
        this.upgrades.push(upgradeId);

        const upgradeDefs = CONSTANTS.UPGRADES;
        switch (upgradeId) {
            case upgradeDefs.SPEED_BOOST.id:
                this.speed *= upgradeDefs.SPEED_BOOST.speedMul;
                break;
            case upgradeDefs.EXTRA_HEALTH.id:
                this.maxHealth += upgradeDefs.EXTRA_HEALTH.healthBonus;
                this.health = this.maxHealth;
                break;
            case upgradeDefs.ENERGY_BOOST.id:
                this.maxEnergy *= upgradeDefs.ENERGY_BOOST.energyMul;
                this.energy = this.maxEnergy;
                break;
        }

        if (!fromSave && this.scene.saveSystem) {
            this.scene.saveSystem.collectUpgrade(upgradeId);
        }
    }

    /**
     * Check if player has the silent sprint upgrade.
     */
    hasSilentSprint() {
        return this.upgrades.includes(CONSTANTS.UPGRADES.SILENT_SPRINT.id);
    }

    /**
     * Set touch joystick velocity (for mobile controls).
     */
    setTouchVelocity(vx, vy) {
        this.touchVelocity.x = vx;
        this.touchVelocity.y = vy;
        this.touchActive = (vx !== 0 || vy !== 0);
    }

    /**
     * Take damage.
     * @param {number} amount
     */
    takeDamage(amount) {
        if (this.invincible || !this.alive) return;

        const dmg = Math.round(amount * this.difficulty.damageMultiplier);
        this.health -= dmg;
        this.damageTaken += dmg;

        // Flash effect
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3,
        });

        // Invincibility frames
        this.invincible = true;
        this.invincibleTimer = CONSTANTS.PLAYER.INVINCIBILITY_TIME;

        if (this.scene.audioSystem) {
            this.scene.audioSystem.playDamage();
        }

        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
        }
    }

    /**
     * Stun the player (from boss EMP).
     * @param {number} duration - ms
     */
    stun(duration) {
        this.stunned = true;
        this.stunTimer = duration;
        this.sprite.setAlpha(0.5);
    }

    /**
     * Check if interaction key is pressed.
     */
    isInteracting() {
        return Phaser.Input.Keyboard.JustDown(this.interactKey) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey);
    }

    /**
     * Add a keycard to inventory.
     * @param {string} color
     */
    addKeycard(color) {
        if (!this.keycards.includes(color)) {
            this.keycards.push(color);
            if (this.scene.audioSystem) {
                this.scene.audioSystem.playPickup();
            }
        }
    }

    /**
     * Check if player has a specific keycard.
     * @param {string} color
     * @returns {boolean}
     */
    hasKeycard(color) {
        return this.keycards.includes(color);
    }

    /**
     * Update player state each frame.
     * @param {number} dt - delta time in seconds
     */
    update(dt) {
        if (!this.alive) {
            this.sprite.body.setVelocity(0, 0);
            return;
        }

        // ── Stun timer ──
        if (this.stunned) {
            this.stunTimer -= dt * 1000;
            this.sprite.body.setVelocity(0, 0);
            if (this.stunTimer <= 0) {
                this.stunned = false;
                this.sprite.setAlpha(1);
            }
            this._updateVisuals();
            return;
        }

        // ── Invincibility timer ──
        if (this.invincible) {
            this.invincibleTimer -= dt * 1000;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.sprite.setAlpha(1);
            }
        }

        // ── Movement ──
        let vx = 0;
        let vy = 0;

        // Keyboard input
        if (this.wasd.A.isDown || this.cursors.left.isDown) vx -= 1;
        if (this.wasd.D.isDown || this.cursors.right.isDown) vx += 1;
        if (this.wasd.W.isDown || this.cursors.up.isDown) vy -= 1;
        if (this.wasd.S.isDown || this.cursors.down.isDown) vy += 1;

        // Touch input
        if (this.touchActive) {
            vx = this.touchVelocity.x;
            vy = this.touchVelocity.y;
        }

        // Normalize diagonal
        const len = Math.sqrt(vx * vx + vy * vy);
        if (len > 0) {
            vx /= len;
            vy /= len;
        }

        // Sprint
        this.sprinting = this.shiftKey.isDown && this.energy > 0 && len > 0;
        let currentSpeed = this.speed;
        if (this.sprinting) {
            currentSpeed *= CONSTANTS.PLAYER.SPRINT_MULTIPLIER;
            this.energy -= CONSTANTS.PLAYER.ENERGY_DRAIN_RATE * dt;
            if (this.energy < 0) this.energy = 0;
        } else if (len === 0) {
            // Regen energy when standing still
            this.energy = Math.min(this.maxEnergy,
                this.energy + CONSTANTS.PLAYER.ENERGY_REGEN_RATE * 1.5 * dt);
        } else {
            // Slower regen while walking
            this.energy = Math.min(this.maxEnergy,
                this.energy + CONSTANTS.PLAYER.ENERGY_REGEN_RATE * 0.5 * dt);
        }

        this.sprite.body.setVelocity(vx * currentSpeed, vy * currentSpeed);

        // ── Facing direction ──
        if (len > 0) {
            this.facingAngle = Math.atan2(vy, vx);
        }

        // ── Footstep sounds ──
        if (len > 0 && this.scene.audioSystem) {
            this.footstepTimer -= dt;
            if (this.footstepTimer <= 0) {
                this.footstepTimer = this.sprinting ? this.footstepInterval * 0.6 : this.footstepInterval;
                this.scene.audioSystem.playFootstep();
            }
        }

        this._updateVisuals();
    }

    /**
     * Update visual elements to match physics body position.
     */
    _updateVisuals() {
        const x = this.sprite.x;
        const y = this.sprite.y;

        this.glowRing.setPosition(x, y);
        this.glowRing.setAlpha(this.sprinting ? 0.6 : 0.2);

        // Direction indicator
        const ix = x + Math.cos(this.facingAngle) * (CONSTANTS.PLAYER.SIZE + 6);
        const iy = y + Math.sin(this.facingAngle) * (CONSTANTS.PLAYER.SIZE + 6);
        this.dirIndicator.setPosition(ix, iy);
        this.dirIndicator.setRotation(this.facingAngle);
    }

    /**
     * Get player position.
     */
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    /**
     * Clean up resources.
     */
    destroy() {
        this.sprite.destroy();
        this.glowRing.destroy();
        this.dirIndicator.destroy();
    }
}
