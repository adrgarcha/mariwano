<h1 align="center">
    🤝 Contributing to Mariwano
</h1>

First of all, thank you for your interest on contributing to our project. It means a lot to us as developers who want to create a community around this project ❤️.

## Before you contribute

1. Look for an open issue, don't worry if you don't find one, new issues are welcome!

2. Create a new branch, if it does not exist, on that issue, and name it `feature-N`, where *N* is the issue number. 

3. When you have everything ready, create a Pull Request specifying your improvements or contributions referring to the issue.

4. You will receive an email when your Pull Request has been reviewed.

5. **Congratulations!** You have already contributed to Mariwano.

### Commit policy

Follow these commit conventions to ensure neatness:

- Format: `[type]: [brief description]`
- Example: `feat: add audio player`

Types:

- feat: new feature
- fix: bug fix
- docs: documentation changes
- refactor: code restructuring
- test: adding or updating tests

### Pull Requests

When submitting a Pull Request (PR):

- Title: follow the format `[type]: [description]`.
- Description: provide a clear description of the changes made and how to test them correctly.

Make sure to assign a reviewer first, and that your PR pass the CI checks by the way, if not, fix them before submitting.

## Set-up 

### Requirements

- Node.js v22.12.0
- npm v10.9.0

**Related to Discord:**
- Discord Developer Portal account (for the bot token)
- Discord Bot Token (required for bot interaction)
- A Discord account (to test the bot)

**Development environment:**
- Visual Studio Code (recommended for code editing)
- Prettier (automatic code formatting)
- FFmpeg (required for the audio player)
  
**Envornment variables:** Check the [.env.example](./.env.example) file to see the environment variables that are needed for various features:

- DISCORD_TEST_TOKEN: the token of your discord bot.
- CLIENT_TEST_ID: the Client ID of your discord bot.
- MONGODB_URI: the URI to your MongoDB database.
- YOUTUBE_API_KEY: the API Key of Youtube.

## Getting started

1. Fork this repository.

2. Clone the repository to your machine. Type in the terminal:
```
git clone https://github.com/your-fork/mariwano.git
```

3. Install the dependencies: 
```
npm install
```

4. Start the bot: 
```
npm run dev
```