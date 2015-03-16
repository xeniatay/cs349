/*** Generic Canvas Template ***/

var Point = function(x, y) {
    this.x = x;
    this.y = y;
}

var Canvas = function () {
};

_.extend(Canvas.prototype, {
    _instantiateInterface: function (templateId, containerId) {
        var template = document.getElementById(templateId),
            containerElem = document.getElementById(containerId);

        this.hostElement = document.createElement('div');
        this.hostElement.classList.add('canvas-host');
        this.hostElement.innerHTML = template.innerHTML;
        containerElem.appendChild(this.hostElement);
    }
});

/*** Buggy Canvas ***/

var BuggyCanvas = function() {
    this.initialize();
};

_.extend(BuggyCanvas.prototype, Canvas.prototype, {

    initialize: function() {
        var container = "app-container";

        this._instantiateInterface('buggy-canvas-template', container);
        this.container = document.getElementById(container);

        this.canvas = document.getElementById('buggui-canvas');
        this.context = this.canvas.getContext('2d');
        this.context.width = 800;
        this.context.height = 600;

        this.context.settings = {
            'carNode': {
                'maxWidth': 150,
                'minWidth': 25,
                'maxHeight': 200,
                'minHeight': 50,
                'minWindowOffsetX': 3,
                'minWindowOffsetY': 10,
                'minWindowWidth': 10,
                'minWindowHeight': 12,
                'bufferFactor': 8,
                'fillStyle': 'purple',
                'mode': 'NONE',
                'colours': {
                    'NONE': 'red',
                    'NONE_TIRES': 'black',
                    'TRANSLATE': 'yellow',
                    'ROTATE': 'purple',
                    'SCALE_Y_POS': 'blue', // downwards
                    'SCALE_Y_NEG': 'blue', // upwards
                    'SCALE_X_POS': 'green', // right
                    'SCALE_X_NEG': 'green',
                    'SCALE_X_AXLE': 'green',
                    'ROTATE_TIRE': 'purple' // left
                }
            }
        };

        this.carS = this.context.settings.carNode;
        this.carS.width = this.carS.maxWidth;
        this.carS.height = this.carS.maxHeight;

        _.extend(this.context.settings, {
            'axleNode': {
                // Axel width is defined as the distance from the side of the car to the center of a tire
                'minWidth': 10,
                'maxWidth': 75,
                'minHeight': 5,
                'maxHeight': 10,
                'distFromBumper': this.carS.height / this.carS.bufferFactor
            }
        });

        this.axleS = this.context.settings.axleNode;
        this.axleS.width = this.axleS.maxWidth;
        this.axleS.totalWidth = (this.axleS.width * 2) + this.carS.width;
        this.axleS.height = this.axleS.maxHeight;

        _.extend(this.context.settings, {
            'tireNode': {
                'minWidth': 5,
                'maxWidth': 30,
                'minHeight': 10,
                'maxHeight': 40,
                'minAngle': - 45 * (Math.PI / 180),
                'maxAngle': 45 * (Math.PI / 180),
                'bufferFactor': 5,
                'mode': 'NONE',
                'fillStyle': 'black'
            }
        });

        this.tireS = this.context.settings.tireNode;
        this.tireS.width = this.tireS.maxWidth;
        this.tireS.height = this.tireS.maxHeight;

        this.context.save();

        this.initBuggy();
    },

    addListener: function(listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function(listener) {
        this.listeners = _.reject(this.listeners, function(fn) {
            if ( _.isEqual(fn, listener) ) { return true; }
        }, this);
    },

    initBuggy: function() {
        this.rootNode = new sceneGraphModule.GraphNode();
        this['CAR_PART'] = new sceneGraphModule.CarNode();

        this.axleNodes = {
            'FRONT_AXLE_PART': new sceneGraphModule.AxleNode(),
            'BACK_AXLE_PART': new sceneGraphModule.AxleNode()
        }

        this.tireNodes = {
            'FRONT_LEFT_TIRE_PART': new sceneGraphModule.TireNode(),
            'FRONT_RIGHT_TIRE_PART': new sceneGraphModule.TireNode(),
            'BACK_LEFT_TIRE_PART': new sceneGraphModule.TireNode(),
            'BACK_RIGHT_TIRE_PART': new sceneGraphModule.TireNode()
        };

        this.initNodes()
        this.drawBuggy();
    },

    initNodeHierachy: function() {

        this.rootNode.addChild(this.CAR_PART);

        // Build node hierachy
        _.each(this.axleNodes, function(node) {
            this.CAR_PART.addChild(node);
        }, this);

        this.axleNodes.FRONT_AXLE_PART.addChild(this.tireNodes.FRONT_LEFT_TIRE_PART);
        this.axleNodes.FRONT_AXLE_PART.addChild(this.tireNodes.FRONT_RIGHT_TIRE_PART);
        this.axleNodes.BACK_AXLE_PART.addChild(this.tireNodes.BACK_LEFT_TIRE_PART);
        this.axleNodes.BACK_AXLE_PART.addChild(this.tireNodes.BACK_RIGHT_TIRE_PART);

    },

    /**
     * Do transformations for buggy
     **/
    initNodes: function() {
        this.initRootNodes();
        this.initCarNodes();
        this.initAxleNodes();
        this.initTireNodes();

        this.initNodeHierachy();
    },

    initGenericNode: function(transform, nodeName, node) {
        var objectTransform = node.objectTransform.clone(),
            objectTransformForHitDetection = node.objectTransformForHitDetection.clone();

        node.initGraphNode(transform, nodeName);

        // Preserve these transforms
        node.objectTransform.copyFrom(objectTransform);
        node.objectTransformForHitDetection.copyFrom(objectTransformForHitDetection);
    },

    initRootNodes: function() {
        this.rootNode.initGraphNode(new AffineTransform(1, 0, 0, 1, 0, 0), 'rootNode');
    },

    initCarNodes: function() {
        var PosX = (this.canvas.width - this.carS.width) / 2,
            PosY = (this.canvas.height - this.carS.height) / 2,
            scaleX = 1,
            scaleY = 1,
            transform = new AffineTransform(scaleX, 0, 0, scaleY, PosX, PosY);

        this.initGenericNode(transform, sceneGraphModule.CAR_PART, this.CAR_PART);
    },

    initAxleNodes: function() {
        // Recalculate axle width
        this.axleS.totalWidth = (this.axleS.width * 2) + this.carS.width;

        var scaleX = 1,
            scaleY = 1,
            PosX = - ( (this.axleS.totalWidth - this.carS.width) / 2 ),
            PosFY = this.axleS.distFromBumper,
            PosBY = this.carS.height - this.axleS.distFromBumper - this.axleS.height,
            transformF = new AffineTransform(scaleX, 0, 0, scaleY, PosX, PosFY),
            transformB = new AffineTransform(scaleX, 0, 0, scaleY, PosX, PosBY);

        this.initGenericNode(transformF, sceneGraphModule.FRONT_AXLE_PART, this.axleNodes.FRONT_AXLE_PART);
        this.initGenericNode(transformB, sceneGraphModule.BACK_AXLE_PART, this.axleNodes.BACK_AXLE_PART);
    },

    initTireNodes: function() {
        var scaleX = 1,
            scaleY = 1,
            PosRX = - this.tireS.width / 2,
            PosLX = this.axleS.totalWidth - (this.tireS.width / 2),
            PosY = -(this.tireS.height - this.axleS.height) / 2,
            transformFL = new AffineTransform(scaleX, 0, 0, scaleY, PosRX, PosY),
            transformFR = new AffineTransform(scaleX, 0, 0, scaleY, PosLX, PosY);

        this.initGenericNode(transformFL, sceneGraphModule.FRONT_LEFT_TIRE_PART, this.tireNodes.FRONT_LEFT_TIRE_PART);
        this.initGenericNode(transformFR, sceneGraphModule.FRONT_RIGHT_TIRE_PART, this.tireNodes.FRONT_RIGHT_TIRE_PART);
        this.initGenericNode(transformFL, sceneGraphModule.BACK_LEFT_TIRE_PART, this.tireNodes.BACK_LEFT_TIRE_PART);
        this.initGenericNode(transformFR, sceneGraphModule.BACK_RIGHT_TIRE_PART, this.tireNodes.BACK_RIGHT_TIRE_PART);
    },

    /*
     * Offsets the node's starting context by the coordinates provided
     */
    translateContext: function(offset, node) {
        // Set translate on objectTransform, because initGraphNode resets startPositionTransform
        node.objectTransform.preTranslate(offset.x, offset.y);
        node.objectTransformForHitDetection.preTranslate(offset.x, offset.y);
    },

    scaleContextX: function(offset, dir, node) {
        var scaleX = 1 + ( (dir * offset.x * 2) / node.settings.width ),
            scaleY = 1;

        node.settings.width = node.settings.width * scaleX;

        node.settings.width = Math.max(node.settings.minWidth, node.settings.width);
        node.settings.width = Math.min(node.settings.maxWidth, node.settings.width);

        this.initNodes();
    },

    scaleContextY: function(offset, dir, node) {
        var scaleY = 1 + ( dir * offset.y / node.settings.width );

        node.settings.height = node.settings.height * scaleY;

        node.settings.height = Math.max(node.settings.minHeight, node.settings.height);
        node.settings.height = Math.min(node.settings.maxHeight, node.settings.height);

        this.initNodes();
    },

    getRotationAngle: function(origCoord, curCoord, offset, node) {
        var invOrig = node.getPointInverse(origCoord),
            invCur = node.getPointInverse(curCoord),
            origin = new Point(node.settings.width / 2, node.settings.height / 2);
            thetaOrig = Math.atan( (invOrig.y - origin.y) / (invOrig.x - origin.x) ),
            thetaCur = Math.atan( (invCur.y - origin.y) / (invCur.x - origin.x) ),
            theta = -1 * Math.abs( thetaOrig - thetaCur );

        return theta;

        // console.debug('Angle:', theta * 180 / Math.PI, ' Radian: ', theta);
    },

    /**
     * Rotate context
     * ONLY Clockwise for now
     **/
    rotateContext: function(origCoord, curCoord, offset, node) {
        var theta = this.getRotationAngle(origCoord, curCoord, offset, node);
        this.rotateContextByAngle(theta, node);
    },

    /**
     * Rotate context by given angle
     * ONLY Clockwise for now
     **/
    rotateContextByAngle: function(theta, node) {
        var newAngle = node.rotationAngle + theta;
        console.debug('newAngle', newAngle * (180 / Math.PI));

        if ( (newAngle <= node.settings.minAngle) || (newAngle >= node.settings.maxAngle) ) {
            return;
        } else {
            node.rotationAngle = newAngle;

            node.objectTransform.rotate(theta, 0, 0);

            node.objectTransformForHitDetection.translate(node.settings.width / 2, node.settings.height / 2);
            node.objectTransformForHitDetection.rotate(-theta, 0, 0);
            node.objectTransformForHitDetection.translate(-node.settings.width / 2, -node.settings.height / 2);
        }

    },

    scaleAxles: function(offset, dir) {
        this.scaleContextX(offset, -1, this.axleNodes.FRONT_AXLE_PART);
    },

    // rotateAxles: function(origCoord, curCoord, offset, node) {

    // },

    clearCanvas: function() {
        // Store the current transformation matrix
        this.context.save();

        // Use the identity matrix while clearing the canvas
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Restore the transform
        this.context.restore();
    },

    /**
     * Draw buggy aka car
     */
    drawBuggy: function() {
        this.clearCanvas();

        this.CAR_PART.render(this.context);
        // this.drawGrid(20);
    },

    /**
     * Draw a dataPoint
     */
    drawPoint: function(colour, x, y, xSize, ySize) {
        this.context.fillStyle = colour;
        this.context.fillRect( x, y, xSize, ySize);
    },

    /**
     * Draw grid
     */
    drawGrid: function(gridSize) {
        gridSize = gridSize || 10;

        for (var y = 0; y <= this.canvas.height; y += gridSize) {
            this.drawLine( [0, y], [this.canvas.width, y] );
        }

        for (var x = 0; x <= this.canvas.width; x += gridSize) {
            this.drawLine( [x, 0], [x, this.canvas.height] );
        }
    },

    /**
     * Draw a line in canvas
     */
    drawLine: function(a, b, colour) {
        // Draw line
        this.context.save();
        this.context.strokeStyle = colour || '#EFEFEF';
        this.context.beginPath();
        this.context.moveTo(a[0], a[1]);
        this.context.lineTo(b[0], b[1]);
        this.context.stroke();
        this.context.restore();
    }

});


