'use strict';

var ACTIVITY_DATA_ADDED_EVENT = 'ACTIVITY_DATA_ADDED_EVENT';
var ACTIVITY_DATA_REMOVED_EVENT = 'ACTIVITY_DATA_REMOVED_EVENT';

var GRAPH_SELECTED_EVENT = 'GRAPH_SELECTED_EVENT';

/**
 * Represents a single activity data point.
 * @param activityType The type of activity. A string
 * @param healthMetricsDict A dictionary of different health metrics. The key is the
 * health data type (e.g., energy level, stress level, etc.), while the value is
 * the value the user gave to that activity.
 * @param activityDurationInMinutes A number
 * @constructor
 */
var ActivityData = function(activityType, healthMetricsDict, activityDurationInMinutes) {
    this.activityType = activityType;
    this.activityDataDict = healthMetricsDict;
    this.activityDurationInMinutes = activityDurationInMinutes
};

/**
 * An object which tracks all of the data
 * @constructor
 */
var ActivityStoreModel = function() {
    this.dataPoints = [];
    this.listeners = [];
};

// _ is the Underscore library
// This extends the JavaScript prototype with additional methods
// This is a common idiom for defining JavaScript classes
_.extend(ActivityStoreModel.prototype, {

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventTime, activityData) where eventType is a string indicating
     * the event type (one of ACTIVITY_DATA_ADDED_EVENT or ACTIVITY_DATA_REMOVED_EVENT), and
     * activityData the ActivityData added or removed.
     */
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

    /**
     * Should add the given data point, and alert listeners that a new data point has
     * been added.
     * @param activityDataPoint
     */
    addActivityDataPoint: function(dataPoint) {
        this.dataPoints.push(dataPoint);
        this.lastUpdated = new Date();

        // Use underscore to iterate over all listeners, calling each in turn
        _.each(this.listeners, function (listener_fn) {
            listener_fn(ACTIVITY_DATA_ADDED_EVENT, this.lastUpdated, dataPoint);
        }, this);
    },

    /**
     * Should remove the given data point (if it exists), and alert listeners that
     * it was removed. It should not alert listeners if that data point did not
     * exist in the data store
     * @param activityDataPoint
     */
    removeActivityDataPoint: function(dataPoint) {
        this.lastUpdated = new Date();

        this.dataPoints = _.reject(this.dataPoints, function(point) {
            if ( _.isEqual(point, dataPoint) ) {
                return true;
            }
        }, this);

        // Use underscore to iterate over all listeners, calling each in turn
        _.each(this.listeners, function (listener_fn) {
            listener_fn(ACTIVITY_DATA_REMOVED_EVENT, this.lastUpdated, dataPoint);
        }, this);
    },

    /**
     * Should return an array of all activity data points
     */
    getActivityDataPoints: function() {
        return this.dataPoints;
    },

    /**
     * Returns list of dataPoints, grouped by activityType
     */
    getGroupedData: function() {
        return _.groupBy(this.dataPoints, function(dataPoint) {
            return dataPoint.activityType;
        });
    },
});

/**
 * The GraphModel tracks what the currently selected graph is.
 * You should structure your architecture so that when the user chooses
 * a new graph, the event handling code for choosing that graph merely
 * sets the new graph here, in the GraphModel. The graph handling code
 * should then update to show the selected graph, along with any components
 * necessary to configure that graph.
 * @constructor
 */
var GraphModel = function() {
    this.settings = {
        'scale': 1.5,
        'padding': 20,
        'yMaxScale': 6,
        'gridSize': 10,
        'graphList': ['table', 'scatter'],
        'scatterKeys': ['stressLevel', 'energyLevel', 'happinessLevel'],
        'colours': { // orange, purple, green
            'stressLevel': '#FF8C00',
            'energyLevel': '#911146',
            'happinessLevel': '#04756F'
        }
    }

    // Set scaleable settings
    var scale = this.settings['scale'];
    _.extend(this.settings, {
        'yAxisWidth': 20 * scale,
        'xAxisHeight': 60 * scale,
        'xInterval': 50 * scale,
        'yInterval': 20 * scale
    });

    this.listeners = [];

    // Set defaults
    this.selectedGraph = 'table';
    this.selectedScatterKeys = this.settings.scatterKeys;
};

_.extend(GraphModel.prototype, {

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventTime, eventData) where eventType is a string indicating
     * the event type (specifically, GRAPH_SELECTED_EVENT),
     * and eventData indicates the name of the new graph.
     */
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

    /**
     * Returns a list of graphs (strings) that can be selected by the user
     */
    getAvailableGraphNames: function() {
        return this.settings.graphList;
    },

    /**
     * Should return the name of the currently selected graph. There should
     * *always* be one graph that is currently available.
     */
    getNameOfCurrentlySelectedGraph: function() {
        return this.selectedGraph;
    },

    /**
     * Changes the currently selected graph to the graph name given. Should
     * broadcast an event to all listeners that the graph changed.
     * @param graphName
     */
    selectGraph: function(graphName) {
        if (graphName === this.selectedGraph || (this.settings.graphList.indexOf(graphName) === -1) )  {
            return;
        }

        this.selectedGraph = graphName;
        this.lastUpdated = new Date();

        _.each(this.listeners, function(listener_fn) {
            listener_fn(GRAPH_SELECTED_EVENT, this.lastUpdated, this.selectedGraph);
        }, this);
    },

    selectScatterKeys: function(scatterKeys) {
        this.selectedScatterKeys = scatterKeys;
    }

});

/**
 * Will generate a number of random data points and add them to the model provided.
 * If numDataPointsToGenerate is not provided, will generate and add 100 data points.
 * @param activityModel The model to add data to
 * @param numDataPointsToGenerate The number of points to generate.
 *
 * Example:
 *
 * generateFakeData(new ActivityStoreModel(), 10);
 */
function generateFakeData(activityModel, numDataPointsToGenerate) {
    var fakeActivities = [];
    _.times(
        5,
        function() {
            fakeActivities.push("Activity " + (fakeActivities.length+1));
        }
    );
    numDataPointsToGenerate = (!_.isNumber(numDataPointsToGenerate) || numDataPointsToGenerate < 0) ? 100 : numDataPointsToGenerate;
    _.times(
        numDataPointsToGenerate,
        function() {
            var activityDataPoint = new ActivityData(
                fakeActivities[_.random(fakeActivities.length-1)],
                {
                    energyLevel: _.random(5),
                    stressLevel: _.random(5),
                    happinessLevel: _.random(5),
                },
                _.random(60)
            );
            activityModel.addActivityDataPoint(activityDataPoint);
        }
    );
}
