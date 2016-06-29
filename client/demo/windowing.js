// ESLint doesn't provide a good way of turning of the ES6 features... so we'll have to do it
// manually.
/* eslint-disable no-var, prefer-arrow-callback, prefer-template, strict */
/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */

'use strict';

(function windowing() {
    var APP_SOURCE = './start.html';
    var ADD_FRAME_HANDLER_QUERY = '#add-frame-handler';
    var IFRAME_QUERY = 'iframe[src="' + APP_SOURCE + '"]';
    var INITIAL_WINDOWS = 1;
    var MAX_FRAMES = 4;
    var ORIG_DOCUMENT_TITLE = document.title;

    var addFrameHandler = document.querySelector(ADD_FRAME_HANDLER_QUERY);
    var frames = [];
    var nextFrameNum = 0;

    /** Functions **/
    function addFrame() {
        // Create a new iframe, decorate it some handlers for closing, etc, and wrap it in a
        // container
        var newFrameContainer = decorateFrameWithCapabilities(createFrame());

        frames.push(newFrameContainer);
        adjustFrameSizing(frames);

        if (frames.length === MAX_FRAMES) {
            addFrameHandler.disabled = true;
        }

        // Finally, push new window into DOM body
        document.body.appendChild(newFrameContainer, addFrameHandler);
    }

    // Adjust sizing of each frame based on the total number of frames
    function adjustFrameSizing(totalFrames) {
        // Size windows into a 2-column grid
        var numGridCells = totalFrames.length % 2 ? (totalFrames.length + 1) : totalFrames.length;
        var baseFrameHeight = 100 / (numGridCells / 2);
        var baseFrameWidth = 50;
        var baseFrameHeightPercentage = baseFrameHeight + '%';
        var baseFrameWidthPercentage = baseFrameWidth + '%';

        totalFrames.forEach(function resizeFrame(frame, ii) {
            var overflowWidthPercentage;

            if (ii === totalFrames.length - 1 && totalFrames.length % 2) {
                // When there are an odd number of frames, make the last frame overflow to cover
                // the leftover bottom area of the screen
                overflowWidthPercentage = (2 * baseFrameWidth) + '%';

                frame.style.height = baseFrameHeightPercentage;
                frame.style.width = overflowWidthPercentage;
            } else {
                frame.style.height = baseFrameHeightPercentage;
                frame.style.width = baseFrameWidthPercentage;
            }
        });
    }

    // Creates a new iframe
    function createFrame() {
        var frame = document.createElement('iframe');
        frame.id = getNextFrameId();
        frame.name = frame.id;
        frame.src = APP_SOURCE;

        // Frames are always 100% of their containers
        frame.height = '100%';
        frame.width = '100%';

        return frame;
    }

    // Wrap the iframe with a container, add back and close functionality, and attach event listeners
    function decorateFrameWithCapabilities(frame) {
        var container = document.createElement('div');
        var backButton = document.createElement('button');
        var closeButton = document.createElement('button');

        // Set up container
        container.className = 'frame-container';

        // Set up backButton
        backButton.className = 'button--back-frame';
        backButton.innerHTML = 'Back';
        backButton.onclick = function goBackInFrame() {
            frame.contentWindow.history.back();
        };

        // Set up close button
        closeButton.className = 'button--close-frame';
        closeButton.innerHTML = 'Close window ' + frame.name.replace(/example-frame-/, '');
        closeButton.onclick = function closeFrame() {
            var removeIndex = frames.indexOf(container);
            var nextDevtoolFrame;

            if (removeIndex > -1) {
                frames.splice(removeIndex, 1);
            }

            // __REACT_DEVTOOLS_HOLDER__ holds the window of the iframe that is attached to the
            // devtools during development mode. If we are closing that window, attach the devtools
            // to the next iframe.
            // eslint-disable-next-line no-underscore-dangle
            if (window.__REACT_DEVTOOLS_HOLDER__ === frame.contentWindow) {
                nextDevtoolFrame = frames[0] && frames[0].querySelector(IFRAME_QUERY);

                if (nextDevtoolFrame) {
                    attachFrameWithReactDevtools(nextDevtoolFrame);
                } else {
                    detachCurrentFrameFromReactDevtools();
                }
            }

            // Remove the frame from the DOM, adjust remaining frames' sizes, and allow more windows
            // to be created
            container.parentNode.removeChild(container);

            adjustFrameSizing(frames);
            addFrameHandler.disabled = false;
        };

        // Set up frame listeners
        frame.onfocus = function frameOnFocus() {
            document.title = frame.contentDocument.title;
        };
        frame.onblur = function frameOnBlur() {
            document.title = ORIG_DOCUMENT_TITLE;
        };

        container.appendChild(backButton);
        container.appendChild(closeButton);
        container.appendChild(frame);

        return container;
    }

    // Gets next frame id
    function getNextFrameId() {
        return 'example-frame-' + (++nextFrameNum);
    }

    /**
     * Devtool utils
     *
     * Use __REACT_DEVTOOLS_HOLDER__ to determine which frame the devtool is attached to
     */
    // Deregister the current frame from React devtools
    function detachCurrentFrameFromReactDevtools() {
        /* eslint-disable no-underscore-dangle */
        if (window.__REACT_DEVTOOLS_HOLDER__) {
            window.__REACT_DEVTOOLS_HOLDER__.__REACT_DEVTOOLS_GLOBAL_HOOK__ = null;
        }

        window.__REACT_DEVTOOLS_HOLDER__ = null;
        /* eslint-enable no-underscore-dangle */
    }

    // Register frame with React devtools
    function attachFrameWithReactDevtools(frame) {
        /* eslint-disable no-underscore-dangle */
        // If the frame's hasn't loaded far enough yet to have a window, then we'll give up
        if (frame.contentWindow) {
            frame.contentWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__ = __REACT_DEVTOOLS_GLOBAL_HOOK__;

            window.__REACT_DEVTOOLS_HOLDER__ = frame.contentWindow;
        } else {
            console.error('Tried to attach React devtools to window: ' + frame.name + ' but ' +
                          'frame was not loaded yet. React devtools will not be available.');
        }
        /* eslint-enable no-underscore-dangle */
    }

    /** Initialization **/
    // Initialize initial iframe windows
    (function initializeWindows(numWindows) {
        var ii;

        for (ii = 0; ii < numWindows; ++ii) {
            addFrame();
        }
    }(INITIAL_WINDOWS));

    // Attach action listener to addFrameHandler
    addFrameHandler.onclick = addFrame;
}());
