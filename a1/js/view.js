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
        this.inputForm = document.getElementById('input-form');
        this.inputs = this.inputForm.getElementsByTagName('input');
        this.initEvents();
    },
    initEvents: function() {
        this.initListeners();
        this.onSubmit();
    },
    initListeners: function() {
        this.model.addListener( function(event, date, dataPoint) {
            if (event === ACTIVITY_DATA_ADDED_EVENT) {

                // Remove 'no data' error message
                if (this.model.lastUpdated) {
                    var emptyWarning = document.getElementById('empty-warning');
                    emptyWarning.classList.add('hidden');
                    emptyWarning.classList.remove('hide-sibling');
                }

                this.setLastUpdated(date, dataPoint);
                graphView.displayGraph();
                this.resetForm();
                this.onSuccess();
            } else if (event === ACTIVITY_DATA_REMOVED_EVENT) {
                // TODO rerender graph?
                graphView.displayGraph();
            }
        }.bind(this) );
    },

    /**
     * Set last updated timestamp
     */
    setLastUpdated: function(date, dataPoint) {
        this.lastUpdated = date;
        document.getElementById('timestamp').innerHTML =
            'Last data entry was: '
            + date.toLocaleString()
            + ' - '
            + dataPoint.activityType;
    },

    /**
     * Reset form
     */
    resetForm: function() {
        _.each(this.inputs, function(input) { input.value = ''; });
    },

    /**
     * Fade in/out: success message
     */
     onSuccess: function() {
        var successMsg = document.getElementById('form-submit-msg');
        successMsg.style.opacity = 1;
        window.setTimeout(function() {
            successMsg.style.opacity = 0;
        }, 2000)
    },

    /**
     * Submit handler
     */
    onSubmit: function() {
        this.inputForm.addEventListener('submit', function(e) {

            // Stop submit event after utilizing HTML5 field validation
            e.preventDefault();

            // Create and add dataPoint to model
            var inputData = this.getInputData(this.inputs),
                healthDict = _.omit(inputData, ['time-spent', 'activity']),
                dataPoint = new ActivityData(
                    inputData['activity'],
                    healthDict,
                    inputData['time-spent']
                );

            console.log(dataPoint);
            this.model.addActivityDataPoint(dataPoint);

        }.bind(this));
    },

    /**
     * Serialize form data
     */
    getInputData: function(inputs) {
        var data = {};

        _.each(inputs, function(i) { data[i.getAttribute('id')] = i.value; }, this);
        return data;
    },
});

/*** Graph View ***/

var GraphView = function(container, model) {
    this._instantiateInterface('graph-view', container);
    this.container = document.getElementById(container);
    this.model = model;
    this.initialize();
}

_.extend(GraphView.prototype, AbstractView.prototype, {
    initialize: function() {
        this.ops = this.model.settings;
        this.canvas = document.getElementById('graph-scatter');
        this.context = this.canvas.getContext('2d');
        this.xaxis = document.getElementById('xaxis');
        this.tbody = document.getElementById('graph-table').getElementsByTagName('tbody')[0];

        this.initListeners();
        this.displayGraphLegend();
        this.setSelectGraphCheckbox();
        this.showSelectedGraph();
    },
    initListeners: function() {
        this.model.addListener( function(eventName, date, eventData) {
            if (eventName === GRAPH_SELECTED_EVENT) {
                this.showSelectedGraph();
            }
        }.bind(this) );
    },

    /**
     * Display selected graph
     */
    displayGraph: function() {
        switch ( this.model.getNameOfCurrentlySelectedGraph() ) {
            case 'scatter':
                this.drawGraph();
                break;
            case 'table':
                this.populateTable();
                break;
            default:
                this.drawGraph();
                this.populateTable();
        }
    },

    /**
     * Draw all graph components
     */
    drawGraph: function() {
        this.setGraphDimensions();
        this.drawGrid();
        this.drawAxesLines();

        // Plot all dataPoints and axes labels

        var xPos = 0;
        this.xaxis.innerHTML = '';

        _.each(activityModel.getGroupedData(), function(dataPoints, key, list) {
            this.plotGroupedPoints(dataPoints, xPos);
            this.drawXLabel(key, this.getX(xPos, this.ops.xInterval), this.canvas.height)
            xPos++;
        }, this);

        for (var j = 0; j <= this.ops.yMaxScale; j++) {
            this.drawYLabel(j, this.getX(0, -15), this.getY(j, -5) );
        }
    },

    /**
     * Calculate and set canvas width and height
     */
    setGraphDimensions: function() {
        var groupedData = activityModel.getGroupedData();

        // width = width of all intervals + padding + y-axis height
        this.canvas.width = ( _.size(groupedData) * this.ops.xInterval )
            + ( this.ops.padding * 2 )
            + this.ops.yAxisWidth;

        // height = width of all intervals + padding + x-axis width
        this.canvas.height = ( this.ops.yMaxScale * this.ops.yInterval )
            + ( this.ops.padding * 2 )
            + this.ops.xAxisHeight;
    },

    /**
     * Plot each group of dataPoints at xPos
     */
    plotGroupedPoints: function(dataPoints, xPos) {
        var w = 10,
            h = 10,
            dict;

        _.each(dataPoints, function(dataPoint) {
            var sKeyIndex = 0,
                // Only display selectedScatterKeys
                dict = _.pick(dataPoint.activityDataDict, this.model.selectedScatterKeys);

            _.each(dict, function(val, index) {
                // TODO just pass in index and vary colour/shape in drawPoint
                this.drawPoint(this.ops.colours[index], this.getX(xPos, this.ops.xInterval), this.getY(val, h), w, h);
                sKeyIndex++;
            }, this);
        }, this);

    },

    /**
     * Get x-coord
     */
    getX: function(val, width) {
        width = width || 0;

        var intervalCoord = val * this.ops.xInterval,
            leftOffset = this.ops.padding + this.ops.yAxisWidth + (width / 2);

        return intervalCoord + leftOffset;
    },

    /**
     * Get y-coord
     */
    getY: function(val, height) {
        height = height || 0;

        var intervalCoord = val * this.ops.yInterval,
            bottomOffset = this.ops.padding + this.ops.xAxisHeight + (height / 2);

        // Because y-axis increases downwards
        return this.canvas.height - intervalCoord - bottomOffset;
    },

    /**
     * Draw y-axis label using canvas
     */
    drawYLabel: function(label, x, y, colour, font) {
        this.context.textAlign = 'right';
        this.context.fillStyle = colour || 'black';
        this.context.font = font || '14px Montserrat';
        this.context.fillText(label, x, y);
    },

    /**
     * Draw x-axis label using absolute-positioned elements
     */
    drawXLabel: function(label, x, y, colour, font) {
        var elem = document.createElement('div');
        elem.style.top = y + 'px';
        elem.style.left = x + 'px';
        elem.innerHTML = label;
        this.xaxis.appendChild(elem);
    },

    /**
     * Draw a dataPoint
     */
    drawPoint: function(colour, x, y, xSize, ySize) {
        this.context.fillStyle = colour;
        this.context.fillRect( x, y, xSize, ySize);
    },

    /**
     * Draw graph grid
     */
    drawGrid: function(gridSize) {
        gridSize = gridSize || this.ops.gridSize;

        for (var y = 0; y <= this.canvas.height; y += gridSize) {
            this.drawLine( [0, y], [this.canvas.width, y] );
        }

        for (var x = 0; x <= this.canvas.width; x += gridSize) {
            this.drawLine( [x, 0], [x, this.canvas.height] );
        }
    },

    /**
     * Draw x and y axes
     */
    drawAxesLines: function() {
        var origin = [
            this.ops.padding + this.ops.yAxisWidth,
            this.canvas.height - this.ops.xAxisHeight - this.ops.padding
        ];

        // x-axis
        this.drawLine( origin, [ this.canvas.width, origin[1] ], 'black');

        // y-axis
        this.drawLine( origin, [ origin[0], 0 ], 'black');
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
    },

    /**
     * Toggle the selectedScatterKeys and redraw graph
     */
    toggleScatterKeys: function() {
        var inputs = document.getElementById('graph-scatter-options').getElementsByTagName('input'),
            newOptions = [];

        _.each(inputs, function(i) {
            if (i.checked) { newOptions.push(i.getAttribute('data-option')); }
        });

        this.model.selectScatterKeys(newOptions);
        this.drawGraph();
    },

    /**
     * Show graph legend
     */
    displayGraphLegend: function() {
        var inputs = document.getElementById('graph-scatter-options').getElementsByTagName('input'),
            div;

        _.each(inputs, function(input, i) {
            div = document.createElement('div');
            div.classList.add('graph-legend');
            div.style.backgroundColor = this.ops.colours[ input.getAttribute('data-option') ];
            input.parentNode.insertBefore(div, input);
        }, this);
    },

    /*** Table Graph ***/

    /**
     * Clear table and repopulate with current data
     */
    populateTable: function() {
        this.clearTable();

        var totalDuration;

        _.each(activityModel.getGroupedData(), function(dataPoints, index) {
            totalDuration = _.reduce(dataPoints, function(memo, dataPoint) {
                return memo + parseFloat(dataPoint.activityDurationInMinutes);
            }, 0);

            this.addTableRow(index, totalDuration);
        }, this);
    },

    /**
     * Clear tbody
     */
    clearTable: function() {
        this.tbody.innerHTML = '';
    },

    /**
     * Add row to table
     */
    addTableRow: function(name, time) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + name + '</td>'
            + '<td>' + time + '</td>';

        this.tbody.appendChild(tr);
    },

    /*** Toggle Selected Graph ***/

    setSelectedGraph: function() {
        var inputs = document.querySelectorAll('[data-option]'),
            checked = _.find(inputs, function(i) { return i.checked; }),
            selected = checked.getAttribute('data-option');

        this.model.selectGraph(selected);
    },

    setSelectGraphCheckbox: function() {
        var selected = this.model.selectedGraph,
            input = document.querySelectorAll('[data-option="' + selected + '"]')[0];

        input.checked = true;
    },

    showSelectedGraph: function() {
        var selected = this.model.selectedGraph;
        this.toggleGraph('[data-toggle^="graph-"]', '[data-toggle="graph-' + selected + '"]');
    },

    toggleGraph: function(all, selected) {
        var views = document.querySelectorAll(all),
            selectedViews = document.querySelectorAll(selected);

        _.each(views, function(view) {
            if ( _.contains(selectedViews, view) ) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });

        this.displayGraph();
    }
});

