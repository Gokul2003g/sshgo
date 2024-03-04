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
fn generate_keys(algorithm: &str, password: &str) {
    let username = whoami::username();
    let output = Command::new("ssh-keygen")
        .args([
            "-t",
            algorithm,
            "-f",
            &format!("/home/{}/.ssh/{}", username, algorithm),
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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![password_auth, generate_keys])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
