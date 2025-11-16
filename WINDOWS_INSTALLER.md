# Windows Installer Setup - RequestBooth

This document outlines the Windows installer configuration for RequestBooth desktop application using Tauri 2.0.

## Installer Types

RequestBooth supports two Windows installer formats:

### 1. MSI Installer (Recommended for Enterprise)
- **Target**: `msi`
- **Best for**: Enterprise deployments, system administrators
- **Features**:
  - Windows Installer service integration
  - Group Policy support
  - Administrative installation
  - Elevated update installation enabled
  - Upgrade code: `E2F5F5C5-8A5A-4B8A-9A5A-5C5E2F5F5C5E`
  - Language: English (en-US)

### 2. NSIS Installer (Recommended for End Users)
- **Target**: `nsis`
- **Best for**: End-user installations, personal computers
- **Features**:
  - Smaller installer size
  - Flexible installation options
  - Install mode: Both (user and system)
  - LZMA compression for minimal size
  - Desktop and Start Menu shortcuts
  - Start Menu folder: "RequestBooth"

## Application Configuration

### Window Settings
- **Title**: "RequestBooth - DJ Song Request System"
- **Default Size**: 1200x800 pixels
- **Minimum Size**: 800x600 pixels
- **Features**: Resizable, decorated, with taskbar integration

### Security
- **CSP**: Configured for localhost development and production APIs
- **Allowed Sources**: 
  - Local development: `http://localhost:5000`
  - Production API: `https://api.requestbooth.com`
  - Updates: `https://updates.requestbooth.com`

## Auto-Update System

### Update Configuration
- **Endpoint**: `https://updates.requestbooth.com/{{target}}/{{arch}}/{{current_version}}`
- **Dialog**: Enabled (shows update prompts)
- **Signing**: Requires public key configuration for production

### Update Process
1. Automatic check 30 seconds after app start
2. Periodic checks every 4 hours
3. Desktop notifications for available updates
4. Progress tracking during download
5. Automatic restart after installation

## Desktop Features

### Native Notifications
- **Permissions**: Auto-requested on first run
- **Types**: Update notifications, status changes, system alerts
- **Integration**: Connected to app events (online/offline, updates)

### Process Management
- **Relaunch**: Enabled for update installations
- **Exit**: Proper cleanup on application close

## Installation Process

### For Development (Requires Rust 1.82+)
```bash
# Build the installer
npm run tauri build

# Output location
src-tauri/target/release/bundle/
├── msi/RequestBooth_1.0.0_x64_en-US.msi
└── nsis/RequestBooth_1.0.0_x64-setup.exe
```

### For Production
1. **Generate Update Signing Keys** (CRITICAL):
   ```bash
   # Generate ED25519 keypair for update signing
   npm run tauri signer generate -- -w ~/.tauri/requestbooth.key
   
   # This creates:
   # - Private key: ~/.tauri/requestbooth.key (keep secret!)
   # - Public key: displayed in terminal (add to tauri.conf.json)
   ```

2. **Configure Public Key in tauri.conf.json**:
   ```json
   "updater": {
     "pubkey": "YOUR_PUBLIC_KEY_HERE"
   }
   ```

3. **Code Signing**: Configure certificate thumbprint in `tauri.conf.json`
4. **Update Server**: Set up HTTPS endpoint for update distribution
5. **Sign Updates**: Use private key to sign all update packages

## Security Considerations

### Code Signing
- **Algorithm**: SHA-256 digest
- **Certificate**: Production requires valid code signing certificate
- **Timestamp**: URL can be configured for certificate validation

### Update Security
- **Signed Updates**: All updates must be cryptographically signed
- **HTTPS Only**: Update endpoint must use secure connections
- **Version Validation**: Prevents downgrade attacks

## Uninstallation

### Clean Removal
- **User Data**: App data preserved by default (configurable)
- **Registry**: Proper cleanup of Windows registry entries
- **Shortcuts**: Automatic removal of desktop and start menu shortcuts

## Troubleshooting

### Common Issues
1. **Rust Version**: Requires Rust 1.82+ for Tauri 2.0
2. **WebView2**: Automatically installed via MSI if missing
3. **Permissions**: May require administrator rights for system-wide installation

### Logs Location
- **Windows**: `%APPDATA%/RequestBooth/logs/`
- **Format**: Structured JSON logs with timestamps

## Building Requirements

### System Requirements
- **OS**: Windows 10/11 (64-bit)
- **Rust**: Version 1.82 or higher
- **Node.js**: Version 18 or higher
- **Build Tools**: Visual Studio Build Tools (for native dependencies)

### Environment Setup
```bash
# Install Rust
winget install Rustlang.Rust.GNU

# Install Tauri CLI
cargo install tauri-cli --version "^2.0.0"

# Build application
npm install
npm run tauri build
```

This configuration provides a professional Windows installation experience with proper update mechanisms, security, and user experience optimization.
