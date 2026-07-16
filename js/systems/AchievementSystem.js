/**
 * AchievementSystem.js — Achievement tracking and notifications for Cyber Heist
 * Handles unlock conditions, toast notifications, and persistence.
 */
class AchievementSystem {
    /**
     * @param {Phaser.Scene} scene
     * @param {SaveSystem} saveSystem
     */
    constructor(scene, saveSystem) {
        this.scene = scene;
        this.saveSystem = saveSystem;
        this.queue = []; // pending toast notifications
        this.showing = false;
        this.currentToast = null;
    }

    /**
     * Attempt to unlock an achievement.
     * If newly unlocked, queues a toast notification.
     * @param {string} achievementId - Key in CONSTANTS.ACHIEVEMENTS
     * @returns {boolean} true if newly unlocked
     */
    unlock(achievementId) {
        const def = CONSTANTS.ACHIEVEMENTS[achievementId.toUpperCase()];
        if (!def) {
            console.warn('AchievementSystem: Unknown achievement', achievementId);
            return false;
        }

        const isNew = this.saveSystem.unlockAchievement(def.id);
        if (isNew) {
            this.queue.push(def);
            this._processQueue();
        }
        return isNew;
    }

    /**
     * Check and unlock achievements based on level completion stats.
     * @param {object} stats - { levelId, time, detected, damageTaken, alarmsTriggered, allDataCollected }
     */
    checkLevelAchievements(stats) {
        // Ghost: no detection
        if (!stats.detected) {
            this.unlock('GHOST');
        }

        // Speed Demon: under 60 seconds
        if (stats.time < 60) {
            this.unlock('SPEED_DEMON');
        }

        // Untouchable: no damage
        if (stats.damageTaken === 0) {
            this.unlock('UNTOUCHABLE');
        }

        // Collector: all data collected
        if (stats.allDataCollected) {
            this.unlock('COLLECTOR');
        }

        // Survivor: 1 HP remaining
        if (stats.healthRemaining <= 1) {
            this.unlock('SURVIVOR');
        }

        // Hard mode
        const settings = this.saveSystem.loadSettings();
        if (settings.difficulty === 'HARD') {
            this.unlock('HARD_MODE');
        }

        // Boss slayer
        if (stats.levelId === 5) {
            this.unlock('BOSS_SLAYER');
        }

        // Completionist: all 5 levels
        const saveData = this.saveSystem.loadGame();
        if (saveData.completedLevels.length >= 5) {
            this.unlock('COMPLETIONIST');
        }

        // Hacker: 10 hacks
        if (saveData.totalHacks >= 10) {
            this.unlock('HACKER');
        }

        // Pacifist: no alarms ever
        if (saveData.totalAlarmsTriggered === 0 && saveData.completedLevels.length >= 5) {
            this.unlock('PACIFIST');
        }

        // Speedrunner: all levels total under 10 min
        if (saveData.bestTotalTime && saveData.bestTotalTime < 600) {
            this.unlock('SPEEDRUN_ALL');
        }

        // Explorer: all upgrades
        if (saveData.upgrades.length >= Object.keys(CONSTANTS.UPGRADES).length) {
            this.unlock('EXPLORER');
        }
    }

    /**
     * Get list of all achievements with unlock status.
     * @returns {Array<{id, name, description, icon, unlocked}>}
     */
    getAll() {
        const saveData = this.saveSystem.loadGame();
        return Object.values(CONSTANTS.ACHIEVEMENTS).map(def => ({
            ...def,
            unlocked: saveData.achievements.includes(def.id),
        }));
    }

    /**
     * Process toast notification queue.
     */
    _processQueue() {
        if (this.showing || this.queue.length === 0) return;
        this.showing = true;

        const def = this.queue.shift();
        this._showToast(def);
    }

    /**
     * Display a toast notification for an unlocked achievement.
     */
    _showToast(def) {
        const w = 260;
        const h = 50;
        const x = CONSTANTS.GAME_WIDTH / 2;
        const startY = -h;
        const targetY = 20;

        // Background
        const bg = this.scene.add.graphics();
        bg.setScrollFactor(0);
        bg.setDepth(2000);
        bg.fillStyle(0x111128, 0.9);
        bg.fillRoundedRect(x - w / 2, startY, w, h, 6);
        bg.lineStyle(2, CONSTANTS.COLORS.NEON_CYAN, 0.8);
        bg.strokeRoundedRect(x - w / 2, startY, w, h, 6);

        // Icon
        const icon = this.scene.add.text(x - w / 2 + 12, startY + 8, def.icon, {
            fontSize: '22px',
        });
        icon.setScrollFactor(0);
        icon.setDepth(2001);

        // Title
        const title = this.scene.add.text(x - w / 2 + 42, startY + 6, 'ACHIEVEMENT UNLOCKED', {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: CONSTANTS.CSS_COLORS.NEON_CYAN,
        });
        title.setScrollFactor(0);
        title.setDepth(2001);

        // Name
        const name = this.scene.add.text(x - w / 2 + 42, startY + 18, def.name, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold',
        });
        name.setScrollFactor(0);
        name.setDepth(2001);

        // Description
        const desc = this.scene.add.text(x - w / 2 + 42, startY + 34, def.description, {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: '#aaaacc',
        });
        desc.setScrollFactor(0);
        desc.setDepth(2001);

        const elements = [bg, icon, title, name, desc];

        // Animate slide down
        this.scene.tweens.add({
            targets: elements,
            y: `+=${targetY - startY}`,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Hold for 2.5 seconds, then slide up
                this.scene.time.delayedCall(2500, () => {
                    this.scene.tweens.add({
                        targets: elements,
                        y: `-=${targetY - startY + 20}`,
                        alpha: 0,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            elements.forEach(el => el.destroy());
                            this.showing = false;
                            this._processQueue();
                        },
                    });
                });
            },
        });
    }

    /**
     * Clean up.
     */
    destroy() {
        this.queue = [];
        if (this.currentToast) {
            this.currentToast.forEach(el => el.destroy());
        }
    }
}
