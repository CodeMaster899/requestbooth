// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                // Auto-check for updates on startup
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    if let Ok(updater) = handle.updater() {
                        if let Ok(Some(update)) = updater.check().await {
                            println!("Update available: {}", update.version);
                            // Silently check for updates - UI will handle user interaction
                        }
                    }
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            is_online,
            check_for_updates
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
async fn is_online() -> bool {
    // Simple online check - try to reach a reliable endpoint
    match reqwest::get("https://httpbin.org/status/200").await {
        Ok(response) => response.status().is_success(),
        Err(_) => false,
    }
}

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<Option<String>, String> {
    #[cfg(desktop)]
    {
        if let Ok(updater) = app.updater() {
            match updater.check().await {
                Ok(Some(update)) => Ok(Some(update.version.clone())),
                Ok(None) => Ok(None),
                Err(e) => Err(format!("Update check failed: {}", e)),
            }
        } else {
            Err("Updater not available".to_string())
        }
    }
    #[cfg(not(desktop))]
    {
        Err("Updates not supported on this platform".to_string())
    }
}