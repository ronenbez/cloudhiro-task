require("dotenv").config();
const { EC2Client, DescribeSpotPriceHistoryCommand } = require("@aws-sdk/client-ec2");

// Configure AWS SDK v3
const ec2Client = new EC2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to fetch AWS Spot Pricing Data
async function fetchSpotPrices() {
  try {
    const command = new DescribeSpotPriceHistoryCommand({
      StartTime: new Date(),
      ProductDescriptions: ["Linux/UNIX"], // Filter for Linux instances
    });

    const data = await ec2Client.send(command);
    return data.SpotPriceHistory;
  } catch (error) {
    console.error("Error fetching AWS spot prices:", error);
    return [];
  }
}

module.exports = fetchSpotPrices;
