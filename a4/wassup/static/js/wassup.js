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
    }

});

// Example derived from: https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
function handleAjaxRequest(command) {

    // Create the request object
    var httpRequest = new XMLHttpRequest();

    // Set the function to call when the state changes
    httpRequest.addEventListener('readystatechange', function() {

        // These readyState 4 means the call is complete, and status
        // 200 means we got an OK response from the server
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            // Parse the response text as a JSON object
            // var responseObj = JSON.parse(httpRequest.responseText);

            // TODO: Actually do something with the data returned
        }
    });

    // This opens a POST connection with the server at the given URL
    httpRequest.open('POST', 'http://localhost:8080/post');

    // Set the data type being sent as JSON
    httpRequest.setRequestHeader('Content-Type', 'application/json');

    // Send the JSON object, serialized as a string
    // TODO: You will need to actually send something and respond to it
    var objectToSend = {
        'command': command
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