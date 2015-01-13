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
        this.model.addListener(function(ACTIVITY_ACTIVITY_DATA_ADDED_EVENT, date, dataPoint) {
            graphView.updateTable(dataPoint);
            graphView.plotDataPoint(dataPoint);
        }.bind(this));

        this.model.addListener(function(ACTIVITY_ACTIVITY_DATA_ACTIVITY_DATA_REMOVED_EVENT, date, dataPoint) {
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

        this.initListeners();
    },
    initListeners: function() {
        this.model.addListener(function(GRAPH_SELECTED_EVENT, date, eventData) {
            // TODO
        });
    },
    plotDataPoint: function(dataPoint) {
        this.context.fillStyle = 'grey';
        this.context.fillRect(0, 0, this.width, this.height);

        _.each(dataPoint.activityDataDict, function(val, index, list) {
            this.context.fillStyle = 'black';
            this.context.fillRect(50, val * 20, 5, 5);
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

        tbody.appendChild(tr);
    }
});
