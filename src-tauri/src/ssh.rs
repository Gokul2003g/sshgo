use std::process::{exit, Command};
use std::fs;
use std::path::Path;
use std::io;
use dirs;

pub fn list_ssh_keys() -> Result<Vec<String>, io::Error> {
    let ssh_dir = dirs::home_dir().unwrap().join(".ssh");
    let mut private_keys = Vec::new();

    if ssh_dir.exists() && ssh_dir.is_dir() {
        let mut key_files = Vec::new();
        for entry in fs::read_dir(&ssh_dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_file() {
                let file_name = path.file_name().unwrap().to_string_lossy().into_owned();
                key_files.push(file_name);
            }
        }
        
        for file in &key_files {
            if !file.ends_with(".pub") {
                let pub_key = format!("{}.pub", file);
                if key_files.contains(&pub_key) {
                    private_keys.push(file.clone()); 
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
    if private_key_path.exists() {
        fs::remove_file(private_key_path).map_err(|e| e.to_string())?;
    } else {
        return Err("Private key file does not exist".into());
    } 
    if public_key_path.exists() {
        fs::remove_file(public_key_path).map_err(|e| e.to_string())?;
    }

    Ok(())
}

pub fn password_auth(username: &str) {
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

pub fn generate_keys(algorithm: &str, password: &str) {
    let username = whoami::username();
    let output = Command::new("ssh-keygen")
        .args([
            "-t",
            algorithm,
            "-f",
            &format!("/home/{}/.ssh/id_{}", username, algorithm),
            "-N",
            password,
        ])
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                println!("{} keys generated successfully.", algorithm.to_uppercase());
            } else {
                eprintln!(
                    "Error generating {} keys: {:?}",
                    algorithm.to_uppercase(),
                    output.stderr
                );
                exit(1);
            }
        }
        Err(e) => {
            eprintln!("Error generating {} keys: {}", algorithm.to_uppercase(), e);
            exit(1);
        }
    }
}

pub fn secure_copy(address: &str) {
    match Command::new("sh")
        .arg("-c")
        .arg(format!("{} --hold ssh-copy-id {}", "kitty", address))
        .spawn()
    {
        Ok(_) => {}
        Err(e) => {
            eprintln!("Error spawning terminal: {}", e);
            exit(1);
        }
    }
}

pub fn connect_ssh(username: &str) {
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
