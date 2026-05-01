const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

/*
  GEÇİCİ ÇÖZÜM:
  API key direkt buraya yazıldı.
  Sonra GitHub repo'yu Private yapman iyi olur.
*/
const RAPIDAPI_KEY = "d13a999a9dmshcd4752d1a9385a1p1f7545jsn8073fcd697e9";

let lastData = [];
let lastRaw = "";
let lastUpdate = null;
let apiStatus = "Başlatılıyor";

async function fetchHaremPrices() {
  try {
    apiStatus = "RapidAPI Harem verisi alınıyor...";

    const url = "https://harem-altin-live-gold-price-data.p.rapidapi.com/harem_altin/prices/23b4c2fb31a242d1eebc0df9b9b65e5e";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "harem-altin-live-gold-price-data.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });

    const text = await response.text();
    lastRaw = text;

    if (!response.ok) {
      apiStatus = "RapidAPI hata HTTP: " + response.status;
      console.log(apiStatus);
      console.log(text);
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

    console.log("Veri güncellendi: " + lastUpdate);

  } catch (err) {
    apiStatus = "RapidAPI hata: " + err.message;
    console.log(apiStatus);
  }
}

fetchHaremPrices();
setInterval(fetchHaremPrices, 30000);

app.get("/", function (req, res) {
  res.json({
    ok: true,
    message: "Reşat Kuyumculuk Harem API Server çalışıyor",
    apiStatus: apiStatus,
    lastUpdate: lastUpdate
  });
});

app.get("/prices", function (req, res) {
  res.json({
    ok: true,
    source: "RapidAPI Harem Altın",
    apiStatus: apiStatus,
    lastUpdate: lastUpdate,
    data: lastData,
    raw: lastRaw
  });
});

app.listen(PORT, function () {
  console.log("Server running on port " + PORT);
});
