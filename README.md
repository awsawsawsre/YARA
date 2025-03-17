# YARA
High-Level Threat Detection Architecture ( Backend with Python)

FastAPI (for API and event-driven alerts)
Machine Learning (Isolation Forest, Deep Learning) (for anomaly detection)
SOAR Automation (to trigger responses like isolating hosts)
Threat Hunting Module (YARA, live memory forensics, packet analysis)

Threat Detection Endpoint (/detect-threats) → Uses Isolation Forest ML model to detect anomalies in log data.
Automated Response (/isolate-host) → Sends a request to isolate compromised hosts via a mock SOAR API

Memory Scanning (/scan-memory) → Uses YARA rules to detect malicious patterns.
Network Monitoring (/network-monitor) → Captures live packets using Scapy.
