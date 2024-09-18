// src/main.rs

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod ssh;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::connect_ssh_command,
            commands::generate_keys_command,
            commands::password_auth_command,
            commands::secure_copy_command,
            commands::list_ssh_keys_command,
            commands::delete_ssh_key_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

