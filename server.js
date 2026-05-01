const express = require("express");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

let lastData = [];
let lastRaw = "";
let lastUpdate = null;
let socketStatus = "Başlatılıyor";

function connectGramvey() {
  socketStatus = "Gramvey bağlanıyor...";

  const ws = new WebSocket("wss://goldpricesocket.gramvey.com", {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  ws.on("open", () => {
    socketStatus = "Gramvey canlı bağlantı kuruldu";
    console.log(socketStatus);
  });

  ws.on("message", (message) => {
    try {
      const text = message.toString();
      lastRaw = text;
      lastData = JSON.parse(text);
      lastUpdate = new Date().toISOString();
      console.log("Veri güncellendi:", lastUpdate);
    } catch (err) {
      console.log("JSON okunamadı:", err.message);
    }
  });

  ws.on("close", (code, reason) => {
    socketStatus = "Gramvey kapandı: " + code + " " + reason;
    console.log(socketStatus);
    setTimeout(connectGramvey, 5000);
  });

  ws.on("error", (err) => {
    socketStatus = "Gramvey hata: " + err.message;
    console.log(socketStatus);
  });
}

connectGramvey();

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Reşat Kuyumculuk Gold Server çalışıyor",
    status: socketStatus,
    lastUpdate: lastUpdate
  });
});

app.get("/prices", (req, res) => {
  res.json({
    ok: true,
    source: "Gramvey WebSocket",
    status: socketStatus,
    lastUpdate: lastUpdate,
    data: lastData,
    raw: lastRaw
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
