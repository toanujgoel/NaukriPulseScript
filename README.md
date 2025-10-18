# 🚀 Naukri Pulse Script

An automated TypeScript + Playwright solution for updating your Naukri.com resume headline on a schedule. This script helps keep your profile active and visible to recruiters by rotating through different professional headlines.

## ✨ Features

- **Automated Headline Rotation**: Cycles through a pool of professional headlines
- **Smart Rotation Logic**: Avoids repeating the current or recently used headlines
- **Robust Selectors**: Multiple fallback strategies for reliable element detection
- **Human-like Behavior**: Random delays and typing patterns to avoid detection
- **Session Management**: One-time login with persistent authentication
- **Comprehensive Logging**: Pretty console output + JSONL file logging
- **Graceful Error Handling**: Screenshots on failure, retry logic, and detailed error reporting
- **Flexible Scheduling**: Configurable delays between updates (20-30 minutes default)
- **Command Line Interface**: Support for single runs or continuous operation

## 📋 Prerequisites

- **Node.js 18+** (Required)
- **Windows/macOS/Linux** (Cross-platform support)
- **Naukri.com Account** (Valid credentials required)

## 🛠️ Installation

1. **Clone or download this project**
   ```bash
   cd NaukriPulseScript
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will automatically install Playwright browsers via the `postinstall` script.

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your preferences:
   ```env
   HEADLESS=true
   MIN_DELAY_SECONDS=1200
   MAX_DELAY_SECONDS=1800
   HEADLINE_POOL=Experienced Software Developer,Full Stack Engineer,Senior Backend Developer
   ```

## 🔐 Authentication Setup

**Important**: Run this once before using the automation script.

```bash
npm run login
```

This will:
1. Open a browser window (headed mode)
2. Navigate to Naukri.com login page
3. Wait for you to complete login (including OTP)
4. Save authentication state for future automated runs
5. Verify access to your profile page

## 🚀 Usage

### Continuous Mode (Recommended)
```bash
npm start
```
Runs indefinitely with random delays between updates (20-30 minutes by default).

### Single Update
```bash
npm run once
```
Performs one headline update and exits.

### Custom Runs
```bash
# Run 5 update cycles
ts-node src/index.ts --runs 5

# Show help
ts-node src/index.ts --help
```

## ⚙️ Configuration

Edit the `.env` file to customize behavior:

| Variable | Description | Default |
|----------|-------------|---------|
| `HEADLESS` | Run browser in headless mode | `true` |
| `MIN_DELAY_SECONDS` | Minimum delay between updates | `1200` (20 min) |
| `MAX_DELAY_SECONDS` | Maximum delay between updates | `1800` (30 min) |
| `HEADLINE_POOL` | Comma-separated headlines | See `.env.example` |
| `APPEND_TIMESTAMP` | Add timestamp to headlines | `false` |
| `TIMEOUT_MS` | Browser operation timeout | `45000` |
| `RUNS` | Number of runs (0 = infinite) | `0` |
| `LOG_LEVEL` | Logging verbosity | `info` |

### Headline Pool Examples

```env
# Technical Roles
HEADLINE_POOL=Senior Software Engineer,Full Stack Developer,Backend Specialist,DevOps Engineer,Cloud Architect

# Management Roles  
HEADLINE_POOL=Technical Lead,Engineering Manager,Product Manager,Team Lead,Senior Consultant

# Specialized Roles
HEADLINE_POOL=Data Scientist,ML Engineer,Security Specialist,Mobile Developer,Frontend Expert
```

## 📁 Project Structure

```
NaukriPulseScript/
├── auth/                    # Authentication storage
│   └── storageState.json   # Saved login session
├── artifacts/              # Logs and screenshots
│   ├── updates.log         # JSONL update history
│   ├── last_headline.txt   # Last used headline
│   └── failed-*.png        # Failure screenshots
├── src/
│   ├── utils/
│   │   ├── config.ts       # Configuration management
│   │   ├── log.ts          # Logging utilities
│   │   ├── random.ts       # Randomization helpers
│   │   └── selectors.ts    # Robust element selectors
│   ├── index.ts            # Main application
│   ├── login.ts            # Authentication setup
│   └── updateHeadline.ts   # Core update logic
├── .env                    # Environment configuration
├── .env.example           # Configuration template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 📊 Monitoring

### Console Output
The script provides real-time colored console output showing:
- Update attempts and results
- Timing information
- Error details
- Next run scheduling

### Log Files
- **`artifacts/updates.log`**: JSONL format with detailed update history
- **`artifacts/last_headline.txt`**: Tracks the last used headline base
- **`artifacts/failed-*.png`**: Screenshots captured on failures

### Example Log Entry
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "oldHeadline": "Senior Software Engineer",
  "newHeadline": "Full Stack Developer", 
  "success": true,
  "durationMs": 3245
}
```

## 🔧 Troubleshooting

### Authentication Issues
```bash
# If you see "Session expired" messages
npm run login

# Check if auth file exists
ls -la auth/storageState.json
```

### Element Not Found Errors
The script uses robust selectors with multiple fallbacks. If elements aren't found:
1. Check if Naukri.com has updated their UI
2. Review failure screenshots in `artifacts/`
3. Update selectors in `src/utils/selectors.ts` if needed

### Browser Issues
```bash
# Reinstall Playwright browsers
npx playwright install

# Run in headed mode for debugging
# Set HEADLESS=false in .env
```

### Network/Timeout Issues
- Increase `TIMEOUT_MS` in `.env`
- Check internet connection
- Verify Naukri.com accessibility

## 🛡️ Security & Best Practices

### Security Features
- ✅ No credentials stored in code
- ✅ Session-based authentication
- ✅ No sensitive data in logs
- ✅ Local storage only

### Recommendations
- **Run on a dedicated machine** or VPS for 24/7 operation
- **Monitor logs regularly** for any issues
- **Update headlines periodically** to keep them relevant
- **Respect rate limits** - don't set delays too low
- **Keep dependencies updated** for security patches

### Rate Limiting
Default delays (20-30 minutes) are conservative and respectful:
- Avoids triggering anti-automation measures
- Mimics natural user behavior
- Reduces server load

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## ⚠️ Disclaimer

This tool is for educational and personal use only. Users are responsible for:
- Complying with Naukri.com's Terms of Service
- Using the tool responsibly and ethically
- Ensuring their account security

The authors are not responsible for any account restrictions or issues that may arise from using this tool.

## 🆘 Support

If you encounter issues:

1. **Check the logs** in `artifacts/` directory
2. **Review this README** for common solutions
3. **Update your configuration** in `.env`
4. **Re-run authentication** with `npm run login`

For technical issues, please provide:
- Error messages from console/logs
- Your configuration (without sensitive data)
- Screenshots if UI-related
- Steps to reproduce the issue

---

**Happy job hunting! 🎯**