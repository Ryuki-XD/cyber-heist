/**
 * Camera.js — Security camera entity for Cyber Heist
 * Sweeps back and forth, detects player, triggers alarms.
 */
class SecurityCamera {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x - Mount position X
     * @param {number} y - Mount position Y
     * @param {number} baseAngle - Center angle of sweep (degrees)
     * @param {object} difficulty
     */
    constructor(scene, x, y, baseAngle, difficulty) {
        this.scene = scene;
        this.difficulty = difficulty;
        this.active = true;
        this.disabled = false;
        this.alerted = false;
        this.alertTimer = 0;

        this.baseAngle = MathUtils.degToRad(baseAngle);
        this.sweepAngle = MathUtils.degToRad(CONSTANTS.CAMERA.SWEEP_ANGLE / 2);
        this.sweepSpeed = CONSTANTS.CAMERA.SWEEP_SPEED;
        this.currentAngle = this.baseAngle;
        this.sweepDir = 1;

        this.visionRange = CONSTANTS.CAMERA.VISION_RANGE * difficulty.guardVisionMul;
        this.visionHalfAngle = MathUtils.degToRad(CONSTANTS.CAMERA.VISION_ANGLE);

        // Camera mount (small square)
        this.mount = scene.add.rectangle(x, y, 10, 10, 0x666688, 1);
        this.mount.setDepth(450);

        // Lens indicator
        this.lens = scene.add.circle(
            x + Math.cos(this.currentAngle) * 8,
            y + Math.sin(this.currentAngle) * 8,
            3, CONSTANTS.COLORS.NEON_RED, 1
        );
        this.lens.setDepth(451);

        // Vision cone graphics
        this.visionGfx = scene.add.graphics();
        this.visionGfx.setDepth(399);
    }

    /**
     * Disable this camera (via hacking).
     */
    disable() {
        this.disabled = true;
        this.active = false;
        this.mount.setAlpha(0.3);
        this.lens.setVisible(false);
        this.visionGfx.clear();
    }

    /**
     * Update camera sweep and detection.
     * @param {number} dt
     * @param {Player} player
     */
    update(dt, player) {
        if (this.disabled) return;

        // Sweep rotation
        this.currentAngle += this.sweepSpeed * this.sweepDir * dt;
        const minAngle = this.baseAngle - this.sweepAngle;
        const maxAngle = this.baseAngle + this.sweepAngle;

        if (this.currentAngle > maxAngle) {
            this.currentAngle = maxAngle;
            this.sweepDir = -1;
        } else if (this.currentAngle < minAngle) {
            this.currentAngle = minAngle;
            this.sweepDir = 1;
        }

        // Update lens position
        this.lens.setPosition(
            this.mount.x + Math.cos(this.currentAngle) * 8,
            this.mount.y + Math.sin(this.currentAngle) * 8
        );

        // ── Detection ──
        if (player && player.alive && !this.alerted) {
            const inCone = MathUtils.isInVisionCone(
                this.mount.x, this.mount.y,
                this.currentAngle,
                player.x, player.y,
                this.visionRange,
                this.visionHalfAngle
            );

            if (inCone) {
                // Check line of sight
                let canSee = true;
                if (this.scene.walls) {
                    canSee = MathUtils.hasLineOfSight(
                        this.mount.x, this.mount.y,
                        player.x, player.y,
                        this.scene.walls
                    );
                }

                if (canSee) {
                    this._triggerAlert(player);
                }
            }
        }

        // ── Alert timer ──
        if (this.alerted) {
            this.alertTimer -= dt * 1000;
            if (this.alertTimer <= 0) {
                this.alerted = false;
                this.lens.setFillStyle(CONSTANTS.COLORS.NEON_RED, 1);
            }
        }

        // ── Draw vision cone ──
        this._drawVisionCone();
    }

    /**
     * Trigger camera alert.
     * @param {Player} player
     */
    _triggerAlert(player) {
        this.alerted = true;
        this.alertTimer = CONSTANTS.CAMERA.ALERT_DURATION;
        player.detected = true;

        this.lens.setFillStyle(CONSTANTS.COLORS.NEON_YELLOW, 1);

        if (this.scene.audioSystem) this.scene.audioSystem.playAlarm();
        if (this.scene.particleSystem) this.scene.particleSystem.alertBurst(this.mount.x, this.mount.y);

        // Alert nearby guards
        if (this.scene.guards) {
            this.scene.guards.forEach(guard => {
                const dist = MathUtils.distance(this.mount.x, this.mount.y, guard.x, guard.y);
                if (dist < 300) {
                    guard.alertToPosition(player.x, player.y);
                }
            });
        }
    }

    /**
     * Draw the vision cone.
     */
    _drawVisionCone() {
        this.visionGfx.clear();
        if (this.disabled) return;

        const color = this.alerted ? CONSTANTS.COLORS.VISION_CONE_ALERT : 0xff4444;
        const alpha = this.alerted ? 0.15 : 0.08;

        const cx = this.mount.x;
        const cy = this.mount.y;
        const range = this.visionRange;
        const startAngle = this.currentAngle - this.visionHalfAngle;
        const endAngle = this.currentAngle + this.visionHalfAngle;

        this.visionGfx.fillStyle(color, alpha);
        this.visionGfx.beginPath();
        this.visionGfx.moveTo(cx, cy);

        const steps = 12;
        for (let i = 0; i <= steps; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / steps);
            this.visionGfx.lineTo(
                cx + Math.cos(angle) * range,
                cy + Math.sin(angle) * range
            );
        }

        this.visionGfx.closePath();
        this.visionGfx.fill();
    }

    /**
     * Get position.
     */
    get x() { return this.mount.x; }
    get y() { return this.mount.y; }

    /**
     * Clean up.
     */
    destroy() {
        this.mount.destroy();
        this.lens.destroy();
        this.visionGfx.destroy();
    }
}
