use crate::file::{
    add_ca_key, load_connections, save_connection, generate_keys_with_filename, check_ssh_keys,
};
use crate::ssh::{
    connect_ssh, generate_keys, password_auth, secure_copy, list_ssh_keys, delete_ssh_key,
};
use crate::certificate::request_certificate;
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

#[tauri::command]
pub fn generate_keys_with_filename_command(
    algorithm: &str,
    password: &str,
    filename: &str,
    overwrite: bool,
) -> Result<i32, String> {
    generate_keys_with_filename(algorithm, password, filename, overwrite)
}

#[tauri::command]
pub fn check_ssh_keys_command() -> Result<Vec<String>, String> {
    check_ssh_keys()
}

#[tauri::command]
pub fn add_ca_key_command(file_content: String, filename: String, role: String) -> Result<i32, String> {
    add_ca_key(file_content, filename, role)
}

#[tauri::command]
pub fn list_ssh_keys_command() -> Result<Vec<String>, String> {
    match list_ssh_keys() {
        Ok(keys) => Ok(keys),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn delete_ssh_key_command(key_name: &str) -> Result<(), String> {
    delete_ssh_key(key_name)
}
#[tauri::command]
pub async fn generate_certificate_command(public_key: String, is_host: bool, email: String, provider: String) -> Result<String, String> {
    match request_certificate(public_key, is_host, email, provider).await {
        Ok(cert) => Ok(cert), // Return the certificate if successful
        Err(e) => Err(format!("Error requesting certificate: {}", e)), // Return error if something goes wrong
    }
}
