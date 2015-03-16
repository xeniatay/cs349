'use strict';

/**
 * A function that creates and returns the scene graph classes and constants.
 */
function createSceneGraphModule() {

    // Part names. Use these to name your different nodes
    var CAR_PART = 'CAR_PART';
    var FRONT_AXLE_PART = 'FRONT_AXLE_PART';
    var BACK_AXLE_PART = 'BACK_AXLE_PART';
    var FRONT_LEFT_TIRE_PART = 'FRONT_LEFT_TIRE_PART';
    var FRONT_RIGHT_TIRE_PART = 'FRONT_RIGHT_TIRE_PART';
    var BACK_LEFT_TIRE_PART = 'BACK_LEFT_TIRE_PART';
    var BACK_RIGHT_TIRE_PART = 'BACK_RIGHT_TIRE_PART';

    // Car sub parts
    var FRONT_BUMPER = 'FRONT_BUMPER';
    var SIDE_BUMPER = 'SIDE_BUMPER';
    var CAR_LEFT = 'CAR_LEFT';
    var CAR_RIGHT = 'CAR_RIGHT';
    var CAR_FRONT = 'CAR_FRONT';
    var CAR_BACK = 'CAR_BACK';

    var GraphNode = function() {
        this.pio = false;
        this.pioLabels = [];
    };

    _.extend(GraphNode.prototype, {

        /**
         * Subclasses should call this function to initialize the object.
         *
         * @param startPositionTransform The transform that should be applied prior
         * to performing any rendering, so that the component can render in its own,
         * local, object-centric coordinate system.
         * @param nodeName The name of the node. Useful for debugging, but also used to uniquely identify each node
         */
        initGraphNode: function(startPositionTransform, nodeName) {

            this.nodeName = nodeName;

            // The transform that will position this object, relative
            // to its parent
            this.startPositionTransform = startPositionTransform;

            // Any additional transforms of this object after the previous transform
            // has been applied
            this.objectTransform = new AffineTransform();
            this.objectTransformForHitDetection = new AffineTransform();

            this.rotationAngle = 0;

            // Any child nodes of this node
            this.children = {};

            // Add any other properties you need, here
        },

        applyTransform: function(matrix) {

            if (!this.context) {
                console.error('Error: no canvas context');
                return;
            }

            this.context.transform(
                matrix.getScaleX(),
                matrix.getShearX(),
                matrix.getShearY(),
                matrix.getScaleY(),
                matrix.getTranslateX(),
                matrix.getTranslateY()
            );

        },

        getPointInverse: function(point, nodeName) {
            nodeName = nodeName ? nodeName : this.nodeName;
            var matrix = this.startPositionTransform.clone().concatenate(this.objectTransformForHitDetection),
                inverse = matrix.createInverse();

            return inverse.transformPoint(point);
        },

        addChild: function(graphNode) {
            this.children[graphNode.nodeName] = graphNode;
        },

        /**
         * Swaps a graph node with a new graph node.
         * @param nodeName The name of the graph node
         * @param newNode The new graph node
         */
        replaceGraphNode: function(nodeName, newNode) {
            if (nodeName in this.children) {
                this.children[nodeName] = newNode;
            } else {
                _.each(
                    _.values(this.children),
                    function(child) {
                        child.replaceGraphNode(nodeName, newNode);
                    }
                );
            }
        },

        /**
         * Render this node using the graphics context provided.
         * Prior to doing any painting, the start_position_transform must be
         * applied, so the component can render itself in its local, object-centric
         * coordinate system. See the assignment specs for more details.
         *
         * This method should also call each child's render method.
         * @param context
         */
        render: function(context) {
            // TODO: Should be overridden by subclass
            this.context = context;
            this.context.save();

            context.fillStyle = 'blue';
            context.fillRect(0, 0, 5, 5);

            _.each(this.children, function(node) {
                node.render(context);
            });

            this.context.restore();
        },

        /**
         * Convert point to inverse and return results of hit test.
         * Worst method name ever. But pointInObject() can't be changed _and_
         * needs to take in an inversed point. ಠ_ಠ
         */
        isInversePointInObject: function(point) {
            return this.pointInObject( this.getPointInverse(point) );
        },

        /**
         * Determines whether a point lies within this object.
         * The point must be transformed correctly prior to this method.
         */
        pointInObject: function(point) {
            var PIO = false;

            if ( (0 < point.x) && (point.x <= this.settings.width)
                && (0 < point.y) && (point.y <= this.settings.height) )  {
                PIO = true;
            }

            _.each(this.children, function(node) {
                PIO = PIO || node.pointInObject( node.getPointInverse(point) );
            });

            return PIO;
        },

        /**
         * Returns NodeName of deepest node that returns true for hit detection
         */
        getPIONodeName: function(point) {
            var nodeName = 'NONE',
                invPoint = this.getPointInverse(point);

            if ( (0 < invPoint.x) && (invPoint.x <= this.settings.width)
                && (0 < invPoint.y) && (invPoint.y <= this.settings.height) )  {
                nodeName = this.nodeName;
            }

            _.each(this.children, function(node) {
                if ( node.pointInObject( node.getPointInverse(invPoint) ) ) {
                    nodeName = node.getPIONodeName( invPoint ); // UGH WTF
                }
            });

            return nodeName;
        },

        /*
         * Based on coordinates of point, return the car sub part currently selected
         */
        getCarMode: function(point) {
            var invPoint = this.getPointInverse(point),
                yBuffer = this.settings.height / this.settings.bufferFactor,
                xBuffer = this.settings.width / this.settings.bufferFactor,
                carMode = 'NONE',
                newMode;

            // Major haxxxx ewwwwwwwwwww
            if (this.nodeName === cursor.activeNode) {
                if (cursor.activeNode === CAR_PART) {
                    if (invPoint.y < yBuffer) {
                        carMode = 'SCALE_Y_POS';
                    } else if (invPoint.y > (this.settings.height - yBuffer) ) {
                        carMode = 'SCALE_Y_NEG';
                    } else if (invPoint.x < xBuffer) {
                        carMode = 'SCALE_X_POS';
                    } else if (invPoint.x > this.settings.width - xBuffer) {
                        carMode = 'SCALE_X_NEG';
                    } else if ( (invPoint.y < this.settings.height / 4) ||
                                (invPoint.y > this.settings.height * 3/4) ) {
                        carMode = 'ROTATE';
                    } else if ( (0 <= invPoint.y) && (invPoint.y <= this.settings.height)
                        && (0 <= invPoint.x) && (invPoint.x <= this.settings.width) ) {
                        carMode = 'TRANSLATE';
                    } else {
                        carMode = 'NONE';
                    }
                } else if ( cursor.activeNode.match(/TIRE_PART/) ) {
                    if ( (0 < invPoint.y) && (invPoint.y < yBuffer) ) {
                        carMode = 'ROTATE_TIRE';
                    } else if ( (invPoint.y > (this.settings.height - yBuffer) )
                           && (invPoint.y <= this.settings.height) ) {
                        carMode = 'ROTATE_TIRE';
                    } else if ( (0 <= invPoint.y) && (invPoint.y <= this.settings.height)
                           && (0 <= invPoint.x) && (invPoint.x <= this.settings.width) ) {
                        carMode = 'SCALE_X_AXLE';
                    } else {
                        carMode = 'NONE';
                    }

                    return carMode;
                }
            }

            _.each(this.children, function(node) {
                newMode = node.getCarMode(invPoint);

                if ( !(newMode === 'NONE') ) {
                    carMode = newMode;
                }
            });

            return carMode;
        }

    });

    var CarNode = function() {
        this.initGraphNode(new AffineTransform(), CAR_PART)
    };

    _.extend(CarNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            var windowOffsetX, windowOffsetY, windowHeight, windowWidth;

            this.context = context;
            this.settings = this.context.settings.carNode;

            this.context.save();

            this.applyTransform( this.startPositionTransform.clone() );

            // objectTransform needs to be applied at the center of node's rendered element
            this.context.translate(this.settings.width / 2, this.settings.height / 2);
            this.applyTransform(this.objectTransform);
            this.context.translate( - this.settings.width / 2, - this.settings.height / 2 );

            context.fillStyle = this.settings.fillStyle;
            context.fillRect(0, 0, this.settings.width, this.settings.height);

            windowOffsetX = (this.settings.width / this.settings.bufferFactor);
            windowOffsetY = (this.settings.height / this.settings.bufferFactor);
            windowWidth = this.settings.width - (windowOffsetX * 2);
            windowHeight = ( this.settings.height - (windowOffsetY * 4) ) / 2;

            windowWidth = Math.max(this.settings.minWindowWidth, windowWidth);
            windowHeight = Math.max(this.settings.minWindowHeight, windowHeight);
            windowOffsetX = Math.max(this.settings.minWindowOffsetX, windowOffsetX);
            windowOffsetY = Math.max(this.settings.minWindowOffsetY, windowOffsetY);

            context.fillStyle = 'black';
            context.fillRect( windowOffsetX, windowOffsetY, windowWidth, windowHeight );

            context.fillStyle = 'white';
            context.fillRect(
                windowOffsetX + (windowWidth / 10),
                windowOffsetY + (windowHeight / 8),
                windowWidth - (windowWidth / 5),
                windowHeight - (windowHeight / 4)
            );

            context.fillStyle = 'white';
            context.fillRect( windowOffsetX, this.settings.height - windowOffsetY - windowHeight, windowWidth, windowHeight );

            _.each(this.children, function(node) {
                node.render(context);
            });

            this.context.restore();
        }


    });

    /**
     * @param axlePartName Which axle this node represents
     * @constructor
     */
    var AxleNode = function(axlePartName) {
        this.initGraphNode(new AffineTransform(), axlePartName);
        // TODO
    };

    _.extend(AxleNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            this.context = context;
            this.context.save();
            this.settings = this.context.settings.axleNode;

            this.applyTransform(this.startPositionTransform);

            // objectTransform needs to be applied at the center of node's rendered element
            this.context.translate(this.settings.width / 2, this.settings.height / 2);
            this.applyTransform(this.objectTransform);
            this.context.translate( - this.settings.width / 2, - this.settings.height / 2 );

            context.globalCompositeOperation = 'destination-over';
            context.fillStyle = 'gray';
            context.fillRect(0, 0, this.settings.totalWidth, this.settings.height);

            _.each(this.children, function(node) {
                node.render(context);
            });

            this.context.restore();
        },

        // // Overrides parent method
        // pointInObject: function(point) {
        //     // User can't select axles
        //     return false;
        // }
    });

    /**
     * @param tirePartName Which tire this node represents
     * @constructor
     */
    var TireNode = function(tirePartName) {
        this.initGraphNode(new AffineTransform(), tirePartName);
        // TODO
    };

    _.extend(TireNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            this.context = context;
            this.settings = this.context.settings.tireNode;

            this.context.save();

            this.applyTransform(this.startPositionTransform);

            // objectTransform needs to be applied at the center of node's rendered element
            this.context.translate(this.settings.width / 2, this.settings.height / 2);
            this.applyTransform(this.objectTransform);
            this.context.translate( - this.settings.width / 2, - this.settings.height / 2 );

            context.globalCompositeOperation = 'source-over';
            context.fillStyle = this.settings.fillStyle;
            context.fillRect(0, 0, this.settings.width, this.settings.height);

            _.each(this.children, function(node) {
                node.render(context);
            });

            this.context.restore();
        }

        // // Overrides parent method
        // pointInObject: function(point) {
        //     // TODO
        // }
    });

    // Return an object containing all of our classes and constants
    return {
        GraphNode: GraphNode,
        CarNode: CarNode,
        AxleNode: AxleNode,
        TireNode: TireNode,
        CAR_PART: CAR_PART,
        FRONT_AXLE_PART: FRONT_AXLE_PART,
        BACK_AXLE_PART: BACK_AXLE_PART,
        FRONT_LEFT_TIRE_PART: FRONT_LEFT_TIRE_PART,
        FRONT_RIGHT_TIRE_PART: FRONT_RIGHT_TIRE_PART,
        BACK_LEFT_TIRE_PART: BACK_LEFT_TIRE_PART,
        BACK_RIGHT_TIRE_PART: BACK_RIGHT_TIRE_PART
    };
}