'use strict';

/**
 * A function that creates and returns all of the model classes and constants.
  */
function createViewModule() {

    var LIST_VIEW = 'LIST_VIEW';
    var GRID_VIEW = 'GRID_VIEW';
    var RATING_CHANGE = 'RATING_CHANGE';
    var VIEW_TYPE_CHANGED = 'VIEW_TYPE_CHANGED';

    /**
     * An object representing a DOM element that will render the given ImageModel object.
     */
    var ImageRenderer = function(imageModel) {
        this.init();
        this.setImageModel(imageModel);
    };

    _.extend(ImageRenderer.prototype, {

        init: function() {
            var imageTemplate = document.getElementById('single-img');

            this.imageDiv = document.createElement('div');
            this.imageDiv.classList.add('img-container');
            this.imageDiv.appendChild(document.importNode(imageTemplate.content, true));
        },

        initListeners: function() {
            this.model.addListener( function(imageModel, date) {
                // META DATA CHANGED
                console.debug('meta data changed');
                this.render();
            }.bind(this) );
        },

        /**
         * Returns an element representing the ImageModel, which can be attached to the DOM
         * to display the ImageModel.
         */
        getElement: function() {
            return this.imageDiv;
        },

        /**
         * Renders image elements
         */
        render: function() {
            var img = this.imageDiv.getElementsByTagName('img')[0],
                name = this.imageDiv.querySelector('.img-name'),
                caption = this.imageDiv.querySelector('.img-caption'),
                dateModified = this.imageDiv.querySelector('.img-date-modified'),
                rating = this.imageDiv.querySelector('.img-rating');

            this.imageDiv.setAttribute('data-id', this.model.getId());
            this.imageDiv.setAttribute('data-img-container-rating', this.model.getRating());

            img.src = name.innerHTML = this.model.getPath();
            caption.innerHTML = this.model.getCaption();
            dateModified.innerHTML = this.model.getModificationDate().toLocaleString();
            rating.setAttribute( 'data-persist-rating', this.model.getRating() );
        },

        /**
         * Returns the ImageModel represented by this ImageRenderer.
         */
        getImageModel: function() {
            return this.model;
        },

        /**
         * Sets the ImageModel represented by this ImageRenderer, changing the element and its
         * contents as necessary.
         */
        setImageModel: function(imageModel) {
            var date = new Date();

            if (this.model !== imageModel) {
                var oldModel = this.model;
                this.model = imageModel;

                // TODO listener stuff
                // this.model.addListener(this.model, date);
                // oldModel.removeListener(oldModel, date);
                this.initListeners();
            }

        },


        /**
         * Changes the rendering of the ImageModel to either list or grid view.
         * @param viewType A string, either LIST_VIEW or GRID_VIEW
         */
        setToView: function(viewType) {
            this.viewType = viewType;
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type it is
         * currently rendering.
         */
        getCurrentView: function() {
            return this.viewType = this.imageDiv.parentNode.getAttribute('data-viewtype');
        }
    });

    /**
     * A factory is an object that creates other objects. In this case, this object will create
     * objects that fulfill the ImageRenderer class's contract defined above.
     */
    var ImageRendererFactory = function() {
        this.renderers = [];
    };

    _.extend(ImageRendererFactory.prototype, {

        /**
         * Creates a new ImageRenderer object for the given ImageModel
         */
        createImageRenderer: function(imageModel) {
            var newRenderer = new ImageRenderer(imageModel);
            this.renderers.push(newRenderer);

            return newRenderer;
        }
    });

    /**
     * An object representing a DOM element that will render an ImageCollectionModel.
     * Multiple such objects can be created and added to the DOM (i.e., you shouldn't
     * assume there is only one ImageCollectionView that will ever be created).
     */
    var ImageCollectionView = function() {
        this.init();
    };

    _.extend(ImageCollectionView.prototype, {

        init: function() {
            this.imageRendererFactory = new ImageRendererFactory();

            var collectionTemplate = document.getElementById('img-collection');
            this.collectionDiv = document.createElement('div');
            this.collectionDiv.classList.add('img-collection-container');
            this.collectionDiv.appendChild(document.importNode(collectionTemplate.content, true));
        },


        initListeners: function() {
            this.model.addListener( function(event, imageModelCollection, imageModel, date) {
                if (event === 'IMAGE_META_DATA_CHANGED_EVENT') {
                    console.log('img collection metadatachanged');
                } else if (event === 'IMAGE_ADDED_TO_COLLECTION_EVENT') {
                    // TODO
                    console.debug('image added');
                    var image = this.imageRendererFactory.createImageRenderer(imageModel);

                    image.render();
                    this.getElement().appendChild(image.getElement());

                } else if (event === 'IMAGE_REMOVED_FROM_COLLECTION_EVENT') {
                    // TODO
                    console.debug('image removed');
                }
            }.bind(this) );
        },

        /**
         * Returns an element that can be attached to the DOM to display the ImageCollectionModel
         * this object represents.
         */
        getElement: function() {
            return this.collectionDiv;
        },

        /**
         * Gets the current ImageRendererFactory being used to create new ImageRenderer objects.
         */
        getImageRendererFactory: function() {
            return this.imageRendererFactory;
        },

        /**
         * Sets the ImageRendererFactory to use to render ImageModels. When a *new* factory is provided,
         * the ImageCollectionView should redo its entire presentation, replacing all of the old
         * ImageRenderer objects with new ImageRenderer objects produced by the factory.
         */
        setImageRendererFactory: function(imageRendererFactory) {
            this.imageRendererFactory = imageRendererFactory;
            // TODO redo presentation
        },

        /**
         * Returns the ImageCollectionModel represented by this view.
         */
        getImageCollectionModel: function() {
            return this.model;
        },

        /**
         * Sets the ImageCollectionModel to be represented by this view. When setting the ImageCollectionModel,
         * you should properly register/unregister listeners with the model, so you will be notified of
         * any changes to the given model.
         */
        setImageCollectionModel: function(imageCollectionModel) {
            this.model = imageCollectionModel;
            this.initListeners();
        },

        /**
         * Changes the presentation of the images to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW.
         */
        setToView: function(viewType) {
            this.viewType = viewType;
            this.collectionDiv.setAttribute('data-viewtype', this.getCurrentView());
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type is currently
         * being rendered.
         */
        getCurrentView: function() {
            return this.viewType;
        }
    });

    /**
     * An object representing a DOM element that will render the toolbar to the screen.
     */
    var Toolbar = function() {
        this.init();
    };

    _.extend(Toolbar.prototype, {

        init: function() {
            var toolbarTemplate = document.getElementById('toolbar');

            this.toolbarDiv = document.createElement('div');
            this.toolbarDiv.classList.add('toolbar-container');
            this.toolbarDiv.appendChild(document.importNode(toolbarTemplate.content, true));

            this.listeners = [];
            this.setToView(GRID_VIEW);
            this.setRatingFilter();
        },

        /**
         * Returns an element representing the toolbar, which can be attached to the DOM.
         */
        getElement: function() {
            return this.toolbarDiv;
        },

        /**
         * Registers the given listener to be notified when the toolbar changes from one
         * view type to another.
         * @param listener_fn A function with signature (toolbar, eventType, eventDate), where
         *                    toolbar is a reference to this object, eventType is a string of
         *                    either, LIST_VIEW, GRID_VIEW, or RATING_CHANGE representing how
         *                    the toolbar has changed (specifically, the user has switched to
         *                    a list view, grid view, or changed the star rating filter).
         *                    eventDate is a Date object representing when the event occurred.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to Toolbar.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from the toolbar.
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to Toolbar.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        },

        /**
         * Sets the toolbar to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW representing the desired view.
         */
        setToView: function(viewType) {

            if (this.viewType === viewType) { return; }
            this.viewType = viewType;

            this.highlightSelectedBtn();

            // Iterate over all listeners, calling each in turn
            _.each(this.listeners, function (listener_fn) {
                listener_fn(this, VIEW_TYPE_CHANGED, new Date());
            }, this);
        },

        highlightSelectedBtn: function() {
            var btns = this.toolbarDiv.querySelectorAll('.layout-btn'),
                selectedBtn = this.toolbarDiv.querySelector('[data-viewtype="' + this.viewType + '"]');

            _.each(btns, function(btn) {
                btn.classList.remove('selected');
            });

            selectedBtn.classList.add('selected');
        },

        /**
         * Returns the current view selected in the toolbar, a string that is
         * either LIST_VIEW or GRID_VIEW.
         */
        getCurrentView: function() {
            return this.viewType;
        },

        /**
         * Returns the current rating filter. A number in the range [0,5], where 0 indicates no
         * filtering should take place.
         */
        getCurrentRatingFilter: function() {
            return this.ratingFilter;
        },

        /**
         * Sets the rating filter.
         * @param rating An integer in the range [0,5], where 0 indicates no filtering should take place.
         */
        setRatingFilter: function(rating) {
            this.ratingFilter = Number(rating) || 0;
            this.toolbarDiv.querySelector('.filter-rating').setAttribute('data-persist-rating', rating);
        }
    });

    /**
     * An object that will allow the user to choose images to display.
     * @constructor
     */
    var FileChooser = function() {
        this.listeners = [];
        this._init();
    };

    _.extend(FileChooser.prototype, {
        // This code partially derived from: http://www.html5rocks.com/en/tutorials/file/dndfiles/
        _init: function() {
            var self = this;
            this.fileChooserDiv = document.createElement('div');
            this.fileChooserDiv.classList.add('file-chooser-container');
            var fileChooserTemplate = document.getElementById('file-chooser');
            this.fileChooserDiv.appendChild(document.importNode(fileChooserTemplate.content, true));
            var fileChooserInput = this.fileChooserDiv.querySelector('.files-input');
            fileChooserInput.addEventListener('change', function(evt) {
                var files = evt.target.files;
                var eventDate = new Date();
                _.each(
                    self.listeners,
                    function(listener_fn) {
                        listener_fn(self, files, eventDate);
                    }
                );
            });
        },

        /**
         * Returns an element that can be added to the DOM to display the file chooser.
         */
        getElement: function() {
            return this.fileChooserDiv;
        },

        /**
         * Adds a listener to be notified when a new set of files have been chosen.
         * @param listener_fn A function with signature (fileChooser, fileList, eventDate), where
         *                    fileChooser is a reference to this object, fileList is a list of files
         *                    as returned by the File API, and eventDate is when the files were chosen.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.addListener: " + JSON.stringify(arguments));
            }

            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from this object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        }
    });

    // Return an object containing all of our classes and constants
    return {
        ImageRenderer: ImageRenderer,
        ImageRendererFactory: ImageRendererFactory,
        ImageCollectionView: ImageCollectionView,
        Toolbar: Toolbar,
        FileChooser: FileChooser,

        LIST_VIEW: LIST_VIEW,
        GRID_VIEW: GRID_VIEW,
        RATING_CHANGE: RATING_CHANGE
    };
}