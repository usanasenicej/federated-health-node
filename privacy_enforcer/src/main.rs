use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use hex;

#[derive(Serialize, Deserialize, Debug)]
struct PatientRecord {
    id: String,
    age: f64,
    cholesterol: f64,
}

#[derive(Serialize, Deserialize, Debug)]
struct SanitizedRecord {
    hashed_id: String,
    age: f64,
    cholesterol: f64,
}

fn hash_id(id: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(id.as_bytes());
    hex::encode(hasher.finalize())
}

fn validate_and_sanitize(record: PatientRecord) -> Result<SanitizedRecord, &'static str> {
    if record.age < 0.0 || record.age > 120.0 {
        return Err("Age out of bounds (Potential Data Leak/Anomaly)");
    }
    if record.cholesterol < 50.0 || record.cholesterol > 600.0 {
        return Err("Cholesterol out of bounds");
    }

    Ok(SanitizedRecord {
        hashed_id: hash_id(&record.id),
        age: record.age,
        cholesterol: record.cholesterol,
    })
}

fn main() {
    println!("🦀 Rust Privacy Enforcer: Active");
    println!("Strictly validating incoming mock data and hashing PII via SHA-256 before FL training.");
    
    // Example of data processing
    let mock_data = PatientRecord {
        id: "PII_PATIENT_12345".to_string(),
        age: 45.0,
        cholesterol: 210.0,
    };

    match validate_and_sanitize(mock_data) {
        Ok(safe_data) => println!("Data Sanitized Successfully: {:?}", safe_data),
        Err(e) => println!("Validation Failed: {}", e),
    }
}
