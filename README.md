# DevTab - Developer's New Tab Chrome Extension

A modern, developer-focused new tab page replacement for Chrome with useful widgets and tools.

## Features

- 🌙 Modern dark theme with a clean, minimalist design
- 🔍 Smart search bar with developer shortcuts
- ⚡ Quick access to common developer tools and resources
- 📊 GitHub activity widget
- 💻 Code snippet of the day
- 📰 Developer news feed
- 📈 System resource monitor
- ⚙️ Customizable layout and widgets

## Search Shortcuts

- `/mdn [query]` - Search Mozilla Developer Network
- `/gh [query]` - Search GitHub
- `/so [query]` - Search Stack Overflow
- `/npm [query]` - Search npm packages

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Configuration

### GitHub Integration
To enable GitHub activity widget:
1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
2. Generate a new token with `repo` and `user` scopes
3. Add your GitHub username and token in the extension settings

### News Sources
Configure your preferred developer news sources in the extension settings.

## Development

### Project Structure
```
├── manifest.json
├── index.html
├── styles/
│   └── main.css
├── js/
│   └── main.js
└── assets/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Local Development
1. Make changes to the source code
2. Reload the extension in `chrome://extensions`
3. Open a new tab to see your changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 