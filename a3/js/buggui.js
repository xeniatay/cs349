'use strict';

// This should be your main point of entry for your app

var sceneGraphModule;

window.addEventListener('load', function() {

    sceneGraphModule = createSceneGraphModule();

    var appContainer = document.getElementById('app-container');
    var buggyCanvas = new BuggyCanvas();

});