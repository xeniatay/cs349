'use strict';

// This should be your main point of entry for your app

window.addEventListener('load', function() {
    var modelModule = createModelModule(),
        viewModule = createViewModule(),
        appContainer = document.getElementById('app-container'),

        imageCollectionView = new viewModule.ImageCollectionView(),
        imageCollectionModel = new modelModule.ImageCollectionModel(),

        toolbarView = new viewModule.Toolbar(),
        fileChooser = new viewModule.FileChooser();

    imageCollectionView.setImageCollectionModel(imageCollectionModel);

    appContainer.appendChild(toolbarView.getElement());
    appContainer.appendChild(fileChooser.getElement());
    appContainer.appendChild(imageCollectionView.getElement());

    // Retrieve all images from Local Storage
    var storedImageCollectionModel = modelModule.loadImageCollectionModel();
    _.each(storedImageCollectionModel.getImageModels(), function(imageModel) {
        imageCollectionModel.addImageModel(imageModel);
    });

    // Initialize all event listeners
    initImageRatingListeners();
    initRatingFilter();
    initViewButtons();
    initToolbarListeners();

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


    /*** Functions ***/

    function initImageRatingListeners() {
        var ratings = appContainer.getElementsByClassName('img-rating');
        _.each(ratings, function(rating) {
            rating.addEventListener('click', function(e) {
                var newRating = e.target.getAttribute('data-rating'),
                    id = this.parentNode.parentNode.getAttribute('data-id'),
                    model = imageCollectionModel.getImageModel(id);

                model.setRating(newRating);
            }, this);

        });
    }

    function initRatingFilter() {
        var filters = appContainer.getElementsByClassName('filter-rating');
        _.each(filters, function(filter) {
            filter.addEventListener('click', function(e) {
                var rating = e.target.getAttribute('data-rating'),
                    images = appContainer.querySelectorAll('.img-container'),
                    selector = '.img-container:not([data-img-container-rating="' + rating + '"])',
                    notSelected = appContainer.querySelectorAll(selector);

                toolbarView.setRatingFilter(rating);

                _.each(images, function(img) { img.classList.remove('hide'); });

                if (rating != 0) {
                    _.each(notSelected, function(img) { img.classList.add('hide'); });
                }
            });
        }, this);
    }

    function initViewButtons() {
        var btns = appContainer.querySelectorAll('.layout-btn');
        _.each(btns, function(btn) {
            btn.addEventListener('click', function(e) {
                var newView = this.getAttribute('data-viewtype');
                toolbarView.setToView(newView);
            });
        }, this);
    }

    function initToolbarListeners() {
        imageCollectionView.setToView(toolbarView.getCurrentView());

        toolbarView.addListener( function(toolbar, event, date) {
            if (event === 'VIEW_TYPE_CHANGED') {
                imageCollectionView.setToView(toolbar.getCurrentView());
            }
        });
    }

});

