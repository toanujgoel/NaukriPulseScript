// Simple validation script to check project structure
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Naukri Pulse Script Project Structure...\n');

// Required files and directories
const requiredStructure = {
  'package.json': 'file',
  'tsconfig.json': 'file',
  '.env.example': 'file',
  '.env': 'file',
  'README.md': 'file',
  'auth': 'directory',
  'artifacts': 'directory',
  'src': 'directory',
  'src/index.ts': 'file',
  'src/login.ts': 'file',
  'src/updateHeadline.ts': 'file',
  'src/utils': 'directory',
  'src/utils/config.ts': 'file',
  'src/utils/random.ts': 'file',
  'src/utils/selectors.ts': 'file',
  'src/utils/log.ts': 'file'
};

let allValid = true;

// Check each required item
for (const [itemPath, itemType] of Object.entries(requiredStructure)) {
  const fullPath = path.join(__dirname, itemPath);
  
  try {
    const stats = fs.statSync(fullPath);
    const actualType = stats.isDirectory() ? 'directory' : 'file';
    
    if (actualType === itemType) {
      console.log(`✅ ${itemPath} (${itemType})`);
    } else {
      console.log(`❌ ${itemPath} - Expected ${itemType}, found ${actualType}`);
      allValid = false;
    }
  } catch (error) {
    console.log(`❌ ${itemPath} - Missing`);
    allValid = false;
  }
}

// Check package.json content
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\n📦 Package.json validation:');
  
  const requiredScripts = ['postinstall', 'login', 'start', 'once', 'build'];
  for (const script of requiredScripts) {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script: ${script}`);
    } else {
      console.log(`❌ Missing script: ${script}`);
      allValid = false;
    }
  }
  
  const requiredDeps = ['@playwright/test', 'dotenv', 'ts-node', 'typescript'];
  for (const dep of requiredDeps) {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ Dependency: ${dep}`);
    } else {
      console.log(`❌ Missing dependency: ${dep}`);
      allValid = false;
    }
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  allValid = false;
}

// Check .env.example content
try {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  console.log('\n🔧 Environment configuration:');
  
  const requiredEnvVars = [
    'HEADLESS',
    'MIN_DELAY_SECONDS',
    'MAX_DELAY_SECONDS',
    'NAUKRI_PROFILE_URL',
    'HEADLINE_POOL',
    'APPEND_TIMESTAMP',
    'TIMEOUT_MS',
    'RUNS'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (envExample.includes(envVar)) {
      console.log(`✅ Environment variable: ${envVar}`);
    } else {
      console.log(`❌ Missing environment variable: ${envVar}`);
      allValid = false;
    }
  }
} catch (error) {
  console.log('❌ Error reading .env.example:', error.message);
  allValid = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 Project structure validation PASSED!');
  console.log('\n📋 Next steps:');
  console.log('1. Install Node.js 18+ if not already installed');
  console.log('2. Run: npm install');
  console.log('3. Configure .env file with your settings');
  console.log('4. Run: npm run login (one-time setup)');
  console.log('5. Run: npm start (continuous mode) or npm run once (single update)');
} else {
  console.log('❌ Project structure validation FAILED!');
  console.log('Please check the missing files/directories above.');
}
console.log('='.repeat(50));