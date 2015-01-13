'use strict';

/*
Put any interaction code here
 */

// You should wire up all of your event handling code here, as well as any
// code that initiates calls to manipulate the DOM (as opposed to responding
// to events)

// Make global :X (or build a better abstraction to allow referencing graphView from activityView...)
var activityModel,
    activityView,
    graphModel,
    graphView;

window.addEventListener('load', function() {

    // Initialize models
    activityModel = new ActivityStoreModel();
    graphModel = new GraphModel();

    // Initialize views
    graphView = new GraphView('graph-container', graphModel);
    activityView = new activityFormView('activity-input-container', activityModel);

    generateFakeData(activityModel, 20);

});

