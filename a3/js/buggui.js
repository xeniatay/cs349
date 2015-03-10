'use strict';

// This should be your main point of entry for your app

var sceneGraphModule,
    buggyCanvas;

window.addEventListener('load', function() {

    var appContainer = document.getElementById('app-container');

    var isMouseDown = false,
        origCoord = new Point(0, 0);

    sceneGraphModule = createSceneGraphModule();
    buggyCanvas = new BuggyCanvas();

    var buggy = buggyCanvas.hostElement;

    buggy.addEventListener('mousedown', function(e) {
        console.log('mousedown');
        isMouseDown = true;
        origCoord = { x: e.offsetX, y: e.offsetY };
    });

    buggy.addEventListener('mousemove', function(e) {
        if (isMouseDown) {
            var newCoord = { x: e.offsetX, y: e.offsetY };

            if ( (origCoord.x !== newCoord.x) || (origCoord.y !== newCoord.y) ) {
                var buggyHit = buggyCanvas.carNode.pointInObject(newCoord),
                    pointOffset = new Point(newCoord.x - origCoord.x, newCoord.y - origCoord.y);

                buggyCanvas.translateOrigin(pointOffset, buggyCanvas.carNode);
            }

            origCoord = newCoord;
        }
    });

    buggy.addEventListener('mouseup', function(e) {
        isMouseDown = false;
    });
});



