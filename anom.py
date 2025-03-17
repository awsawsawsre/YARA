from fastapi import FastAPI, HTTPException
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import requests
import uvicorn
import yara
import scapy.all as scapy

app = FastAPI()

# Mocked SIEM log data
db_logs = [
    {"ip": "192.168.1.10", "event": "login_failure", "count": 5, "risk_score": 30},
    {"ip": "192.168.1.15", "event": "file_modification", "count": 12, "risk_score": 80},
    {"ip": "192.168.1.20", "event": "port_scan", "count": 50, "risk_score": 95},
    {"ip": "192.168.1.25", "event": "login_success", "count": 1, "risk_score": 10}
]

@app.get("/detect-threats")
def detect_threats():
    df = pd.DataFrame(db_logs)
    X = df[['count', 'risk_score']]
    model = IsolationForest(contamination=0.2, random_state=42)
    df['anomaly'] = model.fit_predict(X)
    anomalies = df[df['anomaly'] == -1]
    if anomalies.empty:
        return {"message": "No threats detected"}
    return {"threats": anomalies.to_dict(orient='records')}

@app.post("/isolate-host")
def isolate_host(ip: str):
    # Mock SOAR API call
    response = requests.post("http://soar-platform/api/isolate", json={"ip": ip})
    if response.status_code == 200:
        return {"message": f"Host {ip} isolated successfully"}
    raise HTTPException(status_code=500, detail="Failed to isolate host")

@app.get("/scan-memory")
def scan_memory():
    rules = yara.compile(source="rule SuspiciousProcess { condition: true }")
    result = rules.match(data="suspicious binary data")
    return {"scan_result": str(result)}

@app.get("/network-monitor")
def network_monitor():
    packets = scapy.sniff(count=10)
    packet_summary = [pkt.summary() for pkt in packets]
    return {"packets": packet_summary}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
