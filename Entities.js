var bloodBoss = 1000;
var damageBoss = 1000;
var bloodPlayer = 4000;
var damagePlayer = 500;
let keyPlayer;
class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        scene.physics.world.enableBody(this, 0);
        this.body.setCollideWorldBounds(true);
        scene.add.existing(this);
        this.setData("isDead", false);
    }
}

class Player extends Entity {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        console.log(key);
        keyPlayer = key
        this.setDepth(2);
        this.body.acceleration.y = 700;
        this.body.setSize(64, 128);
        this.setData("bloodPlayer", bloodPlayer);
        this.setData("isShooting", false);
        this.setData("timerShootDelay", 20);
        this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
    }

    update() {
        var player = this;
        if (!this.getData("isDead") && isControllable && this.getData("isDead") !== undefined) {
            if (this.scene.sys.game.device.os.desktop) {
                if (this.scene.cursors.right.isDown) {
                    player.body.setVelocityX(300);
                    player.anims.play(`${keyPlayer}TurnMotion`, true);
                    player.flipX = false;
                } else if (this.scene.cursors.left.isDown) {
                    player.body.setVelocityX(-300);
                    player.anims.play(`${keyPlayer}TurnMotion`, true);
                    player.flipX = true;
                } else if (this.scene.cursors.space.isDown) {
                    if (player.getData("timerShootTick") < player.getData("timerShootDelay")) {
                        player.setData("timerShootTick", player.getData("timerShootTick") + 1);
                    } else {
                        this.scene.playSound("attackSound");
                        if (player.flipX === false) {
                            player.attack = new PlayerWeapon(player.scene, player.body.x + 40, player.body.y + 40).setDepth(4);
                            player.attack.flipX = false;
                            player.attack.setData("isFlip", false);
                        } else {
                            player.attack = new PlayerWeapon(player.scene, player.body.x - 35, player.body.y + 40).setDepth(4);
                            player.attack.flipX = true;
                            player.attack.setData("isFlip", true);
                        }
                        player.setData("timerShootTick", 0);
                        player.scene.attackGroup.add(player.attack);
                    }
                } else {
                    player.body.velocity.x = 0;
                    player.anims.play(`${keyPlayer}IdleMotion`);
                }

                if (player.scene.cursors.up.isDown && player.body.onFloor() && player.body.velocity.y >= 0) {
                    player.body.setVelocityY(-700);
                    this.scene.playSound("jumpSound");
                    player.anims.play(`${keyPlayer}JumpMotion`);
                }
                if (player.body.velocity.y !== 0 && !player.body.onFloor()) {
                    player.anims.play(`${keyPlayer}JumpMotion`);
                }
            } else {
                if (isTurnRight) {
                    player.body.setVelocityX(300);
                    player.anims.play(`${keyPlayer}TurnMotion`, true);
                    player.flipX = false;
                } else if (isTurnLeft) {
                    player.body.setVelocityX(-300);
                    player.anims.play(`${keyPlayer}TurnMotion`, true);
                    player.flipX = true;
                } else if (isFire) {
                    if (player.getData("timerShootTick") < player.getData("timerShootDelay")) {
                        player.setData("timerShootTick", player.getData("timerShootTick") + 1);
                    } else {
                        this.scene.playSound("attackSound");
                        if (player.flipX === false) {
                            player.attack = new PlayerWeapon(player.scene, player.body.x + 40, player.body.y + 40).setDepth(4);
                            player.attack.flipX = false;
                            player.attack.setData("isFlip", false);
                        } else {
                            player.attack = new PlayerWeapon(player.scene, player.body.x - 35, player.body.y + 40).setDepth(4);

                            player.attack.flipX = true;
                            player.attack.setData("isFlip", true);
                        }
                        player.setData("timerShootTick", 0);
                        player.scene.attackGroup.add(player.attack);
                    }
                } else {
                    player.body.velocity.x = 0;
                    player.anims.play(`${keyPlayer}IdleMotion`);
                }

                if (isJump && player.body.onFloor() && player.body.velocity.y >= 0) {
                    player.body.setVelocityY(-700);
                    player.anims.play(`${keyPlayer}JumpMotion`);
                    this.scene.playSound("jumpSound");
                }
                if (player.body.velocity.y !== 0 && !player.body.onFloor()) {
                    player.anims.play(`${keyPlayer}JumpMotion`);
                }
            }
        }

        if (!this.getData("isDead")) {
            if (Phaser.Math.Distance.Between(this.x, this.y, this.scene.dynamicsWorld.x, this.scene.dynamicsWorld.y) < 550 && checkPipe) {
                checkPipe = false;
                this.scene.add.tween({
                    targets: this.scene.dynamicsWorld,
                    ease: "Sine.easeInOut",
                    duration: 100,
                    y: this.scene.dynamicsWorld.body.y - 200,
                    delay: 0,
                    repeat: 0,
                    yoyo: false,
                });
            }
        }
    }

    onFailure(gameOver) {
        this.scene.playSound("loseSound");
        Sounds["bgSound"].pause();
        this.scene.turnRight.setVisible(false);
        this.scene.turnLeft.setVisible(false);
        this.scene.jump.setVisible(false);
        this.scene.fire.setVisible(false);
        this.scene.player.body.setImmovable(true);
        this.scene.player.body.velocity.y = -300;
        this.scene.player.body.velocity.x = 0;
        this.scene.add.tween({
            targets: this.scene.player,
            ease: "Sine.easeInOut",
            duration: 1000,
            alpha: {
                getStart: () => 1,
                getEnd: () => 0,
            },
            repeat: 0,
            yoyo: false,
        });
        this.scene.add.tween({
            targets: gameOver,
            ease: "Sine.easeInOut",
            duration: 500,
            delay: 500,
            scale: 1,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1,
            },
            repeat: 0,
            yoyo: false,
        });
    }

    onSuccessfuly(gameWin) {
        this.scene.playSound("winSound");
        Sounds["bgSound"].pause();
        this.scene.turnRight.setVisible(false);
        this.scene.turnLeft.setVisible(false);
        this.scene.jump.setVisible(false);
        this.scene.fire.setVisible(false);
        this.scene.add.tween({
            targets: gameWin,
            ease: "Sine.easeInOut",
            duration: 500,
            delay: 0,
            scale: 1,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1,
            },
            repeat: 0,
            yoyo: false,
        });
    }
}

class Boss extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprBoss");
        this.play("sprBossIdleMotion");
        this.body.setSize(100, 160).setOffset(100, 40);
        this.setData("isShooting", false);
        this.setData("timerShootDelay", 200);
        this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
        this.setData("bloodBoss", bloodBoss);
        this.setData("isAttacking", false);
    }

    update() {
        if (!this.getData("isDead") && this.getData("isAttacking") && !this.scene.player.getData("isDead") && !isPlayerDead) {
            if (this.getData("timerShootTick") < this.getData("timerShootDelay")) {
                this.setData("timerShootTick", this.getData("timerShootTick") + 1);
            } else if (this.getData("timerShootTick") === this.getData("timerShootDelay")) {
                this.anims.play("sprBossAttackMotion", true);
                if (this.anims.currentFrame.index === 10) {
                    this.scene.playSound("attackSound");
                    this.attack = new BossWeapon(this.scene, this.body.x - 35, this.body.y + 120).setDepth(4);
                    this.attack.body.setAcceleration(300);
                    this.scene.bossAttackGroup.add(this.attack);
                    this.setData("timerShootTick", 0);
                }
                this.once("animationcomplete", function () {
                    this.anims.play("sprBossIdleMotion", true);
                });
            }
        }
        if (!this.getData("isDead") && !isBossDead) {
            if (Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y) < 450) {
                this.setData("isAttacking", true);
            } else {
                this.setData("isAttacking", false);
            }
        }
        if (this.getData("isDead")) {
            this.body.collideWorldBounds = false;
            this.body.enable = false;
        }
    }
}

class BossWeapon extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprBossWeapon");
        this.body.setSize(60, 60, true);
        this.setData("damagePlayer", damagePlayer);
        this.body.setAcceleration(300);
        // this.body.setMaxVelocity(500);
    }

    update() {
        this.scene.physics.velocityFromAngle(0, -500, this.body.acceleration);
        this.angle -= 13;
    }
}

class Princess extends Entity {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        this.setDepth(2);
        this.body.setSize(60, 95);
    }
}

class Springs extends Entity {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        if (sprite === "sprSprings") {
            this.setDepth(3);
        } else {
            this.setDepth(0);
        }
    }
}

class PlayerWeapon extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprPlayerWeapon");
        this.play("sprPlayerWeaponMotion");
        this.setData("damagePlayer", damagePlayer);
        this.setData("isFlip", false);
    }

    update() {
        if (this.getData("isFlip")) {
            this.body.setVelocityX(-250);
        } else {
            this.body.setVelocityX(250);
        }
    }
}

class Coins extends Entity {
    constructor(scene, x, y, typeCoin) {
        super(scene, x + 15, y, typeCoin);
        this.play("sprCoinMotion");
    }
    update() {
        if (this.getData("isDead")) {
            this.destroy();
        }
    }
}

class Enemy extends Entity {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.body.allowGravity = false;
        this.setOrigin(0.5, 0);
        this.play(texture + "Motion");
    }
    update() {
        if (this.getData("isDead")) {
            this.destroy();
            console.log("check");
        }
    }
}

class BonusPoint extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprBonusPoint");
        this.setOrigin(0, 0);
        this.body.setImmovable(true);
        this.body.setSize(20, 32, true).setOffset(6, 1);
        this.play("sprBonusPointMotion");
    }
    update() {
        console.log(this.getData("isDead"));
        if (this.getData("isDead")) {
            this.anims.stop();
        }
    }
}

class AssetStatic extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
    }
}

class AssetMotion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        this.play(sprite + "Motion");
    }
}
