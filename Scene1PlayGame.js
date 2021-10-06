let playerImageKey;
let checkEnd;
class Scene1PlayGame extends Phaser.Scene {
    constructor() {
        super({ key: "Scene1PlayGame" });
    }
    init(data) {
        playerImageKey = data.image;
    }
    create() {
        isControllable = true;
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.map = this.make.tilemap({ key: "map" });
        this.groundTiles = this.map.addTilesetImage("tile_mario", "sprTileMap");
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, "sprBackground").setScrollFactor(0).setOrigin(0, 0);

        this.background1 = this.map.createDynamicLayer("BG", this.groundTiles, 0, 0);
        this.front = this.map.createDynamicLayer("Front", this.groundTiles, 0, 0).setDepth(2);
        this.groundLayer = this.map.createDynamicLayer("World", this.groundTiles, 0, 0).setCollisionByExclusion([-1]).setDepth(2);

        this.trap = this.map.createDynamicLayer("Trap", this.groundTiles, 0, 0).setCollisionByExclusion([-1]);
        this.finishPoint = this.map.createDynamicLayer("FinishPoint", this.groundTiles, 0, 0).setCollisionByExclusion([-1]);

        this.coinsGroup = this.physics.add.group();
        this.attackGroup = this.physics.add.group();
        this.blockCoin = this.physics.add.group();
        this.stairGroup = this.physics.add.group();
        this.elevatorGroup = this.physics.add.group();
        this.enemiesGroup = this.physics.add.group();
        this.bossAttackGroup = this.physics.add.group();

        this.blockCoin.defaults.setAllowGravity = false;
        this.coinsGroup.defaults.setAllowGravity = false;
        this.attackGroup.defaults.setAllowGravity = false;
        this.stairGroup.defaults.setAllowGravity = false;
        this.elevatorGroup.defaults.setAllowGravity = false;
        this.enemiesGroup.defaults.setAllowGravity = false;
        this.bossAttackGroup.defaults.setAllowGravity = false;

        this.map.getObjectLayer("PlayerPosition").objects.forEach((player) => {
            console.log(playerImageKey);
            this.player = new Player(this, player.x, player.y, playerImageKey).setDepth(3).setScale(0.5);
            this.physics.add.collider(this.player, this.groundLayer);
            this.physics.add.collider(this.player, this.trap, this.standOnTrap, null, this);
            this.physics.add.collider(this.player, this.bossAttackGroup, this.attackPlayer, null, this);
        });

        this.map.getObjectLayer("Coins").objects.forEach((coin) => {
            this.coin = new Coins(this, coin.x, coin.y, "sprCoinMotion");
            this.coinsGroup.add(this.coin);
            this.physics.add.overlap(this.coinsGroup, this.player, this.collectCoins, null, this);
        });

        this.map.getObjectLayer("Enemies").objects.forEach((enemyData) => {
            var nameEnemy = this.getPropertiesObject(enemyData.properties, {
                name: "nameEnemy",
            }).value;
            var moveType = this.getPropertiesObject(enemyData.properties, {
                name: "moveType",
            }).value;
            var long = this.getPropertiesObject(enemyData.properties, {
                name: "long",
            }).value;
            this.enemy = new Enemy(this, enemyData.x, enemyData.y, nameEnemy);
            if (moveType === "right") {
                this.enemy.flipX = true;
                this.tweens.add({
                    targets: this.enemy,
                    props: {
                        x: {
                            value: enemyData.x + long,
                            duration: 3000,
                            flipX: true,
                        },
                    },
                    ease: "Linear",
                    yoyo: true,
                    repeat: -1,
                });
            } else if (moveType === "left") {
                this.tweens.add({
                    targets: this.enemy,
                    props: {
                        x: {
                            value: enemyData.x + long,
                            duration: 3000,
                            flipX: true,
                        },
                    },
                    ease: "Linear",
                    yoyo: true,
                    repeat: -1,
                });
            } else if (moveType === "up") {
                this.tweens.add({
                    targets: this.enemy,
                    props: {
                        y: {
                            value: enemyData.y + long,
                            duration: 3000,
                            flipX: true,
                        },
                    },
                    ease: "Linear",
                    yoyo: true,
                    repeat: -1,
                });
            } else if (moveType === "down") {
                this.tweens.add({
                    targets: this.enemy,
                    props: {
                        y: {
                            value: enemyData.y + long,
                            duration: 2000,
                            flipX: true,
                        },
                    },
                    ease: "Linear",
                    yoyo: true,
                    repeat: -1,
                });
            }

            this.physics.add.collider(this.enemy, this.player, this.impactEnemy, null, this);
            this.physics.add.collider(this.enemy, this.attackGroup, this.attackEnemy, null, this);
            this.enemiesGroup.add(this.enemy);
            this.physics.add.collider(this.enemy, this.groundLayer);
        });

        this.map.getObjectLayer("Boss").objects.forEach((enemyData) => {
            var nameEnemy = this.getPropertiesObject(enemyData.properties, {
                name: "nameEnemy",
            }).value;
            var moveType = this.getPropertiesObject(enemyData.properties, {
                name: "moveType",
            }).value;
            var long = this.getPropertiesObject(enemyData.properties, {
                name: "long",
            }).value;
            boss = new Boss(this, enemyData.x + 20, enemyData.y, nameEnemy);
            boss.body.setImmovable(true);
            this.playerBoss = this.physics.add.collider(boss, this.player, this.impactBoss, null, this);
            this.physics.add.collider(boss, this.attackGroup, this.attackBoss, null, this);
            this.physics.add.collider(boss, this.groundLayer);
        });

        this.map.getObjectLayer("BonusPoints").objects.forEach((blockData) => {
            this.block = new BonusPoint(this, blockData.x, blockData.y);

            var coinQuantity = this.getPropertiesObject(blockData.properties, {
                name: "coinQuantity",
            });
            this.block.setDepth(1);
            this.block.body.moves = false;
            this.physics.add.collider(this.enemiesGroup, this.block, (block, enemy) => {
                this.playSound("standOnEnemySound");
                enemy.play(enemy.texture.key + "DeadMotion");
                if (enemy.texture.key === "sprFlowerEnemy") {
                    enemy.setData("isDead", true);
                } else {
                    enemy.on("animationcomplete", function () {
                        enemy.setData("isDead", true);
                    });
                }
            });
            this.physics.add.collider(this.player, this.block, (player, block) => {
                if (block.body.touching.down) {
                    if (coinQuantity.value > 0) {
                        coinQuantity.value -= 1;
                        this.playSound("hitBonusBlockSound");
                        this.tweens.add({
                            targets: [block],
                            ease: "Linear",
                            y: block.body.y - 20,
                            duration: 150,
                            yoyo: true,
                            repeat: 0,
                            onComplete: () => {
                                if (coinQuantity.value === 0 || coinQuantity.value === undefined) {
                                    block.setFrame(4);
                                    block.setData("isDead", true);
                                    block.anims.stop();
                                    this.coinBlock.setData("isDead", true);
                                }
                            },
                        });
                        this.coinBlock = new Coins(this, block.x, block.y + 25, "sprCoinMotion");
                        this.coinBlock.body.setAllowGravity(false);
                        this.coinBlock.setDepth(0);
                        this.blockCoin.add(this.coinBlock);
                        this.tweens.add({
                            targets: this.coinBlock,
                            delay: 0,
                            props: {
                                y: {
                                    value: this.coinBlock.y - 70,
                                    duration: 300,
                                    flipX: false,
                                },
                            },
                            ease: "Linear",
                            repeat: 0,
                            onComplete: () => {
                                this.coinBlock.setVisible(false);
                                this.coinBlock.setData("isDead", true);
                            },
                        });
                    }
                    player.body.velocity.y = 100;
                } else if (isJump && block.body.touching.up) {
                    this.player.body.setVelocityY(-650);
                    this.player.anims.play(`${playerImageKey}IdleMotion`);
                    this.playSound("jumpSound");
                } else if (this.cursors.up.isDown && block.body.touching.up) {
                    this.player.body.setVelocityY(-650);
                    this.playSound("jumpSound");
                }
            });
        });

        this.map.getObjectLayer("Princess").objects.forEach((princessData) => {
            this.princess = new Princess(this, princessData.x, princessData.y, "sprPrincessPlayer");
            this.case = new AssetStatic(this, princessData.x, princessData.y - 25, "sprCase").setDepth(3);

            this.physics.world.enableBody(this.case, 0);
            this.case.body.setCollideWorldBounds(true);
            this.case.body.setImmovable(true);
            this.princess.play("sprPrincessCryMotion");
            this.physics.add.collider(this.princess, this.groundLayer);
            this.physics.add.collider(this.case, this.groundLayer);
            this.physics.add.collider(this.case, this.player);
            this.physics.add.overlap(this.player, this.princess, this.impactPrincess, null, this);
        });

        this.map.getObjectLayer("Springs").objects.forEach((springsData) => {
            this.springs = new Springs(this, springsData.x, springsData.y, "sprSprings");
            this.springs.play("sprSpringsIdleMotion");
            this.springs.body.setImmovable(true);
            this.springs.body.moves = false;
            this.physics.add.collider(this.springs, this.groundLayer);
            this.physics.add.collider(this.player, this.springs, this.impactSprings, null, this);
        });

        this.map.getObjectLayer("DynamicWorld").objects.forEach((dynamicsWorldData) => {
            var nameWorld = this.getPropertiesObject(dynamicsWorldData.properties, {
                name: "nameWorld",
            }).value;
            var moveType = this.getPropertiesObject(dynamicsWorldData.properties, {
                name: "moveType",
            }).value;
            var long = this.getPropertiesObject(dynamicsWorldData.properties, {
                name: "long",
            }).value;
            this.dynamicsWorld = new Springs(this, dynamicsWorldData.x, dynamicsWorldData.y, nameWorld);
            this.dynamicsWorld.body.setImmovable(true);
            this.dynamicsWorld.body.moves = false;
            this.dynamicsWorld.setData("moveType", moveType);
            this.dynamicsWorld.setData("long", long);
            this.physics.add.collider(this.dynamicsWorld, this.groundLayer);
            this.physics.add.collider(this.player, this.dynamicsWorld, (player, block) => {
                if (isJump && block.body.touching.up) {
                    this.player.body.setVelocityY(-650);
                    this.player.anims.play(`${playerImageKey}IdleMotion`);
                    this.playSound("jumpSound");
                } else if (this.cursors.up.isDown && block.body.touching.up) {
                    this.player.body.setVelocityY(-650);
                    this.playSound("jumpSound");
                }
            });
        });

        this.physics.add.collider(this.player, this.finishPoint, this.impactFinishPoint, null, this);
        this.physics.add.collider(this.bossAttackGroup, this.groundLayer, this.bulletImpactGround, null, this);
        this.physics.add.collider(this.attackGroup, this.groundLayer, this.bulletImpactGround, null, this);

        this.tapToPlay = new AssetStatic(this, this.game.scale.width / 2, this.game.scale.height / 2, "sprTapToPlay").setScrollFactor(0).setDepth(3).setVisible(false);
        this.tweens.add({
            targets: this.tapToPlay,
            duration: 500,
            alpha: {
                getStart: () => 0.5,
                getEnd: () => 1,
            },
            ease: "Linear",
            yoyo: true,
            repeat: -1,
        });
        this.gameOver = new AssetStatic(this, this.game.scale.width / 2, this.game.scale.height / 2, "sprGameOver").setAlpha(0).setScale(0.1).setDepth(3).setInteractive().setScrollFactor(0);
        this.logo = new AssetStatic(this, this.game.scale.width / 2, this.game.scale.height / 2 - 110, "sprLogoGame").setAlpha(0).setScale(0.1).setDepth(4).setInteractive().setScrollFactor(0);
        this.gameWin = new AssetStatic(this, this.game.scale.width / 2, this.game.scale.height / 2, "sprGameWin").setAlpha(0).setScale(0.1).setDepth(3).setInteractive().setScrollFactor(0);
        this.downloadNow = new AssetMotion(this, this.game.scale.width / 2, 40, "sprDownloadNow").setDepth(3).setInteractive().setVisible(false).setScrollFactor(0);
        disableBgSound = new AssetStatic(this, 40, 40, "sprMute").setFrame(0).setDepth(3).setInteractive().setScrollFactor(0).setVisible(false);
        disableBgSound.on("pointerdown", function (event) {
            if (Sounds["bgSound"].playing()) {
                isMuted = true;
                Sounds["bgSound"].pause();
                disableBgSound.setFrame(1);
            } else {
                isMuted = true;
                Sounds["bgSound"].play();
                disableBgSound.setFrame(0);
            }
        });

        this.downloadNow.on("pointerdown", function () {
            console.log("GOTOSTORE")
        });

        this.gameOver.on("pointerdown", function () {
            console.log("GOTOSTORE")
        });
        this.gameWin.on("pointerdown", function () {
            console.log("GOTOSTORE")
        });

        this.turnLeft = new AssetStatic(this, this.game.scale.width / 12, this.cameras.main.height - 45, "sprController")
            .setDepth(3)
            .setScrollFactor(0)
            .setFrame(0)
            .setScale(1)
            .setVisible(false)
            .setInteractive({ draggable: true });
        this.turnRight = new AssetStatic(this, this.game.scale.width / 12 + 90, this.cameras.main.height - 45, "sprController")
            .setDepth(3)
            .setScrollFactor(0)
            .setFrame(2)
            .setScale(1)
            .setVisible(false)
            .setInteractive({ draggable: true });
        this.jump = new AssetStatic(this, this.game.scale.width / 1.09, this.cameras.main.height - 100, "sprController")
            .setDepth(3)
            .setScrollFactor(0)
            .setFrame(4)
            .setScale(1)
            .setVisible(false)
            .setInteractive({ draggable: true });
        this.fire = new AssetStatic(this, this.game.scale.width / 1.09 - 70, this.cameras.main.height - 45, "sprController")
            .setDepth(3)
            .setScrollFactor(0)
            .setFrame(6)
            .setScale(1)
            .setVisible(false)
            .setInteractive({ draggable: true });
        this.turnLeft
            .on("pointerdown", function () {
                isTurnLeft = true;
            })
            .on("pointerout", function () {
                isTurnLeft = false;
            });

        this.turnRight
            .on("pointerdown", function () {
                isTurnRight = true;
            })
            .on("pointerout", function () {
                isTurnRight = false;
            });

        this.jump
            .on("pointerdown", function () {
                isJump = true;
            })
            .on("pointerout", function () {
                isJump = false;
            });

        this.fire
            .on("pointerdown", function () {
                isFire = true;
            })
            .on("pointerout", function () {
                isFire = false;
            });

        this.physics.world.bounds.width = this.groundLayer.width;
        this.physics.world.bounds.height = this.groundLayer.height;

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels - 40);
        // this.cameras.main.scrollX = this.princess.x - 300;
        // this.cameras.main.scrollY = this.princess.y;
        this.cameras.main.startFollow(this.player);
        this.fire.setVisible(true);
        this.turnRight.setVisible(true);
        this.turnLeft.setVisible(true);
        this.jump.setVisible(true);
        this.downloadNow.setVisible(true);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.pan(0, this.groundLayer.height, 1000, "Sine.easeInOut");
        this.cameras.main.setFollowOffset(0, -300);
        Sounds["bgSound"].play();
        this.input.on("pointerdown", function () {
            if (!Sounds["bgSound"].playing() && !isMuted) {
                Sounds["bgSound"].play();
            }
        })
        // this.cameras.main.startFollow(this.scene.player);
        // this.cameras.main.zoomTo(1.5, 1000);
        // this.cameras.main.pan(this.princess.x, this.princess.y, 1500, "Sine.easeInOut");

        // this.cameras.main.on(Phaser.Cameras.Scene2D.Events.ZOOM_COMPLETE, () => {
        //     this.tapToPlay.setVisible(true);
        //     this.time.addEvent({
        //         delay: 500,
        //         callback: function () {
        //             this.input.on("pointerdown", function () {
        //                 if (!Sounds["bgSound"].playing() && this.scene.player.getData("isDead") !== undefined && !this.scene.player.getData("isDead") && !isMuted) {
        //                     Sounds["bgSound"].play();
        //                     this.scene.tapToPlay.setVisible(false);
        //                     if (!isTap) {
        //                         isTap = true;
        //                         this.cameras.main.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
        //                         this.cameras.main.stopFollow(this.princess);
        //                         this.cameras.main.zoomTo(1, 1000);
        //                         this.cameras.main.pan(0, this.scene.groundLayer.height, 1000, "Sine.easeInOut");

        //                         this.cameras.main.on(Phaser.Cameras.Scene2D.Events.ZOOM_COMPLETE, () => {
        //                             this.scene.fire.setVisible(true);
        //                             this.scene.turnRight.setVisible(true);
        //                             this.scene.turnLeft.setVisible(true);
        //                             this.scene.jump.setVisible(true);
        //                             this.scene.downloadNow.setVisible(true);
        //                             this.cameras.main.startFollow(this.scene.player);
        //                             this.scene.tapToPlay.setVisible(false);
        //                             this.cameras.main.followOffset.set(0, -100);
        //                             this.cameras.main.on(Phaser.Cameras.Scene2D.Events.ZOOM_COMPLETE, () => { });
        //                         });
        //                     }
        //                 }
        //             });
        //         },
        //         callbackScope: this,
        //         repeat: 0,
        //     });
        // });
        this.cameras.main.roundPixels = true;
        this.cameras.main.pixelArt = true;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.sound.pauseOnBlur = false;
        this.game.events.on(Phaser.Core.Events.BLUR, () => {
            this.handleLoseFocus();
        });

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                return;
            }
            this.handleLoseFocus();
        });
        this.resize()
        this.scale.on("resize", this.resize, this);
    }

    resize() {
        let width = window.innerWidth, height = window.innerHeight;
        this.cameras.resize(width, height);
        this.background.setSize(width, height);
        this.tapToPlay.setPosition(width / 2, height / 2);
        this.gameWin.setPosition(width / 2, height / 2);
        this.gameOver.setPosition(width / 2, height / 2);
        this.logo.setPosition(this.gameOver.x, this.gameOver.y- 110);
        this.turnLeft.setPosition(width / 12, height - 45);
        this.turnRight.setPosition(width / 12 + 90, height - 45);
        this.jump.setPosition(width / 1.09, height - 100);
        this.fire.setPosition(width / 1.09 - 90, height - 45);
        disableBgSound.setPosition(30, 30);
        this.downloadNow.setPosition(width / 2, 30);
    }

    handleLoseFocus() {
        if (this.scene.isActive("paused")) {
            return;
        }
        Sounds["bgSound"].pause();

        this.scene.run("paused", {
            onResume: () => {
                this.scene.stop("paused");
                Sounds["bgSound"].resume();
            },
        });
    }

    bulletImpactGround(bullet, ground) {
        bullet.destroy();
    }

    collectCoins(player, coin) {
        if (coin) {
            coin.destroy();
            this.playSound("collectCoinSound");
        }
    }

    impactSprings(player, springs) {
        if (springs.body.touching.up) {
            springs.play("sprSpringsPutMotion");
            player.body.setVelocityY(-1200);
            this.playSound("jumpSound");
        }
    }

    attackBoss(enemy, attack) {
        if (!enemy.getData("isDead")) {
            if (enemy.getData("bloodBoss") < 500) {
                if (attack) {
                    attack.destroy();
                }
                enemy.anims.play("sprBossDeadMotion", true);
                enemy.setData("isDead", true);
                enemy.on("animationcomplete", function () {
                    enemy.anims.play("sprBossDead", true);
                });
                this.playSound("bossDeadSound");
                this.player.setData("isShooting", false);
                this.attackGroup.clear(true, true);
                isBossDead = true;

                this.time.addEvent({
                    delay: 1500,
                    callback: function () {
                        this.add.tween({
                            targets: this.case,
                            ease: "Sine.easeInOut",
                            duration: 1000,
                            delay: 0,
                            alpha: {
                                getStart: () => 1,
                                getEnd: () => 0,
                            },
                            repeat: 0,
                            yoyo: false,
                            loop: 0,
                            onComplete: () => {
                                this.case.destroy();
                            },
                        });
                    },
                    callbackScope: this,
                    repeat: 0,
                });
            } else {
                this.playSound("standOnEnemySound");
                this.tweens.addCounter({
                    from: 255,
                    to: 200,
                    duration: 100,
                    onUpdate: function (tween) {
                        const value = Math.floor(tween.getValue());

                        enemy.setTint(Phaser.Display.Color.GetColor(value, value, value));
                    },
                    yoyo: true,
                    loop: 3,
                });
                enemy.setData("bloodBoss", enemy.getData("bloodBoss") - attack.getData("damagePlayer"));
                attack.destroy();
            }
        }
    }

    impactBoss(enemy, player) {
        if (!enemy.getData("isDead") && !player.getData("isDead")) {
            console.log("1");
            player.setData("isDead", true);
            player.play(`${playerImageKey}DeadMotion`);
            isControllable = false;
            player.on("animationcomplete", function () {
                player.body.setImmovable(true);
            });
            isPlayerDead = true;
            player.onFailure(this.gameOver);
            player.onFailure(this.logo);
            endGame = true;
        }
    }

    attackPlayer(player, attack) {
        if (!player.getData("isDead")) {
            if (player.getData("bloodPlayer") < 500 || isNaN(player.getData("bloodPlayer"))) {
                if (attack) {
                    attack.destroy();
                }
                boss.setData("isAttacking", false);
                player.setData("isDead", true);
                player.play(`${playerImageKey}DeadMotion`);
                player.body.setImmovable(true);
                isPlayerDead = true;
                player.onFailure(this.gameOver);
                player.onFailure(this.logo);
                endGame = true;
            } else {
                this.playSound("standOnEnemySound");
                player.setData("bloodPlayer", player.getData("bloodPlayer") - attack.getData("damageBoss"));
                attack.destroy();
            }
        }
    }

    impactEnemy(enemy, player) {
        if (!enemy.getData("isDead")) {
            if (enemy.body.touching.up) {
                this.playSound("standOnEnemySound");
                enemy.play(enemy.texture.key + "DeadMotion");
                if (enemy.texture.key === "sprFlowerEnemy") {
                    enemy.setData("isDead", true);
                } else {
                    enemy.on("animationcomplete", function () {
                        enemy.setData("isDead", true);
                    });
                }
                player.body.velocity.y = -300;
            } else {
                if (!player.getData("isDead")) {
                    player.play(`${playerImageKey}DeadMotion`);
                    player.setData("isDead", true);
                    isControllable = false;
                    enemy.body.velocity.x = 0;
                    enemy.body.velocity.y = 0;
                    enemy.body.setImmovable(true);
                    isPlayerDead = true;
                    player.onFailure(this.gameOver);
                    player.onFailure(this.logo);
                    endGame = true;
                }
            }
        }
    }

    attackEnemy(enemy, attack) {
        if (!enemy.getData("isDead")) {
            enemy.play(enemy.texture.key + "DeadMotion");
        }
        var blow = this.add.sprite(enemy.x, enemy.y + 10).play("sprImpactMotion");
        this.playSound("standOnEnemySound");
        if (enemy.texture.key === "sprFlowerEnemy") {
            enemy.setData("isDead", true);
        } else {
            enemy.on("animationcomplete", function () {
                enemy.setData("isDead", true);
            });
        }
        blow.on("animationcomplete", function () {
            blow.destroy();
        });
        attack.destroy();
    }

    impactFinishPoint(player, finishPoint) {
        player.anims.play(`${playerImageKey}TurnMotion`, true);
        this.finishPoint.setCollisionByExclusion([0]);
        player.body.velocity.x = 100;
        this.add.tween({
            targets: [player, this.princess],
            ease: "Sine.easeInOut",
            duration: 700,
            delay: 0,
            alpha: {
                getStart: () => 1,
                getEnd: () => 0,
            },
            repeat: 0,
            yoyo: false,
            loop: 0,
            onComplete: () => {
                player.onSuccessfuly(this.gameWin);
                player.onSuccessfuly(this.logo);
                endGame = true;
            },
        });
    }

    impactPrincess(player, princess) {
        if (isBossDead) {
            isControllable = false;
            player.body.velocity.x = 100;
            this.time.addEvent({
                delay: 200,
                callback: function () {
                    player.body.velocity.x = 100;
                    player.anims.play(`${playerImageKey}TurnMotion`, true);
                },
                callbackScope: this,
                repeat: 0,
            });
            this.time.addEvent({
                delay: 900,
                callback: function () {
                    princess.body.velocity.x = 100;
                    princess.anims.play("sprPrincessMoveMotion", true);
                },
                callbackScope: this,
                repeat: 0,
            });
        }
    }

    standOnTrap(player, trap) {
        if (!player.getData("isDead")) {
            this.trap.setCollisionByExclusion([0]);
            player.body.velocity.y = 100;
            player.setData("isDead", true);
            isUpgrade ? player.anims.play("sprPlayerDeadUpgradeMotion", true) : player.play(`${playerImageKey}DeadMotion`);
            player.on("animationcomplete", function () {
                player.body.setImmovable(true);
            });
            player.onFailure(this.gameOver, this.tryAgain);
            player.onFailure(this.logo);
            endGame = true;
        }
    }

    playSound(name) {
        Sounds[name].currentTime = 0;
        Sounds[name].play();
    }

    getPropertiesObject(objectData, varTexture, defaultValue = null) {
        var data;
        for (var properties of objectData) {
            data = properties;
            for (var key in varTexture) {
                if (properties[key] !== varTexture[key]) {
                    data = null;
                }
            }
            if (data === null) continue;
            else break;
        }
        if (data === null) return defaultValue;
        else return data;
    }

    update() {
        if (nLoaded >= nAssets) {
            this.player.update();
            boss.update();
            // this.cameras.main.followOffset.set(0, -200);
            if (this.player.getData("isDead")) {
                Sounds["bgSound"].pause();
            }
            if (endGame && checkEnd == 0) {
                checkEnd++;
                this.downloadNow.setVisible(false);
                window.gameEnd && window.gameEnd();
                /*GameEndVungle*/
                this.input.on("pointerdown", function () {
                    window.install && window.install();
                });
            }
            for (var i = 0; i < this.enemiesGroup.getChildren().length; i++) {
                var enemy = this.enemiesGroup.getChildren()[i];
                enemy.update();
            }
            for (var i = 0; i < this.stairGroup.getChildren().length; i++) {
                var stair = this.stairGroup.getChildren()[i];
                stair.update();
            }
            for (var i = 0; i < this.blockCoin.getChildren().length; i++) {
                var coin = this.blockCoin.getChildren()[i];
                coin.update();
            }
            for (var i = 0; i < this.attackGroup.getChildren().length; i++) {
                var bulletPlayer = this.attackGroup.getChildren()[i];
                bulletPlayer.update();
            }
            for (var i = 0; i < this.elevatorGroup.getChildren().length; i++) {
                var elevator = this.elevatorGroup.getChildren()[i];
                elevator.update();
            }
            for (var i = 0; i < this.bossAttackGroup.getChildren().length; i++) {
                var bulletBoss = this.bossAttackGroup.getChildren()[i];
                bulletBoss.update();
            }
        }
    }
}
function gameClose() { }
