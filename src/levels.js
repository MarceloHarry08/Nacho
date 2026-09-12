/**
 * Nacho el Maestro - Level & Progression Manager
 * Handles wave spawning, boss triggers, belt advancements, and level transitions.
 */

class LevelManager {
  constructor() {
    this.currentLevelIndex = 1;
    this.killsThisLevel = 0;
    this.spawnTimer = 0;
    this.bossActive = false;
    this.currentBoss = null;
    this.levelComplete = false;
    this.isFinalVictory = false;
    this.bossWarningTimer = 0;
  }

  startLevel(levelIndex = 1) {
    this.currentLevelIndex = levelIndex;
    this.killsThisLevel = 0;
    this.spawnTimer = 1.0;
    this.bossActive = false;
    this.currentBoss = null;
    this.levelComplete = false;
    this.isFinalVictory = false;
    this.bossWarningTimer = 0;

    const levelConfig = this.getCurrentConfig();
    parallaxManager.loadLevel(levelIndex);
    particleSystem.setBiome(levelIndex);
    retroAudio.startBGM(levelIndex, false);
  }

  getCurrentConfig() {
    return GAME_CONFIG.LEVELS[this.currentLevelIndex - 1] || GAME_CONFIG.LEVELS[0];
  }

  update(dt, enemies, projectiles, player) {
    const config = this.getCurrentConfig();

    // 1. Boss Warning sequence
    if (this.bossWarningTimer > 0) {
      this.bossWarningTimer -= dt;
      if (this.bossWarningTimer <= 0) {
        // Spawn the Boss!
        this.currentBoss = new ZoneBoss(config.boss);
        this.bossActive = true;
        retroAudio.startBGM(this.currentLevelIndex, true);
      }
      return;
    }

    // 2. Boss Fight Phase
    if (this.bossActive) {
      if (this.currentBoss) {
        this.currentBoss.update(dt, player, projectiles);

        // Check if Boss is defeated
        if (this.currentBoss.isDead && this.currentBoss.stateTimer >= 1.2 && !this.levelComplete) {
          this.handleBossDefeated(player);
        }
      }
      return;
    }

    // 3. Regular Wave Spawning Phase
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && enemies.length < config.maxEnemiesOnScreen) {
      this.spawnTimer = config.spawnInterval;
      this.spawnEnemy(config, enemies);
    }

    // Check if target kills reached to summon Boss
    if (this.killsThisLevel >= config.targetKills && !this.bossActive && this.bossWarningTimer <= 0) {
      this.triggerBossWarning();
    }
  }

  spawnEnemy(config, enemies) {
    const pool = config.allowedEnemies;
    const type = pool[Math.floor(Math.random() * pool.length)];
    const side = Math.random() > 0.5 ? "left" : "right";

    let enemy = null;
    if (type === "walker") {
      enemy = new WalkerZombie(side);
    } else if (type === "crawler") {
      enemy = new CrawlerZombie(side);
    } else if (type === "wraith") {
      enemy = new WraithEnemy(side);
    } else if (type === "caster") {
      enemy = new CasterEnemy(side);
    }

    if (enemy) {
      enemies.push(enemy);
      retroAudio.playZombieGroan();
    }
  }

  triggerBossWarning() {
    this.bossWarningTimer = 2.5;
    retroAudio.playBossWarning();
  }

  registerKill() {
    this.killsThisLevel++;
  }

  handleBossDefeated(player) {
    this.levelComplete = true;

    // Check if beating Level 5 (The Grandmaster Finale)
    if (this.currentLevelIndex === 5) {
      // Award Black Belt!
      player.setBelt(5); // Belt index 5 is Black Belt
      this.isFinalVictory = true;
      retroAudio.playVictory();
    } else {
      // Promotion to next belt!
      const newBeltIndex = this.currentLevelIndex;
      player.setBelt(newBeltIndex);
      retroAudio.playBeltUpgrade();
    }
  }

  nextLevel(player) {
    if (this.currentLevelIndex < 5) {
      this.startLevel(this.currentLevelIndex + 1);
    }
  }
}

// Global Level Manager
window.levelManager = new LevelManager();
