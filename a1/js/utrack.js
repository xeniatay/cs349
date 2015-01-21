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

    // generateFakeData(activityModel, 1000);

    initEvents();

});

function initEvents() {
    initNav();
    initSliders();
    initSelectGraph();
    initGraphOptions();
}

function initNav() {
    var navLinks = document.getElementsByClassName('nav-link');
    _.each(navLinks, function(navLink) {
        navLink.addEventListener('click', function(e) {
            _.each(navLinks, function(navLink) {
                navLink.classList.remove('active');
            });

            // Toggle views
            var views = document.getElementsByClassName('view-container');
            _.each(views, function(view) {
                view.classList.add('hidden');
            }, this);

            var viewName = this.getAttribute('data-view'),
                currentView = document.getElementById(viewName + '-container'),
                activeNavLink = document.getElementById(viewName + '-nav');

            currentView.classList.remove('hidden');
            activeNavLink.classList.add('active');
        });
    });
}

function initSliders() {
    var rangeInputs = document.getElementsByClassName('input-range');
    _.each(rangeInputs, function(input) {
        input.nextElementSibling.innerHTML = input.value;

        input.addEventListener('input', function() {
            input.nextElementSibling.innerHTML = input.value;
        });
    });
}

function initSelectGraph() {
    var selectGraph = document.getElementById('graph-select-type'),
        selectGraphInputs = selectGraph.getElementsByTagName('input');

    _.each(selectGraphInputs, function(input) {
        input.addEventListener('change', function() {
            graphView.setSelectedGraph();
        });
    });
}

function initGraphOptions() {
    var graphOptions = document.getElementById('graph-scatter-options'),
        graphOptionsInputs = graphOptions.getElementsByTagName('input');

    _.each(graphOptionsInputs, function(input) {
        input.addEventListener('change', function() {
            graphView.toggleScatterKeys();
        });
    });
}
