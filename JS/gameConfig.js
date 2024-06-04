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
var maskGraphics;
var lightMask;
var angle;


let keyA, keyS, keyD, keyW;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', '/assets/sky.png');
    this.load.image('ground', '/assets/platform.png');
    this.load.image('star', '/assets/star.png');
    this.load.image('bomb', '/assets/bomb.png');
    this.load.spritesheet('dude', '/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('police', '/assets/dude.png', { frameWidth: 32, frameHeight: 48 }); // Usar un sprite diferente para el policía si lo tienes
}


function create() {
    // Añadir el fondo y las plataformas
    this.add.image(400, 300, 'sky');
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Añadir el jugador
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setOrigin(2.7,0.5); //Ajustar centro del personaje
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Añadir las animaciones del jugador

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

    // Añadir los policías
    police = this.physics.add.group();
    addPolice(400, 300, 100, this); // Añade un policía en la posición (400, 300) con una distancia de patrulla de 100 píxeles


    // Añadir los objetos a recoger
    objects = this.physics.add.group({
        key: 'star',
        repeat: 10,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    objects.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // Añadir colisiones
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(police, platforms);
    this.physics.add.collider(objects, platforms);
    this.physics.add.overlap(player, objects, collectObject, null, this);
    this.physics.add.overlap(player, police, restartGame, null, this);

    // Configurar teclas
    cursors = this.input.keyboard.createCursorKeys();
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    // Añadir la máscara de luz
     
    lightMask = this.make.graphics();
    lightMask.fillStyle(0xffffff, 1);
    lightMask.fillCircle(0, 0, 100);
    let maskTexture = lightMask.generateTexture('light', 100, 100);
    lightMask.destroy();


    // Añadir máscara de luz al jugador
    let light = this.add.image(player.x, player.y, 'light');
    
    light.setOrigin(0.5,0.5);
    light.setAlpha(0.8);
    light.setAngle(-45); //Canvi angle per la llum

    player.light = light;
    

    // Añadir máscara de luz a los policías
    police.children.iterate(function (child) {
        let policeLight = this.add.image(child.x, child.y, 'light');
        policeLight.setAlpha(0.8);
        policeLight.setAngle(-45); //Canviar el angle 
        child.light = policeLight;
    }, this);
}

function update() {
    // Movimiento del jugador
    if (cursors.left.isDown || keyA.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        //player.light.setFlipX(true); //Giramos la luz del jugador
        player.light.setAngle(130);

    } else if (cursors.right.isDown || keyD.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        //player.light.setFlipX(false); //Giramos la luz del jugador
        player.light.setAngle(-45);
        
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if ((cursors.up.isDown || keyW.isDown) && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    // Actualizar la posición de la luz del jugador
    player.light.x = player.x;
    player.light.y = player.y;



    // Movimiento de los policías
    police.children.iterate(function (child) {
        patrol(child);
        child.light.x = child.x;
        child.light.y = child.y;
    });
}


function addPolice(x, y, distance, scene) {
    var policeOfficer = scene.physics.add.sprite(x, y, 'police');
    policeOfficer.setBounce(0.2);
    policeOfficer.setCollideWorldBounds(true);
    policeOfficer.startX = x;
    policeOfficer.startY = y;
    policeOfficer.distance = distance;
    policeOfficer.direction = 1; // 1 para derecha, -1 para izquierda

    // Animaciones del policía (similar al jugador)
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
        policeOfficer.light.setAngle(135); //Rotar angle
    } else if (policeOfficer.direction === -1 && policeOfficer.x <= policeOfficer.startX - policeOfficer.distance) {
        policeOfficer.direction = 1;
        policeOfficer.light.setAngle(-45); //Rotar angle
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
    // Lógica para manejar la recolección del objeto
}

function restartGame(player, policeOfficer) {
    // Lógica para reiniciar el juego
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.physics.pause();

    setTimeout(() => {
        this.scene.restart();
    }, 1000);
}
