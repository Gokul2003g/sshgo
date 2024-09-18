// src/commands.rs
use crate::ssh::{connect_ssh, generate_keys, password_auth, secure_copy, list_ssh_keys, delete_ssh_key};
use tauri::command;

#[command]
pub fn connect_ssh_command(username: &str) -> Result<(), String> {
    connect_ssh(username)
        .map_err(|e| e.to_string())
}

#[command]
pub fn generate_keys_command(algorithm: &str, password: &str) -> Result<(), String> {
    generate_keys(algorithm, password)
        .map_err(|e| e.to_string())
}

#[command]
pub fn password_auth_command(username: &str) -> Result<(), String> {
    password_auth(username)
        .map_err(|e| e.to_string())
}

#[command]
pub fn secure_copy_command(address: &str) -> Result<(), String> {
    secure_copy(address)
        .map_err(|e| e.to_string())
}

#[command]
pub fn list_ssh_keys_command() -> Result<Vec<String>, String> {
    match list_ssh_keys() {
        Ok(keys) => Ok(keys),
        Err(e) => Err(e.to_string()),
    }
}


#[command]
pub fn delete_ssh_key_command(key_name: &str) -> Result<(), String> {
    delete_ssh_key(key_name)
}

