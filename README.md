# twitchAdSkip
Based upon `refreshTwitchAd.js` (see credits)

## Purpose
This is a script injectable by TamperMonkey (or similar) that attempts to bypass/skip Twitch's obnoxious mid-roll ad process when used in conjunction with effective adblocking filters/rules.  This script itself *won't block ads* - it will skip the placeholder presented by Twitch (see purple image below under `Why`) when ads are effectively blocked.

## Requirements
- Ads adblocked (preferably with [uBlock Origin](https://github.com/gorhill/uBlock) + [odensc's ttv-ublock workaround](https://github.com/odensc/ttv-ublock))
- UserScript manager browser extension, e.g. [TamperMonkey](https://www.tampermonkey.net/) or [GreaseMonkey](https://www.greasespot.net/)
- [FrankerFaceZ extension](https://www.frankerfacez.com/)

## Why
Twitch has very recently & noticeably ramped up its anti-adblock efforts in an effort to increase ad viewership across its platform, presumably to increase profits.
There is currently a non-official workaround for blocking pre-roll (before stream starts) ads, but mid-roll ads are half blocked.  Currently, mid-roll _ads_ are blocked, but a pattern is emerging that Twitch is interrupting stream viewing with a notice regarding "third party tool[s]", specifically for those with ad-blockers in an effort to dissuade their use.

![image](https://user-images.githubusercontent.com/16191979/97927844-b45ba100-1d5d-11eb-9149-b3bfcc4ee7cf.png)
_(Screenshot showing Twitch notice when an adblocker is used.  Because not loading ads is "impacting site performance", and watching ads results in "the best Twitch experience" /s. Blatantly lying to the consumer.)_

## Installation (TamperMonkey, but adaptable to other UserScript managers)
1. Ensure that your browser meets the requirements above
2. Copy the [script](https://raw.githubusercontent.com/Wilkolicious/twitchAdSkip/main/twitchAdSkip.js) to your clipboard
3. Open your TamperMonkey dashboard
4. Find and press the new script button.  In TamperMonkey, this can be found as a tab in the dashboard with a plus-in-a-box icon
![image](https://user-images.githubusercontent.com/16191979/97928662-6d6eab00-1d5f-11eb-9dc6-30a6d266e2dd.png)
5. Paste the code in the edit text area
6. Save (Ctrl-s works, as if saving a Spreadsheet or Document)
7. Ensure that the script is enabled, e.g. green: 
![image](https://user-images.githubusercontent.com/16191979/97933577-1242b580-1d6b-11eb-8af5-018c06ed81ae.png)
8. Reload any twitch streams
9. To update, repeat steps 2-8 (except edit the saved script instead of adding a new one)

## Limitations
- There will be a small delay (~1 second) when the mid-roll ad runs where the stream refreshes.  Really, we need to find a way to stop the ad process before it reaches the player but that requires reverse engineering of Twitch's SPA or some undiscovered adblock rule.
- The script attempts to maintain the volume level between refreshes, but there may be scenarios where it does not.
- If the current adblock mechanism ([currently here](https://github.com/odensc/ttv-ublock)) no longer works, then the stream will keep refreshing until Twitch's app stops pushing an ad.
- Twitch's / AWS IVS engineers are currently breaking these kinds of workarounds/bypasses often.  They are likely reading the discussion threads and deliberately breaking user scipts.  Hi Twitch engineer if you're reading this.

## Privacy
- I don't want your data or want to handle it in any way. 
- The code will always remain auditable here.  
- I am not a nameless face/ghost like the [new owners of NanoAdblocker](https://github.com/NanoAdblocker/NanoCore/issues/362).

The update URLs set in the UserScript are only for ease of use but will mean that updates are sourced directly from the latest commit in this repo.  If you do not trust the code here or want automatic updates, then disable script updates in your UserScript manager and/or remove the following lines from the script in your UserScript manager:
```js
// @updateURL     https://raw.githubusercontent.com/Wilkolicious/twitchAdSkip/main/twitchAdSkip.js
// @downloadURL   https://raw.githubusercontent.com/Wilkolicious/twitchAdSkip/main/twitchAdSkip.js
```

## Credits
- [simple-hacker](https://github.com/simple-hacker) - [initial gist & continuous revisions that this is based upon](https://gist.github.com/simple-hacker/ddd81964b3e8bca47e0aead5ad19a707/)

## License
MIT
