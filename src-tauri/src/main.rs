// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }
use std::process::{exit, Command};

#[tauri::command]
fn password_auth(username: &str) {
    match Command::new("sh")
        .arg("-c")
        .arg(format!("{} --hold ssh {}", "kitty", username))
        .spawn()
    {
        Ok(_) => {}
        Err(e) => {
            eprintln!("Error spawning terminal: {}", e);
            exit(1);
        }
    }
}

#[tauri::command]
fn generate_keys(algorithm: &str) {
    println!("Requested algorithm is: {}", algorithm);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![password_auth, generate_keys])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
