var togle = "char1";
var box1, box2, board, playbtn, selectBox, char1, char2, fCharsGroup, player;
class ChooseCharactor extends Phaser.Scene {
    constructor() {
        super({ key: "ChooseCharacter" });
    }

    create() {
        const that = this;
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        //set background
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, "sprBackgroundChooseScene")
            .setOrigin(0, 0).setDepth(0);

        board = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "sprBoadChooseScene")
            .setScale(0.4).setDepth(1);

        box1 = this.add.image(board.x - 80, this.cameras.main.height / 2, "sprNotSelectChooseScene")
            .setScale(0.4).setDepth(2);

        box2 = this.add.image(board.x + 80, this.cameras.main.height / 2, "sprNotSelectChooseScene")
            .setScale(0.4).setDepth(2);

        playbtn = this.add.image(this.cameras.main.width / 2, board.y + 150, "sprPlayButtonChooseScene")
            .setScale(0.4).setDepth(3).setInteractive();

        selectBox = this.add.image(0, 0, "sprSelectChooseScene")
            .setScale(0.4).setDepth(3).setVisible(false);

        //add characters
        char1 = this.add.sprite(box1.x - 45, box1.y - 45, "sprMovementPlayer1")
            .setOrigin(0.0, 0.0).setInteractive().setScale(0.8).setDepth(4);

        char2 = this.add.sprite(box2.x - 45, box2.y - 45, "sprMovementPlayer2")
            .setOrigin(0.0, 0.0).setInteractive().setScale(0.8).setDepth(4);

        //group characters
        fCharsGroup = this.add.group([char1, char2]);

        //add player			
        player = this.add.sprite(0, 0, "char1-happy-jump-1")
            .setOrigin(0.0, 0.0).setDepth(4).setScale(0.8);
        player.anims.play("sprMovementPlayer1JumpMotion");

        // select a character for playing and show instructions
        char1.on("pointerdown", function () {
            Sounds["touchSound"].play();
            player.update(char1.x, char1.y, "char1-happy-jump-1");
            player.anims.play("sprMovementPlayer1JumpMotion");
            player.setVisible(true);
            togle = "char1";
        });

        char2.on("pointerdown", function () {
            Sounds["touchSound"].play();
            player.update(char2.x - 50, char2.y, "char1-happy-jump-1");
            player.anims.play("sprMovementPlayer2JumpMotion");
            player.setVisible(true);
            togle = "char2";
        });
        playbtn.on("pointerdown", function () {
            Sounds["collectCoinSound"].play();
            if (togle == "char1") {
                that.scene.start("Scene1PlayGame", { image: "sprMovementPlayer1" });

            } else if (togle == "char2") {
                that.scene.start("Scene1PlayGame", { image: "sprMovementPlayer2" });
            }
        });
        this.resize()
        this.scale.on("resize", this.resize2, this);

    }
    resize() {
        console.log('resize');
        let width = window.innerWidth, height = window.innerHeight;
        let wratio = width / height, ratio = 9 / 14;

        if (wratio < ratio) {
            console.log('pp');
            this.background.setScale(2)
            board.setPosition(width / 2, height / 2);
            box1.setPosition(board.x - 80, height / 2)
            box2.setPosition(board.x + 80, height / 2)
            playbtn.setPosition(width / 2, board.y + 150)
            char1.setPosition(box1.x - 55, box1.y - 50)
            char2.setPosition(box2.x - 50, box2.y - 50);
            this.background.height = height;

        } else {
            console.log("ll");
            this.background.setScale(1)
            this.background.width = width;
            this.background.height = height;
            board.setPosition(width / 2, height / 2);
            box1.setPosition(board.x - 80, height / 2)
            box2.setPosition(board.x + 80, height / 2)
            playbtn.setPosition(width / 2, board.y + 150)
            char1.setPosition(box1.x - 55, box1.y - 50)
            char2.setPosition(box2.x - 50, box2.y - 50);
        }
    }
    resize2(gameSize, baseSize, displaySize, resolution) {
        let width = gameSize.width, height = gameSize.height;
        let wratio = width / height, ratio = 9 / 14;
        if (wratio < ratio) {
            console.log('pp');
            board.setPosition(width / 2, height / 2);
            box1.setPosition(board.x - 80, height / 2)
            box2.setPosition(board.x + 80, height / 2)
            playbtn.setPosition(width / 2, board.y + 150)
            char1.setPosition(box1.x - 55, box1.y - 50)
            char2.setPosition(box2.x - 50, box2.y - 50);
            this.background.setScale(2)
            this.background.height = height;

        } else {
            console.log("ll");
            this.background.setScale(1)
            this.background.width = width;
            this.background.height = height;
            board.setPosition(width / 2, height / 2);
            box1.setPosition(board.x - 80, height / 2)
            box2.setPosition(board.x + 80, height / 2)
            playbtn.setPosition(width / 2, board.y + 150)
            char1.setPosition(box1.x - 55, box1.y - 50)
            char2.setPosition(box2.x - 50, box2.y - 50);
        }
    }
    update() {
        if (togle == "char1") {
            char1.setAlpha(0);
            char2.setAlpha(0.5);
            player.setPosition(char1.x, char1.y);
            selectBox.setPosition(box1.x, box1.y).setVisible(true);

        } else if (togle == "char2") {
            char1.setAlpha(0.5);
            char2.setAlpha(0);
            player.setPosition(char2.x, char2.y);
            selectBox.setPosition(box2.x, box2.y).setVisible(true);
        }
    }
}