const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

let lastData = [];
let lastRaw = "";
let lastUpdate = null;
let apiStatus = "Başlatılıyor";

async function fetchHaremPrices() {
  try {
    apiStatus = "RapidAPI Harem verisi alınıyor...";

    if (!RAPIDAPI_KEY) {
      apiStatus = "RAPIDAPI_KEY Railway Variables içinde yok";
      return;
    }

    const url = "https://harem-altin-live-gold-price-data.p.rapidapi.com/harem_altin/prices/23b4c2fb31a242d1eebc0df9b9b65e5e";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "harem-altin-live-gold-price-data.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
        "Accept": "application/json"
      }
    });

    const text = await response.text();
    lastRaw = text;

    if (!response.ok) {
      apiStatus = "RapidAPI hata HTTP: " + response.status;
      console.log(apiStatus + " - " + text);
      return;
    }

    const parsed = JSON.parse(text);

    if (parsed.data && Array.isArray(parsed.data)) {
      lastData = parsed.data;
    } else if (Array.isArray(parsed)) {
      lastData = parsed;
    } else {
      lastData = parsed;
    }

    lastUpdate = new Date().toISOString();
    apiStatus = "RapidAPI Harem veri alındı";
    console.log("Veri güncellendi:", lastUpdate);

  } catch (err) {
    apiStatus = "RapidAPI hata: " + err.message;
    console.log(apiStatus);
  }
}

fetchHaremPrices();
setInterval(fetchHaremPrices, 30000);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Reşat Kuyumculuk Harem API Server çalışıyor",
    apiStatus: apiStatus,
    lastUpdate: lastUpdate
  });
});

app.get("/prices", (req, res) => {
  res.json({
    ok: true,
    source: "RapidAPI Harem Altın",
    apiStatus: apiStatus,
    lastUpdate: lastUpdate,
    data: lastData,
    raw: lastRaw
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
