





export const config = {
    type: Phaser.AUTO,
    width: 3000,
    height: 2800,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var platforms;
var cursors;

let keyA;
    let keyS;
    let keyD;
    let keyW;


var game = new Phaser.Game(config);




function preload ()
{
    this.load.image('sky', '/assets/sky.png');
    this.load.image('ground', '/assets/platform.png');
    this.load.image('star', '/assets/star.png');
    this.load.image('bomb', '/assets/bomb.png');
    this.load.spritesheet('dude', '/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{

    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(800, 450, 'dude').setScrollFactor(0);

    //player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

     //  From here down is just camera controls and feedback

     var controlConfig = {
         camera: this.cameras.main,
         left: cursors.left,
         right: cursors.right,
         up: cursors.up,
         down: cursors.down,
         acceleration: 0.06,
         drag: 0.0005,
         maxSpeed: 1.0
     };

     this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

     var cam = this.cameras.main;

     const gui = new dat.GUI();



     var f1 = gui.addFolder('Camera');
     f1.add(cam, 'x').listen();
     f1.add(cam, 'y').listen();
     f1.add(cam, 'scrollX').listen();
     f1.add(cam, 'scrollY').listen();
     f1.add(cam, 'rotation').min(0).step(0.01).listen();
     f1.add(help, 'line1');
     f1.open();

    this.physics.add.collider(player, platforms);
}

function update ()
{
    if (keyA.isDown)
    {
        player.setVelocityX(-500);

        player.anims.play('left', true);
    }
    else if (keyD.isDown)
    {
        player.setVelocityX(600);

        player.anims.play('right', true);
    }
    else if (keyW.isDown)
    {
        player.setVelocityY(-100);

    }
    else if (keyS.isDown)
    {
        player.setVelocityY(800);

    }
    else
    {
        player.setVelocityX(0);
        player.setVelocityY(0);

        player.anims.play('turn');
    }
}