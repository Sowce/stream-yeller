# Twitch Live Notifier for Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Sowce/stream-yeller)

Deploy to Heroku with these config vars

- `followId`: the twitch user id of the channel you want to have notifications for (not the username)
- `twitchId`: your twitch API client ID
- `webhookUrl`: the discord webhook url to the channel you want the notifications posted in
- `username` _optional_: to override the webhook username
- `avatarUrl` _optional_: to override the webhook avatar
