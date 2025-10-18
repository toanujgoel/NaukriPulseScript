# 🚀 Quick Setup Guide

This guide will help you get the Naukri Pulse Script running on your system.

## Step 1: Install Node.js

### Windows
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (18.x or higher)
3. Run the installer and follow the setup wizard
4. Restart your command prompt/PowerShell

### macOS
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 2: Verify Installation

Open a new terminal/command prompt and run:
```bash
node --version
npm --version
```

You should see version numbers like:
```
v18.17.0
9.6.7
```

## Step 3: Install Project Dependencies

Navigate to the project directory and run:
```bash
npm install
```

This will:
- Install all required dependencies
- Download Playwright browsers automatically
- Set up the project for use

## Step 4: Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your preferences:
   ```env
   HEADLESS=true
   MIN_DELAY_SECONDS=1200
   MAX_DELAY_SECONDS=1800
   HEADLINE_POOL=Experienced Software Developer,Full Stack Engineer,Senior Backend Developer
   ```

## Step 5: One-Time Authentication

Run the login script to save your Naukri.com session:
```bash
npm run login
```

This will:
- Open a browser window
- Navigate to Naukri.com login
- Wait for you to complete login (including OTP)
- Save your session for automated runs

## Step 6: Start the Script

### Continuous Mode (Recommended)
```bash
npm start
```

### Single Update
```bash
npm run once
```

## Troubleshooting

### "npm not found" Error
- Restart your terminal after installing Node.js
- Make sure Node.js was installed correctly
- Try running `node --version` first

### "Playwright browsers not found"
```bash
npx playwright install
```

### Permission Issues (Linux/macOS)
```bash
sudo npm install -g npm
```

### Firewall/Antivirus Issues
- Add Node.js and npm to your firewall exceptions
- Temporarily disable antivirus during installation

## Validation

Run the validation script to check your setup:
```bash
node validate.js
```

This will verify that all files are in place and properly configured.

## Need Help?

1. Check the main [README.md](README.md) for detailed documentation
2. Ensure you have Node.js 18+ installed
3. Make sure all dependencies are installed with `npm install`
4. Verify your `.env` configuration

---

**Ready to automate your Naukri profile! 🎯**