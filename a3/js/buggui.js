'use strict';

// This should be your main point of entry for your app

var sceneGraphModule,
    buggyCanvas,
    cursor;

window.addEventListener('load', function() {

    var appContainer = document.getElementById('app-container'),
        buggy;

    sceneGraphModule = createSceneGraphModule();
    buggyCanvas = new BuggyCanvas();
    buggy = buggyCanvas.hostElement;

    resetCursor();

    /*** On mouse down ***/
    buggy.addEventListener('mousedown', function(e) {
        var curCoord = { x: e.offsetX, y: e.offsetY };

        setPIOActiveNode(curCoord);

        cursor.isMouseDown = true;
        cursor.origCoord = curCoord;

        buggy.classList.add('mousedown');
    });

    /*** On mouse move ***/
    buggy.addEventListener('mousemove', function(e) {
        var curCoord = { x: e.offsetX, y: e.offsetY },
            pointOffset = new Point(curCoord.x - cursor.origCoord.x, curCoord.y - cursor.origCoord.y);

        if (cursor.isMouseDown) {
            if (cursor.activeNode === sceneGraphModule.CAR_PART) {
                transformCar(curCoord, pointOffset, buggyCanvas.carNode);
            } else if (cursor.activeNode.match(/TIRE_PART/)) {
                switch (buggyCanvas.tireS.mode) {
                    case 'SCALE_X_AXLE':
                        buggyCanvas.scaleAxles(pointOffset);
                        break;
                    case 'ROTATE':
                        break;
                    default:
                        break;
                }
            // } else if (cursor.activeNode === sceneGraphModule.FRONT_LEFT_TIRE_PART) {

            // } else if (cursor.activeNode === sceneGraphModule.FRONT_RIGHT_TIRE_PART) {
            // } else if (cursor.activeNode === sceneGraphModule.BACK_LEFT_TIRE_PART) {
            // } else if (cursor.activeNode === sceneGraphModule.BACK_RIGHT_TIRE_PART) {
            }

            cursor.origCoord = curCoord;
        } else {
            setPIOActiveNode(curCoord);
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
            'transformMode': 'NONE',
            'activeNode': 'NONE',
            'pointInCar': false
        }

        buggy.classList.remove('mousedown');

        buggyCanvas.carS.fillStyle = buggyCanvas.carS.colours['NONE'];
        buggyCanvas.drawBuggy();
    }

    function setPIOActiveNode(point) {
        cursor.pointInCar = buggyCanvas.carNode.isInversePointInObject(point);

        if (cursor.pointInCar) {
            cursor.activeNode = buggyCanvas.carNode.getPIONodeName(point);

            if (cursor.activeNode === sceneGraphModule.CAR_PART) {
                buggyCanvas.carS.mode = buggyCanvas.carNode.getCarMode(point);
                buggyCanvas.carS.fillStyle = buggyCanvas.carS.colours['NONE'];
                buggyCanvas.carS.fillStyle = buggyCanvas.carS.colours[buggyCanvas.carS.mode];

                // TODO cursors look weird when rotated :(
                buggy.setAttribute('data-mode', buggyCanvas.carS.mode);
            } else {
                buggyCanvas.carS.mode = 'NONE';
                buggyCanvas.carS.fillStyle = buggyCanvas.carS.colours['NONE'];
            }

            if ( cursor.activeNode.match(/TIRE_PART/) ) {
                buggyCanvas.tireS.mode = buggyCanvas.tireNodes.FR.getTireMode(point);
                buggy.setAttribute('data-mode', buggyCanvas.tireS.mode);
            }

        } else {
            buggy.setAttribute('data-mode', 'NONE');
        }

    }

    function transformCar(curCoord, offset, node) {
        switch (buggyCanvas.carS.mode) {
            case 'SCALE_X_POS':
                buggyCanvas.scaleContextX(offset, '-1', node);
                break;
            case 'SCALE_X_NEG':
                buggyCanvas.scaleContextX(offset, '1', node);
                break;
            case 'SCALE_Y_POS':
                buggyCanvas.scaleContextY(offset, '-1', node);
                break;
            case 'SCALE_Y_NEG':
                buggyCanvas.scaleContextY(offset, '+1', node);
                break;
            case 'ROTATE':
                buggyCanvas.rotateContext(cursor.origCoord, curCoord, offset, node);
                break;
            case 'TRANSLATE':
                buggyCanvas.translateContext(offset, node);
                break;
            default:
                console.debug('Warning: invalid car transform mode');
                break;
        }
    }
});

