# Hyperfy Development Environment Setup Guide

This guide will walk you through setting up your development environment for working with the Hyperfy project.

## Prerequisites

Before you begin, ensure you have administrator access to your machine and a terminal application installed.

### Windows Setup Guide

If you're using Windows, you'll need to set up the Windows Subsystem for Linux (WSL). This allows you to run a Linux environment directly on Windows.

#### 1. System Requirements

- Windows 10 version 2004 and higher (Build 19041 and higher) or Windows 11
- At least 8GB of RAM (16GB recommended)
- Administrator access

#### 2. Install WSL

1. Open PowerShell as Administrator (right-click, "Run as administrator")
2. Install WSL with Ubuntu by running:
   ```powershell
   wsl --install
   ```
   This command will:
   - Enable the WSL feature
   - Install the WSL kernel
   - Set WSL 2 as default
   - Install Ubuntu (default Linux distribution)

3. Restart your computer when prompted

#### 3. First-time Ubuntu Setup

1. After restart, the Ubuntu terminal will open automatically
2. Create a new UNIX username when prompted (can be different from your Windows username)
3. Set a password for your Ubuntu account
4. Update your Ubuntu packages:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
 
## Required Tools

### 1. Node Version Manager (nvm)

NVM helps manage multiple Node.js versions.

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Add nvm to your current terminal session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Verify installation
nvm --version
```

### 2. Node.js

The project requires Node.js version 22.11.0:

```bash
# Install and use the required Node.js version
nvm install 22.11.0
nvm use 22.11.0

# Verify installation
node --version # Should output v22.11.0
```

### 3. NPM

The project requires npm version 10.0.0 or higher:

```bash
# Verify npm version
npm --version # Should be >=10.0.0

# Update npm if needed
npm install -g npm@latest
```

### 4. Git

Git is required for version control:

```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install git

# Verify installation
git --version
```

## Project Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/hyperfy-xyz/hyperfy.git
cd hyperfy
```

### 2. Install Dependencies

```bash
# Install project dependencies
npm install
```

### 3. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your preferred editor and update the values
# nano .env or vim .env
```

Key environment variables to configure:

```bash
# Server Configuration
PORT=3000                    # The port the server runs on
WORLD=world                  # The world folder to run
JWT_SECRET=hyper            # Secret for JSON web tokens
ADMIN_CODE=                 # Admin access code (blank = everyone is admin)

# Save Settings
SAVE_INTERVAL=60            # World save interval in seconds (0 to disable)

# Upload Configuration
PUBLIC_MAX_UPLOAD_SIZE=12   # Maximum upload file size in MB

# Public URLs
PUBLIC_WS_URL=http://localhost:3000/ws           # WebSocket URL
PUBLIC_API_URL=http://localhost:3000/api         # API URL
PUBLIC_ASSETS_URL=http://localhost:3000/assets   # Assets URL
```

## Development Tools

The project uses several development tools that are installed automatically with `npm install`:

- **ESLint**: For code linting with React support
- **Prettier**: For code formatting
- **esbuild**: For fast bundling
- **Three.js**: Version 0.173.0 for 3D graphics
- **React**: Version 18.3.1 for UI components
- **Fastify**: Version 5.0.0 for the server

## Project Structure

```
hyperfy/
├── src/             # Source code
├── world/           # World configuration and assets
├── build/           # Build output
├── docs/           # Documentation
└── .vscode/        # VS Code configuration
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build the project
npm run build

# Start the server
npm start

# Format and lint code
npm run format
npm run lint
npm run lint:fix
npm run check

# Clean world data
npm run world:clean
```

## Common Issues and Troubleshooting

### Node.js Version Issues

If you see errors related to Node.js version:
```bash
nvm use 22.11.0
```

### NPM Installation Issues

If you encounter NPM-related errors:
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install
```

### ESLint/Prettier Issues

If you encounter formatting issues:
```bash
# Fix linting issues
npm run lint:fix

# Fix formatting
npm run format
```

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Fastify Documentation](https://fastify.dev/docs/latest/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)

## Getting Help

If you encounter any issues not covered in this guide:

1. Check the project's [GitHub Issues](https://github.com/hyperfy-xyz/hyperfy/issues)
2. Review the documentation in the `docs/` directory
3. Read through CONTRIBUTING.md and CODE_OF_CONDUCT.md
4. Reach out to the development team through the appropriate channels

## Next Steps

After completing the setup:

1. Review the project's README.md
2. Explore the example world in the `world/` directory
3. Read through the documentation
4. Set up your IDE with recommended extensions
5. Join the project's community channels

---

*Note: Keep this guide updated as project requirements change. Last updated: [Current Date]* 