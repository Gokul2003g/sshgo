use reqwest::header::{HeaderMap, AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use std::error::Error;
use base64::{encode};
use std::path::{PathBuf};
use std::fs;
use std::env;

pub async fn download_user_signing_key() -> Result<String, String> {
    let url = "http://localhost:8000/public/user-sign-key.pub";
    fetch_and_save_key(url, "user-sign-key.pub").await
}

pub async fn download_host_signing_key() -> Result<String, String> {
    let url = "http://localhost:8000/public/host-sign-key.pub";
    fetch_and_save_key(url, "host-sign-key.pub").await
}

async fn fetch_and_save_key(url: &str, filename: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    match client.get(url).send().await {
        Ok(response) if response.status().is_success() => {
            let content = response.text().await.map_err(|e| e.to_string())?;
            let path = save_key_to_downloads(filename, &content).await.map_err(|e| e.to_string())?;
            Ok(format!("Key saved to {}", path.display()))
        }
        Ok(response) => Err(format!(
            "Failed to fetch key: HTTP {}",
            response.status()
        )),
        Err(e) => Err(format!("Error sending request: {}", e)),
    }
}

async fn save_key_to_downloads(filename: &str, content: &str) -> Result<PathBuf, std::io::Error> {
    let home_dir = env::home_dir().ok_or_else(|| std::io::Error::new(std::io::ErrorKind::NotFound, "Home directory not found"))?;
    let downloads_path = home_dir.join("Downloads").join(filename);
    fs::write(&downloads_path, content)?;
    Ok(downloads_path)
}

#[derive(Serialize)]
struct CertificateRequest {
    public_key: String,
    identity: String,
    is_host: bool,
    provider: String,
}

#[derive(Deserialize)]
struct CertificateResponse {
    certificate: String,
}

pub async fn request_certificate(public_key: String, is_host: bool, identity: String, provider: String) -> Result<String, Box<dyn Error>> {
    let url = "http://localhost:8000/handle-post"; 
    let body = CertificateRequest {
        public_key,
        identity,
        is_host,
        provider,
    };

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, "Bearer hardcodedToken".parse()?);
    headers.insert(CONTENT_TYPE, "application/json".parse()?);
    
    let client = reqwest::Client::new();
    let res = client
        .post(url)
        .headers(headers)
        .json(&body)
        .send()
        .await?;

    let status = res.status().clone();
    let response_text = res.text().await?;

    if status.is_success() {
        Ok(response_text)  
    } else {
        Err(format!("Failed to fetch certificate: {}", response_text).into())
    }
}

