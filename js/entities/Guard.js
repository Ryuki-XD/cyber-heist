/**
 * Guard.js — Enemy guard AI for Cyber Heist
 * FSM-based: PATROL → ALERT → CHASE → SEARCH → PATROL
 * Features vision cone rendering, waypoint patrol, and line-of-sight checks.
 */
class Guard {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Array<{x:number, y:number}>} waypoints - Patrol path
     * @param {object} difficulty - Difficulty multipliers
     */
    constructor(scene, x, y, waypoints, difficulty) {
        this.scene = scene;
        this.difficulty = difficulty;
        this.waypoints = waypoints || [{ x, y }];
        this.currentWaypoint = 0;
        this.lastKnownPlayerPos = null;
        this.alertTriggered = false;

        // ── Sprite ──
        this.sprite = scene.add.circle(x, y, CONSTANTS.GUARD.SIZE, CONSTANTS.COLORS.GUARD_BODY, 1);
        this.sprite.setDepth(450);

        // Enable physics
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCircle(CONSTANTS.GUARD.SIZE);
        this.sprite.body.setOffset(-CONSTANTS.GUARD.SIZE, -CONSTANTS.GUARD.SIZE);
        this.sprite.body.setImmovable(true);

        // ── Vision Cone Graphics ──
        this.visionGfx = scene.add.graphics();
        this.visionGfx.setDepth(400);

        // ── State ──
        this.facingAngle = 0;
        this.patrolSpeed = CONSTANTS.GUARD.PATROL_SPEED * difficulty.guardSpeedMul;
        this.chaseSpeed = CONSTANTS.GUARD.CHASE_SPEED * difficulty.guardSpeedMul;
        this.visionRange = CONSTANTS.GUARD.VISION_RANGE * difficulty.guardVisionMul;
        this.visionHalfAngle = MathUtils.degToRad(CONSTANTS.GUARD.VISION_ANGLE);
        this.active = true;

        // ── Detection ──
        this.detectionLevel = 0;   // 0-1, fills up when player visible
        this.detectionRate = 1.5;  // per second

        // Initial facing toward first waypoint
        if (this.waypoints.length > 1) {
            const wp = this.waypoints[1] || this.waypoints[0];
            this.facingAngle = MathUtils.angleBetween(x, y, wp.x, wp.y);
        }

        // ── FSM ──
        this.fsm = new FSM(this, {
            PATROL: {
                enter() {
                    this.detectionLevel = 0;
                    this._moveToNextWaypoint();
                },
                update(dt) {
                    this._updatePatrol(dt);
                },
                exit() { },
            },
            ALERT: {
                enter(params) {
                    this.lastKnownPlayerPos = params ? { x: params.px, y: params.py } : null;
                    this.sprite.body.setVelocity(0, 0);
                    // Flash sprite
                    this.scene.tweens.add({
                        targets: this.sprite,
                        fillAlpha: 0.5,
                        duration: 150,
                        yoyo: true,
                        repeat: 2,
                    });
                },
                update(dt) {
                    // Wait for alert delay, then chase
                    if (this.fsm.getStateTime() > CONSTANTS.GUARD.ALERT_DELAY) {
                        this.fsm.setState('CHASE');
                    }
                },
                exit() { },
            },
            CHASE: {
                enter() {
                    this.alertTriggered = true;
                },
                update(dt) {
                    this._updateChase(dt);
                },
                exit() { },
            },
            SEARCH: {
                enter() {
                    // Move toward last known position
                    if (this.lastKnownPlayerPos) {
                        const angle = MathUtils.angleBetween(
                            this.sprite.x, this.sprite.y,
                            this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y
                        );
                        this.facingAngle = angle;
                        const speed = CONSTANTS.GUARD.SEARCH_SPEED * this.difficulty.guardSpeedMul;
                        this.sprite.body.setVelocity(
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed
                        );
                    }
                },
                update(dt) {
                    // Look around at last known pos
                    if (this.lastKnownPlayerPos) {
                        const dist = MathUtils.distance(
                            this.sprite.x, this.sprite.y,
                            this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y
                        );
                        if (dist < 20) {
                            this.sprite.body.setVelocity(0, 0);
                            // Slowly rotate while searching
                            this.facingAngle += dt * 2;
                        }
                    }
                    // Return to patrol after search duration
                    if (this.fsm.getStateTime() > CONSTANTS.GUARD.SEARCH_DURATION) {
                        this.fsm.setState('PATROL');
                    }
                },
                exit() {
                    this.lastKnownPlayerPos = null;
                },
            },
        }, 'PATROL');
    }

    // ── Patrol Logic ──

    _moveToNextWaypoint() {
        if (this.waypoints.length === 0) return;

        this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
        const wp = this.waypoints[this.currentWaypoint];
        const angle = MathUtils.angleBetween(this.sprite.x, this.sprite.y, wp.x, wp.y);
        this.facingAngle = angle;
        this.sprite.body.setVelocity(
            Math.cos(angle) * this.patrolSpeed,
            Math.sin(angle) * this.patrolSpeed
        );
    }

    _updatePatrol(dt) {
        const wp = this.waypoints[this.currentWaypoint];
        const dist = MathUtils.distance(this.sprite.x, this.sprite.y, wp.x, wp.y);

        if (dist < 8) {
            this.sprite.body.setVelocity(0, 0);
            // Pause at waypoint, then move to next
            if (!this._waypointPausing) {
                this._waypointPausing = true;
                this.scene.time.delayedCall(CONSTANTS.GUARD.WAYPOINT_PAUSE, () => {
                    this._waypointPausing = false;
                    if (this.fsm.is('PATROL') && this.active) {
                        this._moveToNextWaypoint();
                    }
                });
            }
        } else {
            // Keep moving toward waypoint
            const angle = MathUtils.angleBetween(this.sprite.x, this.sprite.y, wp.x, wp.y);
            this.facingAngle = angle;
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.patrolSpeed,
                Math.sin(angle) * this.patrolSpeed
            );
        }
    }

    // ── Chase Logic ──

    _updateChase(dt) {
        const player = this.scene.player;
        if (!player || !player.alive) {
            this.fsm.setState('PATROL');
            return;
        }

        const dist = MathUtils.distance(this.sprite.x, this.sprite.y, player.x, player.y);
        const canSee = this._canSeePlayer(player);

        if (canSee) {
            this.lastKnownPlayerPos = { x: player.x, y: player.y };
            // Move toward player
            const angle = MathUtils.angleBetween(this.sprite.x, this.sprite.y, player.x, player.y);
            this.facingAngle = angle;
            this.sprite.body.setVelocity(
                Math.cos(angle) * this.chaseSpeed,
                Math.sin(angle) * this.chaseSpeed
            );

            // Damage player on contact
            if (dist < CONSTANTS.GUARD.SIZE + CONSTANTS.PLAYER.SIZE + 2) {
                player.takeDamage(20);
            }
        } else {
            // Lost sight — switch to search
            this.fsm.setState('SEARCH');
        }
    }

    // ── Detection ──

    /**
     * Check if player is visible (in cone + line of sight).
     * @param {Player} player
     * @returns {boolean}
     */
    _canSeePlayer(player) {
        if (!player || !player.alive) return false;

        // Check vision cone
        const inCone = MathUtils.isInVisionCone(
            this.sprite.x, this.sprite.y,
            this.facingAngle,
            player.x, player.y,
            this.visionRange,
            this.visionHalfAngle
        );

        if (!inCone) return false;

        // Check line of sight (walls blocking)
        if (this.scene.walls) {
            return MathUtils.hasLineOfSight(
                this.sprite.x, this.sprite.y,
                player.x, player.y,
                this.scene.walls
            );
        }

        return true;
    }

    /**
     * Update guard AI and rendering each frame.
     * @param {number} dt - Delta time in seconds
     * @param {Player} player
     */
    update(dt, player) {
        if (!this.active) return;

        // ── Detection check (runs in all states) ──
        if (player && player.alive && !this.fsm.is('CHASE')) {
            const canSee = this._canSeePlayer(player);

            // Shadow reduces detection
            let detRate = this.detectionRate;
            if (this.scene.lightingSystem && this.scene.lightingSystem.isInShadow(player.x, player.y)) {
                detRate *= 0.4;
                // Also reduce vision range in shadow
            }

            if (canSee) {
                this.detectionLevel += detRate * dt;
                if (this.detectionLevel >= 1 && !this.fsm.is('ALERT') && !this.fsm.is('CHASE')) {
                    // Player detected!
                    player.detected = true;
                    if (this.scene.audioSystem) this.scene.audioSystem.playAlert();
                    if (this.scene.particleSystem) this.scene.particleSystem.alertBurst(this.sprite.x, this.sprite.y);
                    this.fsm.setState('ALERT', { px: player.x, py: player.y });
                }
            } else {
                this.detectionLevel = Math.max(0, this.detectionLevel - dt * 0.5);
            }
        }

        // ── FSM update ──
        this.fsm.update(dt);

        // ── Draw vision cone ──
        this._drawVisionCone();
    }

    /**
     * Draw the vision cone using Graphics.
     */
    _drawVisionCone() {
        this.visionGfx.clear();

        const isAlert = this.fsm.is('CHASE') || this.fsm.is('ALERT');
        const color = isAlert ? CONSTANTS.COLORS.VISION_CONE_ALERT : CONSTANTS.COLORS.VISION_CONE;
        const alpha = isAlert ? 0.2 : 0.1;

        const cx = this.sprite.x;
        const cy = this.sprite.y;
        const range = this.visionRange;
        const startAngle = this.facingAngle - this.visionHalfAngle;
        const endAngle = this.facingAngle + this.visionHalfAngle;

        this.visionGfx.fillStyle(color, alpha);
        this.visionGfx.beginPath();
        this.visionGfx.moveTo(cx, cy);

        const steps = 16;
        for (let i = 0; i <= steps; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / steps);
            const px = cx + Math.cos(angle) * range;
            const py = cy + Math.sin(angle) * range;
            this.visionGfx.lineTo(px, py);
        }

        this.visionGfx.closePath();
        this.visionGfx.fill();

        // Cone border
        this.visionGfx.lineStyle(1, color, alpha + 0.1);
        this.visionGfx.beginPath();
        this.visionGfx.moveTo(cx, cy);
        this.visionGfx.lineTo(cx + Math.cos(startAngle) * range, cy + Math.sin(startAngle) * range);
        this.visionGfx.moveTo(cx, cy);
        this.visionGfx.lineTo(cx + Math.cos(endAngle) * range, cy + Math.sin(endAngle) * range);
        this.visionGfx.strokePath();

        // Detection indicator
        if (this.detectionLevel > 0 && this.detectionLevel < 1) {
            this.visionGfx.fillStyle(CONSTANTS.COLORS.NEON_YELLOW, 0.7);
            this.visionGfx.fillRect(cx - 10, cy - CONSTANTS.GUARD.SIZE - 8, 20 * this.detectionLevel, 3);
            this.visionGfx.lineStyle(1, CONSTANTS.COLORS.NEON_YELLOW, 0.5);
            this.visionGfx.strokeRect(cx - 10, cy - CONSTANTS.GUARD.SIZE - 8, 20, 3);
        }
    }

    /**
     * Alert this guard to the player's position (e.g., from a camera alert).
     * @param {number} px - Player X
     * @param {number} py - Player Y
     */
    alertToPosition(px, py) {
        if (this.fsm.is('CHASE')) return;
        this.lastKnownPlayerPos = { x: px, y: py };
        this.detectionLevel = 1;
        this.fsm.setState('ALERT', { px, py });
    }

    /**
     * Get position.
     */
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    /**
     * Clean up.
     */
    destroy() {
        this.sprite.destroy();
        this.visionGfx.destroy();
        this.active = false;
    }
}
