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
                        "2" => {
                            run_command("sudo", &["apt", "install", "-y", "openssh-server"]);
                            enable_ssh();
                        }
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
                        "2" => {
                            run_command("sudo", &["yum", "install", "-y", "openssh-server"]);
                            enable_ssh();
                        }
                        _ => println!("Invalid choice. Please enter 1 or 2."),
                    }
                }
                "arch" => {
                    run_command("sudo", &["pacman", "-S", "--noconfirm", "openssh"]);
                    enable_ssh();
                }
                _ => println!("Unsupported Linux distribution."),
            }
        }
        "macos" => {
            run_command("brew", &["install", "openssh"]);
            enable_ssh();
        }
        "windows" => {
            println!("Choose the option:");
            println!("1. Install OpenSSH Client");
            println!("2. Install OpenSSH Server");

            let mut choice = String::new();
            io::stdin().read_line(&mut choice).expect("Failed to read user input");

            match choice.trim() {
                "1" => install_windows_ssh_client(),
                "2" => install_windows_ssh_server(),
                _ => println!("Invalid choice. Please enter 1 or 2."),
            }
        }
        _ => println!("Unsupported operating system."),
    }
}

fn enable_ssh() {
    let system = std::env::consts::OS;

    match system {
        "linux" => {
            println!("Enabling SSH...");

            let start_sshd = Command::new("sudo").args(&["systemctl", "start", "sshd"]).status();

            match start_sshd {
                Ok(exit_status) => {
                    if exit_status.success() {
                        println!("OpenSSH Server started successfully.");
                        Command::new("sudo")
                            .args(&["systemctl", "enable", "sshd"])
                            .status()
                            .expect("Failed to enable sshd service.");
                    } else {
                        eprintln!("Failed to start OpenSSH Server.");
                    }
                }
                Err(e) => {
                    eprintln!("Error running command: {}", e);
                    exit(1);
                }
            }
        }
        "macos" => {
            println!("Enabling SSH...");

            let start_sshd = Command::new("sudo").args(&["systemsetup", "-setremotelogin", "on"]).status();

            match start_sshd {
                Ok(exit_status) => {
                    if exit_status.success() {
                        println!("OpenSSH Server started successfully.");
                    } else {
                        eprintln!("Failed to start OpenSSH Server.");
                    }
                }
                Err(e) => {
                    eprintln!("Error running command: {}", e);
                    exit(1);
                }
            }
        }
        "windows" => {
            println!("Enabling SSH...");

            let start_sshd = Command::new("PowerShell")
                .args(&["Start-Service", "sshd"])
                .status();

            match start_sshd {
                Ok(exit_status) => {
                    if exit_status.success() {
                        println!("OpenSSH Server started successfully.");
                        Command::new("PowerShell")
                            .args(&["Set-Service", "-Name", "sshd", "-StartupType", "'Automatic'"])
                            .status()
                            .expect("Failed to set sshd service startup type.");
                    } else {
                        eprintln!("Failed to start OpenSSH Server.");
                    }
                }
                Err(e) => {
                    eprintln!("Error running command: {}", e);
                    exit(1);
                }
            }
        }
        _ => println!("Unsupported operating system."),
    }
}

fn install_windows_ssh_client() {
    let ssh_client_check = Command::new("PowerShell")
        .args(&["Get-WindowsCapability", "-Online", "|", "Where-Object", "Name", "-like", "'OpenSSH*'"])
        .status();

    match ssh_client_check {
        Ok(exit_status) => {
            if exit_status.success() {
                let install_ssh_client = Command::new("PowerShell")
                    .args(&["Add-WindowsCapability", "-Online", "-Name", "OpenSSH.Client~~~~0.0.1.0"])
                    .status();

                match install_ssh_client {
                    Ok(exit_status) => {
                        if exit_status.success() {
                            println!("OpenSSH Client installed successfully.");
                        } else {
                            eprintln!("Failed to install OpenSSH Client.");
                        }
                    }
                    Err(e) => {
                        eprintln!("Error running command: {}", e);
                        exit(1);
                    }
                }
            } else {
                eprintln!("Failed to check OpenSSH availability.");
            }
        }
        Err(e) => {
            eprintln!("Error running command: {}", e);
            exit(1);
        }
    }
}

fn install_windows_ssh_server() {
    let ssh_server_check = Command::new("PowerShell")
        .args(&["Get-WindowsCapability", "-Online", "|", "Where-Object", "Name", "-like", "'OpenSSH*'"])
        .status();

    match ssh_server_check {
        Ok(exit_status) => {
            if exit_status.success() {
                let install_ssh_server = Command::new("PowerShell")
                    .args(&["Add-WindowsCapability", "-Online", "-Name", "OpenSSH.Server~~~~0.0.1.0"])
                    .status();

                match install_ssh_server {
                    Ok(exit_status) => {
                        if exit_status.success() {
                            println!("OpenSSH Server installed successfully.");
                        } else {
                            eprintln!("Failed to install OpenSSH Server.");
                        }
                    }
                    Err(e) => {
                        eprintln!("Error running command: {}", e);
                        exit(1);
                    }
                }
            } else {
                eprintln!("Failed to check OpenSSH availability.");
            }
        }
        Err(e) => {
            eprintln!("Error running command: {}", e);
            exit(1);
        }
    }
}

fn get_linux_distro() -> String {
    if std::path::Path::new("/etc/os-release").exists() {
        let distro = std::fs::read_to_string("/etc/os-release").unwrap_or_else(|_| String::new());
        let distro_name = distro.lines().find(|line| line.starts_with("ID=")).map(|line| line.split('=').nth(1).unwrap_or_default());
        distro_name.unwrap_or_default().to_lowercase()
    } else {
        println!("Error: /etc/os-release not found. Using uname -srm instead.");
        get_linux_distro_uname()
    }
}

fn get_linux_distro_uname() -> String {
    let uname_output = Command::new("uname").args(&["-srm"]).output();
    
    match uname_output {
        Ok(output) => {
            if output.status.success() {
                String::from_utf8_lossy(&output.stdout).trim().to_lowercase()
            } else {
                eprintln!("Error running uname command.");
                String::new()
            }
        }
        Err(e) => {
            eprintln!("Error running uname command: {}", e);
            String::new()
        }
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

