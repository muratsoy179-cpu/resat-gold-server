const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

const RAPIDAPI_KEY = "d13a999a9dmshcd4752d1a9385a1p1f7545jsn8073fcd697e9";

let lastData = [];
let lastRaw = "";
let lastUpdate = null;
let apiStatus = "Sunucu başladı, veri bekleniyor";

app.get("/", function (req, res) {
  res.json({
    ok: true,
    message: "Reşat Kuyumculuk API çalışıyor",
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

async function fetchHaremPrices() {
  try {
    apiStatus = "RapidAPI verisi alınıyor...";

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
      console.log(apiStatus);
      console.log(text);
      return;
    }

    const parsed = JSON.parse(text);

    if (parsed.data) {
      lastData = parsed.data;
    } else {
      lastData = parsed;
    }

    lastUpdate = new Date().toISOString();
    apiStatus = "RapidAPI Harem veri alındı";

    console.log("Veri alındı:", lastUpdate);

  } catch (error) {
    apiStatus = "RapidAPI hata: " + error.message;
    console.log(apiStatus);
  }
}

app.listen(PORT, function () {
  console.log("Server started on port " + PORT);

  fetchHaremPrices();

  setInterval(function () {
    fetchHaremPrices();
  }, 30000);
});
