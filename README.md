# Tauri Desktop Application Setup

## ⚠️ CRITICAL: Update Signing Keys Required

The auto-update system **will not work** without proper signing keys configured. This is a security requirement.

### Step 1: Generate Update Signing Keys

```bash
# Generate ED25519 keypair for secure update signing
npm run tauri signer generate -- -w ~/.tauri/requestbooth.key
```

This command generates:
- **Private Key**: `~/.tauri/requestbooth.key` (⚠️ KEEP SECRET - never commit to git!)
- **Public Key**: Displayed in terminal output

### Step 2: Configure Public Key

Copy the public key from the terminal output and add it to `tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "endpoints": ["https://updates.requestbooth.com/{{target}}/{{arch}}/{{current_version}}"],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"  // ← ADD KEY HERE
    }
  }
}
```

### Step 3: Sign Update Packages

When building updates for production, sign them with your private key:

```bash
# Build the application
npm run tauri build

# Sign the update (example for NSIS installer)
npm run tauri signer sign ./src-tauri/target/release/bundle/nsis/RequestBooth_1.0.0_x64-setup.exe \
  -- -k ~/.tauri/requestbooth.key
```

### Step 4: Deploy Update Server

The update endpoint must:
1. Serve over HTTPS
2. Return signed update manifests
3. Match the URL pattern in `tauri.conf.json`

## Building the Desktop Application

### Requirements
- **Rust**: Version 1.82+ (Tauri 2.0 requirement)
- **Node.js**: Version 18+
- **Platform**: Windows 10/11 (64-bit)

### Build Commands

```bash
# Development mode
npm run tauri dev

# Production build
npm run tauri build
```

### Build Outputs

After successful build, installers are located at:
- **NSIS**: `src-tauri/target/release/bundle/nsis/RequestBooth_1.0.0_x64-setup.exe`
- **MSI**: `src-tauri/target/release/bundle/msi/RequestBooth_1.0.0_x64_en-US.msi`

## Configuration Files

- `tauri.conf.json` - Main Tauri configuration
- `Cargo.toml` - Rust dependencies
- `src/main.rs` - Rust backend code

## Security Checklist

- [ ] Generate update signing keypair
- [ ] Add public key to `tauri.conf.json`
- [ ] Secure private key (never commit to repository)
- [ ] Configure code signing certificate (for production)
- [ ] Set up HTTPS update server
- [ ] Test update flow end-to-end

## Troubleshooting

### Build Fails
- Verify Rust version: `rustc --version` (needs 1.82+)
- Update Rust: `rustup update stable`
- Clean build: `cargo clean` then rebuild

### Updates Not Working
- Check public key is configured in `tauri.conf.json`
- Verify update server is accessible
- Ensure updates are properly signed
- Check browser/desktop console for errors

## Additional Resources

- [Tauri Documentation](https://v2.tauri.app/)
- [Updater Plugin Docs](https://v2.tauri.app/plugin/updater/)
- [WINDOWS_INSTALLER.md](../WINDOWS_INSTALLER.md) - Detailed installer configuration
