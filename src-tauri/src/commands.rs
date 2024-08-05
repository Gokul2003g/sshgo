use crate::file::{load_connections, save_connection};
use crate::ssh::{connect_ssh, generate_keys, password_auth, secure_copy};

#[tauri::command]
pub fn password_auth_command(username: &str) {
    password_auth(username);
}

#[tauri::command]
pub fn generate_keys_command(algorithm: &str, password: &str) {
    generate_keys(algorithm, password);
}

#[tauri::command]
pub fn secure_copy_command(username: &str) {
    secure_copy(username);
}

#[tauri::command]
pub fn connect_ssh_command(address: &str) {
    connect_ssh(address);
}

#[tauri::command]
pub fn save_connection_command(connection: String) -> Result<(), String> {
    save_connection(connection)
}

#[tauri::command]
pub fn load_connections_command() -> Result<Vec<String>, String> {
    load_connections()
}
