// ==UserScript==
// @name          twitchAdSkip
// @namespace     https://www.twitch.tv/
// @version       2.0
// @description   Script to skip ad placeholder (i.e. purple screen of doom when ads are blocked)
// @author        simple-hacker & Wilkolicious
// @match         https://www.twitch.tv/*
// @grant         none
// @require       https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.11.0/underscore-min.js
// @homepageURL   https://github.com/Wilkolicious/twitchAdSkip
// @updateURL     https://raw.githubusercontent.com/Wilkolicious/twitchAdSkip/main/twitchAdSkip.js
// @downloadURL   https://raw.githubusercontent.com/Wilkolicious/twitchAdSkip/main/twitchAdSkip.js
// ==/UserScript==

(function () {
  'use strict';

  const scriptName = 'twitchAdSkip';
  const adTestSel = '[data-test-selector="ad-banner-default-text"]';
  const ffzResetBtnSel = '[data-a-target="ffz-player-reset-button"]';
  const videoPlayerSel = '[data-a-target="video-player"]';
  const videoPlayervolSliderSel = '[data-a-target="player-volume-slider"]';
  const videoNodeSel = 'video';
  const postFixVolWaitTime = 2000;
  const nodeTypesToCheck = [Node.ELEMENT_NODE, Node.DOCUMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE];

  //
  const maxRetriesFindVideoPlayer = 5;
  const maxRetriesVolListener = 5;
  const maxRetriesVideoPlayerObserver = 5;

  // Volume vals
  let videoNodeVolCurrent;
  let adLaunched = false;

  // Helpers //
  const log = function (logType, message) {
    return console[logType](`${scriptName}: ${message}`);
  };
  const getFfzResetButton = function () {
    return document.querySelector(ffzResetBtnSel);
  };
  const getElWithOptContext = function (selStr, context) {
    context = context || document;
    return context.querySelector(selStr);
  };
  const getVideoNodeEl = function (context) {
    return getElWithOptContext(videoNodeSel, context);
  };
  const getVideoPlayerVolSliderEl = function (context) {
    return getElWithOptContext(videoPlayervolSliderSel, context);
  };
  const getVideoPlayerEl = function (context) {
    return getElWithOptContext(videoPlayerSel, context);
  };

  const attachMO = async function (videoPlayerEl) {
    let resetButton = getFfzResetButton();

    const videoPlayerObserver = new MutationObserver(function (mutations) {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          const canCheckNode = nodeTypesToCheck.includes(node.nodeType);
          if (!canCheckNode) {
            continue;
          }

          const isAdNode = node.querySelector(adTestSel);
          if (!isAdNode) {
            continue;
          }

          log('info', `Found ad node at: ${adTestSel}`);

          // Is ad //
          adLaunched = true;
          if (!resetButton) {
            log('info', `FFZ reset button not loaded - attempting to load...`);

            // Attempt to load the resetButton now
            resetButton = getFfzResetButton();

            if (!resetButton) {
              log('error', `FFZ reset button could not be loaded - refreshing full page.`);

              // Not loaded for some reason
              window.location.reload();
            }
          }

          // Cache current vol props //
          log('info', 'Finding video node to post-fix volume.');
          // Actual video volume
          const videoNodeEl = getVideoNodeEl(videoPlayerEl);
          log('info', `Volume before reset: ${videoNodeVolCurrent}`);

          // Cosmetic vol slider
          const videoPlayerVolSliderEl = getVideoPlayerVolSliderEl(videoPlayerEl);
          const videoPlayerVolSliderCurrent = parseInt(videoPlayerVolSliderEl.value, 10).toFixed(2);

          log('info', `Triggering FFZ reset button...`);
          resetButton.dispatchEvent(new MouseEvent('dblclick', {
            bubbles: true,
            cancelable: true,
            view: window
          }));

          log('info', `Fixing volume to original value of '${videoNodeVolCurrent}' after interval of '${postFixVolWaitTime}' ms`);
          setTimeout(() => {
            // Does the video player element still exist after reset?
            if (!videoPlayerEl) {
              log('info', 'Video player element destroyed after reset - sourcing new element...');
              videoPlayerEl = getVideoPlayerEl();
            }

            // Does the video node still exist after reset?
            if (!videoNodeEl) {
              log('info', 'Video node destroyed after reset - sourcing new node...');
              videoNodeEl = getVideoNodeEl(videoPlayerEl);
            }

            // Fix video vol
            const preFixVol = videoNodeEl.volume;
            videoNodeEl.volume = videoNodeVolCurrent;
            log('info', `Post-fixed volume from reset val of '${preFixVol}' -> '${videoNodeVolCurrent}'`);

            // Fix video player vol slider
            // TODO: this may not work due to this input being tied to the js framework component
            if (!videoPlayerVolSliderEl) {
              videoPlayerVolSliderEl = getVideoPlayerVolSliderEl(videoPlayerEl);
            }
            videoPlayerVolSliderEl.value = videoPlayerVolSliderCurrent;

            adLaunched = false;
          }, postFixVolWaitTime);
        }
      }
    });

    videoPlayerObserver.observe(videoPlayerEl, {
      childList: true,
      subtree: true
    });
    log('info', 'Video player observer attached');
  };

  const listenForVolumeChanges = async function (videoPlayerEl) {
    const videoNodeEl = getVideoNodeEl(videoPlayerEl);

    if (!videoNodeEl) {
      throw new Error('Video player element not found.  If it is expected that there is no video on the current page (e.g. Twitch directory), then ignore this error.');
    }

    // Initial load val
    videoNodeVolCurrent = videoNodeEl.volume.toFixed(2);
    log('info', `Initial volume: '${videoNodeVolCurrent}'.`);

    const videoPlayerVolSliderEl = getVideoPlayerVolSliderEl(videoPlayerEl);

    if (!videoPlayerVolSliderEl) {
      throw new Error('Video player volume slider not found.  Perhaps application is in picture-in-picture mode?');
    }

    const setCurrentVolume = (event) => {
      // Ignore any vol changes for ads
      if (document.querySelector(adTestSel) || adLaunched) {
        return;
      }

      // Always find the video node element as Twitch app may have re-created tracked element
      videoNodeVolCurrent = getVideoNodeEl(videoPlayerEl).volume.toFixed(2);
      log('info', `Volume modified to: '${videoNodeVolCurrent}'.`);
    };

    // Standard volume change listeners
    videoPlayerVolSliderEl.addEventListener('keyup', (event) => {
      if (!event.key) {
        return;
      }

      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) {
        return;
      }
      setCurrentVolume(event);
    });

    videoPlayerVolSliderEl.addEventListener('mouseup', setCurrentVolume);
    videoPlayerVolSliderEl.addEventListener('scroll', (event) => _.debounce(setCurrentVolume, 1000));

    // TODO: FFZ scrollup & scrolldown support
  };

  const retryWrap = function(fnToRetry, args, intervalInMs, maxRetries, actionDescription) {
    const retry = (fn, retries = 3) => fn()
      .catch((e) => {
        if (retries <= 0) {
          log('error', `${actionDescription} - failed after ${maxRetries} retries.`)
          return Promise.reject(e);
        }
        log('warn', `${actionDescription} - retrying another ${retries} time(s).`);
        return retry(fn, --retries)
      });

    const delay = ms => new Promise((resolve) => setTimeout(resolve, ms));
    const delayError = (fn, args, ms) => () => fn(...args).catch((e) => delay(ms).then((y) => Promise.reject(e)));
    return retry(delayError(fnToRetry, args, intervalInMs), maxRetries);
  };

  const spawnFindVideoPlayerEl = async function() {
    const actionDescription = 'Finding video player';
    log('info', `${actionDescription}...`);
    const findVideoPlayerEl = async () => {
      const videoPlayerEl = document.querySelector(videoPlayerSel);
      if (!videoPlayerEl) {
        return Promise.reject('Video player not found.');
      }
      return videoPlayerEl;
    };
    return await retryWrap(findVideoPlayerEl, [], 2000, maxRetriesFindVideoPlayer, actionDescription);
  };

  const spawnVolumeChangeListener = async function(videoPlayerEl) {
    const actionDescription = 'Listening for volume changes';
    log('info', `${actionDescription}...`);
    retryWrap(listenForVolumeChanges, [videoPlayerEl], 2000, maxRetriesVolListener, actionDescription);
  };

  const spawnVideoPlayerAdSkipObservers = async function(videoPlayerEl) {
    const actionDescription = 'Attaching MO';
    log('info', `${actionDescription}...`);
    retryWrap(attachMO, [videoPlayerEl], 2000, maxRetriesVideoPlayerObserver, actionDescription);
  };

  const spawnObservers = async function () {
    try {
      const videoPlayerEl = await spawnFindVideoPlayerEl();

      if (!videoPlayerEl) {
        throw new Error('Could not find video player.');
      }
      log('info', 'Success - video player found.');

      spawnVolumeChangeListener(videoPlayerEl);
      spawnVideoPlayerAdSkipObservers(videoPlayerEl);
    } catch (error) {
      log('error', error);
    }
  }

  log('info', 'Page loaded - attempting to spawn observers...');
  spawnObservers();

  log('info', 'Overloading history push state')
  var pushState = history.pushState;
  history.pushState = function () {
    pushState.apply(history, arguments);

    log('info', 'History change - attempting to spawn observers...')
    spawnObservers();
  };
})();
