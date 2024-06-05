
// Lógica del menú
/*document.getElementById('start-game').addEventListener('click', () => {

    window.location.assign("./html/phasergame.html");
});*/

document.getElementById('play').addEventListener('click', 
    function(){
        sessionStorage.removeItem("save");
        window.location.assign("./html/phasergame.html");
    });
