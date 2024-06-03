// Configuración del juego Phaser
/*const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};*/

//const game = new Phaser.Game(config);

function preload() {
    // Aquí puedes cargar tus recursos
}

function create() {
    // Aquí puedes crear tus objetos iniciales del juego
    this.add.text(100, 100, 'Juego Iniciado', { font: '16px Press Start 2P', fill: '#ffffff' });
}

function update() {
    // Aquí puedes manejar la lógica de actualización de tu juego
}

// Lógica del menú
document.getElementById('start-game').addEventListener('click', () => {

    window.location.assign("../html/phasergame.html");
});

document.getElementById('settings').addEventListener('click', () => {
    alert('Configuraciones no implementadas');
});

document.getElementById('credits').addEventListener('click', () => {
    alert('Créditos no implementados');
});