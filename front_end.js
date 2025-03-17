import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const socket = io("http://localhost:8000");

export default function Dashboard() {
  const [threats, setThreats] = useState([]);
  const [packets, setPackets] = useState([]);
  const [riskChartData, setRiskChartData] = useState([]);

  useEffect(() => {
    socket.on("threat_alert", (data) => {
      setThreats((prev) => [...prev, data]);
      setRiskChartData((prev) => [...prev, { time: new Date().toLocaleTimeString(), risk: data.risk_score }]);
    });

    socket.on("network_packets", (data) => {
      setPackets(data);
    });

    return () => {
      socket.off("threat_alert");
      socket.off("network_packets");
    };
  }, []);

  const isolateHost = (ip) => {
    fetch("http://localhost:8000/isolate-host", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip })
    }).then(response => response.json()).then(data => alert(data.message));
  };

  const runYaraScan = () => {
    fetch("http://localhost:8000/scan-memory")
      .then(response => response.json())
      .then(data => alert(`YARA Scan Result: ${data.scan_result}`));
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">Threat Alerts</h2>
          <ul>
            {threats.map((threat, index) => (
              <li key={index} className="p-2 bg-red-100 rounded-md mt-2 flex justify-between">
                <span>{threat.ip} - {threat.event} - Risk Score: {threat.risk_score}</span>
                <Button variant="destructive" onClick={() => isolateHost(threat.ip)}>Isolate</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
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
      <Card className="col-span-2">
        <CardContent>
          <h2 className="text-xl font-bold">Risk Score Trend</h2>
          <LineChart width={600} height={300} data={riskChartData}>
            <XAxis dataKey="time" />
            <YAxis />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <Tooltip />
            <Line type="monotone" dataKey="risk" stroke="#ff0000" strokeWidth={2} />
          </LineChart>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardContent className="flex justify-center">
          <Button variant="primary" onClick={runYaraScan}>Run YARA Scan</Button>
        </CardContent>
      </Card>
    </div>
  );
}
