use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};

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
