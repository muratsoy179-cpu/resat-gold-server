const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

let lastData = [];
let lastRaw = "";
let lastUpdate = null;
let apiStatus = "Sunucu başladı, veri bekleniyor";

function normalizeData(parsed) {
  if (Array.isArray(parsed)) return parsed;

  if (parsed && Array.isArray(parsed.data)) return parsed.data;
  if (parsed && Array.isArray(parsed.prices)) return parsed.prices;
  if (parsed && Array.isArray(parsed.items)) return parsed.items;

  if (parsed && parsed.data && typeof parsed.data === "object") {
    return Object.keys(parsed.data).map(function (key) {
      const item = parsed.data[key];
      if (item && typeof item === "object") {
        return Object.assign({ key: key }, item);
      }
      return { key: key, value: item };
    });
  }

  if (parsed && typeof parsed === "object") {
    const arr = [];

    Object.keys(parsed).forEach(function (key) {
      const item = parsed[key];

      if (item && typeof item === "object" && !Array.isArray(item)) {
        arr.push(Object.assign({ key: key }, item));
      }
    });

    if (arr.length > 0) return arr;
  }

  return [];
}

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
    if (!RAPIDAPI_KEY) {
      apiStatus = "RAPIDAPI_KEY Railway Variables içinde yok";
      console.log(apiStatus);
      return;
    }

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
    lastData = normalizeData(parsed);

    lastUpdate = new Date().toISOString();
    apiStatus = "RapidAPI Harem veri alındı";

    console.log("Veri alındı:", lastUpdate, "Ürün sayısı:", lastData.length);

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
  }, 60000);
});
