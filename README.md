# Nexus

Nexus is a web-based Discord Permissions Calculator built with Next.js. It allows users to easily generate Discord bot invite links with custom permissions and scopes, and provides a user-friendly interface for managing bot permissions.

## Features
- Calculate Discord bot permissions
- Generate invite URLs with selected permissions and scopes
- Modern, responsive UI
- Built with Next.js and React
- Customizable components

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/ThunderDoesDev/Nexus.git
    cd Nexus
    ```
2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3. Create your local config (this file is gitignored and must not be committed):
    ```bash
    cp settings/config.example.json settings/config.json
    ```
    Fill in your Discord bot token, client secret, session secret, and database credentials. Never push `settings/config.json` to GitHub.

### Running Locally
Start the development server:
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:2028](http://localhost:2028) in your browser to view the app.

### Building for Production
To build the app for production:
```bash
npm run build
```
To start the production server:
```bash
npm start
```


## Project Structure
```
Nexus/
├── public/                # Static assets
├── src/
│   ├── components/
│   │   ├── footer.js
│   │   ├── header.js
│   │   ├── layout.js
│   │   ├── PermissionsCalculator.js
│   │   └── ui/
│   │       ├── button.js
│   │       ├── card.js
│   │       ├── input.js
│   │       └── label.js
│   ├── lib/
│   │   ├── getInviteUrl.js
│   │   ├── permissions.js
│   │   ├── scopes.js
│   │   └── utils.js
│   ├── pages/
│   │   ├── 404.js
│   │   ├── api/
│   │   │   └── bot-info.js
│   │   ├── index.js
│   │   ├── _app.js
│   │   └── _document.js
│   └── styles/
│       └── globals.css
├── package.json           # Project metadata and scripts
├── jsconfig.json          # JS project configuration
├── next.config.mjs        # Next.js configuration
├── postcss.config.mjs     # PostCSS configuration
├── README.md              # Project documentation
```

## Usage
1. Select the permissions your bot needs.
2. Choose the required scopes.
3. Copy the generated invite URL and use it to invite your bot to a server.

## Support

For support, issues or enhancements, please open an issue in this repository or join our discord support server.

[Join Support Server](https://discord.gg/thunderdoesdev)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
