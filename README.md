# Social Scheduler

This Payload CMS Plugin gives you the power to connect different social-media accounts and schedule posts!

## Supported Platforms

- [ ] Instagram
- [x] Mastodon
- [ ] YouTube (Not yet started)
- [ ] TikTok (Not yet started)
- [ ] BlueSky (Not yet started)

## Features

- [x] OAuth Login
- [ ] Schedule Posts
- [ ] Auto-Renew Logins (Instagram)

## How to use?

### Mastodon

You don't need any configuration. Every Mastodon Instance will create a Client-App for the plugin on the first request. That client is then stored locally, so we don't create multiple or get rate-limited.

### Instagram

You need a `client_secret` and `client_id` for Instagram. This plugin can't auto-generate that. To get that, you can follow [this guide](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/create-a-meta-app-with-instagram)
