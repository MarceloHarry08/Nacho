/**
 * Nacho el Maestro - Game Configuration & Constants
 * 16-bit Retro Beat 'em Up (Taekwondo vs Zombies)
 */

window.GAME_CONFIG = {
  // Virtual Internal Resolution (16:9 16-bit retro arcade)
  CANVAS_WIDTH: 480,
  CANVAS_HEIGHT: 270,
  TARGET_FPS: 60,
  GRAVITY: 0.55,
  FLOOR_Y: 228, // Ground level baseline for player and walking enemies

  // Belt Progression System
  BELTS: [
    {
      level: 1,
      name: "Cinturón Blanco",
      grade: "10º Kup (Principiante)",
      color: "#F4F6F7",
      darkColor: "#BDC3C7",
      accent: "#E0E6ED",
      symbol: "🥋",
      description: "El inicio del camino marcial. Pureza e inocencia ante el combate."
    },
    {
      level: 2,
      name: "Cinturón Amarillo",
      grade: "8º Kup",
      color: "#F1C40F",
      darkColor: "#D68910",
      accent: "#F9E79F",
      symbol: "🥋",
      description: "La tierra fértil donde la semilla del Taekwondo echa sus primeras raíces."
    },
    {
      level: 3,
      name: "Cinturón Verde",
      grade: "6º Kup",
      color: "#2ECC71",
      darkColor: "#1E8449",
      accent: "#A9DFBF",
      symbol: "🥋",
      description: "La planta crece vigorosa. El practicante desarrolla destreza y agilidad."
    },
    {
      level: 4,
      name: "Cinturón Azul",
      grade: "4º Kup",
      color: "#3498DB",
      darkColor: "#21618C",
      accent: "#AED6F1",
      symbol: "🥋",
      description: "El cielo hacia el que se eleva el practicante. Fortaleza y precisión aérea."
    },
    {
      level: 5,
      name: "Cinturón Rojo",
      grade: "2º Kup",
      color: "#E74C3C",
      darkColor: "#922B21",
      accent: "#F5B7B1",
      symbol: "🥋",
      description: "El peligro y la madurez marcial. Control total del cuerpo y la fuerza."
    },
    {
      level: 6, // Final Boss / Grandmaster Victory
      name: "Cinturón Negro",
      grade: "1er Dan (Gran Maestro)",
      color: "#17202A",
      darkColor: "#0B1015",
      accent: "#F39C12", // Golden trim
      symbol: "🏆",
      description: "La culminación del camino. El conocimiento supremo y la victoria final."
    }
  ],

  // Nacho (Player) Attributes
  PLAYER: {
    MAX_HP: 100,
    SPEED_X: 2.6,
    JUMP_FORCE: -8.8,
    WIDTH: 32,
    HEIGHT: 48,
    CROUCH_HEIGHT: 28,
    SPECIAL_COOLDOWN: 10.0, // Strict 10-second cooldown
    SPECIAL_DAMAGE: 120,
    SPECIAL_RADIUS: 240, // Full screen area
    INVULNERABLE_TIME: 1.2, // seconds after hurt
    ATTACK_DURATION: 0.22, // seconds per strike
    ATTACK_COOLDOWN: 0.08,
    // Damage values for each technique
    STAND_KICK_DAMAGE: 30,  // Dollyo Chagi (one-shots basic walker: HP 25)
    CROUCH_KICK_DAMAGE: 35, // Low sweep (one-shots crawler: HP 20)
    JUMP_KICK_DAMAGE: 40,   // Twichagi (one-shots wraith: HP 30)
    // Hitbox offsets
    STAND_HITBOX: { x: 16, y: -28, width: 28, height: 18 },
    CROUCH_HITBOX: { x: 14, y: -12, width: 26, height: 14 },
    JUMP_HITBOX: { x: 14, y: -30, width: 32, height: 22 }
  },

  // Game Modes
  MODES: {
    CLASSIC: { id: "classic", name: "Modo Clásico (3 Vidas)", lives: 3 },
    PRACTICE: { id: "practice", name: "Modo Práctica (Vidas Infinitas)", lives: Infinity }
  },

  // Levels & Biomes
  LEVELS: [
    {
      id: 1,
      name: "Nivel 1: La Ciudad Infestada",
      subtitle: "Calles oscuras y neones rotos bajo la lluvia ácida",
      beltRewardIndex: 1, // Awards Yellow belt on clear
      targetKills: 16, // Kills needed to spawn boss
      spawnInterval: 2.2, // seconds between spawns
      maxEnemiesOnScreen: 5,
      allowedEnemies: ["walker", "crawler"],
      boss: {
        id: "boss_butcher",
        name: "El Carnicero Mutante",
        title: "Capataz de la Horda",
        maxHp: 240,
        speed: 1.2,
        attackDamage: 18,
        color: "#C0392B"
      },
      palette: {
        skyTop: "#0B0C1E",
        skyBottom: "#1B1734",
        cityBack: "#1F1D36",
        cityMid: "#2C274E",
        streetFloor: "#1E1E28",
        curbColor: "#3D385A",
        accent: "#00F0FF" // Neon Cyan
      }
    },
    {
      id: 2,
      name: "Nivel 2: La Selva Sombría",
      subtitle: "Ruinas ancestrales sumergidas en niebla venenosa",
      beltRewardIndex: 2, // Awards Green belt on clear
      targetKills: 20,
      spawnInterval: 1.9,
      maxEnemiesOnScreen: 6,
      allowedEnemies: ["walker", "crawler", "wraith"],
      boss: {
        id: "boss_shaman",
        name: "Kukulkán Corrupto",
        title: "Chamán Serpiente Ancestral",
        maxHp: 320,
        speed: 1.5,
        attackDamage: 22,
        color: "#16A085"
      },
      palette: {
        skyTop: "#0B1D16",
        skyBottom: "#11352A",
        cityBack: "#144534",
        cityMid: "#195B42",
        streetFloor: "#132D20",
        curbColor: "#277E57",
        accent: "#2ECC71" // Emerald Green
      }
    },
    {
      id: 3,
      name: "Nivel 3: El Templo de Hielo",
      subtitle: "Vientos helados y agujas de escarcha milenarias",
      beltRewardIndex: 3, // Awards Blue belt on clear
      targetKills: 24,
      spawnInterval: 1.7,
      maxEnemiesOnScreen: 7,
      allowedEnemies: ["walker", "crawler", "wraith", "caster"],
      boss: {
        id: "boss_golem",
        name: "Yeti Ancestral de Escarcha",
        title: "Guardián de la Aguja Blanca",
        maxHp: 400,
        speed: 1.3,
        attackDamage: 25,
        color: "#2980B9"
      },
      palette: {
        skyTop: "#081B2B",
        skyBottom: "#102F49",
        cityBack: "#1B4769",
        cityMid: "#2B6894",
        streetFloor: "#214C6B",
        curbColor: "#5DADE2",
        accent: "#85C1E9" // Icy Cyan
      }
    },
    {
      id: 4,
      name: "Nivel 4: Las Cavernas de Fuego",
      subtitle: "Ríos de magma hirviente y ascuas inextinguibles",
      beltRewardIndex: 4, // Awards Red belt on clear
      targetKills: 28,
      spawnInterval: 1.5,
      maxEnemiesOnScreen: 8,
      allowedEnemies: ["walker", "crawler", "wraith", "caster"],
      boss: {
        id: "boss_pyro",
        name: "Señor de la Ceniza",
        title: "Señor del Núcleo de Magma",
        maxHp: 480,
        speed: 1.6,
        attackDamage: 28,
        color: "#D35400"
      },
      palette: {
        skyTop: "#280A05",
        skyBottom: "#451206",
        cityBack: "#6E1B05",
        cityMid: "#942507",
        streetFloor: "#3A0E06",
        curbColor: "#E67E22",
        accent: "#F39C12" // Burning Orange
      }
    },
    {
      id: 5,
      name: "Nivel 5: El Castillo del Dragón Oscuro",
      subtitle: "La fortaleza suprema bajo el resplandor de la Luna de Sangre",
      beltRewardIndex: 5, // Awards Black Belt on clear!
      targetKills: 32,
      spawnInterval: 1.3,
      maxEnemiesOnScreen: 9,
      allowedEnemies: ["walker", "crawler", "wraith", "caster"],
      boss: {
        id: "boss_dragon",
        name: "Lord Ryoko",
        title: "Gran Maestro del Dragón Oscuro",
        maxHp: 620,
        speed: 1.9,
        attackDamage: 32,
        color: "#8E44AD"
      },
      palette: {
        skyTop: "#1A051C",
        skyBottom: "#2F0933",
        cityBack: "#4A0C50",
        cityMid: "#64106C",
        streetFloor: "#230626",
        curbColor: "#9B59B6",
        accent: "#E74C3C" // Blood Red & Royal Violet
      }
    }
  ],

  // Enemy Types Definitions
  ENEMY_TYPES: {
    walker: {
      id: "walker",
      name: "Zombi Básico",
      hp: 25,
      speed: 1.1,
      damage: 10,
      grabDrainRate: 12, // HP drained per second while grabbing
      scoreValue: 100,
      width: 28,
      height: 46,
      crouchable: false
    },
    crawler: {
      id: "crawler",
      name: "Zombi Rastrero",
      hp: 20,
      speed: 1.4,
      damage: 12,
      scoreValue: 150,
      width: 32,
      height: 20,
      isLow: true // Requires crouching attack!
    },
    wraith: {
      id: "wraith",
      name: "Espectro Volador",
      hp: 25,
      speed: 1.6,
      damage: 14,
      scoreValue: 200,
      width: 28,
      height: 32,
      isFlying: true, // Requires jump kick!
      flyAltitude: 140
    },
    caster: {
      id: "caster",
      name: "Chamán Oscuro",
      hp: 40,
      speed: 0.9,
      damage: 15,
      scoreValue: 250,
      width: 30,
      height: 48,
      isRanged: true,
      shootInterval: 2.8
    }
  }
};
