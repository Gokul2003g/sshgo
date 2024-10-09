use std::fs::{self, File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::process::Command;

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
pub fn add_ca_key(file_content: String) -> Result<i32, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let known_hosts_path = home_dir.join(".ssh").join("ssh_known_hosts");

    let entry = format!("@cert-authority * {}\n", file_content);

    // Open the file in append mode or create it if it doesn't exist
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(known_hosts_path)
        .map_err(|e| format!("Error opening file: {}", e))?;

    // Write the CA key entry to the file
    file.write_all(entry.as_bytes())
        .map_err(|e| format!("Error writing to file: {}", e))?;

    Ok(1)
}



