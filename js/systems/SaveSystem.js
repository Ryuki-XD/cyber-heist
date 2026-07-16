/**
 * SaveSystem.js — LocalStorage persistence for Cyber Heist
 * Handles save/load of game progress, high scores, settings, and achievements.
 */
class SaveSystem {
    constructor() {
        this.defaultSave = {
            version: 1,
            unlockedLevels: [1],
            completedLevels: [],
            highScores: {},          // levelId → { score, time, rank }
            achievements: [],        // array of achievement IDs
            upgrades: [],            // array of upgrade IDs collected
            totalPlayTime: 0,
            totalHacks: 0,
            totalDeaths: 0,
            totalAlarmsTriggered: 0,
            bestTotalTime: null,     // for speedrun achievement
        };

        this.defaultSettings = {
            difficulty: 'NORMAL',
            musicVolume: 0.5,
            sfxVolume: 0.7,
            showFPS: false,
            touchControls: true,
        };
    }

    /**
     * Load saved game data, or return defaults.
     * @returns {object}
     */
    loadGame() {
        try {
            const raw = localStorage.getItem(CONSTANTS.SAVE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                // Merge with defaults to handle new fields in updates
                return { ...this.defaultSave, ...data };
            }
        } catch (e) {
            console.warn('SaveSystem: Failed to load save data', e);
        }
        return { ...this.defaultSave };
    }

    /**
     * Save game data to LocalStorage.
     * @param {object} data
     */
    saveGame(data) {
        try {
            localStorage.setItem(CONSTANTS.SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('SaveSystem: Failed to save game data', e);
        }
    }

    /**
     * Load settings, or return defaults.
     * @returns {object}
     */
    loadSettings() {
        try {
            const raw = localStorage.getItem(CONSTANTS.SETTINGS_KEY);
            if (raw) {
                return { ...this.defaultSettings, ...JSON.parse(raw) };
            }
        } catch (e) {
            console.warn('SaveSystem: Failed to load settings', e);
        }
        return { ...this.defaultSettings };
    }

    /**
     * Save settings to LocalStorage.
     * @param {object} settings
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(CONSTANTS.SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('SaveSystem: Failed to save settings', e);
        }
    }

    /**
     * Mark a level as completed and update high score if better.
     * @param {number} levelId
     * @param {number} score
     * @param {number} time - completion time in seconds
     * @param {boolean} detected - whether player was detected
     */
    completeLevel(levelId, score, time, detected) {
        const data = this.loadGame();

        // Mark as completed
        if (!data.completedLevels.includes(levelId)) {
            data.completedLevels.push(levelId);
        }

        // Unlock next level
        const nextLevel = levelId + 1;
        if (nextLevel <= 5 && !data.unlockedLevels.includes(nextLevel)) {
            data.unlockedLevels.push(nextLevel);
        }

        // Update high score
        const existing = data.highScores[levelId];
        if (!existing || score > existing.score) {
            data.highScores[levelId] = {
                score,
                time: Math.round(time),
                rank: this.calculateRank(score, time, detected),
                detected,
            };
        }

        this.saveGame(data);
        return data;
    }

    /**
     * Calculate rank based on score, time, and stealth.
     */
    calculateRank(score, time, detected) {
        if (!detected && time < 60) return 'S';
        if (!detected) return 'A';
        if (time < 90) return 'B';
        if (time < 150) return 'C';
        return 'D';
    }

    /**
     * Unlock an achievement.
     * @param {string} achievementId
     * @returns {boolean} true if newly unlocked
     */
    unlockAchievement(achievementId) {
        const data = this.loadGame();
        if (data.achievements.includes(achievementId)) return false;
        data.achievements.push(achievementId);
        this.saveGame(data);
        return true;
    }

    /**
     * Collect an upgrade.
     * @param {string} upgradeId
     */
    collectUpgrade(upgradeId) {
        const data = this.loadGame();
        if (!data.upgrades.includes(upgradeId)) {
            data.upgrades.push(upgradeId);
            this.saveGame(data);
        }
    }

    /**
     * Increment a stat counter.
     * @param {string} stat - key in save data
     * @param {number} [amount=1]
     */
    incrementStat(stat, amount = 1) {
        const data = this.loadGame();
        if (typeof data[stat] === 'number') {
            data[stat] += amount;
            this.saveGame(data);
        }
    }

    /**
     * Reset all save data (for New Game).
     */
    resetAll() {
        localStorage.removeItem(CONSTANTS.SAVE_KEY);
    }

    /**
     * Check if a level is unlocked.
     * @param {number} levelId
     * @returns {boolean}
     */
    isLevelUnlocked(levelId) {
        const data = this.loadGame();
        return data.unlockedLevels.includes(levelId);
    }
}
