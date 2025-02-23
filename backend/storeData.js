const mysql = require("mysql2/promise");
const fetchSpotPrices = require("./fetchAWSData");
const express = require("express");
require("dotenv").config();

const app = express();

// MySQL Connection Config
async function getDBConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
}

async function storeData(spotPrices) {
  const connection = await getDBConnection();
  // const spotPrices = await fetchSpotPrices();

  for (const price of spotPrices) {
    await connection.execute(
      "INSERT INTO spot_prices (instance_type, region, price, timestamp) VALUES (?, ?, ?, ?)",
      [price.InstanceType, price.AvailabilityZone, price.SpotPrice, price.Timestamp]
    );
  }

  console.log("AWS Spot Pricing data stored successfully.");
  await connection.end();
}

async function fetchAndStoreData() {
  try {
    console.log("Fetching AWS Spot Pricing Data...");
    const data = await fetchSpotPrices();
    await storeData(data);
  } catch (error) {
    console.error("Error fetching and storing data:", error);
  }
}

// Run every 2 minutes
setInterval(fetchAndStoreData, 120000);

module.exports = { fetchAndStoreData };