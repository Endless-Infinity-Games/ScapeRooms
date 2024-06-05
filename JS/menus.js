

document.getElementById('start-game').addEventListener('click', 
    function(){
        window.location.assign("./html/phasergame.html");
    });


document.addEventListener('DOMContentLoaded', function () {
    var logoImage = document.getElementById('logo-image');
    
    logoImage.addEventListener('load', function () {
        var triggerArea = logoImage.contentDocument.getElementById('triggerArea');
        var hiddenArea = logoImage.contentDocument.getElementById('hiddenArea');
        
        triggerArea.addEventListener('mouseover', function () {
            hiddenArea.style.visibility = 'visible';
        });
        
        triggerArea.addEventListener('mouseout', function () {
            hiddenArea.style.visibility = 'hidden';
        });
    });
});

