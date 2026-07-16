/**
 * config.js — Phaser game configuration
 */
const config = {
    type: Phaser.AUTO,
    width: CONSTANTS.GAME_WIDTH,
    height: CONSTANTS.GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#0a0a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        BootScene,
        MenuScene,
        SettingsScene,
        LevelSelectScene,
        GameScene,
        HackingScene,
        PauseScene,
        GameOverScene,
        VictoryScene
    ]
};
