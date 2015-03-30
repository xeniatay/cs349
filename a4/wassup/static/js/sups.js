'use strict';

/**
 * Helper code for Wasssssuuuuuup
 */

var Sups = function() {
    this.initialize();
};

_.extend(Sups.prototype, {
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
    this.context.font="30px Verdana";
    this.context.fillText('SUP', 10, 50);
    // var gradient=this.context.createLinearGradient(0,0,this.canvas.width,0);
    // gradient.addColorStop("0","magenta");
    // gradient.addColorStop("0.5","blue");
    // gradient.addColorStop("1.0","red");
    // this.context.fillStyle=gradient;


  }
 });
