'use strict';

/**
 * Helper code for Wasssssuuuuuup
 */

var FriendsList = function() {
    // this._instantiateInterface('template-friends-list', container);
    this.initialize();
};

_.extend(FriendsList.prototype, {
    _instantiateInterface: function (templateId, containerId) {
        // var template = document.getElementById(templateId),
        //     containerElem = document.getElementById(containerId);

        // this.hostElement = document.createElement('div');
        // this.hostElement.classList.add('friends-list-host');
        // this.hostElement.innerHTML = template.innerHTML;
        // containerElem.appendChild(this.hostElement);

    },

    initialize: function() {
        this.el = document.querySelector('.friends-list');
        this.friendTemplate = document.createElement('li');
        this.friendTemplate.innerHTML = document.querySelector('#template-single-friend').innerHTML;

        this.btnSendSup = document.querySelector('.btn-send-sup');
        this.btnAddFriend = document.querySelector('.btn-add-friend');
        this.inputAddFriend = document.querySelector('.new-friend-input');

        this.initEvents();
    },

    initEvents: function() {
        this.btnAddFriend.addEventListener('click', function(e) {
            this.addFriend();
        }.bind(this));

        this.inputAddFriend.addEventListener('keydown', (function(e) {
            // TODO disable send sup button if no friend selected

            if (e.keyCode === 13) {  // enter
                this.addFriend();
            }
        }).bind(this));

        this.el.addEventListener('click', function(e) {
            if (e.target.className.indexOf('btn-delete-friend') > 0) {
                this.removeFriend(e);
            }
        });

        this.btnSendSup.addEventListener('click', (function(e) {
            this.sendSups();
        }).bind(this));
    },

    updateFriendsList: function() {
        handleAjaxRequest('get_friends', null, friendsList.displayFriends);
    },

    displayFriends: function(data) {
        // Wipe original data
        this.inputAddFriend.value = "";
        this.el.innerHTML = "";

        _.each(data.reply_data, function(friend) {
            var friendEl = this.friendTemplate.cloneNode(true);

            friendEl.classList.add('single-friend');
            friendEl.querySelector('.friend-name').innerHTML = friend.full_name;
            friendEl.querySelector('.friend-id').innerHTML = friend.user_id;
            friendEl.querySelector('label').setAttribute('for', friend.user_id);
            friendEl.querySelector('input').setAttribute('id', friend.user_id);

            this.el.appendChild(friendEl);
        }, this);
    },

    addFriend: function() {
        // TODO if friend already exists, show error msg
        var newFriend = this.inputAddFriend.value;
        handleAjaxRequest('user_exists', {'user_id': newFriend }, function(data) {
            if (data.reply_data.exists) {
                handleAjaxRequest('add_friend', {'user_id': data.reply_data.user_id}, friendsList.updateFriendsList);
            }
        });
    },

    removeFriend: function(e) {
        var friend = e.target.parentNode.querySelector('.friend-id').innerHTML;
        handleAjaxRequest('remove_friend', {'user_id': friend}, friendsList.updateFriendsList);
    },

    sendSups: function() {
        var selected = document.querySelectorAll('.single-friend input:checked'),
            data = {};

        if (selected) {
            _.each(selected, function(friend) {
                data = {
                    'user_id': friend.getAttribute('id'),
                    'sup_id': _.uniq(),
                    'date': new Date()
                }
            });

            handleAjaxRequest('send_sup', data, null);
        }

    }

});
