/**
 * Nacho el Maestro - 16-Bit Parallax Backgrounds & Biomes
 * Generates continuous multi-layer parallax scenes for the 5 game levels.
 */

class ParallaxBackgroundManager {
  constructor() {
    this.container = new PIXI.Container();
    this.layers = [];
    this.currentLevel = null;
  }

  createCanvas(w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  loadLevel(levelIndex) {
    this.container.removeChildren();
    this.layers = [];

    const config = GAME_CONFIG.LEVELS[levelIndex - 1] || GAME_CONFIG.LEVELS[0];
    const w = GAME_CONFIG.CANVAS_WIDTH;
    const h = GAME_CONFIG.CANVAS_HEIGHT;

    // Layer 0: Sky & Far Celestial Background
    const skyTex = this.generateSkyTexture(levelIndex, config, w, h);
    const skySprite = new PIXI.TilingSprite(skyTex, w, h);
    skySprite.speedFactor = 0.05;
    this.container.addChild(skySprite);
    this.layers.push(skySprite);

    // Layer 1: Distant Scenery (Mountains, Skyline, Ruins)
    const farTex = this.generateFarTexture(levelIndex, config, w, 180);
    const farSprite = new PIXI.TilingSprite(farTex, w, 180);
    farSprite.y = 40;
    farSprite.speedFactor = 0.2;
    this.container.addChild(farSprite);
    this.layers.push(farSprite);

    // Layer 2: Midground (Ruined facades, Pagodas, Trees, Cavern arches)
    const midTex = this.generateMidTexture(levelIndex, config, w, 160);
    const midSprite = new PIXI.TilingSprite(midTex, w, 160);
    midSprite.y = 70;
    midSprite.speedFactor = 0.5;
    this.container.addChild(midSprite);
    this.layers.push(midSprite);

    // Layer 3: Foreground Interactive Floor & Curb
    const floorTex = this.generateFloorTexture(levelIndex, config, w, 60);
    const floorSprite = new PIXI.TilingSprite(floorTex, w, 60);
    floorSprite.y = GAME_CONFIG.FLOOR_Y - 18;
    floorSprite.speedFactor = 1.0;
    this.container.addChild(floorSprite);
    this.layers.push(floorSprite);

    this.currentLevel = levelIndex;
  }

  update(playerVelocityX) {
    // Parallax scrolling based on movement
    this.layers.forEach(layer => {
      layer.tilePosition.x -= playerVelocityX * layer.speedFactor;
    });
  }

  // --- SKY LAYER ---
  generateSkyTexture(lvl, cfg, w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, cfg.palette.skyTop);
    grad.addColorStop(1, cfg.palette.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (lvl === 1) {
      // Crescent Moon & Distant Stars
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < 30; i++) {
        const sx = (i * 37) % w;
        const sy = (i * 19) % 100;
        ctx.fillRect(sx, sy, 1, 1);
      }
      ctx.fillStyle = "#F9E79F";
      ctx.beginPath();
      ctx.arc(380, 50, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = cfg.palette.skyTop;
      ctx.beginPath();
      ctx.arc(372, 46, 19, 0, Math.PI * 2);
      ctx.fill();
    } else if (lvl === 2) {
      // Jungle Fireflies and misty clouds
      ctx.fillStyle = "rgba(46, 204, 113, 0.4)";
      for (let i = 0; i < 20; i++) {
        ctx.fillRect((i * 43) % w, (i * 29) % 120, 2, 2);
      }
    } else if (lvl === 3) {
      // Aurora Borealis & Ice Halo
      const aurora = ctx.createLinearGradient(0, 20, w, 60);
      aurora.addColorStop(0, "rgba(0, 240, 255, 0.15)");
      aurora.addColorStop(0.5, "rgba(46, 204, 113, 0.2)");
      aurora.addColorStop(1, "rgba(52, 152, 219, 0.1)");
      ctx.fillStyle = aurora;
      ctx.fillRect(0, 10, w, 50);
    } else if (lvl === 4) {
      // Magma glow from below
      const glow = ctx.createLinearGradient(0, 100, 0, h);
      glow.addColorStop(0, "rgba(231, 76, 60, 0)");
      glow.addColorStop(1, "rgba(230, 126, 34, 0.4)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 80, w, h - 80);
    } else if (lvl === 5) {
      // Giant Blood Moon
      ctx.fillStyle = "#C0392B";
      ctx.beginPath();
      ctx.arc(240, 60, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#922B21";
      ctx.beginPath();
      ctx.arc(234, 52, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    return PIXI.Texture.from(canvas);
  }

  // --- FAR LAYER ---
  generateFarTexture(lvl, cfg, w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);
    ctx.fillStyle = cfg.palette.cityBack;

    if (lvl === 1) {
      // Distant City Skyline Silhouettes
      for (let x = 0; x < w; x += 30) {
        const bldH = 40 + ((x * 13) % 70);
        ctx.fillRect(x, h - bldH, 26, bldH);
        // Dim building windows
        ctx.fillStyle = "rgba(241, 196, 15, 0.3)";
        for (let wy = h - bldH + 8; wy < h - 10; wy += 10) {
          ctx.fillRect(x + 4, wy, 4, 4);
          ctx.fillRect(x + 14, wy, 4, 4);
        }
        ctx.fillStyle = cfg.palette.cityBack;
      }
    } else if (lvl === 2) {
      // Ancient Temple Step-Pyramids in jungle distance
      for (let x = 0; x < w; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x + 30, h - 50);
        ctx.lineTo(x + 90, h - 50);
        ctx.lineTo(x + 120, h);
        ctx.closePath();
        ctx.fill();
      }
    } else if (lvl === 3) {
      // Jagged Frozen Mountains
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x + 30, h - 60 - ((x * 7) % 40));
        ctx.lineTo(x + 60, h);
        ctx.closePath();
        ctx.fill();
      }
    } else if (lvl === 4) {
      // Lava Cavern Columns
      for (let x = 0; x < w; x += 50) {
        ctx.fillRect(x, 0, 20, h - 40);
        ctx.fillRect(x + 10, h - 50, 25, 50);
      }
    } else if (lvl === 5) {
      // Dragon Citadel Spires & Towers
      for (let x = 0; x < w; x += 70) {
        ctx.fillRect(x + 10, h - 80, 40, 80);
        // Pointed roof
        ctx.beginPath();
        ctx.moveTo(x, h - 80);
        ctx.lineTo(x + 30, h - 110);
        ctx.lineTo(x + 60, h - 80);
        ctx.closePath();
        ctx.fill();
      }
    }

    return PIXI.Texture.from(canvas);
  }

  // --- MID LAYER ---
  generateMidTexture(lvl, cfg, w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);
    ctx.fillStyle = cfg.palette.cityMid;

    if (lvl === 1) {
      // Ruined Street Buildings with Broken Neon Signs
      for (let x = 0; x < w; x += 80) {
        const bldH = 70 + ((x * 17) % 50);
        ctx.fillRect(x, h - bldH, 70, bldH);

        // Broken Neon Signs
        if (x % 160 === 0) {
          ctx.fillStyle = cfg.palette.accent; // Neon Cyan
          ctx.fillRect(x + 12, h - bldH + 15, 36, 10);
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(x + 16, h - bldH + 18, 28, 4);
        } else {
          ctx.fillStyle = "#E74C3C"; // Broken Red Neon
          ctx.fillRect(x + 15, h - bldH + 20, 30, 8);
        }

        // Windows & Fire escapes
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(x + 10, h - bldH + 34, 18, 22);
        ctx.fillRect(x + 40, h - bldH + 34, 18, 22);

        // Street Lamppost
        ctx.fillStyle = "#5D6D7E";
        ctx.fillRect(x + 72, h - 55, 3, 55);
        ctx.fillRect(x + 68, h - 58, 10, 4);
        ctx.fillStyle = "#F9E79F"; // Lamp glow
        ctx.fillRect(x + 70, h - 54, 6, 4);

        ctx.fillStyle = cfg.palette.cityMid;
      }
    } else if (lvl === 2) {
      // Giant Jungle Trees, Moss & Hanging Vines
      for (let x = 0; x < w; x += 90) {
        ctx.fillRect(x + 20, 0, 24, h);
        // Hanging Vines
        ctx.fillStyle = "#1E8449";
        for (let vy = 10; vy < h - 30; vy += 14) {
          ctx.fillRect(x + 16, vy, 3, 10);
          ctx.fillRect(x + 46, vy + 4, 3, 10);
        }
        ctx.fillStyle = cfg.palette.cityMid;
      }
    } else if (lvl === 3) {
      // Frozen Temple Columns & Stalactites
      for (let x = 0; x < w; x += 70) {
        // Icicles hanging down
        ctx.fillStyle = "#AED6F1";
        ctx.beginPath();
        ctx.moveTo(x + 10, 0);
        ctx.lineTo(x + 20, 40);
        ctx.lineTo(x + 30, 0);
        ctx.closePath();
        ctx.fill();

        // Ice Pagoda Pillar
        ctx.fillStyle = cfg.palette.cityMid;
        ctx.fillRect(x + 40, 20, 18, h - 20);
      }
    } else if (lvl === 4) {
      // Basalt Columns with Cascading Magma Falls
      for (let x = 0; x < w; x += 80) {
        ctx.fillRect(x, 10, 30, h - 10);
        // Lava stream
        ctx.fillStyle = "#E74C3C";
        ctx.fillRect(x + 12, 10, 6, h - 10);
        ctx.fillStyle = "#F39C12";
        ctx.fillRect(x + 14, 10, 2, h - 10);
        ctx.fillStyle = cfg.palette.cityMid;
      }
    } else if (lvl === 5) {
      // Throne Room Pillars & Burning Torch Braziers
      for (let x = 0; x < w; x += 80) {
        ctx.fillRect(x + 20, 0, 24, h);
        // Torch Brazier
        ctx.fillStyle = "#F39C12";
        ctx.beginPath();
        ctx.arc(x + 32, 60, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#E74C3C";
        ctx.beginPath();
        ctx.arc(x + 32, 58, 5, 0, Math.PI * 2);
        ctx.fill();
        // Crimson Banner
        ctx.fillStyle = "#900C3F";
        ctx.fillRect(x + 26, 72, 12, 36);
        ctx.fillStyle = cfg.palette.cityMid;
      }
    }

    return PIXI.Texture.from(canvas);
  }

  // --- FLOOR LAYER ---
  generateFloorTexture(lvl, cfg, w, h) {
    const { canvas, ctx } = this.createCanvas(w, h);

    // Curb / Trim
    ctx.fillStyle = cfg.palette.curbColor;
    ctx.fillRect(0, 0, w, 4);

    // Main Ground
    ctx.fillStyle = cfg.palette.streetFloor;
    ctx.fillRect(0, 4, w, h - 4);

    // Texture details
    if (lvl === 1) {
      // Asphalt cracks & pavement lines
      ctx.fillStyle = "#111116";
      for (let x = 0; x < w; x += 40) {
        ctx.fillRect(x, 6, 2, h - 6);
      }
      ctx.fillStyle = "rgba(0, 240, 255, 0.15)"; // Wet neon reflection
      ctx.fillRect(20, 16, 60, 6);
      ctx.fillRect(140, 24, 80, 6);
    } else if (lvl === 2) {
      // Moss & stone tiles
      ctx.fillStyle = "#1E8449";
      for (let x = 0; x < w; x += 25) {
        ctx.fillRect(x, 10, 12, 3);
        ctx.fillRect(x + 10, 24, 8, 3);
      }
    } else if (lvl === 3) {
      // Ice shine & cracks
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let x = 0; x < w; x += 50) {
        ctx.fillRect(x, 8, 30, 2);
        ctx.fillRect(x + 15, 20, 20, 2);
      }
    } else if (lvl === 4) {
      // Magma cracks on obsidian
      ctx.fillStyle = "#E74C3C";
      for (let x = 0; x < w; x += 60) {
        ctx.fillRect(x, 8, 18, 3);
        ctx.fillRect(x + 12, 11, 4, 12);
        ctx.fillStyle = "#F1C40F";
        ctx.fillRect(x + 3, 9, 12, 1);
        ctx.fillStyle = "#E74C3C";
      }
    } else if (lvl === 5) {
      // Imperial polished stone floor with dragon trims
      ctx.fillStyle = "#4A235A";
      for (let x = 0; x < w; x += 48) {
        ctx.fillRect(x, 12, 46, 2);
        ctx.fillRect(x, 26, 46, 2);
      }
    }

    return PIXI.Texture.from(canvas);
  }
}

// Global Background Manager
window.parallaxManager = new ParallaxBackgroundManager();
