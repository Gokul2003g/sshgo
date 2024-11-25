use reqwest::header::{HeaderMap, AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use std::error::Error;
use base64::{encode};
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
    let encoded_public_key = encode(public_key);
    let body = CertificateRequest {
        public_key:encoded_public_key,
        identity,
        is_host,
        provider,
    };

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, "Bearer hardcodedToken".parse()?);
    headers.insert(CONTENT_TYPE, "application/json".parse()?);
    println!("is_host : {}",is_host);
    let client = reqwest::Client::new();
    let res = client
        .post(url)
        .headers(headers)
        .json(&body)
        .send()
        .await?;

    if res.status().is_success() {
        let certificate: CertificateResponse = res.json().await?;
        Ok(certificate.certificate) 
    } else {
        Err("Failed to fetch certificate".into()) 
    }
}

