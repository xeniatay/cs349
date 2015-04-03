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

  DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  initialize: function() {

    this.sups = [];
    this.supSettings = {};

    this.canvas = document.querySelector('.sup-canvas');
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = 400;
    this.context = this.canvas.getContext('2d');

    this.initEvents();
    this.showLoadingState();
    this.getSups();
  },

  initEvents: function() {
    var supNav = document.querySelectorAll('.sup-nav');

    this.prevNav = document.querySelector('[data-dir="prev"]');
    this.nextNav = document.querySelector('[data-dir="next"]');
    this.btnReloadSups = document.querySelectorAll('.btn-reload-sups');
    this.numSupsElem = document.querySelector('.number-of-sups');
    this.currentSupElem = document.querySelector('.current-sup');
    this.btnRemoveSup = document.querySelector('.btn-delete-sup');
    this.btnClearSups = document.querySelector('.btn-clear-sups');
    this.senderName = document.querySelector('.sup-sender-info .friend-name');
    // this.senderId = document.querySelector('.sup-sender-info .friend-id');
    this.senderDate = document.querySelector('.sup-sender-info .sup-date');

    _.each(supNav, function(nav) {
      nav.addEventListener('click', function() {
          var dir = this.getAttribute('data-dir');

          supData.changeSup(dir);
      });
    });

    _.each(this.btnReloadSups, function(btn) {
      btn.addEventListener('click', _.bind(function() {
        this.getSups();
      }, this) );
    }, this);

    this.btnRemoveSup.addEventListener('click', _.bind(function() {
      this.removeSup();
    }, this) );

    this.btnClearSups.addEventListener('click', _.bind(function() {
      this.clearSups();
    }, this) );

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

    if (!this.sups.length) {
      // Initial sups
      this.sups = allSups;
      _.flatten( this.sups );
      this.curSup = this.sups.length ? 0 : -1;
    } else {
      var numNewSups = allSups.length - this.sups.length,
          existingSupIDs = _.pluck(this.sups, 'sup_id'),
          newSups = _.reject(allSups, function(sup) {
            return _.contains(existingSupIDs, sup.sup_id);
          });

      if (numNewSups > 0) {
        var newSupAlert = document.querySelector('.new-sup-alert');
        newSupAlert.style.opacity = 1;
        window.setTimeout(function() {
          newSupAlert.style.opacity = 0;
        }, 2000)

        this.curSup = this.curSup + numNewSups;
        this.sups = newSups.concat(this.sups);
      }
    }

  },

  displaySups: function() {
    this.validateSups();

    if (!this.sups.length) {
      return;
    }

    this.updateSupInfo();

    var sup = this.sups[this.curSup];
    this.curSupId = this.sups[ this.curSup ].sup_id;

    this.clearCanvas();
    this.drawSup();
    this.context.restore();
  },

  showLoadingState: function() {
    var chatArea = document.querySelector('.chat-area');
    chatArea.classList.remove('no-sups');
    chatArea.classList.remove('has-sups');
  },

  validateSups: function() {
    var chatArea = document.querySelector('.chat-area');
    if (!this.sups.length) {
      chatArea.classList.add('no-sups');
      chatArea.classList.remove('has-sups');
      // this.clearCanvas();
    } else {
      chatArea.classList.remove('no-sups');
      chatArea.classList.add('has-sups');
      this.prevNav.classList.remove('disabled');
      this.nextNav.classList.remove('disabled');
    }

    if (this.sups.length === 1) {
      this.prevNav.classList.add('disabled');
      this.nextNav.classList.add('disabled');
    } else if ( (this.curSup + 1) === this.sups.length) {
      this.nextNav.classList.add('disabled');
    } else if ( this.curSup === 0 ){
      this.prevNav.classList.add('disabled');
    }

  },

  updateSupInfo: function() {

    var curSup = this.sups[this.curSup],
        date = new Date(curSup.date),
        hours = date.getHours() % 12,
        AMorPM = (date.getHours() > 12) ? 'pm' : 'am';

    this.currentSupElem.innerHTML = this.curSup + 1;
    this.numSupsElem.innerHTML = this.sups.length;
    this.senderName.innerHTML = curSup.sender_full_name;
    // this.senderId.innerHTML = curSup.sender_id;
    this.senderDate.innerHTML = this.DAYS[ date.getDay() ] + ", " + date.getHours() + ":" + date.getMinutes() + AMorPM ;
  },

  drawSup: function() {
    this.generateSupSettings();

    var textString = 'SUP?',
        textWidth = this.context.measureText(textString).width,
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
      fontSize: _.random(70, 150),
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

    this.validateCurSup();
    this.displaySups();
  },

  validateCurSup: function() {

    this.curSup = Math.min(this.curSup, this.sups.length - 1);
    this.curSup = Math.max(this.curSup, 0);

    if (!this.sups.length) {
      this.curSup = -1;
    }

  },

  removeSup: function() {
    var data = { 'sup_id': this.sups[this.curSup].sup_id },
        currentSup = this.sups[this.curSup];

    handleAjaxRequest('remove_sup', data, _.bind( function() {
      this.sups = _.without(this.sups, currentSup);
      this.changeSup('prev');
    }, this) );
  },

  clearSups: function() {
    handleAjaxRequest('clear_sups', null, _.bind(function() {
      this.sups.length = 0;
      this.curSup = -1;
      supData.displaySups();
    }, this));
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
