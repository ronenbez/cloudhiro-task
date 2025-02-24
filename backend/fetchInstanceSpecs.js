const { PricingClient, GetProductsCommand } = require("@aws-sdk/client-pricing");
const fs = require("fs");
require("dotenv").config();

const client = new PricingClient({ 
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }, });

const fetchEC2Specs = async () => {
  const params = {
    ServiceCode: "AmazonEC2",
    Filters: [{ Type: "TERM_MATCH", Field: "productFamily", Value: "Compute Instance" }],
    MaxResults: 100,
  };

  try {
    const command = new GetProductsCommand(params);
    const response = await client.send(command);
    const products = response.PriceList.map((p) => JSON.parse(p));

    const instances = products.map((p) => {
        const attributes = p.product.attributes;
        return {
          instanceType: attributes.instanceType,
          vCPUs: parseInt(attributes.vcpu, 10),
          memoryGB: parseFloat(attributes.memory.replace(" GiB", "")),
          family: attributes.instanceFamily,
          region: attributes.regionCode,
        };
    });

    fs.writeFileSync("ec2Specs.json", JSON.stringify(instances, null, 2));
    console.log("✅ EC2 specifications saved to ec2Specs.json");
  } catch (error) {
    console.error("❌ Error fetching EC2 specifications:", error);
  }
};

fetchEC2Specs();
