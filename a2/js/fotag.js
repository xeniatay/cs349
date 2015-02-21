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
    loadImagesFromLS();

    // Initialize all event listeners
    initImageListeners();
    initToolbarListeners();
    initRatingFilter();
    initViewButtons();
    initFileChooser();
    initRemoveAllImages();
    initDemoImages();

    /*** Functions ***/

    function initFileChooser() {
        // Choose files and save to local storage
        fileChooser.addListener(function(fileChooser, files, eventDate) {
            _.each(files, function(file) {
                imageCollectionModel.addImageModel( new modelModule.ImageModel('./images/' + file.name, file.lastModifiedDate, '', 0));
            });

            var fileChooserElem = fileChooser.getElement(),
                input = fileChooserElem.querySelector('.files-input');

            fileChooserElem.classList.add('success');
            input.setAttribute('disabled', 'disabled');

            window.setTimeout(function() {
                input.value = '';
                input.removeAttribute('disabled');
            }, 500)

            window.setTimeout(function() {
                fileChooserElem.classList.remove('success');
            }, 1500)
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
        filterImages();
    }

    function initRatingFilter() {
        var filters = appContainer.querySelectorAll('[data-filter-rating]');
        _.each(filters, function(filter) {
            filter.addEventListener('click', function(e) {
                var rating = e.target.getAttribute('data-rating');
                if (!rating) { return; }

                toolbarView.setRatingFilter(rating);
                filterImages();
            }, this);
        });
    }

    function filterImages() {
        var rating = toolbarView.getCurrentRatingFilter(),
            images = appContainer.querySelectorAll('.img-container'),
            selector = '.img-container:not([data-img-container-rating="' + rating + '"])',
            notSelected = appContainer.querySelectorAll(selector),
            selected = appContainer.querySelectorAll('.img-container[data-img-container-rating="' + rating + '"]'),
            noImagesMsg = appContainer.querySelector('.no-images-msg');

        _.each(images, function(img) { img.classList.remove('hide'); });

        if (rating != 0) {
            _.each(notSelected, function(img) { img.classList.add('hide'); });
        }

        if (!selected.length && rating != 0) {
            noImagesMsg.classList.remove('hide');
        } else {
            noImagesMsg.classList.add('hide');
        }
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
        var id = e.target.parentNode.parentNode.parentNode.getAttribute('data-id'),
            model = imageCollectionModel.getImageModel(id);

        imageCollectionModel.removeImageModel(model);
    }

    function initRemoveAllImages(e) {
        var btn = appContainer.querySelector('.delete-all');

        btn.addEventListener('click', function(e) {
            imageCollectionModel.removeImageModels();
        });
    }

    function initDemoImages() {
        var btn = appContainer.querySelector('.demo-img');

        btn.addEventListener('click', function(e) {
            loadImagesFromLS('[{"path":"./images/GOPR0042-small.jpg","modificationDate":"2015-02-21T22:49:01.800Z","caption":"","rating":0},{"path":"./images/GOPR0044-small.jpg","modificationDate":"2015-02-21T22:49:01.801Z","caption":"","rating":0},{"path":"./images/GOPR0045-small.jpg","modificationDate":"2015-02-21T22:49:01.802Z","caption":"","rating":0},{"path":"./images/GOPR0051-small.jpg","modificationDate":"2015-02-21T22:49:01.802Z","caption":"","rating":0},{"path":"./images/GOPR0052-small.jpg","modificationDate":"2015-02-21T22:49:01.802Z","caption":"","rating":0},{"path":"./images/GOPR0069-small.jpg","modificationDate":"2015-02-21T22:49:01.802Z","caption":"","rating":0},{"path":"./images/GOPR0069-smallverylongname-look-this-name-is=very-super-long.jpg","modificationDate":"2015-02-21T22:49:01.803Z","caption":"","rating":0},{"path":"./images/GOPR0074-small.jpg","modificationDate":"2015-02-21T22:49:01.803Z","caption":"","rating":0},{"path":"./images/tall.jpg","modificationDate":"2015-02-21T22:49:01.803Z","caption":"","rating":0},{"path":"./images/verywide.jpg","modificationDate":"2015-02-21T22:49:01.803Z","caption":"","rating":0}]');
        });
    }

    function loadImagesFromLS(hardcodedImages) {
        var storedImageCollectionModel = modelModule.loadImageCollectionModel(hardcodedImages);
        _.each(storedImageCollectionModel.getImageModels(), function(imageModel) {
            imageCollectionModel.addImageModel(imageModel);
        });
    }
});

