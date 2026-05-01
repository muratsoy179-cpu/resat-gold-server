const express = require("express");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

let lastData = [];
let lastRaw = "";
let lastUpdate = null;
let socketStatus = "Başlatılıyor";
let restStatus = "REST bekliyor";

function connectGramveySocket() {
  socketStatus = "Gramvey WebSocket bağlanıyor...";

  const ws = new WebSocket("wss://goldpricesocket.gramvey.com", {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Origin": "https://gramvey.com"
    }
  });

  ws.on("open", () => {
    socketStatus = "Gramvey WebSocket canlı bağlantı kuruldu";
    console.log(socketStatus);
  });

  ws.on("message", (message) => {
    try {
      const text = message.toString();
      lastRaw = text;

      const parsed = JSON.parse(text);
      lastData = parsed;
      lastUpdate = new Date().toISOString();

      console.log("WebSocket veri geldi:", lastUpdate);
    } catch (err) {
      console.log("WebSocket JSON okunamadı:", err.message);
    }
  });

  ws.on("close", (code, reason) => {
    socketStatus = "Gramvey WebSocket kapandı: " + code + " " + reason;
    console.log(socketStatus);

    setTimeout(connectGramveySocket, 10000);
  });

  ws.on("error", (err) => {
    socketStatus = "Gramvey WebSocket hata: " + err.message;
    console.log(socketStatus);
  });
}

async function fetchGramveyRest() {
  try {
    restStatus = "Gramvey REST deneniyor...";

    const response = await fetch("https://goldapi.gramvey.com/golds", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });

    const text = await response.text();
    lastRaw = text;

    if (!response.ok) {
      restStatus = "REST hata HTTP: " + response.status;
      console.log(restStatus + " - " + text);
      return;
    }

    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      lastData = parsed;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      lastData = parsed.data;
    } else {
      lastData = parsed;
    }

    lastUpdate = new Date().toISOString();
    restStatus = "Gramvey REST veri alındı";

    console.log("REST veri geldi:", lastUpdate);

  } catch (err) {
    restStatus = "REST hata: " + err.message;
    console.log(restStatus);
  }
}

connectGramveySocket();

fetchGramveyRest();
setInterval(fetchGramveyRest, 5000);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Reşat Kuyumculuk Gold Server çalışıyor",
    socketStatus: socketStatus,
    restStatus: restStatus,
    lastUpdate: lastUpdate
  });
});

app.get("/prices", (req, res) => {
  res.json({
    ok: true,
    source: "Gramvey WebSocket + REST",
    socketStatus: socketStatus,
    restStatus: restStatus,
    lastUpdate: lastUpdate,
    data: lastData,
    raw: lastRaw
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
