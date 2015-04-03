var friendsList,
    supData,
    PUBLIC_SERVER = 'http://104.197.3.113/post',
    PRIVATE_SERVER = 'http://localhost:8080/post',
    serverURL = PRIVATE_SERVER;

window.addEventListener('load', function() {

    var loggedIn = hasCookie('user_id');
    // User Authentication
    // TODO user validation
    if (loggedIn) {
        // Redirect from login page to app
        if ( location.pathname.match(/login/) ) {
            location = location.origin;
        }

        document.body.classList.add('logged-in');

        friendsList = new FriendsList();
        friendsList.updateFriendsList();
        supData = new Sups();

        var btnServers = document.querySelectorAll('.btn-server');

        _.each(btnServers, function(btn) {
            btn.addEventListener('click', function(e) {
                switch( e.target.getAttribute('data-type') ) {
                    case ('public'):
                        serverURL = PUBLIC_SERVER;
                        break;
                    case ('private'):
                    default:
                        serverURL = PRIVATE_SERVER;
                        break;
                }

                console.debug(serverURL);
            });
        });

    }

});

// Example derived from: https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
function handleAjaxRequest(command, command_data, callback) {
    command_data = command_data || null;

    // Create the request object
    var httpRequest = new XMLHttpRequest();

    // Set the function to call when the state changes
    httpRequest.addEventListener('readystatechange', function() {

        // These readyState 4 means the call is complete, and status
        // 200 means we got an OK response from the server
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            // Parse the response text as a JSON object
            var responseObj = JSON.parse(httpRequest.responseText);

            if (responseObj.error !== "") {
                console.error(responseObj.command, responseObj.error);
            } else {
                console.debug(responseObj.command, responseObj.reply_data);
            }

            if (callback) {
                callback.call(friendsList, responseObj);
            }

            // TODO: Actually do something with the data returned
        }
    });

    // This opens a POST connection with the server at the given URL
    httpRequest.open('POST', serverURL);
                console.debug(serverURL);

    // Set the data type being sent as JSON
    httpRequest.setRequestHeader('Content-Type', 'application/json');

    // Send the JSON object, serialized as a string
    var objectToSend = {
        'command': command,
        'command_data': command_data,
        'message_id': _.uniqueId('messageId-'),
        'user_id': getCookie('user_id'),
        'protocol_version': 1.2
    };

    httpRequest.send(JSON.stringify(objectToSend));
}

/**
 * Checks whether a cookie exists
 * Derived from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 */
function hasCookie(sKey) {
    if (!sKey) { return false; }
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
}

/**
 * Gets value of cookie
 * Derived from: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 */
function getCookie(sKey) {
    if (!sKey) { return null; }
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
}