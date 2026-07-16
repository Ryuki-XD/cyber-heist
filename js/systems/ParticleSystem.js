/**
 * ParticleSystem.js — Visual particle effects for Cyber Heist
 * Spark, smoke, data-stream, and alert indicator effects.
 */
class ParticleSystem {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.particles = []; // manual particles array
    }

    /**
     * Spawn spark particles (for hacking, damage, etc).
     * @param {number} x
     * @param {number} y
     * @param {number} [color=0x00f0ff]
     * @param {number} [count=8]
     */
    sparks(x, y, color = CONSTANTS.COLORS.NEON_CYAN, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            const life = 300 + Math.random() * 400;
            const size = 1.5 + Math.random() * 2;

            const p = this.scene.add.circle(x, y, size, color, 1);
            p.setDepth(800);
            this.particles.push({
                obj: p,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
            });
        }
    }

    /**
     * Spawn a data stream effect (vertical falling characters).
     * @param {number} x
     * @param {number} y
     */
    dataStream(x, y) {
        for (let i = 0; i < 6; i++) {
            const chars = '01';
            const ch = chars[Math.floor(Math.random() * chars.length)];
            const p = this.scene.add.text(
                x + (Math.random() - 0.5) * 20,
                y - 10,
                ch,
                { fontSize: '10px', fontFamily: 'monospace', color: '#39ff14' }
            );
            p.setDepth(800);
            this.particles.push({
                obj: p,
                vx: (Math.random() - 0.5) * 10,
                vy: -30 - Math.random() * 40,
                life: 600 + Math.random() * 400,
                maxLife: 1000,
            });
        }
    }

    /**
     * Spawn alert exclamation particles.
     * @param {number} x
     * @param {number} y
     */
    alertBurst(x, y) {
        const p = this.scene.add.text(x, y - 20, '!', {
            fontSize: '16px', fontFamily: 'monospace', color: '#ff1744', fontStyle: 'bold',
        });
        p.setDepth(850);
        p.setOrigin(0.5);
        this.particles.push({
            obj: p,
            vx: 0,
            vy: -30,
            life: 800,
            maxLife: 800,
        });
    }

    /**
     * Spawn smoke/dust puff.
     * @param {number} x
     * @param {number} y
     */
    smoke(x, y) {
        for (let i = 0; i < 5; i++) {
            const size = 3 + Math.random() * 4;
            const p = this.scene.add.circle(x, y, size, 0x666688, 0.5);
            p.setDepth(799);
            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
                obj: p,
                vx: Math.cos(angle) * 20,
                vy: Math.sin(angle) * 20 - 10,
                life: 500 + Math.random() * 300,
                maxLife: 800,
                grow: true,
            });
        }
    }

    /**
     * Spawn EMP pulse ring.
     * @param {number} x
     * @param {number} y
     */
    empPulse(x, y) {
        const ring = this.scene.add.circle(x, y, 10, 0xd400ff, 0);
        ring.setStrokeStyle(3, 0xd400ff, 0.8);
        ring.setDepth(800);
        this.particles.push({
            obj: ring,
            vx: 0,
            vy: 0,
            life: 600,
            maxLife: 600,
            expandRing: true,
            targetRadius: CONSTANTS.BOSS.EMP_RANGE,
        });
    }

    /**
     * Update all particles (call each frame).
     * @param {number} dt - delta in seconds
     */
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt * 1000;

            if (p.life <= 0) {
                p.obj.destroy();
                this.particles.splice(i, 1);
                continue;
            }

            const alpha = MathUtils.clamp(p.life / p.maxLife, 0, 1);
            p.obj.setAlpha(alpha);

            p.obj.x += p.vx * dt;
            p.obj.y += p.vy * dt;

            // Slow down
            p.vx *= 0.97;
            p.vy *= 0.97;

            // Growing smoke
            if (p.grow && p.obj.setScale) {
                const scale = 1 + (1 - alpha) * 1.5;
                p.obj.setScale(scale);
            }

            // Expanding ring
            if (p.expandRing && p.obj.setRadius) {
                const progress = 1 - (p.life / p.maxLife);
                p.obj.setRadius(p.targetRadius * progress);
                p.obj.setStrokeStyle(3 * (1 - progress), 0xd400ff, alpha);
            }
        }
    }

    /**
     * Clean up all particles.
     */
    destroy() {
        this.particles.forEach(p => p.obj.destroy());
        this.particles = [];
    }
}
