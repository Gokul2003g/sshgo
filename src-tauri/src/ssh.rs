// src/ssh.rs
use std::fs;
use std::process::Command;
use std::path::Path;
use std::io;

pub fn list_ssh_keys() -> Result<Vec<String>, io::Error> {
    let ssh_dir = dirs::home_dir().unwrap().join(".ssh");
    let mut keys = Vec::new();

    if ssh_dir.exists() && ssh_dir.is_dir() {
        for entry in fs::read_dir(ssh_dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_file() {
                let file_name = path.file_name().unwrap().to_string_lossy().into_owned();
                // Filter to only include SSH key files (usually starting with id_*)
                if file_name.starts_with("id_") {
                    keys.push(file_name);
                }
            }
        }
    }

    Ok(keys)
}

pub fn delete_ssh_key(key_name: &str) -> Result<(), String> {
    let ssh_dir = match dirs::home_dir() {
        Some(path) => path.join(".ssh"),
        None => return Err("Home directory not found".into()),
    };

    let key_path = ssh_dir.join(key_name);
    if key_path.exists() {
        fs::remove_file(key_path).map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Key file does not exist".into())
    }
}

pub fn connect_ssh(username: &str) -> Result<(), String> {
    let status = Command::new("sh")
        .arg("-c")
        .arg(format!("ssh {}", username))
        .status()
        .map_err(|e| e.to_string())?;
    
    if status.success() {
        Ok(())
    } else {
        Err("Failed to connect SSH".into())
    }
}

pub fn generate_keys(algorithm: &str, password: &str) -> Result<(), String> {
    let status = Command::new("ssh-keygen")
        .args(&["-t", algorithm, "-N", password])
        .status()
        .map_err(|e| e.to_string())?;
    
    if status.success() {
        Ok(())
    } else {
        Err("Failed to generate keys".into())
    }
}

pub fn password_auth(username: &str) -> Result<(), String> {
    let status = Command::new("sh")
        .arg("-c")
        .arg(format!("sshpass -p {} ssh {}", username, username))
        .status()
        .map_err(|e| e.to_string())?;
    
    if status.success() {
        Ok(())
    } else {
        Err("Failed to authenticate with password".into())
    }
}

pub fn secure_copy(address: &str) -> Result<(), String> {
    let status = Command::new("scp")
        .arg(address)
        .status()
        .map_err(|e| e.to_string())?;
    
    if status.success() {
        Ok(())
    } else {
        Err("Failed to perform secure copy".into())
    }
}

