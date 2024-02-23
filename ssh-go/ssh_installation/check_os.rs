use std::process::{Command, exit};

fn install_ssh() {
    let system = std::env::consts::OS;
    println!("Operating System: {}", system);

    match system {
        "linux" => {
            let distro = get_linux_distro();
            println!("Linux Distribution: {}", distro);

            match distro.as_str() {
                "debian" | "ubuntu" => run_command("sudo", &["apt", "install", "-y", "openssh-client"]),
                "fedora" | "centos" | "redhat" => run_command("sudo", &["yum", "install", "-y", "openssh-clients"]),
                "arch" => run_command("sudo", &["pacman", "-S", "--noconfirm", "openssh"]),
                _ => println!("Unsupported Linux distribution."),
            }
        }
        "macos" => run_command("brew", &["install", "openssh"]),
        "windows" => run_command("choco", &["install", "openssh"]),
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
                println!("SSH installed successfully.");
            } else {
                eprintln!("Failed to install SSH.");
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


