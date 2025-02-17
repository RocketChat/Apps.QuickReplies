# Quick Replies with Rocket.Chat

<br />
<div align="center">
  <h3 align="center">Quick Replies Feature for RocketChat</h3>

  <p align="center">
    <a href="https://www.youtube.com/watch?v=a6DpSaHqnU4&t=688s">View Demo</a>
    ·
    <a href="https://github.com/RocketChat/Apps.QuickReplies/issues">Report Bug</a>
    ·
    <a href="https://github.com/RocketChat/Apps.QuickReplies/issues">Request Feature</a>
  </p>
</div>

<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

</div>

## 📜 Getting Started

### Prerequisites

-   You need a Rocket.Chat Server Setup
-   Rocket.Chat.Apps CLI,

*   In case you don't have run:
    ```sh
    npm install -g @rocket.chat/apps-cli
    ```

### ⚙️ Installation

-   Every RocketChat Apps runs on RocketChat Server, thus everytime you wanna test you need to deploy the app with this note. lets start setting up:

1. Clone the repo
    ```sh
    git clone https://github.com/<yourusername>/Apps.QuickReplies
    ```
2. Install NPM packages
    ```sh
    npm ci
    ```
3. Deploy app using:

    ```sh
    rc-apps deploy --url <url> --username <username> --password <password>
    ```

<!-- ABOUT THE PROJECT -->

## ✅ About The Project:

```

The project aims to enhance customer support efficiency by introducing a Quick Replies feature in the helpdesk system.
This will allow agents/user to create, save, and use predefined responses to common queries, accessible via a button or keyboard shortcut.
By selecting quick replies instead of typing manually, agents/users can respond faster and maintain consistent communication, improving productivity and customer satisfaction.

```

## :rocket: Usage :

👋 Need some help with /quick or /qs?

-   **`/quick`**: Get started with Quick Reply
-   **`/quick create`**: Create a new quick reply
-   **`/quick list`**: List all your quick replies
-   **`/quick config`**: Configure your language preferences and AI settings
-   **`/quick ai`**: Use AI to generate replies
-   **`/quick help`**: Get help with Quick Reply
-   **`/qs <reply name>`**: Quickly search and send a reply by name

### Using Placeholders:

When creating or configuring a reply, you can use placeholders like `[name]`, `[username]`, and `[email]` in the reply content. These placeholders will automatically be replaced based on the recipient's information when the message is sent.

<!-- CONTRIBUTING -->

## 🧑‍💻 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue.
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: adds some amazing feature'`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

## 📚 Resources

Here are some links to examples and documentation:

-   [Rocket.Chat Apps TypeScript Definitions Documentation](https://rocketchat.github.io/Rocket.Chat.Apps-engine/)
-   [Rocket.Chat Apps TypeScript Definitions Repository](https://github.com/RocketChat/Rocket.Chat.Apps-engine)
-   [Example Rocket.Chat Apps](https://github.com/graywolf336/RocketChatApps)
-   [DemoApp](https://github.com/RocketChat/Rocket.Chat.Demo.App)
-   [GithubApp](https://github.com/RocketChat/Apps.Github22)
-   Community Forums
    -   [App Requests](https://forums.rocket.chat/c/rocket-chat-apps/requests)
    -   [App Guides](https://forums.rocket.chat/c/rocket-chat-apps/guides)
    -   [Top View of Both Categories](https://forums.rocket.chat/c/rocket-chat-apps)
-   [#rocketchat-apps on Open.Rocket.Chat](https://open.rocket.chat/channel/rocketchat-apps)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/RocketChat/Apps.QuickReplies?style=for-the-badge
[contributors-url]: https://github.com/RocketChat/Apps.QuickReplies/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/RocketChat/Apps.QuickReplies?style=for-the-badge
[forks-url]: https://github.com/RocketChat/Apps.QuickReplies/network/members
[stars-shield]: https://img.shields.io/github/stars/RocketChat/Apps.QuickReplies?style=for-the-badge
[stars-url]: https://github.com/RocketChat/Apps.QuickReplies/stargazers
[issues-shield]: https://img.shields.io/github/issues/RocketChat/Apps.QuickReplies?style=for-the-badge
[issues-url]: https://github.com/RocketChat/Apps.QuickReplies/issues
[license-shield]: https://img.shields.io/github/license/RocketChat/Apps.QuickReplies?style=for-the-badge
[license-url]: https://github.com/RocketChat/Apps.QuickReplies/blob/master/LICENSE.txt
