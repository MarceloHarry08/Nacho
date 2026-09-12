/**
 * Nacho el Maestro - UI & HUD System
 * Renders arcade HUD, menus, interactive controls diagram, and victory/game over screens.
 */

class UIManager {
  constructor() {
    this.root = document.getElementById("ui-overlay");
    this.hudElement = document.getElementById("hud");
    this.titleScreen = document.getElementById("title-screen");
    this.controlsModal = document.getElementById("controls-modal");
    this.creditsModal = document.getElementById("credits-modal");
    this.levelClearModal = document.getElementById("level-clear-modal");
    this.lifeLostModal = document.getElementById("life-lost-modal");
    this.lifeLostRemaining = document.getElementById("life-lost-remaining");
    this.btnContinueLife = document.getElementById("btn-continue-life");
    this.victoryModal = document.getElementById("victory-modal");
    this.gameOverModal = document.getElementById("game-over-modal");

    // HUD Elements
    this.playerHpBar = document.getElementById("player-hp-bar");
    this.playerHpText = document.getElementById("player-hp-text");
    this.bossHpContainer = document.getElementById("boss-hp-container");
    this.bossHpBar = document.getElementById("boss-hp-bar");
    this.bossNameText = document.getElementById("boss-name-text");
    this.beltBadge = document.getElementById("belt-badge");
    this.beltNameText = document.getElementById("belt-name-text");
    this.livesCounter = document.getElementById("lives-counter");
    this.scoreText = document.getElementById("score-text");
    this.levelBadge = document.getElementById("level-badge");
    this.specialButton = document.getElementById("special-widget");
    this.specialTimerText = document.getElementById("special-timer-text");
    this.specialProgress = document.getElementById("special-progress");
    this.grabAlert = document.getElementById("grab-alert");
    this.bossWarning = document.getElementById("boss-warning");

    // State
    this.selectedMode = "classic"; // "classic" or "practice"
    this.crtEnabled = true;

    this.setupListeners();
  }

  setupListeners() {
    // Mode toggle button
    const modeBtn = document.getElementById("btn-toggle-mode");
    if (modeBtn) {
      modeBtn.addEventListener("click", () => {
        this.selectedMode = (this.selectedMode === "classic") ? "practice" : "classic";
        modeBtn.innerText = (this.selectedMode === "classic")
          ? "MODO: 3 VIDAS (CLÁSICO)"
          : "MODO: VIDAS INFINITAS (PRÁCTICA)";
        retroAudio.playHit();
      });
    }

    // Start Game Button
    const startBtn = document.getElementById("btn-start-game");
    if (startBtn) {
      startBtn.addEventListener("click", async () => {
        await retroAudio.init();
        window.gameEngine.startGame(this.selectedMode);
        this.showScreen("game");
      });
    }

    // Controls Button
    const controlsBtn = document.getElementById("btn-show-controls");
    if (controlsBtn) {
      controlsBtn.addEventListener("click", () => {
        this.controlsModal.classList.remove("hidden");
        retroAudio.playHit();
      });
    }
    const closeControlsBtn = document.getElementById("btn-close-controls");
    if (closeControlsBtn) {
      closeControlsBtn.addEventListener("click", () => {
        this.controlsModal.classList.add("hidden");
        retroAudio.playHit();
      });
    }

    // Credits Button
    const creditsBtn = document.getElementById("btn-show-credits");
    if (creditsBtn) {
      creditsBtn.addEventListener("click", () => {
        this.creditsModal.classList.remove("hidden");
        retroAudio.playHit();
      });
    }
    const closeCreditsBtn = document.getElementById("btn-close-credits");
    if (closeCreditsBtn) {
      closeCreditsBtn.addEventListener("click", () => {
        this.creditsModal.classList.add("hidden");
        retroAudio.playHit();
      });
    }

    // CRT Filter Toggle
    const crtBtn = document.getElementById("btn-toggle-crt");
    if (crtBtn) {
      crtBtn.addEventListener("click", () => {
        this.crtEnabled = !this.crtEnabled;
        const crtLayer = document.getElementById("crt-layer");
        if (crtLayer) crtLayer.style.display = this.crtEnabled ? "block" : "none";
        crtBtn.innerText = `FILTRO CRT: ${this.crtEnabled ? "ACTIVADO" : "DESACTIVADO"}`;
        retroAudio.playHit();
      });
    }

    // Next Level Button
    const nextLvlBtn = document.getElementById("btn-next-level");
    if (nextLvlBtn) {
      nextLvlBtn.addEventListener("click", () => {
        this.levelClearModal.classList.add("hidden");
        window.gameEngine.advanceToNextLevel();
      });
    }

    // Continue Life Button (After losing a life)
    if (this.btnContinueLife) {
      this.btnContinueLife.addEventListener("click", () => {
        this.lifeLostModal.classList.add("hidden");
        window.gameEngine.resumeAfterLifeLost();
      });
    }

    // Retry / Return to title after game over
    const retryBtn = document.getElementById("btn-retry");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        this.gameOverModal.classList.add("hidden");
        window.gameEngine.restartGame();
      });
    }
    const titleBtn = document.getElementById("btn-gameover-title");
    if (titleBtn) {
      titleBtn.addEventListener("click", () => {
        this.gameOverModal.classList.add("hidden");
        this.showScreen("title");
      });
    }

    // Victory Return to Title
    const victoryTitleBtn = document.getElementById("btn-victory-title");
    if (victoryTitleBtn) {
      victoryTitleBtn.addEventListener("click", () => {
        this.victoryModal.classList.add("hidden");
        this.showScreen("title");
      });
    }
  }

  showScreen(screenName) {
    // Hide all
    this.titleScreen.classList.add("hidden");
    this.hudElement.classList.add("hidden");
    this.levelClearModal.classList.add("hidden");
    this.lifeLostModal.classList.add("hidden");
    this.victoryModal.classList.add("hidden");
    this.gameOverModal.classList.add("hidden");

    if (screenName === "title") {
      this.titleScreen.classList.remove("hidden");
      retroAudio.stopBGM();
    } else if (screenName === "game") {
      this.hudElement.classList.remove("hidden");
    }
  }

  showLifeLost(remainingLives) {
    if (this.lifeLostRemaining) {
      this.lifeLostRemaining.innerText = `Vidas restantes: x${remainingLives}`;
    }
    this.lifeLostModal.classList.remove("hidden");
  }

  showLevelClear(beltData, score) {
    const title = document.getElementById("level-clear-title");
    const desc = document.getElementById("level-clear-desc");
    const beltBox = document.getElementById("level-clear-belt");

    if (title) title.innerText = `¡NIVEL COMPLETADO!`;
    if (desc) desc.innerText = `Has obtenido el ${beltData.name} (${beltData.grade}).\n"${beltData.description}"`;
    if (beltBox) {
      beltBox.style.backgroundColor = beltData.color;
      beltBox.style.color = (beltData.color === "#F4F6F7") ? "#17202A" : "#FFFFFF";
      beltBox.innerText = beltData.name;
    }

    this.levelClearModal.classList.remove("hidden");
  }

  showVictory(score, kills) {
    document.getElementById("victory-score").innerText = `Puntuación Final: ${score}`;
    document.getElementById("victory-kills").innerText = `Zombis Derrotados: ${kills}`;
    this.victoryModal.classList.remove("hidden");
  }

  showGameOver(score) {
    document.getElementById("gameover-score").innerText = `Puntuación: ${score}`;
    this.gameOverModal.classList.remove("hidden");
  }

  updateHUD(player, levelMgr, score, lives, currentMode) {
    if (!player) return;

    // 1. Health Bar
    const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
    this.playerHpBar.style.width = `${hpPct}%`;
    this.playerHpText.innerText = `${Math.ceil(player.hp)} / ${player.maxHp}`;
    if (hpPct <= 25) {
      this.playerHpBar.style.backgroundColor = "#E74C3C"; // Red low health
    } else if (hpPct <= 50) {
      this.playerHpBar.style.backgroundColor = "#F39C12"; // Yellow
    } else {
      this.playerHpBar.style.backgroundColor = "#2ECC71"; // Green
    }

    // 2. Boss Health Bar
    if (levelMgr.bossActive && levelMgr.currentBoss && !levelMgr.currentBoss.isDead) {
      this.bossHpContainer.classList.remove("hidden");
      const boss = levelMgr.currentBoss;
      const bHpPct = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
      this.bossHpBar.style.width = `${bHpPct}%`;
      this.bossNameText.innerText = `JEFE: ${boss.name} - ${boss.title}`;
    } else {
      this.bossHpContainer.classList.add("hidden");
    }

    // 3. Current Belt
    const belt = GAME_CONFIG.BELTS[player.beltIndex];
    if (belt) {
      this.beltBadge.style.backgroundColor = belt.color;
      this.beltBadge.style.borderColor = belt.darkColor;
      this.beltNameText.innerText = `${belt.name} (${belt.grade})`;
    }

    // 4. Lives Counter
    if (currentMode === "practice") {
      this.livesCounter.innerText = "VIDAS: ∞";
    } else {
      this.livesCounter.innerText = `VIDAS: x${lives}`;
    }

    // 5. Score & Level
    this.scoreText.innerText = `SCORE: ${String(score).padStart(6, "0")}`;
    this.levelBadge.innerText = `ETAPA ${levelMgr.currentLevelIndex}`;

    // 6. Special Attack Cooldown (Strict 10s)
    if (player.specialCooldown <= 0) {
      this.specialButton.classList.add("ready");
      this.specialTimerText.innerText = "¡LISTO! [CTRL]";
      this.specialProgress.style.height = "100%";
    } else {
      this.specialButton.classList.remove("ready");
      this.specialTimerText.innerText = `${player.specialCooldown.toFixed(1)}s`;
      const cdPct = (1 - (player.specialCooldown / player.specialMaxCooldown)) * 100;
      this.specialProgress.style.height = `${cdPct}%`;
    }

    // 7. Grab Alert
    if (player.grabbedBy.length > 0) {
      this.grabAlert.classList.remove("hidden");
    } else {
      this.grabAlert.classList.add("hidden");
    }

    // 8. Boss Approaching Warning
    if (levelMgr.bossWarningTimer > 0) {
      this.bossWarning.classList.remove("hidden");
    } else {
      this.bossWarning.classList.add("hidden");
    }
  }
}

// Global UI Manager
window.uiManager = new UIManager();
