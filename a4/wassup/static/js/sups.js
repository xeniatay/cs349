'use strict';

/**
 * Helper code for Wasssssuuuuuup
 */

var Sups = function() {
    this.initialize();
};

_.extend(Sups.prototype, {

  FONTS: [
    'Verdana',
    'Arial',
    'Century Gothic',
    'Georgia',
    'Times New Roman',
    'Trebuchet MS',
    'Palatino Linotype',
    'Comic Sans',
    'Impact',
    'Tahoma',
    'Courier New',
    'Lucida Console'
  ],

  initialize: function() {

    this.supSettings = {};

    this.canvas = document.querySelector('.sup-canvas');
    this.context = this.canvas.getContext('2d');


    this.initEvents();
    this.getSups();
  },

  initEvents: function() {
    var supNav = document.querySelectorAll('.sup-nav');

    this.btnReloadSups = document.querySelector('.btn-reload-sups');
    this.numSupsElem = document.querySelector('.number-of-sups');
    this.currentSupElem = document.querySelector('.current-sup');

    _.each(supNav, function(nav) {
      nav.addEventListener('click', function() {
          var dir = this.getAttribute('data-dir');

          supData.changeSup(dir);
      });
    });

    this.btnReloadSups.addEventListener('click', _.bind(function() {
      this.getSups();
    }).this);

    window.setInterval(_.bind(function() {
        this.getSups()
    }, this), 30000);
  },

  getSups: function() {
    handleAjaxRequest('get_sups', null, (function(data) {
      // this.sups = data.reply_data;
      this.handleNewSups(data.reply_data);
      this.displaySups();
    }).bind(this));;
  },

  handleNewSups: function(allSups) {

    if (!this.sups) {
      // Initial sups
      this.sups = allSups;
      this.curSup = 0;
    } else {
      var numNewSups = allSups.length - this.sups.length,
          existingSupIDs = _.pluck(this.sups, 'sup_id'),
          newSups = _.reject(allSups, function(sup) {
            return _.contains(existingSupIDs, sup.sup_id);
          });

      if (numNewSups > 0) {
        this.curSup = this.curSup + numNewSups;
        this.sups.unshift(newSups);
      }
    }

  },

  displaySups: function() {
    this.currentSupElem.innerHTML = this.curSup + 1;
    this.numSupsElem.innerHTML = this.sups.length;

    var sup = this.sups[this.curSup];
    this.curSupId = this.sups[ this.curSup ].sup_id;

    this.clearCanvas();
    this.drawSup();
    this.context.restore();
  },

  drawSup: function() {
    this.generateSupSettings();

    var textString = 'SUP',
        textWidth = this.context.measureText(textString ).width,
        settings = this.supSettings[this.curSupId];

    this.context.font = settings.fontSize + "px " + settings.fontName;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';

    this.context.translate( (this.canvas.width / 2) - (textWidth / 2), (this.canvas.height / 2) );
    this.context.rotate( Math.PI / 180 * settings.rotateAngle );

    this.context.fillStyle = 'rgb(' + settings.red + ',' + settings.blue + ',' + settings.green + ')';
    this.context.fillText(textString, 0, 0);
  },

  generateSupSettings: function() {
    if (this.supSettings[this.curSupId]) {
      return;
    }

    var settings = {
      red: _.random(50, 240),
      green: _.random(50, 240),
      blue: _.random(50, 240),
      fontSize: _.random(100, 200),
      fontName: this.FONTS[ _.random( this.FONTS.length - 1 ) ],
      rotateAngle: _.random(-60, 60)
    };

    this.supSettings[this.curSupId] = settings;
  },

  changeSup: function(dir) {
    if (dir === 'next') {
      this.curSup = this.curSup + 1;
    } else {
      this.curSup = this.curSup - 1;
    }

    this.curSup = Math.min(this.curSup, this.sups.length - 1);
    this.curSup = Math.max(this.curSup, 0);

    this.displaySups();
  },

  /**
   * Tabula Rasa ᕦ(ò_óˇ)ᕤ
   * From: http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
   */
  clearCanvas: function() {
      this.context.save();

      // Use the identity matrix while clearing the canvas
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },


 });
