use std::fs::{self, File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::process::Command;
use std::path::Path;
pub fn generate_keys_with_filename(algorithm: &str, password: &str, filename: &str, overwrite: bool) -> Result<i32, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let ssh_dir = home_dir.join(".ssh");
    let path = ssh_dir.join(filename);

    if path.exists() {
        if overwrite {
            if let Err(e) = fs::remove_file(&path) {
                return Err(format!("Error removing existing file: {}", e));
            }
        } else {
            return Ok(-1);
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
                Ok(1)
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

pub fn check_ssh_keys() -> Result<Vec<String>, String> {
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

pub fn save_connection(connection: String) -> Result<(), String> {
    let username = whoami::username();
    let config_dir = format!("/home/{}/.config/sshgo", username);
    let file_path = format!("{}/previousConnections", config_dir);

    // Create the config directory if it does not exist
    if let Err(err) = create_dir_all(&config_dir) {
        return Err(format!("Error creating directory: {}", err));
    }

    // Open the file, create it if it does not exist, and append to it
    match OpenOptions::new().create(true).append(true).open(&file_path) {
        Ok(mut file) => {
            if let Err(err) = writeln!(file, "{}", connection) {
                return Err(format!("Error writing to file: {}", err));
            }
            Ok(())
        }
        Err(_) => Err(String::from("Error opening file")),
    }
}

pub fn load_connections() -> Result<Vec<String>, String> {
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

pub fn delete_connection(connection_to_delete: String) -> Result<(), String> {
    let username = whoami::username();
    let file_path = format!("/home/{}/.config/sshgo/previousConnections", username);

    // Read the existing connections
    let file = File::open(&file_path).map_err(|err| format!("Error opening file: {}", err))?;
    let reader = BufReader::new(file);
    let mut connections: Vec<String> = reader
        .lines()
        .filter_map(|line| line.ok()) // Ignore lines that fail to read
        .collect();

    // Remove the specified connection
    let original_len = connections.len();
    connections.retain(|connection| connection != &connection_to_delete);

    if connections.len() == original_len {
        return Err("Connection not found".to_string());
    }

    // Write the updated connections back to the file
    let mut file = File::create(&file_path).map_err(|err| format!("Error creating file: {}", err))?;
    for connection in connections {
        writeln!(file, "{}", connection).map_err(|err| format!("Error writing to file: {}", err))?;
    }

    Ok(())
}

pub fn add_ca_key(file_content: String, filename: String, role: String) -> Result<i32, String> {
    match role.as_str() {
        "user" => {
            let ssh_dir = dirs::home_dir().map(|d| d.join(".ssh")).unwrap();
            if !ssh_dir.exists() {
                fs::create_dir_all(&ssh_dir).map_err(|_| "Failed to create .ssh directory.")?;
            }

            let known_hosts_path = ssh_dir.join("ssh_known_hosts");
            let mut file = OpenOptions::new()
                .create(true)
                .write(true)
                .append(true)
                .open(&known_hosts_path)
                .map_err(|_| "Failed to open known_hosts file.")?;
            file.write_all(format!("@cert-authority * {}", file_content).as_bytes())
                .map_err(|_| "Failed to write to known_hosts file.")?;

            Ok(1) 
        }
        "host" => {
            let trusted_keys_dir = Path::new("/etc/ssh/trusted_keys");
            let sshd_config_path = Path::new("/etc/ssh/sshd_config");
            let filename_basename = Path::new(&filename).file_name().unwrap().to_str().unwrap();

            let combined_command = format!(
                "sudo mkdir -p {} && sudo sh -c 'touch {} && echo \"{}\" > {}' && sudo sh -c 'echo \"TrustedUserCAKeys {}/{}\" >> {}' && exit",
                trusted_keys_dir.display(),
                trusted_keys_dir.join(filename_basename).display(),
                file_content,
                trusted_keys_dir.join(filename_basename).display(),
                trusted_keys_dir.display(),
                filename_basename,
                sshd_config_path.display()
            );

            let result_combined = Command::new("kitty")
                .arg("-e")
                .arg("bash")
                .arg("-c")
                .arg(combined_command)
                .spawn();

            if let Ok(mut child) = result_combined {
                child.wait().expect("Failed to wait for combined command");
                Ok(1) 
            } else {
                Err("Failed to launch terminal for combined command".to_string())
            }
        }
        _ => Err("Invalid role. Use 'user' or 'host'.".to_string()),
    }
}



