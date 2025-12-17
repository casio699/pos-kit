// Library functions for Tauri backend

use std::fs;
use std::path::Path;
use tauri::command;

#[command]
pub fn create_directory(path: String) -> Result<(), String> {
    match fs::create_dir_all(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to create directory: {}", e)),
    }
}

#[command]
pub fn delete_file(path: String) -> Result<(), String> {
    match fs::remove_file(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete file: {}", e)),
    }
}

#[command]
pub fn copy_file(src: String, dst: String) -> Result<(), String> {
    match fs::copy(&src, &dst) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to copy file: {}", e)),
    }
}

#[command]
pub fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

#[command]
pub fn get_file_size(path: String) -> Result<u64, String> {
    match fs::metadata(&path) {
        Ok(metadata) => Ok(metadata.len()),
        Err(e) => Err(format!("Failed to get file size: {}", e)),
    }
}

#[command]
pub fn list_directory(path: String) -> Result<Vec<String>, String> {
    match fs::read_dir(&path) {
        Ok(entries) => {
            let mut files = Vec::new();
            for entry in entries {
                match entry {
                    Ok(entry) => {
                        if let Some(path_str) = entry.path().to_str() {
                            files.push(path_str.to_string());
                        }
                    }
                    Err(e) => return Err(format!("Failed to read directory entry: {}", e)),
                }
            }
            Ok(files)
        }
        Err(e) => Err(format!("Failed to read directory: {}", e)),
    }
}
