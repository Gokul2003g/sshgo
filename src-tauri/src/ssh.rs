use std::fs;
use std::path::Path;
use std::io;

pub fn list_ssh_keys() -> Result<Vec<String>, io::Error> {
    let ssh_dir = dirs::home_dir().unwrap().join(".ssh");
    let mut private_keys = Vec::new();

    if ssh_dir.exists() && ssh_dir.is_dir() {
        let mut key_files = Vec::new();

        // Collect all files in the .ssh directory
        for entry in fs::read_dir(&ssh_dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_file() {
                let file_name = path.file_name().unwrap().to_string_lossy().into_owned();
                key_files.push(file_name);
            }
        }

        // Identify private keys by checking if they have a corresponding .pub key
        for file in &key_files {
            if !file.ends_with(".pub") {
                let pub_key = format!("{}.pub", file);
                if key_files.contains(&pub_key) {
                    private_keys.push(file.clone()); // Add only private keys
                }
            }
        }
    }

    Ok(private_keys)
}

pub fn delete_ssh_key(key_name: &str) -> Result<(), String> {
    let ssh_dir = match dirs::home_dir() {
        Some(path) => path.join(".ssh"),
        None => return Err("Home directory not found".into()),
    };

    let private_key_path = ssh_dir.join(key_name);
    let public_key_path = ssh_dir.join(format!("{}.pub", key_name));

    // Delete the private key if it exists
    if private_key_path.exists() {
        fs::remove_file(private_key_path).map_err(|e| e.to_string())?;
    } else {
        return Err("Private key file does not exist".into());
    }

    // Delete the corresponding public key if it exists
    if public_key_path.exists() {
        fs::remove_file(public_key_path).map_err(|e| e.to_string())?;
    }

    Ok(())
}

pub fn connect_ssh(username: &str) -> Result<(), String> {
    let status = std::process::Command::new("sh")
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
    let status = std::process::Command::new("ssh-keygen")
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
    let status = std::process::Command::new("sh")
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
    let status = std::process::Command::new("scp")
        .arg(address)
        .status()
        .map_err(|e| e.to_string())?;

    if status.success() {
        Ok(())
    } else {
        Err("Failed to perform secure copy".into())
    }
}

