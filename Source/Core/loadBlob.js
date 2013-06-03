/*global define*/
define([
        './DeveloperError',
        './RequestErrorEvent',
        '../ThirdParty/when'
    ], function(
        DeveloperError,
        RequestErrorEvent,
        when) {
    "use strict";

    /**
     * Asynchronously loads the given URL as a blob.  Returns a promise that will resolve to
     * a Blob once loaded, or reject if the URL failed to load.  The data is loaded
     * using XMLHttpRequest, which means that in order to make requests to another origin,
     * the server must have Cross-Origin Resource Sharing (CORS) headers enabled.
     *
     * @exports loadBlob
     *
     * @param {String|Promise} url The URL of the data, or a promise for the URL.
     * @param {Object} [headers] HTTP headers to send with the requests.
     *
     * @returns {Promise} a promise that will resolve to the requested data when loaded.
     *
     * @see <a href='http://www.w3.org/TR/cors/'>Cross-Origin Resource Sharing</a>
     * @see <a href='http://wiki.commonjs.org/wiki/Promises/A'>CommonJS Promises/A</a>
     *
     * @example
     * // load a single URL asynchronously
     * loadBlob('some/url').then(function(blob) {
     *     // use the data
     * }, function() {
     *     // an error occurred
     * });
     */
    var loadBlob = function(url, headers) {
        if (typeof url === 'undefined') {
            throw new DeveloperError('url is required.');
        }

        return when(url, function(url) {
            var deferred = when.defer();

            loadBlob.load(url, headers, deferred);

            return deferred.promise;
        });
    };

    // This is broken out into a separate function so that it can be mocked for testing purposes.
    loadBlob.load = function(url, headers, deferred) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        if (typeof headers !== 'undefined') {
            for ( var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xhr.setRequestHeader(key, headers[key]);
                }
            }
        }

        xhr.responseType = 'blob';

        xhr.onload = function(e) {
            if (xhr.status === 200) {
                deferred.resolve(xhr.response);
            } else {
                deferred.reject(new RequestErrorEvent(xhr.status, xhr.response));
            }
        };

        xhr.onerror = function(e) {
            deferred.reject(new RequestErrorEvent());
        };

        xhr.send();
    };

    loadBlob.defaultLoad = loadBlob.load;

    return loadBlob;
});