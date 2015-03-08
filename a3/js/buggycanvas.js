/*** Generic Canvas Template ***/

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
                'minHeight': 50
            },
            'axleNode': {
                'minWidth': 5,
                'maxWidth': 75,
                'minHeight': 10,
                'maxHeight': 10
            },
            'tireNode': {
                'minWidth': 5,
                'maxWidth': 30,
                'minHeight': 10,
                'maxHeight': 40,
            }
        };

        _.each(this.context.settings, function(settings) {
            settings.width = settings.maxWidth;
            settings.height = settings.maxHeight;
        });

        this.drawGrid(20);
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
        this.carNode = new sceneGraphModule.CarNode();

        this.axleNodes = {
            FL: new sceneGraphModule.AxleNode('FL'),
            FR: new sceneGraphModule.AxleNode('FR'),
            BL: new sceneGraphModule.AxleNode('BL'),
            BR: new sceneGraphModule.AxleNode('BR'),
        };

        this.tireNodes = {
            FL: new sceneGraphModule.TireNode('FL'),
            FR: new sceneGraphModule.TireNode('FR'),
            BL: new sceneGraphModule.TireNode('BL'),
            BR: new sceneGraphModule.TireNode('BR')
        };

        this.initTransforms()
        this.initNodeHierachy();
        this.drawBuggy();
    },

    initNodeHierachy: function() {

        // Build node hierachy
        _.each(this.axleNodes, function(node, key) {
            this.carNode.addChild(node);
            node.addChild( this.tireNodes[key] );
        }, this);

    },

    /**
     * Do transformations for buggy
     **/
    initTransforms: function() {
        var settings = this.context.settings.carNode,
            posX = (this.canvas.width - settings.width) / 2,
            posY = (this.canvas.height - settings.height) / 2,
            scaleX = 1,
            scaleY = 1,
            carTransform = new AffineTransform(scaleX, 0, 0, scaleY, posX, posY);

        this.carNode.initGraphNode(carTransform, 'carNode');

        _.each(this.axleNodes, function(nodes) {
            nodes.initGraphNode(carTransform, 'axleNode');
        });
    },

    /**
     * Draw buggy aka car
     */
    drawBuggy: function() {
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

