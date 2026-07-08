from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import torch
import time
import uuid
import hashlib
from model import get_model

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="HealthLedger FL API",
    description="Privacy-preserving federated learning inference API for cardiovascular risk.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------
model = get_model()
# model.load_state_dict(torch.load("global_model.pth"))  # Load real weights here
model.eval()

# Simulate a deterministic model hash for blockchain audit trail
global_model_hash = hashlib.sha256(b"HealthLedger_V1_Weights").hexdigest()

_START_TIME = time.time()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class PatientData(BaseModel):
    age: float = Field(..., description="Age of the patient")
    sex: float = Field(..., description="Sex (0 = female, 1 = male)")
    cp: float = Field(..., description="Chest pain type (0–3)")
    trestbps: float = Field(..., description="Resting blood pressure (mm Hg)")
    chol: float = Field(..., description="Serum cholesterol (mg/dl)")
    fbs: float = Field(..., description="Fasting blood sugar > 120 mg/dl (1 = true)")
    restecg: float = Field(..., description="Resting ECG results (0–2)")
    thalach: float = Field(..., description="Maximum heart rate achieved")
    exang: float = Field(..., description="Exercise-induced angina (1 = yes)")
    oldpeak: float = Field(..., description="ST depression induced by exercise")
    slope: float = Field(..., description="Slope of the peak exercise ST segment (0–2)")
    ca: float = Field(..., description="Number of major vessels coloured by fluoroscopy (0–3)")
    thal: float = Field(..., description="Thalassemia type (1–3)")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/", tags=["Meta"])
def read_root():
    return {"status": "HealthLedger FL API is running", "version": "1.0.0"}


@app.get("/health", tags=["Meta"])
def health_check():
    """Liveness / readiness probe for container orchestration."""
    return {
        "status": "healthy",
        "uptime_seconds": round(time.time() - _START_TIME, 1),
    }


@app.get("/model-info", tags=["Meta"])
def model_info():
    """Return metadata about the currently loaded global model."""
    return {
        "architecture": "CardiovascularRiskModel",
        "input_features": 13,
        "trainable_parameters": model.count_parameters(),
        "model_hash": global_model_hash,
    }


@app.post("/predict", tags=["Inference"])
def predict_risk(data: PatientData):
    """Run federated-model inference and return cardiovascular risk score."""
    try:
        input_tensor = torch.tensor([[
            data.age, data.sex, data.cp, data.trestbps, data.chol,
            data.fbs, data.restecg, data.thalach, data.exang,
            data.oldpeak, data.slope, data.ca, data.thal,
        ]], dtype=torch.float32)

        with torch.no_grad():
            risk_score: float = model(input_tensor).item()

        # Human-readable risk band
        if risk_score < 0.33:
            risk_level = "LOW"
        elif risk_score < 0.66:
            risk_level = "MODERATE"
        else:
            risk_level = "HIGH"

        prediction_id = str(uuid.uuid4())

        # TODO: Replace with live Web3.py call:
        # web3_client.logPrediction(prediction_id, global_model_hash)

        return {
            "prediction_id": prediction_id,
            "risk_score": round(risk_score, 4),
            "risk_level": risk_level,
            "model_hash_used": global_model_hash,
            "blockchain_status": "Logged to Smart Contract (Simulation)",
            "timestamp": int(time.time()),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

