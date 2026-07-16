/**
 * Boss.js — Boss enemy for Cyber Heist Level 5
 * Enhanced guard with EMP attack, multi-phase behavior, and larger vision.
 */
class Boss {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Array<{x:number, y:number}>} waypoints
     * @param {object} difficulty
     */
    constructor(scene, x, y, waypoints, difficulty) {
        this.scene = scene;
        this.difficulty = difficulty;
        this.waypoints = waypoints || [{ x, y }];
        this.currentWaypoint = 0;
        this.lastKnownPlayerPos = null;
        this.active = true;
        this.defeated = false;

        // ── Stats ──
        this.health = CONSTANTS.BOSS.HEALTH;
        this.maxHealth = CONSTANTS.BOSS.HEALTH;
        this.empCooldown = 0;
        this.phase = 1; // phases 1-3 based on health

        // ── Sprite ──
        this.sprite = scene.add.circle(x, y, CONSTANTS.BOSS.SIZE, CONSTANTS.COLORS.BOSS_BODY, 1);
        this.sprite.setDepth(460);

        // Outer ring
        this.ring = scene.add.circle(x, y, CONSTANTS.BOSS.SIZE + 4, 0x000000, 0);
        this.ring.setStrokeStyle(2, CONSTANTS.COLORS.NEON_PINK, 0.6);
        this.ring.setDepth(459);

        // Enable physics
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCircle(CONSTANTS.BOSS.SIZE);
        this.sprite.body.setOffset(-CONSTANTS.BOSS.SIZE, -CONSTANTS.BOSS.SIZE);
        this.sprite.body.setImmovable(true);

        // ── Vision ──
        this.visionGfx = scene.add.graphics();
        this.visionGfx.setDepth(398);
        this.visionRange = CONSTANTS.BOSS.VISION_RANGE * difficulty.guardVisionMul;
        this.visionHalfAngle = MathUtils.degToRad(CONSTANTS.BOSS.VISION_ANGLE);
        this.facingAngle = 0;

        // ── Health bar ──
        this.healthGfx = scene.add.graphics();
        this.healthGfx.setDepth(461);

        // ── FSM ──
        this.fsm = new FSM(this, {
            PATROL: {
                enter() {
                    this._moveToNextWaypoint();
                },
                update(dt) {
                    this._updatePatrol(dt);
                },
                exit() { },
            },
            CHASE: {
                enter() {
                    if (this.scene.audioSystem) this.scene.audioSystem.playAlert();
                },
                update(dt) {
                    this._updateChase(dt);
                },
                exit() { },
            },
            SEARCH: {
                enter() { },
                update(dt) {
                    this._updateSearch(dt);
                },
                exit() { },
            },
            STUNNED: {
                enter() {
                    this.sprite.body.setVelocity(0, 0);
                    this.sprite.setAlpha(0.5);
                },
                update(dt) {
                    if (this.fsm.getStateTime() > 1500) {
                        this.sprite.setAlpha(1);
                        this.fsm.setState('CHASE');
                    }
                },
                exit() {
                    this.sprite.setAlpha(1);
                },
            },
        }, 'PATROL');
    }

    // ── Patrol ──

    _moveToNextWaypoint() {
        this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
        const wp = this.waypoints[this.currentWaypoint];
        const angle = MathUtils.angleBetween(this.sprite.x, this.sprite.y, wp.x, wp.y);
        this.facingAngle = angle;
        const speed = CONSTANTS.BOSS.SPEED * this.difficulty.guardSpeedMul;
        this.sprite.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    _updatePatrol(dt) {
        const wp = this.waypoints[this.currentWaypoint];
        const dist = MathUtils.distance(this.sprite.x, this.sprite.y, wp.x, wp.y);
        if (dist < 10) {
            this.sprite.body.setVelocity(0, 0);
            if (!this._pausing) {
                this._pausing = true;
                this.scene.time.delayedCall(1000, () => {
                    this._pausing = false;
                    if (this.fsm.is('PATROL') && this.active) this._moveToNextWaypoint();
                });
            }
        }
    }

    // ── Chase ──

    _updateChase(dt) {
        const player = this.scene.player;
        if (!player || !player.alive) {
            this.fsm.setState('PATROL');
            return;
        }

        const canSee = this._canSeePlayer(player);
        if (canSee) {
            this.lastKnownPlayerPos = { x: player.x, y: player.y };
            const angle = MathUtils.angleBetween(this.sprite.x, this.sprite.y, player.x, player.y);
            this.facingAngle = angle;

            // Speed increases with phase
            const speed = CONSTANTS.BOSS.CHASE_SPEED * this.difficulty.guardSpeedMul * (1 + (this.phase - 1) * 0.15);
            this.sprite.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

            const dist = MathUtils.distance(this.sprite.x, this.sprite.y, player.x, player.y);

            // Contact damage
            if (dist < CONSTANTS.BOSS.SIZE + CONSTANTS.PLAYER.SIZE + 2) {
                player.takeDamage(30);
            }

            // EMP attack
            this.empCooldown -= dt * 1000;
            if (this.empCooldown <= 0 && dist < CONSTANTS.BOSS.EMP_RANGE * 1.5) {
                this._fireEMP(player);
            }
        } else {
            this.fsm.setState('SEARCH');
        }
    }

    // ── Search ──

    _updateSearch(dt) {
        if (this.lastKnownPlayerPos) {
            const dist = MathUtils.distance(
                this.sprite.x, this.sprite.y,
                this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y
            );
            if (dist > 15) {
                const angle = MathUtils.angleBetween(
                    this.sprite.x, this.sprite.y,
                    this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y
                );
                this.facingAngle = angle;
                const speed = CONSTANTS.BOSS.SPEED * this.difficulty.guardSpeedMul;
                this.sprite.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            } else {
                this.sprite.body.setVelocity(0, 0);
                this.facingAngle += dt * 3;
            }
        }

        if (this.fsm.getStateTime() > 5000) {
            this.fsm.setState('PATROL');
        }
    }

    // ── EMP Attack ──

    _fireEMP(player) {
        this.empCooldown = CONSTANTS.BOSS.EMP_COOLDOWN / (1 + (this.phase - 1) * 0.2);

        if (this.scene.audioSystem) this.scene.audioSystem.playEMP();
        if (this.scene.particleSystem) this.scene.particleSystem.empPulse(this.sprite.x, this.sprite.y);

        const dist = MathUtils.distance(this.sprite.x, this.sprite.y, player.x, player.y);
        if (dist < CONSTANTS.BOSS.EMP_RANGE) {
            player.stun(CONSTANTS.BOSS.EMP_STUN_DURATION);
        }
    }

    // ── Vision ──

    _canSeePlayer(player) {
        if (!player || !player.alive) return false;
        const inCone = MathUtils.isInVisionCone(
            this.sprite.x, this.sprite.y,
            this.facingAngle,
            player.x, player.y,
            this.visionRange,
            this.visionHalfAngle
        );
        if (!inCone) return false;
        if (this.scene.walls) {
            return MathUtils.hasLineOfSight(this.sprite.x, this.sprite.y, player.x, player.y, this.scene.walls);
        }
        return true;
    }

    /**
     * Boss takes a hit (from hacking terminal interaction during boss fight).
     */
    takeHit() {
        this.health--;
        this.phase = Math.max(1, CONSTANTS.BOSS.HEALTH - this.health + 1);

        if (this.scene.audioSystem) this.scene.audioSystem.playDamage();
        if (this.scene.particleSystem) this.scene.particleSystem.sparks(this.sprite.x, this.sprite.y, CONSTANTS.COLORS.NEON_PINK, 12);

        // Flash
        this.scene.tweens.add({
            targets: [this.sprite, this.ring],
            alpha: 0.2,
            duration: 100,
            yoyo: true,
            repeat: 4,
        });

        this.fsm.setState('STUNNED');

        if (this.health <= 0) {
            this.defeated = true;
            this.active = false;
            this.sprite.body.setVelocity(0, 0);
            this.sprite.setAlpha(0.2);
            this.ring.setAlpha(0.1);
            this.visionGfx.clear();
        }
    }

    /**
     * Update boss each frame.
     * @param {number} dt
     * @param {Player} player
     */
    update(dt, player) {
        if (!this.active || this.defeated) return;

        // Detection
        if (player && player.alive && !this.fsm.is('CHASE') && !this.fsm.is('STUNNED')) {
            if (this._canSeePlayer(player)) {
                player.detected = true;
                this.fsm.setState('CHASE');
            }
        }

        this.fsm.update(dt);
        this._drawVisionCone();
        this._drawHealthBar();

        // Update ring position
        this.ring.setPosition(this.sprite.x, this.sprite.y);
        // Pulse ring
        const pulse = 0.4 + Math.sin(Date.now() * 0.005 * this.phase) * 0.3;
        this.ring.setStrokeStyle(2, CONSTANTS.COLORS.NEON_PINK, pulse);
    }

    _drawVisionCone() {
        this.visionGfx.clear();
        if (this.defeated) return;

        const isAlert = this.fsm.is('CHASE');
        const color = isAlert ? CONSTANTS.COLORS.VISION_CONE_ALERT : CONSTANTS.COLORS.NEON_PINK;
        const alpha = isAlert ? 0.2 : 0.1;

        const cx = this.sprite.x;
        const cy = this.sprite.y;
        const range = this.visionRange;
        const startAngle = this.facingAngle - this.visionHalfAngle;
        const endAngle = this.facingAngle + this.visionHalfAngle;

        this.visionGfx.fillStyle(color, alpha);
        this.visionGfx.beginPath();
        this.visionGfx.moveTo(cx, cy);

        for (let i = 0; i <= 16; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / 16);
            this.visionGfx.lineTo(cx + Math.cos(angle) * range, cy + Math.sin(angle) * range);
        }

        this.visionGfx.closePath();
        this.visionGfx.fill();
    }

    _drawHealthBar() {
        this.healthGfx.clear();
        if (this.defeated) return;

        const bx = this.sprite.x - 20;
        const by = this.sprite.y - CONSTANTS.BOSS.SIZE - 12;
        const bw = 40;
        const bh = 5;
        const pct = this.health / this.maxHealth;

        this.healthGfx.fillStyle(0x330000, 0.8);
        this.healthGfx.fillRect(bx, by, bw, bh);
        this.healthGfx.fillStyle(CONSTANTS.COLORS.NEON_PINK, 0.9);
        this.healthGfx.fillRect(bx, by, bw * pct, bh);
        this.healthGfx.lineStyle(1, CONSTANTS.COLORS.NEON_PINK, 0.6);
        this.healthGfx.strokeRect(bx, by, bw, bh);
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    destroy() {
        this.sprite.destroy();
        this.ring.destroy();
        this.visionGfx.destroy();
        this.healthGfx.destroy();
        this.active = false;
    }
}
