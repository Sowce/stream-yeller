# Twitch Live Notifier for Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Sowce/stream-yeller)

Deploy to Heroku with these config vars

- `streamName`: the twitch channel's name
- `clientId`: your twitch API client ID
- `accessToken`: your twitch API access token
- `webhookUrl`: the discord webhook url to the channel you want the notifications posted in
- `username` _optional_: to override the webhook username
- `avatarUrl` _optional_: to override the webhook avatar
- `checkDelay` _optional_: delay in seconds between checks, see it as the maximum of time you want to allow the notification delay to be
- `message` _optional_: adds a message to the discord notification (up to 2000 characters)
