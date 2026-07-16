/**
 * MathUtils.js — Math helpers for Cyber Heist
 * Angle normalization, distance checks, vision cone tests, raycasting.
 */
const MathUtils = {

    /**
     * Calculate distance between two points.
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Calculate angle from (x1,y1) to (x2,y2) in radians.
     */
    angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Normalize angle to [-PI, PI] range.
     */
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    },

    /**
     * Check if a target point is within a vision cone.
     * @param {number} sourceX - Observer X
     * @param {number} sourceY - Observer Y
     * @param {number} facingAngle - Observer facing direction (radians)
     * @param {number} targetX - Target X
     * @param {number} targetY - Target Y
     * @param {number} range - Max vision distance (pixels)
     * @param {number} halfAngle - Half of the cone angle (radians)
     * @returns {boolean}
     */
    isInVisionCone(sourceX, sourceY, facingAngle, targetX, targetY, range, halfAngle) {
        const dist = this.distance(sourceX, sourceY, targetX, targetY);
        if (dist > range) return false;

        const angleToTarget = this.angleBetween(sourceX, sourceY, targetX, targetY);
        const angleDiff = Math.abs(this.normalizeAngle(angleToTarget - facingAngle));

        return angleDiff <= halfAngle;
    },

    /**
     * Simple raycast against an array of rectangular obstacles.
     * Returns true if line of sight is clear (no obstacles blocking).
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     * @param {Phaser.Physics.Arcade.StaticGroup} walls - Wall group
     * @param {number} [step=8] - Ray step size
     * @returns {boolean} true if line of sight is clear
     */
    hasLineOfSight(x1, y1, x2, y2, walls, step = 8) {
        const dist = this.distance(x1, y1, x2, y2);
        const steps = Math.ceil(dist / step);
        const dx = (x2 - x1) / steps;
        const dy = (y2 - y1) / steps;

        const wallBodies = walls.getChildren();

        for (let i = 1; i < steps; i++) {
            const px = x1 + dx * i;
            const py = y1 + dy * i;

            for (let w = 0; w < wallBodies.length; w++) {
                const wall = wallBodies[w];
                if (wall.getBounds && wall.getBounds().contains(px, py)) {
                    return false;
                }
            }
        }
        return true;
    },

    /**
     * Degrees to radians.
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Radians to degrees.
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },

    /**
     * Linear interpolation.
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Clamp value between min and max.
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Random integer between min and max (inclusive).
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Shuffle an array in-place (Fisher-Yates).
     */
    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },
};
