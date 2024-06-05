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

var player;
var police;
var platforms;
var cursors;
var objects;
var lightMask;
var darkness;

let keyA, keyS, keyD, keyW;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', '/assets/sky.png');
    this.load.image('ground', '/assets/platform.png');
    this.load.image('star', '/assets/star.png');
    this.load.image('bomb', '/assets/bomb.png');
    this.load.image('cone', '/assets/cone.png');
    this.load.image('groundVertical', '/assets/platformGirada.png')
    
    this.load.spritesheet('dude', '/assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('police', '/assets/dude.png', { frameWidth: 32, frameHeight: 48 }); // Usar un sprite diferente para el policía si lo tienes
}


function create() {
    // Añadir el fondo y las plataformas
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
    player.setOrigin(0.5,0.5); //Ajustar centro del personaje
    player.setBounce(0);
    player.setCollideWorldBounds(true);
    player.body.setAllowGravity(false);
    

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
    addPolice(600, 500, 100, this); // Añade un policía en la posición (400, 300) con una distancia de patrulla de 100 píxeles
    addPolice(500, 175, 120, this);
    addPolice(150, 200, 90, this);

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
    lightMask.fillStyle(0xffffff, 0.3);
    lightMask.fillCircle(150, 150, 150);
    let maskTexture = lightMask.generateTexture('light', 300, 300);
   
    lightMask.destroy();

    let light = this.add.image(player.x, player.y, 'light');
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
        
        //Cono dibujado
        /*
        let coneGraphics = policeOfficer.scene.add.graphics();
        coneGraphics.fillStyle(0xffffff, 0.2);
        coneGraphics.slice(0, 0, 150, Phaser.Math.DegToRad(-45), Phaser.Math.DegToRad(45), false);
        coneGraphics.fillPath();
        policeOfficer.cone = coneGraphics;
*/
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


}

function update() {
    player.setVelocity(0);
    // Movimiento del jugador
    if (cursors.left.isDown || keyA.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
       
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

    if ((cursors.up.isDown || keyW.isDown) && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    // Actualizar la posición de la luz del jugador
    /*lightCircle.x= player.x;
    lightCircle.y= player.y;
    console.log(lightCircle.x,player.x);*/
    player.light.x = player.x;
    player.light.y = player.y;


    police.children.iterate(function (policeOfficer) {
        patrol(policeOfficer);
        // Actualizar la posición y ángulo del cono

        policeOfficer.cone.x = policeOfficer.x;
        policeOfficer.cone.y = policeOfficer.y;
        
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
