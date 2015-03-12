'use strict';

// This should be your main point of entry for your app

var sceneGraphModule,
    buggyCanvas,

    // cursor defaults
    cursor = {
        'isMouseDown': false,
        'origCoord': new Point(0, 0),
        'selectedNode': 'NONE',
        'transformMode': 'NONE'
    },
    CAR_COLOURS = {
        'NONE': 'red',
        'TRANSLATE': 'yellow',
        'ROTATE': 'purple',
        'SCALE_Y_POS': 'blue', // downwards
        'SCALE_Y_NEG': 'blue', // upwards
        'SCALE_X_POS': 'green', // right
        'SCALE_X_NEG': 'green' // left
    };

window.addEventListener('load', function() {

    var appContainer = document.getElementById('app-container');

    sceneGraphModule = createSceneGraphModule();
    buggyCanvas = new BuggyCanvas();

    var buggy = buggyCanvas.hostElement;

    buggy.addEventListener('mousedown', function(e) {

        var curCoord = { x: e.offsetX, y: e.offsetY };

        detectCarMode(curCoord);

        cursor.isMouseDown = true;
        cursor.origCoord = curCoord;

        buggy.classList.add('mousedown');
    });

    buggy.addEventListener('mousemove', function(e) {
        var curCoord = { x: e.offsetX, y: e.offsetY },
            pointOffset,
            pointInCar = buggyCanvas.carNode.isInversePointInObject(curCoord);

        if ( (cursor.origCoord.x !== curCoord.x) || (cursor.origCoord.y !== curCoord.y) ) {
            pointOffset = new Point(curCoord.x - cursor.origCoord.x, curCoord.y - cursor.origCoord.y);
        }

        if (pointOffset) {
            if (cursor.isMouseDown) {
                switch (buggyCanvas.carS.mode) {
                    case 'SCALE_X_POS':
                        buggyCanvas.scaleContextX(pointOffset, '-1', buggyCanvas.carNode);
                        break;
                    case 'SCALE_X_NEG':
                        buggyCanvas.scaleContextX(pointOffset, '1', buggyCanvas.carNode);
                        break;
                    case 'SCALE_Y_POS':
                        buggyCanvas.scaleContextY(pointOffset, '-1', buggyCanvas.carNode);
                        break;
                    case 'SCALE_Y_NEG':
                        buggyCanvas.scaleContextY(pointOffset, '+1', buggyCanvas.carNode);
                        break;
                    case 'ROTATE':
                        buggyCanvas.rotateContext(cursor.origCoord, curCoord, pointOffset, buggyCanvas.carNode);
                        break;
                    case 'TRANSLATE':
                        buggyCanvas.translateContext(pointOffset, buggyCanvas.carNode);
                        break;
                    default:
                        console.debug('Warning: invalid car transform mode');
                        break;
                }

                cursor.origCoord = curCoord;

            } else {
                detectCarMode(curCoord);
            }
        }

        if (pointInCar) {
        }
            buggyCanvas.drawBuggy();
    });

    buggy.addEventListener('mouseup', function(e) {
        resetCursor();
    });

    function resetCursor() {
        cursor = {
            'isMouseDown': false,
            'origCoord': new Point(0, 0),
            'selectedNode': 'NONE',
            'transformMode': 'NONE'
        }

        buggy.classList.remove('mousedown');

        buggyCanvas.carS.fillStyle = CAR_COLOURS['NONE'];
        buggyCanvas.drawBuggy();
    }

    function detectCarMode(point) {
        var pointInCar = buggyCanvas.carNode.isInversePointInObject(point);

        if (pointInCar) {
            buggyCanvas.carS.mode = buggyCanvas.carNode.getCarMode(point);
            buggyCanvas.carS.fillStyle = CAR_COLOURS['NONE'];
            buggyCanvas.carS.fillStyle = CAR_COLOURS[buggyCanvas.carS.mode];
        } else {
            buggyCanvas.carS.mode = 'NONE';
            buggyCanvas.carS.fillStyle = CAR_COLOURS['NONE'];
        }

        buggy.setAttribute('data-mode', buggyCanvas.carS.mode);
    }
});

