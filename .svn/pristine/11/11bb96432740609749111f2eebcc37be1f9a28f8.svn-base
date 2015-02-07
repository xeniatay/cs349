'use strict';

/**
 * A function that creates and returns all of the model classes and constants.
 */
function createModelModule() {

    var IMAGE_ADDED_TO_COLLECTION_EVENT = 'IMAGE_ADDED_TO_COLLECTION_EVENT';
    var IMAGE_REMOVED_FROM_COLLECTION_EVENT = 'IMAGE_REMOVED_FROM_COLLECTION_EVENT';
    var IMAGE_META_DATA_CHANGED_EVENT = 'IMAGE_META_DATA_CHANGED_EVENT';
    /**
     * An ImageModel represents a reference to an image on the local file system. You should assume
     * that all images are within the ./images directory.
     * @param pathToFile The relative path to the image. A string.
     * @param modificationDate The modification date of the file. A Date.
     * @param caption A user-supplied caption. Users may not provide a caption. A string.
     * @param rating The rating, from 0-5, the user has provided for the image. The rating is an integer.
     *               A rating of 0 indicates that the user has not yet supplied a rating for the image.
     * @constructor
     */
    var ImageModel = function(
        pathToFile,
        modificationDate,
        caption,
        rating
    ) {
        if ( !(_.isString(pathToFile)
                && _.isString(caption)
                && (modificationDate instanceof Date)
                && (_.isNumber(rating) && rating >= 0 && rating <= 5) )) {
            throw new Error("Invalid arguments supplied to ImageModel: " + JSON.stringify(arguments));
        }

        this.id = _.uniqueId('img-');
        this.path = pathToFile;
        this.modificationDate = modificationDate;

        this.init();
        this.setCaption(caption);
        this.setRating(rating);
    };

    _.extend(ImageModel.prototype, {

        init: function() {
            this.listeners = [];
        },

        /**
         * Adds a listener to be notified of when the model changes.
         * @param listener_fn A function with the signature: (imageModel, eventTime),
         * where imageModel is a reference to this object, and eventTime is a Date
         * object indicating the time of the event.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to ImageModel.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from this object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to ImageModel.removeListener: " + JSON.stringify(arguments));
            }

            this.listeners = _.without(this.listeners, listener_fn);
        },

        /**
         * Returns a string representing the caption. Must return an empty string if the
         * user has not supplied a caption for the image.
         */
        getCaption: function() {
            return this.caption;
        },

        /**
         * Sets the caption for this image.
         * @param caption A string representing a user caption.
         */
        setCaption: function(caption) {
            this.caption = caption || '';
            this.onMetaDataChange();
        },

        /**
         * Returns the user-supplied rating of the image. A user can provide a rating between 1-5.
         * If no rating has been given, should return 0.
         */
        getRating: function() {
            return this.rating;
        },

        /**
         * Sets the user-supplied rating of the image.
         * @param rating An integer in the range [0,5] (where a 0 indicates the user is clearing their rating)
         */
        setRating: function(rating) {
            if (Number(rating) === this.rating) { return; }
            this.rating = Number(rating) || 0;
            this.onMetaDataChange();
        },

        /**
         * Returns a complete path to the image suitable for inserting into an img tag.
         */
        getPath: function() {
            // Relative path from current dir, i.e. './image/...'
            return this.path;
        },

        /**
         * Returns unique ID
         */
        getId: function() {
            return this.id;
        },

        /**
         * Sets modification date to new date
         */
        setModificationDate: function(date) {
            this.modificationDate = date || new Date();
        },

        /**
         * Returns the modification date (a Date object) for this image.
         */
        getModificationDate: function() {
            return this.modificationDate;
        },

        /**
         * Trigger META_DATA_CHANGED_EVENT for all listeners
         */
        onMetaDataChange: function() {
            this.setModificationDate();

            // Use underscore to iterate over all listeners, calling each in turn
            _.each(this.listeners, function (listener_fn) {
                listener_fn(this, this.getModificationDate());
            }, this);
        }

    });

    /**
     * Manages a collection of ImageModel objects.
     */
    var ImageCollectionModel = function() {
        this.imageModels = [];
        this.init();
    };

    _.extend(ImageCollectionModel.prototype, {

        init: function() {
            this.listeners = [];
            this.imageModelListeners = {};
        },

        /**
         * Adds a listener to the collection to be notified of when the collection or an image
         * in the collection changes.
         * @param listener_fn A function with the signature (eventType, imageModelCollection, imageModel, eventDate),
         *                    where eventType is a string of either
         *                    - IMAGE_ADDED_TO_COLLECTION_EVENT,
         *                    - IMAGE_REMOVED_FROM_COLLECTION_EVENT, or
         *                    - IMAGE_META_DATA_CHANGED_EVENT.
         *                    imageModelCollection is a reference to this object, imageModel is the imageModel
         *                    that was added, removed, or changed, and eventDate is a Date object representing the
         *                    time when the change occurred.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to ImageModelCollection.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from the object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to ImageModelCollection.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        },

        /**
         * Adds an ImageModel object to the collection. When adding an ImageModel, this object should
         * register as a listener for that object, and notify its own (i.e., the ImageCollectionModel's listeners)
         * when that ImageModel changes.
         * @param imageModel
         */
        addImageModel: function(imageModel) {
            this.imageModels.push(imageModel);

            var newListener = _.bind(this.onMetaDataChange, this),
                id = imageModel.id,
                listeners = this.imageModelListeners[id];

            // Keep track of listeners in order to remove them if needed

            imageModel.addListener(newListener);
            if (!this.imageModelListeners[id]) {
                this.imageModelListeners[id] = [newListener];
            } else {
                this.imageModelListeners[id].push[newListener];
            }

            this.onAddImage(imageModel);
        },

        /**
         * Removes the given ImageModel object from the collection and removes any listeners it has
         * registered with the ImageModel.
         * @param imageModel
         */
        removeImageModel: function(imageModel) {
            this.imageModels = _.without(this.imageModels, imageModel);

            var id = imageModel.id;

            _.each(this.imageModelListeners[id], function(listener) {
                imageModel.removeListener(listener);
            });

            this.onRemoveImage(imageModel);
        },

        removeImageModels: function() {
            _.each(this.imageModels, function(imageModel) {
                this.removeImageModel(imageModel);
            }, this);
        },

        /**
         * Returns an array of all ImageModel objects currently in this collection.
         */
        getImageModels: function() {
            return this.imageModels.slice();
        },

        /**
         * Returns an ImageModel by given ID
         */
        getImageModel: function(id) {
            return _.find(this.imageModels, function(imageModel) {
                return imageModel.getId() === id;
            });

        },

        /**
         * Trigger IMAGE_ADDED_TO_COLLECTION_EVENT for all listeners
         */
        onAddImage: function(imageModel) {
            // Use underscore to iterate over all listeners, calling each in turn
            storeImageCollectionModel(this);
            _.each(this.listeners, function (listener_fn) {
                listener_fn(IMAGE_ADDED_TO_COLLECTION_EVENT, this, imageModel, new Date);
            }, this);
        },

        /**
         * Trigger IMAGE_REMOVED_FROM_COLLECTION_EVENT for all listeners
         */
        onRemoveImage: function(imageModel) {
            // Use underscore to iterate over all listeners, calling each in turn
            storeImageCollectionModel(this);
            _.each(this.listeners, function (listener_fn) {
                listener_fn(IMAGE_REMOVED_FROM_COLLECTION_EVENT, this, imageModel, new Date);
            }, this);
        },

        /**
         * Trigger IMAGE_META_DATA_CHANGED_EVENT for all listeners
         */
        onMetaDataChange: function(imageModel, date) {
            // Use underscore to iterate over all listeners, calling each in turn
            storeImageCollectionModel(this);
            _.each(this.listeners, function (listener_fn) {
                listener_fn(IMAGE_META_DATA_CHANGED_EVENT, this, imageModel, date);
            }, this);
        }
    });

    /**
     * Given an ImageCollectionModel, stores all of its contents in localStorage.
     */
    function storeImageCollectionModel(imageCollectionModel) {
        var models = _.map(
            imageCollectionModel.getImageModels(),
            function(imageModel) {
                return {
                    path: imageModel.getPath(),
                    modificationDate: imageModel.getModificationDate(),
                    caption: imageModel.getCaption(),
                    rating: imageModel.getRating()
                };
            }
        );
        localStorage.setItem('imageCollectionModel', JSON.stringify(models));
    }

    /**
     * Returns a new ImageCollectionModel object with contents loaded from localStorage.
     */
    function loadImageCollectionModel() {
        var imageCollectionModel = new ImageCollectionModel(),
            modelsJSON = localStorage.getItem('imageCollectionModel');

        if (!modelsJSON) { return imageCollectionModel; }

        var models = JSON.parse(modelsJSON);
        _.each(models, function(model) {
            try {
                var imageModel = new ImageModel( model.path, new Date(model.modificationDate), model.caption, model.rating );
                imageCollectionModel.addImageModel(imageModel);
            } catch (err) {
                debugger;
                console.debug("Error creating ImageModel: " + err);
            }
        });

        return imageCollectionModel;
    }

    // Return an object containing all of our classes and constants
    return {
        ImageModel: ImageModel,
        ImageCollectionModel: ImageCollectionModel,

        IMAGE_ADDED_TO_COLLECTION_EVENT: IMAGE_ADDED_TO_COLLECTION_EVENT,
        IMAGE_REMOVED_FROM_COLLECTION_EVENT: IMAGE_REMOVED_FROM_COLLECTION_EVENT,
        IMAGE_META_DATA_CHANGED_EVENT: IMAGE_META_DATA_CHANGED_EVENT,

        storeImageCollectionModel: storeImageCollectionModel,
        loadImageCollectionModel: loadImageCollectionModel
    };
}