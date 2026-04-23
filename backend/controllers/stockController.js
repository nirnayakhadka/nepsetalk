const { getMarketSummary } = require("../services/nepseAPIService");
const redisClient = require("../config/redis");

async function marketSummary(req, res) {
  try {
    // Check cache first
    const cache = await redisClient.get("marketSummary");
    if (cache) return res.json(JSON.parse(cache));

    const data = await getMarketSummary();

    // Save to cache for 30 sec
    await redisClient.setEx("marketSummary", 30, JSON.stringify(data));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { marketSummary };