// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn save_to_file(file_path: String, content: String) -> Result<(), String> {
    use std::fs;
    use std::io::Write;

    match fs::File::create(&file_path) {
        Ok(mut file) => {
            match file.write_all(content.as_bytes()) {
                Ok(_) => Ok(()),
                Err(e) => Err(format!("Failed to write to file: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create file: {}", e)),
    }
}

#[tauri::command]
async fn read_from_file(file_path: String) -> Result<String, String> {
    use std::fs;

    match fs::read_to_string(&file_path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

#[tauri::command]
async fn show_message(message: String) -> Result<(), String> {
    use tauri::api::dialog;

    dialog::MessageDialogBuilder::new("KiTS POS", &message)
        .kind(tauri::api::dialog::MessageDialogKind::Info)
        .show();

    Ok(())
}

#[tauri::command]
async fn confirm_action(message: String) -> Result<bool, String> {
    use tauri::api::dialog;

    let confirmed = dialog::MessageDialogBuilder::new("KiTS POS", &message)
        .kind(tauri::api::dialog::MessageDialogKind::Warning)
        .buttons(tauri::api::dialog::MessageDialogButtons::YesNo)
        .show();

    Ok(confirmed)
}

#[tauri::command]
async fn select_file() -> Result<Option<String>, String> {
    use tauri::api::dialog;

    let file_path = dialog::FileDialogBuilder::new()
        .set_title("Select File")
        .pick_file();

    Ok(file_path)
}

#[tauri::command]
async fn save_file_dialog(default_name: String) -> Result<Option<String>, String> {
    use tauri::api::dialog;

    let file_path = dialog::FileDialogBuilder::new()
        .set_title("Save File")
        .set_file_name(&default_name)
        .save_file();

    Ok(file_path)
}

#[tauri::command]
async fn get_app_dir() -> Result<String, String> {
    use std::env;
    
    match env::current_exe() {
        Ok(exe_path) => {
            if let Some(parent) = exe_path.parent() {
                Ok(parent.to_string_lossy().to_string())
            } else {
                Err("Failed to get parent directory".to_string())
            }
        }
        Err(e) => Err(format!("Failed to get current executable path: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize app state if needed
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            save_to_file,
            read_from_file,
            show_message,
            confirm_action,
            select_file,
            save_file_dialog,
            get_app_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
