// ==UserScript==
// @name         twitchAdRefreshV2
// @namespace    https://www.twitch.tv/
// @version      1.0
// @description  TBD
// @author       SimpleHacker & Wilkolicious
// @match        https://www.twitch.tv/*
// @grant        none
// @homepageURL
// @updateURL
// @downloadURL
// ==/UserScript==

(function () {
  'use strict';

  const scriptName = 'twitchAdRefreshV2';
  const adTestSel = '[data-test-selector="ad-banner-default-text"]';
  const ffzResetBtnSel = '[data-a-target="ffz-player-reset-button"]';
  const videoPlayerSel = '[data-a-target="video-player"]';
  const videoPlayervolSliderSel = '[data-a-target="player-volume-slider"]';
  const videoNodeSel = 'video';
  const postFixVolWaitTime = 5000;
  const nodeTypesToCheck = [Node.ELEMENT_NODE, Node.DOCUMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE];

  // Volume vals
  let videoNodeVolCurrent;
  let adLaunched = false;

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

  const attachMO = function (videoPlayerEl) {
    let resetButton = getFfzResetButton();

    const observer = new MutationObserver(function (mutations) {
      for (const muation of mutations) {
        for (const node of muation.addedNodes) {
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

            // Prefer volume slider as source of truth for now
            if (videoPlayerVolSliderCurrent !== videoNodeVolCurrent) {
              videoNodeVolCurrent = videoPlayerVolSliderCurrent;
            }

            // Fix video vol
            const preFixVol = videoNodeEl.volume;
            videoNodeEl.volume = videoNodeVolCurrent;
            log('info', `Post-fixed volume from reset val of '${preFixVol}' -> '${videoNodeVolCurrent}'`);

            // Fix video player vol slider
            if (!videoPlayerVolSliderEl) {
              videoPlayerVolSliderEl = getVideoPlayerVolSliderEl(videoPlayerEl);
            }
            videoPlayerEl.value = videoPlayerVolSliderCurrent;

            adLaunched = false;
          }, postFixVolWaitTime);
        }
      }
    });

    observer.observe(videoPlayerEl, {
      childList: true,
      subtree: true
    });
  };

  const listenForVolumeChanges = function (videoPlayerEl) {
    const videoNodeEl = getVideoNodeEl(videoPlayerEl);

    // Initial load val
    videoNodeVolCurrent = videoNodeEl.volume.toFixed(2);
    log('info', `Initial volume: '${videoNodeVolCurrent}'.`);

    // On change
    videoNodeEl.addEventListener('volumechange', (event) => {
      // Ignore any vol changes for ads
      if (document.querySelector(adTestSel) || adLaunched) {
        return;
      }

      videoNodeVolCurrent = event.currentTarget.volume.toFixed(2);
      log('info', `Volume modified to: '${videoNodeVolCurrent}'.`);
    });
  };

  const findVideoPlayer = function () {
    const videoPlayerEl = document.querySelector(videoPlayerSel);

    if (videoPlayerEl) {
      log('info', 'Success - video player found.');

      log('info', 'Listening for volume changes...');
      listenForVolumeChanges(videoPlayerEl);

      log('info', 'Attaching MO...');
      attachMO(videoPlayerEl);
      return;
    }

    log('error', 'Error - could not find video player.');
  }

  // window.onload = function() {
  log('info', 'Page loaded - attempting to find video player & attach MO.');
  findVideoPlayer();

  log('info', 'Overloading history push state')
  var pushState = history.pushState;
  history.pushState = function () {
    pushState.apply(history, arguments);

    log('info', 'Attempting to find video player & attach MO after history change.')
    findVideoPlayer();
  };
  // }
})();
