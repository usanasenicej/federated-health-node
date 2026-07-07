from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from model import get_model
import hashlib
import time
import uuid

app = FastAPI(title="HealthLedger FL API")

# Enable CORS for the frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load global model
model = get_model()
# In a real app, load the aggregated weights here
# model.load_state_dict(torch.load("global_model.pth"))
model.eval()

# Simulate a model hash for blockchain audit
global_model_hash = hashlib.sha256(b"HealthLedger_V1_Weights").hexdigest()

class PatientData(BaseModel):
    age: float
    sex: float
    cp: float
    trestbps: float
    chol: float
    fbs: float
    restecg: float
    thalach: float
    exang: float
    oldpeak: float
    slope: float
    ca: float
    thal: float

@app.get("/")
def read_root():
    return {"status": "HealthLedger FL API is running"}

@app.post("/predict")
def predict_risk(data: PatientData):
    try:
        # Convert to tensor
        input_tensor = torch.tensor([[
            data.age, data.sex, data.cp, data.trestbps, data.chol, 
            data.fbs, data.restecg, data.thalach, data.exang, 
            data.oldpeak, data.slope, data.ca, data.thal
        ]], dtype=torch.float32)
        
        with torch.no_grad():
            output = model(input_tensor)
            risk_score = output.item()
            
        prediction_id = str(uuid.uuid4())
        
        # In a real app, we'd interact with Web3.py here to log to the blockchain
        # web3_client.logPrediction(prediction_id, global_model_hash)
        
        return {
            "prediction_id": prediction_id,
            "risk_score": risk_score,
            "model_hash_used": global_model_hash,
            "blockchain_status": "Logged to Smart Contract (Simulation)",
            "timestamp": int(time.time())
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
