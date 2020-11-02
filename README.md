# twitchAdRefreshV2

## Purpose
This is a script injectable by TamperMonkey (or similar) that attempts to bypass/skip Twitch's obnoxious mid-roll process.

## Requirements
- UserScript manager browser extension, e.g. [TamperMonkey](https://www.tampermonkey.net/) or [GreaseMonkey](https://www.greasespot.net/)
- [FrankerFaceZ extension](https://www.frankerfacez.com/)

## Why
Twitch has very recently & noticeably ramped up its anti-adblock efforts in an effort to increase ad viewership across its platform, presumably to increase profits.
There is currently a non-official workaround for blocking pre-roll (before stream starts) ads, but mid-roll ads are half blocked.  Currently, mid-roll _ads_ are blocked, but a pattern is emerging that Twitch is interrupting stream viewing with a notice regarding "third party tool[s]", specifically for those with ad-blockers in an effort to dissuade their use.

![image](https://user-images.githubusercontent.com/16191979/97927844-b45ba100-1d5d-11eb-9149-b3bfcc4ee7cf.png)
_(Screenshot showing Twitch notice when an adblocker is used.  Because not loading ads is "impacting site performance", and watching ads results in "the best Twitch experience". /s  Blatantly lying to the consumer.)_

## Installation (TamperMonkey but adaptable to other UserScript managers)
1. Ensure that your browser meets the requirements above
2. Copy the [script](https://raw.githubusercontent.com/Wilkolicious/twitchAdRefreshV2/main/twitchAdRefreshV2.js) to your clipboard
3. Open your TamperMonkey dashboard
4. Find and press the new script button.  In TamperMonkey, this can be found as a tab in the dashboard with a plus-in-a-box icon
![image](https://user-images.githubusercontent.com/16191979/97928662-6d6eab00-1d5f-11eb-9dc6-30a6d266e2dd.png)
5. Paste the code in the edit text area
6. Save (Ctrl-s works, as if saving a Spreadsheet or Document)
7. Reload any twitch streams
8. To update, repeat steps 2-7 (except edit the saved script instead of adding a new one)

## Credits
- [simple-hacker](https://github.com/simple-hacker) - [initial gist & continuous updates that this is based upon](https://gist.github.com/simple-hacker/ddd81964b3e8bca47e0aead5ad19a707/)
