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
    activityView = new activityFormView('activity-form-container', activityModel);
    graphView = new GraphView('graph-container', graphModel);

    generateFakeData(activityModel, 1);

    initEvents();

});

function initEvents() {
    var navLinks = document.getElementsByClassName('nav-link');

    _.each(navLinks, function(navLink) {
        navLink.addEventListener('click', function(e) {
            // Toggle views

            var views = document.getElementsByClassName('view-container');
            _.each(views, function(view) {
                view.classList.add('hidden');
            });

            var viewName = this.getAttribute('data-view'),
                currentView = document.getElementById(viewName + '-container');

            currentView.classList.remove('hidden');
        });
    });
}
