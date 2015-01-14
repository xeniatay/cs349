'use strict';

/*** Abstract View ***/

var AbstractView = function () {
};

_.extend(AbstractView.prototype, {
    _instantiateInterface: function (templateId, containerId) {
        var template = document.getElementById(templateId),
            containerElem = document.getElementById(containerId);
        this.hostElement = document.createElement('div');
        this.hostElement.innerHTML = template.innerHTML;
        containerElem.appendChild(this.hostElement);
    }
});

/*** Activity Input Form View ***/

var activityFormView = function (container, model) {
    this._instantiateInterface('activity-form-view', container);
    this.container = document.getElementById(container);
    this.model = model;
    this.initialize();
};

_.extend(activityFormView.prototype, AbstractView.prototype, {
    initialize: function() {
        this.inputSubmit = document.getElementById('input-submit');
        this.inputForm = document.getElementById('input-form');
        this.inputs = this.inputForm.getElementsByTagName('input');
        this.selects = this.inputForm.getElementsByTagName('select');
        this.activityTypeInput = document.getElementById('activity');

        this.initEvents();
    },
    initEvents: function() {
        this.initListeners();
        this.onSubmit();
    },
    initListeners: function() {
        this.model.addListener( function(event, date, dataPoint) {
            // if ADD_EVENT
            this.lastUpdated = date;
            document.getElementById('timestamp').innerHTML = date;
            // wipe form

            // else REMOVE_EVENT
            // idk do what

            // this shouldn't be necessary
            graphView.updateTable(dataPoint);
            graphView.drawGraph();
        }.bind(this) );
    },
    onSubmit: function() {
        this.inputSubmit.addEventListener('click', function(e) {
            var inputData = this.getInputData(this.inputs),
                healthDict = _.omit(inputData, 'time-spent');

            var dataPoint = new ActivityData(
                this.activityTypeInput.value,
                healthDict,
                inputData['time-spent']
            );

            console.log(dataPoint);
            activityModel.addActivityDataPoint(dataPoint);
        }.bind(this));
    },
    getInputData: function(inputs) {
        var dataPoint = {};
        _.each(inputs, function(input) {
            // TODO validate input
            dataPoint[input.getAttribute('id')] = input.value;
        });
        return dataPoint;
    },
});

/*** Graph View ***/

var GraphView = function(container, model) {
    this._instantiateInterface('graph-view', container);

    this.COLOURS = ['black', 'red', 'blue', 'green', 'purple']
    this.container = document.getElementById(container);
    this.model = model;
    this.initialize();
}

_.extend(GraphView.prototype, AbstractView.prototype, {
    initialize: function() {
        this.canvas = document.getElementById('graph');
        this.context = this.canvas.getContext('2d');
        this.scale = 2;
        this.padding = 20;
        this.yAxisWidth = 20;
        this.xAxisHeight = 50;
        this.yMaxScale = 10;
        this.xInterval = 50;
        this.yInterval = 20;

        // Scale graph
        this.context.scale(this.scale, this.scale);

        this.initListeners();
    },
    initListeners: function() {
        this.model.addListener(function(GRAPH_SELECTED_EVENT, date, eventData) {
            // TODO
        });
    },
    drawGraph: function() {
        // Get .uniq of different activities - each has an id, enum?
        var groupedData = _.groupBy(activityModel.dataPoints, function(dataPoint) {
            return dataPoint.activityType;
        });


        // canvas width = width of all intervals + padding + y-axis height
        this.canvas.width = ( _.size(groupedData) * this.xInterval )
            + ( this.padding * 2 )
            + this.yAxisWidth;

        // canvas height = width of all intervals + padding + x-axis width
        this.canvas.height = ( this.yMaxScale * this.yInterval )
            + ( this.padding * 2 )
            + this.xAxisHeight;

        // Fill graph
        // this.context.fillStyle = 'grey';
        //this.context.fillRect(0, 0, this.canvas.width * this.scale, this.canvas.height * this.scale);

        // this.drawGrid(20);
        this.drawAxes();

        // Plot each data point
        var i = 0;

        _.each(groupedData, function(dataPoints, index, list) {
            this.plotDataPoints(dataPoints, i);
            this.drawLabel('x', index, this.getX(i, this.xInterval), 280)
            i++;
        }, this);
        this.plotDataPoints()

        for (var j = 0; j < 11; j++) {
            this.drawLabel( 'y', j, this.getX(0, -15), this.getY(j, -5) );
        }

    },
    plotDataPoints: function(dataPoints, xIndex) {
        var w = 5,
            h = 5;

        _.each(dataPoints, function(dataPoint) {
            var i = 0;
            _.each(dataPoint.activityDataDict, function(val, index) {
                this.drawPoint(this.COLOURS[i], this.getX(xIndex, this.xInterval), this.getY(val, h), w, h);
                i++;
            }, this);
        }, this);

    },
    getX: function(val, width) {
        width = width || 0;

        var intervalCoord = val * this.xInterval,
            leftOffset = this.padding + this.yAxisWidth + (width / 2);

        return intervalCoord + leftOffset;
    },
    getY: function(val, height) {
        height = height || 0;

        var intervalCoord = val * this.yInterval,
            bottomOffset = this.padding + this.xAxisHeight + (height / 2);

        // Because y-axis increases downwards
        return this.canvas.height - intervalCoord - bottomOffset;
    },
    drawLabel: function(axis, label, x, y, colour, font) {

        if (axis === 'x') {
            // Store existing context
            this.context.save();

            // Rotate context for vertical x-axis labels
            this.context.translate(x, y);
            this.context.rotate(Math.PI * 48/31);
            this.context.translate(-x, -y);
            this.context.textAlign = 'start';
        } else if (axis === 'y') {
            this.context.textAlign = 'end';
        }

        this.context.fillStyle = colour || 'black';
        this.context.font = font || '10px Helvetica';
        this.context.fillText(label, x, y);

        // Revert context for vertical x-axis labels
        if (axis === 'x') {
            this.context.restore();
        }
    },
    drawPoint: function(colour, x, y, xSize, ySize) {
        this.context.fillStyle = colour;
        this.context.fillRect( x, y, xSize, ySize);
    },
    drawGrid: function(gridSize) {
        gridSize = gridSize || 10;

        for (var y = 0; y <= this.canvas.height; y += gridSize) {
            this.drawLine( [0, y], [this.canvas.width, y] );
        }

        for (var x = 0; x <= this.canvas.width; x += gridSize) {
            this.drawLine( [x, 0], [x, this.canvas.height] );
        }
    },
    drawAxes: function() {
        var origin = [
            this.padding + this.yAxisWidth,
            this.canvas.height - this.xAxisHeight - this.padding
        ];

        // x-axis
        this.drawLine( origin, [ this.canvas.width, origin[1] ], 'black');

        // y-axis
        this.drawLine( origin, [ origin[0], 0 ], 'black');


    },
    drawLine: function(a, b, colour) {
        // Draw line
        this.context.save();
        this.context.strokeStyle = colour || '#EFEFEF';
        this.context.beginPath();
        this.context.moveTo(a[0], a[1]);
        this.context.lineTo(b[0], b[1]);
        this.context.stroke();
        this.context.restore();
    },
    updateTable: function(dataPoint) {
        var tbody = document.getElementById('analysis-table').getElementsByTagName('tbody')[0],
            tr = document.createElement('tr');

        var td = document.createElement('td');
        td.innerHTML = dataPoint.activityType;
        tr.appendChild(td);

        _.each(dataPoint.activityDataDict, function(val, index) {
            var td = document.createElement('td');
            td.innerHTML = val;
            tr.appendChild(td);
        }, this);

        td = document.createElement('td');
        td.innerHTML = dataPoint.activityDurationInMinutes;
        tr.appendChild(td);

        tbody.appendChild(tr);
    }
});
