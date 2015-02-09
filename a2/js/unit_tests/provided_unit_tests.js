'use strict';

var expect = chai.expect;

describe('Provided unit tests', function() {
    it('Add a valid ImageModel to ImageCollectionModel', function() {
      var modelModule = createModelModule(),
          imageCollectionModel = new modelModule.ImageCollectionModel(),
          imageModel = new modelModule.ImageModel( '/images/test_path.png', new Date(), '', 0 );

      expect(imageCollectionModel.imageModels.length).to.equal(0);

      imageCollectionModel.addImageModel(imageModel);

      expect(imageCollectionModel.imageModels.length).to.equal(1);
      expect(imageCollectionModel.imageModels[0]).to.equal(imageModel);
    });

    it('Remove a valid ImageModel from ImageCollectionModel', function() {
      var modelModule = createModelModule(),
          imageCollectionModel = new modelModule.ImageCollectionModel(),
          imageModel = new modelModule.ImageModel( '/images/test_path.png', new Date(), '', 0 );

      imageCollectionModel.addImageModel(imageModel);

      expect(imageCollectionModel.imageModels.length).to.equal(1);
      expect(imageCollectionModel.imageModels[0]).to.equal(imageModel);

      imageCollectionModel.removeImageModel(imageModel);
      expect(imageCollectionModel.imageModels.length).to.equal(0);
    });

    it('ImageModel listeners are called when image metadata is updated', function() {
      var modelModule = createModelModule(),
          imageModel = new modelModule.ImageModel( '/images/test_path.png', new Date(), '', 0 ),
          firstListener = sinon.spy();

      imageModel.addListener(firstListener);

      imageModel.setRating(1);
      expect(firstListener.callCount, 'ImageModel listener should be called once').to.equal(1);

      imageModel.setCaption('caption');
      expect(firstListener.callCount, 'ImageModel listener should be called twice').to.equal(2);
    });

    it('ImageCollectionModel listeners are called when valid imageModels are added and removed', function() {
      var modelModule = createModelModule(),
          imageCollectionModel = new modelModule.ImageCollectionModel(),
          imageModel = new modelModule.ImageModel( '/images/test_path.png', new Date(), '', 0 ),
          firstListener = sinon.spy();

      imageCollectionModel.addListener(firstListener);

      imageCollectionModel.addImageModel(imageModel);
      expect(firstListener.callCount, 'imageCollectionModel listener should be called once').to.equal(1);

      imageCollectionModel.removeImageModel({});
      expect(firstListener.callCount, 'imageCollectionModel listener should be called once').to.equal(1);

      imageCollectionModel.removeImageModel(imageModel);
      expect(firstListener.callCount, 'imageCollectionModel listener should be called twice').to.equal(2);
    });


    it('Add and remove listeners on ImageCollectionModel', function() {
      var modelModule = createModelModule(),
          imageCollectionModel = new modelModule.ImageCollectionModel(),
          imageModel = new modelModule.ImageModel( '/images/test_path.png', new Date(), '', 0 ),
          firstListener = sinon.spy(),
          secondListener = sinon.spy();

      imageCollectionModel.addListener(firstListener);
      imageCollectionModel.addListener(secondListener);

      imageCollectionModel.addImageModel(imageModel);
      expect(firstListener.callCount, 'imageCollectionModel first listener should be called once').to.equal(1);
      expect(secondListener.callCount, 'imageCollectionModel second listener should be called once').to.equal(1);

      imageCollectionModel.removeListener(firstListener);
      imageCollectionModel.addImageModel(imageModel);
      expect(firstListener.callCount, 'imageCollectionModel listener should be called once').to.equal(1);
      expect(secondListener.callCount, 'imageCollectionModel second listener should be called twice').to.equal(2);
    });
});

