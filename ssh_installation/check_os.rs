use std::process::{Command, exit};
use std::io;

fn install_ssh() {
    let system = std::env::consts::OS;
    println!("Operating System: {}", system);

    match system {
        "linux" => {
            let distro = get_linux_distro();
            println!("Linux Distribution: {}", distro);

            match distro.as_str() {
                "debian" | "ubuntu" => {
                    println!("Choose the option:");
                    println!("1. Install OpenSSH Client");
                    println!("2. Install OpenSSH Server");

                    let mut choice = String::new();
                    io::stdin().read_line(&mut choice).expect("Failed to read user input");

                    match choice.trim() {
                        "1" => run_command("sudo", &["apt", "install", "-y", "openssh-client"]),
                        "2" => run_command("sudo", &["apt", "install", "-y", "openssh-server"]),
                        _ => println!("Invalid choice. Please enter 1 or 2."),
                    }
                }
                "fedora" | "centos" | "redhat" => {
                    println!("Choose the option:");
                    println!("1. Install OpenSSH Client");
                    println!("2. Install OpenSSH Server");

                    let mut choice = String::new();
                    io::stdin().read_line(&mut choice).expect("Failed to read user input");

                    match choice.trim() {
                        "1" => run_command("sudo", &["yum", "install", "-y", "openssh-clients"]),
                        "2" => run_command("sudo", &["yum", "install", "-y", "openssh-server"]),
                        _ => println!("Invalid choice. Please enter 1 or 2."),
                    }
                }
                "arch" => run_command("sudo", &["pacman", "-S", "--noconfirm", "openssh"]),
                _ => println!("Unsupported Linux distribution."),
            }
        }
        "macos" => run_command("brew", &["install", "openssh"]),
        _ => println!("Unsupported operating system."),
    }
}

fn get_linux_distro() -> String {
    if std::path::Path::new("/etc/os-release").exists() {
        let distro = std::fs::read_to_string("/etc/os-release").unwrap_or_else(|_| String::new());
        let distro_name = distro.lines().find(|line| line.starts_with("ID=")).map(|line| line.split('=').nth(1).unwrap_or_default());
        distro_name.unwrap_or_default().to_lowercase()
    } else {
        println!("Error: /etc/os-release not found.");
        String::new()
    }
}

fn run_command(command: &str, args: &[&str]) {
    let status = Command::new(command).args(args).status();

    match status {
        Ok(exit_status) => {
            if exit_status.success() {
                println!("Command executed successfully.");
            } else {
                eprintln!("Failed to execute the command.");
            }
        }
        Err(e) => {
            eprintln!("Error running command: {}", e);
            exit(1);
        }
    }
}

fn main() {
    install_ssh();
}

