'use strict';

/*** Abstract View ***/

var AbstractView = function () {
};

_.extend(AbstractView.prototype, {
    _instantiateInterface: function (templateId, attachToElement) {
        var template = document.getElementById(templateId);
        this.hostElement = document.createElement('div');
        this.hostElement.innerHTML = template.innerHTML;
        attachToElement.appendChild(this.hostElement);
    }
});

/*** Activity Input Form View ***/

var activityFormView = function (container, model) {
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
            graphView.updateTable(dataPoint);
            //graphView.plotDataPoint(dataPoint);
            graphView.drawGraph();
        }.bind(this));

        this.model.addListener( function(event, date, dataPoint) {
            // TODO
        }.bind(this));
    },
    onSubmit: function() {
        this.inputSubmit.addEventListener('click', function(e) {
            var dataPoint = {};

            dataPoint['activity-id'] = this.activityTypeInput.getAttribute('data-activity-id');
            _.extend(dataPoint, this.getInputData(this.inputs));
            _.extend(dataPoint, this.getInputData(this.selects));

            console.log(dataPoint);
            this.model.addActivityDataPoint(dataPoint);
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
    this.COLOURS = ['black', 'red', 'blue', 'green', 'purple']

    this.container = document.getElementById(container);
    this.model = model;
    this.initialize();
}

_.extend(GraphView.prototype, AbstractView.prototype, {
    initialize: function() {
        this.canvas = document.getElementById('graph');
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.context.fillStyle = 'grey';
        this.context.fillRect(0, 0, this.width, this.height);

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

        var i = 0;

        // Plot each data point
        _.each(groupedData, function(dataPoints, index, list) {
            this.plotDataPoints(dataPoints, i);
            i++;
        }, this);
        this.plotDataPoints()

        // Scale graph
    },
    plotDataPoints: function(dataPoints, yIndex) {
        _.each(dataPoints, function(dataPoint) {
            var i = 0;
            _.each(dataPoint.activityDataDict, function(val, index) {
                this.context.fillStyle = this.COLOURS[i];
                this.context.fillRect( (yIndex + 1) * 20, val * 20, 5, 5);
                i++;
            }, this);
        }, this);

        // Draw line
        // context.strokeStyle = 'red';
        // context.moveTo(0, 0);
        // context.lineTo(width, height);
        // context.stroke();
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
