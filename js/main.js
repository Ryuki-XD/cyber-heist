/**
 * main.js — Boots the Cyber Heist game
 */
window.addEventListener('load', () => {
    // Initialize systems globally so scenes can easily access them
    window.saveSystem = new SaveSystem();
    window.audioSystem = new AudioSystem();

    // Check settings and apply volume values
    const settings = window.saveSystem.loadSettings();
    window.audioSystem.setMusicVolume(settings.musicVolume);
    window.audioSystem.setSfxVolume(settings.sfxVolume);

    // Audio context requires interaction to start.
    // We listen to the first click/touch on the page to initialize the audio context.
    const startAudio = () => {
        window.audioSystem.init();
        window.audioSystem.resume();
        window.removeEventListener('click', startAudio);
        window.removeEventListener('touchstart', startAudio);
    };
    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);

    // Create the Phaser game instance
    window.game = new Phaser.Game(config);
});
