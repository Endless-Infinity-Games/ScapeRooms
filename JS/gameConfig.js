export const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Texto al completar el nivel




var player;
var police;
var platforms;
var cursors;
var objects;
var lightMask;


var darkness;
let starsCollected = 0;
let totalStars = 0;
var completeText;




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
    this.load.image('cone', '/assets/cone.png');
    this.load.image('groundVertical', '/assets/platformGirada.png')
    
    this.load.spritesheet('dude', '/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('police', '/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    this.add.image(400, 300, 'sky');
    platforms = this.physics.add.staticGroup();


    //platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(44, 248, 'ground').refreshBody();
    platforms.create(510, 130, 'ground').refreshBody();
    platforms.create(670, 228, 'ground').refreshBody();
    platforms.create(600, 564, 'ground').refreshBody();
    platforms.create(100, 564, 'ground').refreshBody();
    platforms.create(600, 10, 'ground').refreshBody();
    platforms.create(200, 10, 'ground').refreshBody();


    platforms.create(300, 748, 'groundVertical').refreshBody();
    platforms.create(400, 412, 'groundVertical').refreshBody();
    platforms.create(140, -25, 'groundVertical').refreshBody();
    platforms.create(400, 748, 'groundVertical').refreshBody();
    platforms.create(300, 638, 'groundVertical').refreshBody();
    platforms.create(300, 175, 'groundVertical').refreshBody();
    platforms.create(16, 364, 'groundVertical').refreshBody();
    platforms.create(16, 364, 'groundVertical').refreshBody();
    platforms.create(784, 364, 'groundVertical').refreshBody();
    platforms.create(784, 164, 'groundVertical').refreshBody();
    platforms.create(16, 164, 'groundVertical').refreshBody();

    
    
    // Añadir el jugador

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

    addPolice(600, 500, 100, this); // Añade un policía en la posición (400, 300) con una distancia de patrulla de 100 píxeles
    addPolice(500, 175, 120, this);
    addPolice(150, 200, 90, this);

    // Lista de posiciones específicas
    const starPositions = [
        { x: 100, y: 500 }/*
        { x: 200, y: 150 },
        { x: 350, y: 50 },
        { x: 450, y: 250 },
        { x: 500, y: 300 },
        { x: 600, y: 350 }*/
    ];


    objects = this.physics.add.group({
        key: 'star',
        repeat: starPositions.length - 1, // -1 porque ya contamos el primer objeto en 'key'
        setXY: { x: 0, y: 0, stepX: 0 } // Esto se ignorará, pero es necesario
    });

    let i = 0;
    objects.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        if (starPositions[i]) {
            child.setPosition(starPositions[i].x, starPositions[i].y);
            totalStars++;
        }
        i++;
    });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(police, platforms);
    this.physics.add.collider(objects, platforms);
    this.physics.add.overlap(player, objects, collectObject, null, this);


    this.physics.add.overlap(player, police, restartGame, null, this);





    cursors = this.input.keyboard.createCursorKeys();
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);



    // Añadir la máscara de luz

    lightMask = this.make.graphics();
    lightMask.fillStyle(0xffffff, 0.3);
    lightMask.fillCircle(150, 150, 150);
    let maskTexture = lightMask.generateTexture('light', 300, 300);
   
    lightMask.destroy();

    let light = this.add.image(player.x, player.y, 'light');

    light.setOrigin(0.5, 0.5);
    light.setAlpha(0.8);

    light.setOrigin(0.5,0.5);
    light.setDepth(2); // Asegura que la máscara esté encima de los otros elementos
    light.setAlpha(0.5);

    light.setAngle(-45);
    player.light = light;
    


    // Oscurecer el fondo
    darkness = this.add.graphics();
    darkness.fillStyle(0x000000); // Color negro
    darkness.fillRect(0, 0, config.width, config.height);
    darkness.setAlpha(0.8); // Ajusta la opacidad del rectángulo según sea necesario
    darkness.setDepth(0); // Asegura que esté detrás de los otros elementos




    police.children.iterate(function (policeOfficer) {
        
    
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


        //Imagen de un cono
        policeOfficer.cone = policeOfficer.scene.physics.add.image(policeOfficer.x, policeOfficer.y, 'cone');
        policeOfficer.cone.setOrigin(1, 0.5);
        policeOfficer.cone.setScale(0.2);
        policeOfficer.cone.setAlpha(0.5); // Ajusta la opacidad según sea necesario
        policeOfficer.cone.body.setAllowGravity(false);
        policeOfficer.cone.body.setImmovable(true);
        policeOfficer.cone.body.setAllowRotation(true);

        policeOfficer.cone.setAngle(180); // Rotar ángulo

        // Ajustar el tamaño del cuerpo de colisión del cono
        policeOfficer.cone.body.setSize(300, 300); // Ajusta el tamaño según sea necesario
        policeOfficer.cone.body.setOffset(300, 150); // Ajusta el offset según sea necesario
                
        this.physics.add.overlap(player, policeOfficer.cone, restartGame, null, this);

 
    }, this);
    //Texto al ganar la partida
    completeText = this.add.text(400, 300, 'Level Complete!', { fontSize: '32px', fill: '#ffffff' });
    completeText.setAlpha(0);


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

       
    } else if (cursors.right.isDown || keyD.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        
    }else if (cursors.up.isDown || keyW.isDown) {
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


        
        //policeOfficer.cone.rotation = policeOfficer.angle; // Ajustar rotación

    }, this);

}

function createWall(scene, x, y, isVertical) {
    const wall = scene.physics.add.staticImage(x, y, 'ground');
    wall.visible = false; // Hacer la pared invisible

    if (isVertical) {
        wall.setSize(wall.height, wall.width); // Cambiar el tamaño del cuerpo de colisión
        wall.body.setSize(wall.width, wall.height); // Asegurarse de que el cuerpo tenga el tamaño correcto
        wall.angle = 90; // Rotar la imagen visible
    }

    const wallImage = scene.add.image(x, y, 'ground');
    wallImage.angle = isVertical ? 90 : 0;
    wallImage.setOrigin(0.5, 0.5);
}

function addStar(x,y,scene) {

    var starObj = scene.physics.add.sprite(x,y, 'star');
    starObj.setBounce(0.2);
    starObj.setCollideWorldBounds(true);
    starObj.startX = x;
    starObj.startY = y;

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

        policeOfficer.cone.setAngle(0); // Rotar ángulo
        policeOfficer.cone.body.setOffset(-160, 150)
         
    } else if (policeOfficer.direction === -1 && policeOfficer.x <= policeOfficer.startX - policeOfficer.distance) {
        policeOfficer.direction = 1;
        policeOfficer.cone.setAngle(180); // Rotar 
        policeOfficer.cone.body.setOffset(300, 150)

    }
    //Velocidad que alcanzan los policias
    policeOfficer.setVelocityX(30 * policeOfficer.direction);
    if (policeOfficer.direction === 1) {
        policeOfficer.anims.play('police_right', true);
    } else {
        policeOfficer.anims.play('police_left', true);
    }
}

function collectObject(player, object) {
    object.disableBody(true, true);

}

    starsCollected += 1;

    if (starsCollected === totalStars) {
        levelComplete();
    }
    // Lógica para manejar la recolección del objeto
}

function levelComplete() {
    console.log("nivell completat");
    // Muestra un mensaje o realiza alguna acción para indicar que el nivel se completó
   
    completeText.setOrigin(0.5, 0.5);
    completeText.setAlpha(1);
    
    // Aquí podrías agregar lógica para avanzar al siguiente nivel o reiniciar el nivel
    setTimeout(() => {
        window.history.back(); // Esto hará que la página vuelva a la página anterior en el historial del navegador
    }, 1000);
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

