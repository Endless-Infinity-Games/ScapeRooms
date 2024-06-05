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
var police;
var platforms;
var cursors;
var objects;
var lightMask;

let keyA, keyS, keyD, keyW;
let isPaused = false;
let pauseButton;
let pauseMenu;
let resumeButton;
let exitButton;

var game = new Phaser.Game(config);

function preload () {
    this.load.image('sky', '/assets/sky.png');
    this.load.image('ground', '/assets/platform.png');
    this.load.image('star', '/assets/star.png');
    this.load.image('bomb', '/assets/bomb.png');
    this.load.spritesheet('dude', '/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('police', '/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    this.add.image(400, 300, 'sky');
    platforms = this.physics.add.staticGroup();
    platforms.create(300, 748, 'ground').setAngle(90);
    platforms.create(400, 412, 'ground').setAngle(90);
    platforms.create(44, 248, 'ground');
    platforms.create(140, -15, 'ground').setAngle(90);
    platforms.create(400, 748, 'ground').setAngle(90);
    platforms.create(510, 148, 'ground');
    platforms.create(650, 228, 'ground');
    platforms.create(300, 638, 'ground').setAngle(90);
    platforms.create(300, 198, 'ground').setAngle(90);
    platforms.create(600, 564, 'ground');
    platforms.create(100, 564, 'ground');
    platforms.create(16, 364, 'ground').setAngle(90);
    platforms.create(16, 164, 'ground').setAngle(90);
    platforms.create(784, 364, 'ground').setAngle(90);
    platforms.create(784, 164, 'ground').setAngle(90);
    platforms.create(600, 10, 'ground');
    platforms.create(200, 10, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setOrigin(0.5,0.5);
    player.setBounce(0);
    player.setCollideWorldBounds(true);
    player.body.setAllowGravity(false);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    police = this.physics.add.group();
    addPolice(400, 300, 100, this);
    addPolice(300, 500, 200, this);

    objects = this.physics.add.group({
        key: 'star',
        repeat: 10,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    objects.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(police, platforms);
    this.physics.add.collider(objects, platforms);
    this.physics.add.overlap(player, objects, collectObject, null, this);

    cursors = this.input.keyboard.createCursorKeys();
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    lightMask = this.make.graphics();
    lightMask.fillStyle(0xffffff, 0.3);
    lightMask.fillCircle(150, 150, 150);
    let maskTexture = lightMask.generateTexture('light', 300, 300);
    lightMask.destroy();

    let light = this.add.image(player.x, player.y, 'light');
    light.setOrigin(0.5, 0.5);
    light.setAlpha(0.8);
    light.setAngle(-45);
    player.light = light;

    police.children.iterate(function (policeOfficer) {
        let coneGraphics = policeOfficer.scene.add.graphics();
        coneGraphics.fillStyle(0xffffff, 0.2);
        coneGraphics.slice(0, 0, 150, Phaser.Math.DegToRad(-45), Phaser.Math.DegToRad(45), false);
        coneGraphics.fillPath();
        policeOfficer.cone = coneGraphics;
    });

    pauseButton = document.getElementById('pause-button');
    pauseMenu = document.getElementById('pause-menu');
    resumeButton = document.getElementById('resume-button');
    exitButton = document.getElementById('exit-button');

    pauseButton.addEventListener('click', () => {
        this.scene.pause();
        isPaused = true;
        pauseMenu.style.display = 'block';
    });

    resumeButton.addEventListener('click', () => {
        this.scene.resume();
        isPaused = false;
        pauseMenu.style.display = 'none';
    });

    exitButton.addEventListener('click', () => {
        window.location.assign("../index.html");
    });
}

function update() {
    if (isPaused) return;

    player.setVelocity(0);
    if (cursors.left.isDown || keyA.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown || keyD.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else if (cursors.up.isDown || keyW.isDown) {
        player.setVelocityY(-160);
    } else if (cursors.down.isDown || keyS.isDown) {
        player.setVelocityY(160);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    player.light.x = player.x;
    player.light.y = player.y;

    police.children.iterate(function (policeOfficer) {
        patrol(policeOfficer);
        policeOfficer.cone.x = policeOfficer.x;
        policeOfficer.cone.y = policeOfficer.y;
    });
}

function addPolice(x, y, distance, scene) {
    var policeOfficer = scene.physics.add.sprite(x, y, 'police');
    policeOfficer.setBounce(0.2);
    policeOfficer.setCollideWorldBounds(true);
    policeOfficer.startX = x;
    policeOfficer.startY = y;
    policeOfficer.distance = distance;
    policeOfficer.direction = 1;

    scene.anims.create({
        key: 'police_left',
        frames: scene.anims.generateFrameNumbers('police', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'police_turn',
        frames: [{ key: 'police', frame: 4 }],
        frameRate: 20
    });

    scene.anims.create({
        key: 'police_right',
        frames: scene.anims.generateFrameNumbers('police', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    police.add(policeOfficer);
}

function patrol(policeOfficer) {
    if (policeOfficer.direction === 1 && policeOfficer.x >= policeOfficer.startX + policeOfficer.distance) {
        policeOfficer.direction = -1;
        policeOfficer.cone.setAngle(-180);
    } else if (policeOfficer.direction === -1 && policeOfficer.x <= policeOfficer.startX - policeOfficer.distance) {
        policeOfficer.direction = 1;
        policeOfficer.cone.setAngle(0);
    }

    policeOfficer.setVelocityX(100 * policeOfficer.direction);
    if (policeOfficer.direction === 1) {
        policeOfficer.anims.play('police_right', true);
    } else {
        policeOfficer.anims.play('police_left', true);
    }
}

function collectObject(player, object) {
    object.disableBody(true, true);
}
