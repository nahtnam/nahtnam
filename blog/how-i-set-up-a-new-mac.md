---
title: "How I Set Up a New Mac"
excerpt: "These are the first things I do when I set up a new Mac"
category: "Tech"
publishedAt: "2022-10-15T07:00:00.000Z"
---

## Brave

The best combination of Google Chrome's rendering engine and Safari's privacy

[https://brave.com/](https://brave.com/)

## Missve

I've found it to be the best cross platform email client in comparison to the default app, Spark, and Newton.

[https://missiveapp.com/](https://missiveapp.com/)

## Cron

The best calendar app that syncs your personal and work calendars. There is unfortunately no mobile app so I use Google Calendar on my phone.

[https://cron.com/](https://cron.com/)

## AltTab Macos

Makes it so that your `cmd` + `tab` cycles through windows instead of entire applications (kind of like on Windows)

[https://alt-tab-macos.netlify.app/](https://alt-tab-macos.netlify.app/)

- Open AltTab and give it the permissions it needs
- Make sure "Start at Login" is checked

![AltTab start at login](/assets/images/blog/how-i-set-up-a-new-mac/alttab-start.png)

- Set the command to use `cmd` + `tab` and show windows from "All Apps + Visible Spaces + Screen showing AltTab".

![AltTab shortcut](/assets/images/blog/how-i-set-up-a-new-mac/alttab-shortcut.png)

- Ensure "Hide apps with no open window" is checked

![AltTab hide](/assets/images/blog/how-i-set-up-a-new-mac/alttab-hide.png)

## Raycast

Replaces Spotlight with a much smarter alternative that also supports integrations with third party apps.

[https://www.raycast.com/](https://www.raycast.com/)

- Give it whatever permissions it needs
- Go to System Preferences > Keyboard > Shortcuts > Spotlight and disable "Show Spotlight Search"

![Disable Spotlight](/assets/images/blog/how-i-set-up-a-new-mac/disable-spotlight.png)

- Then go back to Raycast and change the hotkey to `cmd` + `space`

![Raycast shortcut](/assets/images/blog/how-i-set-up-a-new-mac/raycast-shortcut.png)

## Todoist

The best way to manage all of the tasks in your life

[https://todoist.com/](https://todoist.com/)

## MacOS Tweaks

### Show Battery %

- Go to System Preferences > Dock & Menu Bar > Battery > Show Percentage

![Battery percent](/assets/images/blog/how-i-set-up-a-new-mac/battery-percent.png)

### Show Bluetooth Quick Settings

- In System Preferences > Bluetooth, enable "Show in menu bar"

![Show Bluetooth](/assets/images/blog/how-i-set-up-a-new-mac/show-bluetooth.png)

### Show Volume Quick Setting

- In System Preferences > Sound, enable "Show Sound in menu bar always"

![Show Sound](/assets/images/blog/how-i-set-up-a-new-mac/show-sound.png)

### Remove Auto Shuffling of Desktops

By default MacOS changes the order of your desktops based on what you use but thats stupid if you like to keep certain apps in certain desktops

- In System Preferences > Mission Control, uncheck the first option

![Disable auto shuffle](/assets/images/blog/how-i-set-up-a-new-mac/disable-auto-shuffle.png)

### Sync Google Stuff

I have my contacts on Google so I want to sync that.

- Under System Preferences > Internet Accounts, add Google
- I enable Contacts and disable the rest. I also disable the Calendar, Contacts, and Email from iCloud. I don't sync my email since I use Missive for that, and I don't sync calendars since I use Cron for that..

![Sync Google](/assets/images/blog/how-i-set-up-a-new-mac/sync-google.png)

### Enable Auto Hiding

I rarely use the doc, Raycast does most of the heavy lifting for me so I enable auto hiding for some more screen real estate

- Right click the dock and press that button

![Auto hide dock](/assets/images/blog/how-i-set-up-a-new-mac/auto-hide-dock.png)

### Show Seconds

Show seconds in the top right

- Go to System Preferences > Doc & Menu Bar > Clock and check "Display time with seconds"

![Show seconds](/assets/images/blog/how-i-set-up-a-new-mac/show-seconds.png)

## Amethyst (Highly Optional)

If you like tiling WM's then amethyst is probably the easiest to use

[https://ianyh.com/amethyst/](https://ianyh.com/amethyst/)

## Magnet

If you don't know what a tiling WM is then install Magnet instead.

[https://apps.apple.com/us/app/magnet/id441258766](https://apps.apple.com/us/app/magnet/id441258766)

## VSCode

The best text editor for Mac

[https://code.visualstudio.com/](https://code.visualstudio.com/)

## Spotify

For music! I've found that their curated radios are much better than Apple Music's.

[https://www.spotify.com](https://www.spotify.com)

## Terminal Stuff

### Brew

The best CLI tool for mac

[https://brew.sh/](https://brew.sh/)

### (Oh My) ZSH

A much better terminal experience

- Run `brew install zsh`
- Run the command from here: [https://ohmyz.sh](https://ohmyz.sh)
- If either of these steps didnt ask you for your password then run `chsh -s /bin/zsh` It changes your default shell to ZSH
- Reboot your computer (not required but a good idea)
- Set up ZSH suggestions
  - Follow this: [https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md#oh-my-zsh](https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md#oh-my-zsh)
  - After you update ~/.zshrc, you will have to run `source ~/.zshrc` to load the changes or restart iterm
  - When you start typing a command, it will suggest one for you and you can press the right arrow key to use that command
- Autojump
  - Follow this: [https://github.com/wting/autojump#os-x](https://github.com/wting/autojump#os-x)
  - Add this to your `~/.zshrc`: `[ -f /usr/local/etc/profile.d/autojump.sh ] && . /usr/local/etc/profile.d/autojump.sh`
  - After visiting a bunch of folders you can type `j XXXX` to jump to a folder. If you have something like `~/Desktop/Program 1` you can now just do `j Program 1` and it will go to it for you. NOTE: It will only work if you have CD'ed into that folder at least once AFTER installing autojump

### Iterm 2

The best macos terminal

[https://iterm2.com/](https://iterm2.com/)

- Open it, go to Preferences > Profile > Keys. Press "Load Preset" and select Natural Text Editing ([https://apple.stackexchange.com/a/293988](https://apple.stackexchange.com/a/293988))

### Lazy Git

The easiest way to use git for lazy people like me.

[https://github.com/jesseduffield/lazygit](https://github.com/jesseduffield/lazygit)

- Add `alias gg='lazygit'` to your zshrc.
