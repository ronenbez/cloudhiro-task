const { fetchAndStoreData } = require('./storeData');
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

async function getDBConnection() {
    return await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
}

// API Route to fetch AWS Spot Pricing data
app.get("/api/spot-pricing", async (req, res) => {
  const db = await getDBConnection();
  try {
    const [rows] = await db.query("SELECT * FROM spot_prices");

    // Calculate average price per region
    let regionGroups = {};
    rows.forEach((item) => {
      if (!regionGroups[item.region]) {
        regionGroups[item.region] = [];
      }
      regionGroups[item.region].push(item.price);
    });

    // Calculate average price for each region
    let averagePrices = {};
    for (let region in regionGroups) {
      let prices = regionGroups[region];
      let avgPrice = prices.reduce((sum, p) => sum + Number(p), 0) / prices.length;
      averagePrices[region] = avgPrice;
    }

    // Mark steals (50% cheaper than average)
    const STEAL_THRESHOLD = 0.5; // 50% cheaper

    const processedData = rows.map((item) => ({
      ...item,
      isSteal: Number(item.price) < Number(averagePrices[item.region]) * STEAL_THRESHOLD,
    }));    

    res.json(processedData);

  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API route to manually trigger data fetching
app.post("/api/regenerate", async (req, res) => {
  console.log("Manual regeneration triggered...");
  await fetchAndStoreData();
  res.json({ message: "Data regenerated successfully" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
