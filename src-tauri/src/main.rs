#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::{self, File, OpenOptions};
use std::io::{self, BufRead, BufReader, Write};
use std::process::{exit, Command};
use std::path::Path;

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
fn generate_keys_with_filename(algorithm: &str, password: &str, filename: &str, overwrite: bool) -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let ssh_dir = home_dir.join(".ssh");
    let path = ssh_dir.join(filename);
    if path.exists() {
        if overwrite {
            if let Err(e) = fs::remove_file(&path) {
                return Err(format!("Error removing existing file: {}", e));
            }
        } else {
            return Err(format!("File already exists: {}", path.display()));
        }
    }

    let output = Command::new("ssh-keygen")
        .args([
            "-t",
            algorithm,
            "-f",
            path.to_str().unwrap(),
            "-N",
            password,
        ])
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                Ok(format!("{} keys generated successfully at {}.", algorithm.to_uppercase(), path.display()))
            } else {
                eprintln!(
                    "Error generating {} keys: {:?}",
                    algorithm.to_uppercase(),
                    String::from_utf8_lossy(&output.stderr)
                );
                Err(format!("Error generating keys: {:?}", String::from_utf8_lossy(&output.stderr)))
            }
        }
        Err(e) => {
            eprintln!("Error generating {} keys: {}", algorithm.to_uppercase(), e);
            Err(format!("Error generating keys: {}", e))
        }
    }
}

#[tauri::command]
fn secure_copy(username: &str) {
    match Command::new("sh")
        .arg("-c")
        .arg(format!("{} --hold ssh-copy-id {}", "kitty", username))
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
fn connect_ssh(username: &str) {
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
fn save_connection(connection: String) -> Result<(), String> {
    let username = whoami::username();
    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(format!(
        "/home/{}/.config/sshgo/previousConnections",
        username
    )) {
        if let Err(err) = writeln!(file, "{}", connection) {
            return Err(format!("Error writing to file: {}", err));
        }
        Ok(())
    } else {
        Err(String::from("Error opening file"))
    }
}

#[tauri::command]
fn load_connections() -> Result<Vec<String>, String> {
    let username = whoami::username();
    let file = match File::open(format!(
        "/home/{}/.config/sshgo/previousConnections",
        username
    )) {
        Ok(file) => file,
        Err(err) => return Err(format!("Error opening file: {}", err)),
    };

    let reader = BufReader::new(file);
    let mut connections = Vec::new();

    for line in reader.lines() {
        if let Ok(connection) = line {
            connections.push(connection);
        }
    }

    Ok(connections)
}

#[tauri::command]
fn check_ssh_keys() -> Result<Vec<String>, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let ssh_dir = home_dir.join(".ssh");
    if !ssh_dir.exists() {
        return Ok(Vec::new());
    }
    let mut ssh_files = vec![];
    for entry in fs::read_dir(&ssh_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            ssh_files.push(path.display().to_string());
        }
    }

    Ok(ssh_files)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            password_auth,
            generate_keys_with_filename,
            connect_ssh,
            secure_copy,
            save_connection,
            load_connections,
            check_ssh_keys
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

