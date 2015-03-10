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
                'bufferFactor': 10,
                'fillStyle': 'purple'
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
                'minHeight': 10,
                'maxHeight': 20,
                'distFromBumper': this.carS.height / this.carS.bufferFactor
            }
        });

        this.axleS = this.context.settings.axleNode;
        this.axleS.width = (this.axleS.maxWidth * 2) + this.carS.width;
        this.axleS.height = this.axleS.maxHeight;

        _.extend(this.context.settings, {
            'tireNode': {
                'minWidth': 5,
                'maxWidth': 30,
                'minHeight': 10,
                'maxHeight': 40,
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
        this.carNode = new sceneGraphModule.CarNode();

        this.axleNodes = {
            F: new sceneGraphModule.AxleNode(),
            B: new sceneGraphModule.AxleNode()
        }

        this.tireNodes = {
            FL: new sceneGraphModule.TireNode(),
            FR: new sceneGraphModule.TireNode(),
            BL: new sceneGraphModule.TireNode(),
            BR: new sceneGraphModule.TireNode()
        };

        this.initNodes()
        this.initNodeHierachy();
        this.drawBuggy();
    },

    initNodeHierachy: function() {

        this.rootNode.addChild(this.carNode);

        // Build node hierachy
        _.each(this.axleNodes, function(node) {
            this.carNode.addChild(node);
        }, this);

        this.axleNodes.F.addChild(this.tireNodes.FL);
        this.axleNodes.F.addChild(this.tireNodes.FR);
        this.axleNodes.B.addChild(this.tireNodes.BL);
        this.axleNodes.B.addChild(this.tireNodes.BR);

    },

    /**
     * Do transformations for buggy
     **/
    initNodes: function() {
        this.initRootNodes();
        this.initCarNodes();
        this.initAxleNodes();
        this.initTireNodes();
    },

    initRootNodes: function() {
        this.rootNode.initGraphNode(new AffineTransform(1, 0, 0, 1, 0, 0), 'rootNode');
    },

    initCarNodes: function() {
        var posX = (this.canvas.width - this.carS.width) / 2,
            posY = (this.canvas.height - this.carS.height) / 2,
            scaleX = 1,
            scaleY = 1,
            transform = new AffineTransform(scaleX, 0, 0, scaleY, posX, posY);

        this.carNode.initGraphNode(transform, 'carNode');
    },

    initAxleNodes: function() {
        var scaleX = 1,
            scaleY = 1,
            PosX = - (this.axleS.width - this.carS.width) / 2,
            PosFY = this.axleS.distFromBumper,
            PosBY = this.carS.height - this.axleS.distFromBumper - this.axleS.height,
            transformF = new AffineTransform(scaleX, 0, 0, scaleY, PosX, PosFY),
            transformB = new AffineTransform(scaleX, 0, 0, scaleY, PosX, PosBY);

        this.axleNodes.F.initGraphNode(transformF, 'axleNodeF');
        this.axleNodes.B.initGraphNode(transformB, 'axleNodeB');
    },

    initTireNodes: function() {
        var scaleX = 1,
            scaleY = 1,
            PosRX = - this.tireS.width / 2,
            PosLX = this.axleS.width - (this.tireS.width / 2),
            PosY = -(this.tireS.height - this.axleS.height) / 2,
            transformR = new AffineTransform(scaleX, 0, 0, scaleY, PosRX, PosY),
            transformL = new AffineTransform(scaleX, 0, 0, scaleY, PosLX, PosY);

        this.tireNodes.FR.initGraphNode(transformR, 'tireNodeFR');
        this.tireNodes.FL.initGraphNode(transformL, 'tireNodeFL');
        this.tireNodes.BR.initGraphNode(transformR, 'tireNodeBR');
        this.tireNodes.BL.initGraphNode(transformL, 'tireNodeBL');
    },

    /*
     * Offsets the node's starting context by the coordinates provided
     */
    translateContext: function(offset, node) {
        node.startPositionTransform.translate(offset.x, offset.y);
    },

    scaleContext: function(offset, node) {
        var scaleX = 1 + ( offset.x / this.canvas.width),
            // scaleY = 1 + ( (offset.y * 2) / this.canvas.height);
            scaleY = 1;

            console.debug(scaleX, scaleY);

        this.objectTransform = node.objectTransform.scale(scaleX, scaleY);
    },

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

        this.drawGrid(20);
        this.carNode.render(this.context);
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


