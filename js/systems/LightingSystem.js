/**
 * LightingSystem.js — Dynamic lighting and shadow overlay for Cyber Heist
 * Creates a dark overlay with punched-out light circles around light sources.
 */
class LightingSystem {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
        this.ambientAlpha = 0.7; // darkness level (0 = fully lit, 1 = pitch black)

        // Create a render texture for the darkness overlay
        this.darkOverlay = scene.add.renderTexture(0, 0,
            CONSTANTS.GAME_WIDTH * 2, CONSTANTS.GAME_HEIGHT * 2);
        this.darkOverlay.setOrigin(0, 0);
        this.darkOverlay.setScrollFactor(0);
        this.darkOverlay.setDepth(900);
        this.darkOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);

        // Graphics object for drawing light shapes
        this.lightGfx = scene.add.graphics();
        this.lightGfx.setVisible(false);
    }

    /**
     * Add a light source.
     * @param {object} config - { x, y, radius, color, intensity, follows }
     */
    addLight(config) {
        this.lights.push({
            x: config.x || 0,
            y: config.y || 0,
            radius: config.radius || 80,
            color: config.color || 0xffffff,
            intensity: config.intensity || 1.0,
            follows: config.follows || null, // sprite to follow
            flicker: config.flicker || false,
            flickerAmount: config.flickerAmount || 5,
        });
    }

    /**
     * Remove all lights (for level reset).
     */
    clearLights() {
        this.lights = [];
    }

    /**
     * Set ambient darkness level.
     * @param {number} alpha - 0 (bright) to 1 (dark)
     */
    setAmbientDarkness(alpha) {
        this.ambientAlpha = MathUtils.clamp(alpha, 0, 1);
    }

    /**
     * Update lighting each frame.
     */
    update() {
        if (this.ambientAlpha <= 0) {
            this.darkOverlay.setVisible(false);
            return;
        }
        this.darkOverlay.setVisible(true);

        // Fill with darkness
        this.lightGfx.clear();

        // Dark background
        const darkR = Math.round(10 * (1 - this.ambientAlpha) + 10);
        const darkG = Math.round(10 * (1 - this.ambientAlpha) + 10);
        const darkB = Math.round(20 * (1 - this.ambientAlpha) + 15);
        const darkColor = (darkR << 16) | (darkG << 8) | darkB;

        this.lightGfx.fillStyle(darkColor, 1);
        this.lightGfx.fillRect(0, 0, CONSTANTS.GAME_WIDTH * 2, CONSTANTS.GAME_HEIGHT * 2);

        // Punch out light circles
        this.lights.forEach(light => {
            let lx = light.x;
            let ly = light.y;

            if (light.follows) {
                lx = light.follows.x;
                ly = light.follows.y;
            }

            // Convert to screen coordinates
            const cam = this.scene.cameras.main;
            const sx = lx - cam.scrollX;
            const sy = ly - cam.scrollY;

            let radius = light.radius * light.intensity;
            if (light.flicker) {
                radius += (Math.random() - 0.5) * light.flickerAmount;
            }

            // Draw gradient light circle (brighter center, fading edge)
            const steps = 8;
            for (let i = steps; i >= 0; i--) {
                const t = i / steps;
                const r = radius * t;
                const brightness = Math.pow(1 - t, 0.5);
                const lr = Math.min(255, Math.round(darkR + (255 - darkR) * brightness));
                const lg = Math.min(255, Math.round(darkG + (255 - darkG) * brightness));
                const lb = Math.min(255, Math.round(darkB + (255 - darkB) * brightness));
                this.lightGfx.fillStyle((lr << 16) | (lg << 8) | lb, 1);
                this.lightGfx.fillCircle(sx, sy, radius - r + radius / steps);
            }
        });

        // Stamp the graphics onto the render texture
        this.darkOverlay.clear();
        this.darkOverlay.draw(this.lightGfx);
    }

    /**
     * Check if a position is in shadow (for AI detection reduction).
     * @param {number} x - World X
     * @param {number} y - World Y
     * @returns {boolean}
     */
    isInShadow(x, y) {
        for (const light of this.lights) {
            let lx = light.x;
            let ly = light.y;
            if (light.follows) {
                lx = light.follows.x;
                ly = light.follows.y;
            }
            const dist = MathUtils.distance(lx, ly, x, y);
            if (dist < light.radius * light.intensity * 0.6) {
                return false;
            }
        }
        return this.ambientAlpha > 0.3;
    }

    /**
     * Clean up resources.
     */
    destroy() {
        if (this.darkOverlay) this.darkOverlay.destroy();
        if (this.lightGfx) this.lightGfx.destroy();
        this.lights = [];
    }
}
