// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod file;
mod ssh;
mod certificate;
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::password_auth_command,
            commands::generate_keys_with_filename_command,
            commands::generate_keys_command,
            commands::connect_ssh_command,
            commands::check_ssh_keys_command,
            commands::secure_copy_command,
            commands::save_connection_command,
            commands::load_connections_command,
            commands::add_ca_key_command,
            commands::list_ssh_keys_command,
            commands::delete_ssh_key_command,
            commands::generate_certificate_command,
            commands::download_user_signing_key_command,
            commands::download_host_signing_key_command,
            commands::rename_ssh_key_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

