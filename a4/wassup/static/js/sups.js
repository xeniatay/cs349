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
    this.currentSup = 0;
    this.canvas = document.querySelector('.sup-canvas');
    this.context = this.canvas.getContext('2d');
  },

  getSups: function() {
    handleAjaxRequest('get_sups', null, (function(data) {
      this.sups = data.reply_data;
      this.displaySups();
    }).bind(this));;
  },

  displaySups: function() {
    var sup = this.sups[this.currentSup];
    this.drawSup();
  },

  drawSup: function() {
    this.generateSupSettings();

    var textString = 'SUP',
        textWidth = this.context.measureText(textString ).width,
        settings = this.sups[this.currentSup].settings;

    this.context.font = settings.fontSize + "px " + settings.fontName;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';

    this.context.translate( (this.canvas.width / 2) - (textWidth / 2), (this.canvas.height / 2) );
    this.context.rotate( Math.PI / 180 * settings.rotateAngle );

    this.context.fillStyle = 'rgb(' + settings.red + ',' + settings.blue + ',' + settings.green + ')';
    this.context.fillText(textString, 0, 0);
  },

  generateSupSettings: function() {
    if (this.sups[this.currentSup].settings) {
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

    this.sups[ this.currentSup ].settings = settings;
  }
 });
