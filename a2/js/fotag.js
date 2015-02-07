'use strict';

// This should be your main point of entry for your app

// Globals - this is notgood lol
var modelModule,
    viewModule,
    appContainer,
    imageCollectionView,
    imageCollectionModel,
    toolbarView,
    fileChooser;

window.addEventListener('load', function() {
    modelModule = createModelModule();
    viewModule = createViewModule();
    appContainer = document.getElementById('app-container');

    imageCollectionView = new viewModule.ImageCollectionView();
    imageCollectionModel = new modelModule.ImageCollectionModel();

    toolbarView = new viewModule.Toolbar();
    fileChooser = new viewModule.FileChooser();

    imageCollectionView.setImageCollectionModel(imageCollectionModel);

    appContainer.appendChild(toolbarView.getElement());
    appContainer.classList.add('toolbar-offset');
    appContainer.appendChild(fileChooser.getElement());
    appContainer.appendChild(imageCollectionView.getElement());

    // Retrieve all images from Local Storage
    var storedImageCollectionModel = modelModule.loadImageCollectionModel();
    _.each(storedImageCollectionModel.getImageModels(), function(imageModel) {
        imageCollectionModel.addImageModel(imageModel);
    });

    // Initialize all event listeners
    initImageListeners();
    initToolbarListeners();
    initRatingFilter();
    initViewButtons();
    initFileChooser();


    /*** Functions ***/

    function initFileChooser() {
        // Choose files and save to local storage
        fileChooser.addListener(function(fileChooser, files, eventDate) {
            _.each(files, function(file) {
                imageCollectionModel.addImageModel( new modelModule.ImageModel('./images/' + file.name, file.lastModifiedDate, '', 0));
            });

            var fileChooserElem = fileChooser.getElement();
            fileChooserElem.classList.add('success');

            window.setTimeout(function() {
                fileChooserElem.classList.remove('success');
            }, 2000)
        });
    }

    function initImageListeners() {
        var imgContainer = appContainer.getElementsByClassName('img-collection-container');

        _.each(imgContainer, function(container) {
            container.addEventListener('click', function(e) {
                var classes = e.target.className.split(" "),
                    elemClass;

                if (classes) {
                    elemClass = _.find(classes, function(c) {
                        if (c === 'rating-star') {
                            onClickImgRating(e);
                            return c;
                        } else if (c === 'img-remove') {
                            onClickImgRemove(e);
                            return c;
                        }
                    });
                }
            });
        });
    }

    function onClickImgRating(e) {
        var newRating = e.target.getAttribute('data-rating'),
            id = e.target.parentNode.parentNode.parentNode.getAttribute('data-id'), // ughhh wtf
            model = imageCollectionModel.getImageModel(id);

        model.setRating(newRating);
    }

    function initRatingFilter() {
        var filters = appContainer.getElementsByClassName('filter-rating');
        _.each(filters, function(filter) {
            filter.addEventListener('click', function(e) {
                var rating = e.target.getAttribute('data-rating');
                if (!rating) { return; }

                var images = appContainer.querySelectorAll('.img-container'),
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

    function onClickImgRemove(e) {
        var id = e.target.parentNode.parentNode.getAttribute('data-id'),
            model = imageCollectionModel.getImageModel(id);

        imageCollectionModel.removeImageModel(model);
    }

    // TODO delete all button
});

