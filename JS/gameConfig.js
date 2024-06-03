
export const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
    //tecles per a controlar el personatge
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    this.add.image(0, 0, 'sky').setOrigin(0,0);

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 800, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 200, 'dude').setScrollFactor(0);

    player.setBounce(0.2);
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

     // Creem la camera i fem que segueixi al jugador

    //BUG AMB CAMERA al implementar la camara que segueix el jugador, el joc dibuixar els coliders desplacats
    this.cameras.main.setBounds(0,0, 1600,800);
    this.cameras.main.startFollow(player);
   // this.physics.world.setBounds(0,0, 1600, 800)

    this.physics.add.collider(player, platforms);
}

function update ()
{
    if (keyA.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (keyD.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else if (keyW.isDown)
    {
        player.setVelocityY(-160);

    }
    else if (keyS.isDown)
    {
        player.setVelocityY(160);

    }
    else
    {
        player.setVelocityX(0);
        player.setVelocityY(0);

        player.anims.play('turn');
    }
}