# Cyber Heist ⚡

A high-performance, responsive HTML5 cyberpunk stealth infiltration game built with **Phaser 3** and vanilla JavaScript/CSS. Infiltrate high-security futuristic sectors, bypass intelligent guard patrols, disable surveillance cameras, hack data terminals, avoid laser barriers, and escape before system lockouts.

## 🎮 Play Instructions
Open the `index.html` file in any modern web browser to boot up.
- **Move**: `W`, `A`, `S`, `D` or `Arrow Keys`
- **Sprint**: Hold `Shift` (drains battery energy)
- **Interact / Hack**: Press `E` or `Space` near gateways/terminals
- **Pause**: Press `ESC`
- **Mobile Support**: Fully supported with custom touch joystick and virtual action controls.

## ⚙️ Game Architecture & State System
The codebase is structured under clean, modular subdirectories containing:
- **`js/utils`**: FSM, Math, and general configuration constants.
- **`js/systems`**: Save profiles, audio, rendering pipelines, HUD, and achievement milestones.
- **`js/entities`**: Core controllers (Player, Guard AI FSM, Security camera sweep, Boss system).
- **`js/objects`**: Pulsing lasers, collectible keycards/upgrades, and doors.
- **`js/scenes`**: Individual Phaser scene overlays.

```
                    ┌──────────────┐
                    │  BootScene   │ (Asset Preloader)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  MenuScene   │◄──────────────────────────┐
                    └──────┬───────┘                           │
                           │                                   │
              ┌────────────┼────────────┐                      │
              │            │            │                      │
       ┌──────▼─────┐┌─────▼──────┐┌────▼─────────────┐        │
       │SettingsScn ││LevelSelScn ││VictoryScene      │        │
       └────────────┘└─────┬──────┘│(Achievements-only│        │
                           │       └──────────────────┘        │
                    ┌──────▼───────┐                           │
                    │  GameScene   │◄──────────────┐           │
                    └──────┬───────┘               │           │
                           │                       │           │
              ┌────────────┼────────────┐          │           │
              │            │            │          │           │
       ┌──────▼─────┐┌─────▼──────┐┌────▼─────────┐│           │
       │PauseScene  ││HackingScene││GameOverScene ││           │
       └────────────┘└────────────┘└────┬─────────┘│           │
                                        │          │           │
                                        └──────────┴───────────┘
```

## 🛠️ Assets Replacement Guide
All game graphics, particles, textures, sound effects, and music are generated **programmatically** using HTML5 Canvas rendering and Web Audio API oscillators. The game runs zero-dependency from day one. To replace them:
- Read [assets/README.md](assets/README.md) for texture coordinates, audio frequency maps, and dimensions.

## 📄 License
This project is licensed under the [MIT License](LICENSE).
