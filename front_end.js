import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Tabs, Tab } from "@/components/ui/tabs";

const socket = io("http://localhost:8000");

export default function SOCDashboard() {
  const [threats, setThreats] = useState([]);
  const [packets, setPackets] = useState([]);
  const [riskChartData, setRiskChartData] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [cloudLogs, setCloudLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("incidents");

  useEffect(() => {
    socket.on("threat_alert", (data) => {
      setThreats((prev) => [...prev, data]);
      setRiskChartData((prev) => [...prev, { time: new Date().toLocaleTimeString(), risk: data.risk_score }]);
    });

    socket.on("network_packets", (data) => {
      setPackets(data);
    });

    socket.on("ai_predictions", (data) => {
      setAiPredictions(data);
    });

    socket.on("cloud_logs", (data) => {
      setCloudLogs(data);
    });

    return () => {
      socket.off("threat_alert");
      socket.off("network_packets");
      socket.off("ai_predictions");
      socket.off("cloud_logs");
    };
  }, []);

  return (
    <div className="p-6">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="incidents" label="Threat Incidents" />
        <Tab value="network" label="Network Traffic" />
        <Tab value="cloud" label="Cloud Logs" />
        <Tab value="ai" label="AI Predictions" />
      </Tabs>
      {activeTab === "incidents" && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold">Threat Alerts</h2>
            <ul>
              {threats.map((threat, index) => (
                <li key={index} className="p-2 bg-red-100 rounded-md mt-2">
                  {threat.ip} - {threat.event} - Risk Score: {threat.risk_score}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {activeTab === "network" && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold">Live Network Traffic</h2>
            <ul>
              {packets.map((packet, index) => (
                <li key={index} className="p-2 bg-blue-100 rounded-md mt-2">
                  {packet}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {activeTab === "cloud" && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold">Cloud Log Ingestion</h2>
            <ul>
              {cloudLogs.map((log, index) => (
                <li key={index} className="p-2 bg-gray-100 rounded-md mt-2">
                  {log.timestamp} - {log.service}: {log.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {activeTab === "ai" && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold">AI Threat Predictions</h2>
            <ul>
              {aiPredictions.map((prediction, index) => (
                <li key={index} className="p-2 bg-yellow-100 rounded-md mt-2">
                  {prediction.time} - {prediction.threat_level}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <Card className="mt-6">
        <CardContent className="flex justify-center space-x-4">
          <Button variant="primary">Run YARA Scan</Button>
          <Button variant="secondary">Execute Remediation Playbook</Button>
        </CardContent>
      </Card>
    </div>
  );
}
