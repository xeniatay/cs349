'use strict';

// This should be your main point of entry for your app

window.addEventListener('load', function() {
    var modelModule = createModelModule(),
        viewModule = createViewModule(),
        appContainer = document.getElementById('app-container'),

        imageCollectionView = new viewModule.ImageCollectionView(),
        imageCollectionModel = new modelModule.ImageCollectionModel(),
        fileChooser = new viewModule.FileChooser();

    imageCollectionView.setImageCollectionModel(imageCollectionModel);

    appContainer.appendChild(fileChooser.getElement());
    appContainer.appendChild(imageCollectionView.getElement());

    // Demo that we can choose files and save to local storage. This can be replaced, later
    fileChooser.addListener(function(fileChooser, files, eventDate) {
        _.each(files, function(file) {
            var newDiv = document.createElement('div');
            var fileInfo = "File name: " + file.name + ", last modified: " + file.lastModifiedDate;
            newDiv.innerText = fileInfo;
            appContainer.appendChild(newDiv);
            imageCollectionModel.addImageModel( new modelModule.ImageModel('./images/' + file.name, file.lastModifiedDate, '', 0));
        });
        modelModule.storeImageCollectionModel(imageCollectionModel);
    });

    // Demo retrieval
    var storedImageCollectionModel = modelModule.loadImageCollectionModel();
    _.each(storedImageCollectionModel.getImageModels(), function(imageModel) {
        imageCollectionModel.addImageModel(imageModel);
    });
});