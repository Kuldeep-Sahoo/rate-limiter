import express from "express";
import Redis from "ioredis";

const app = express();
const redis = new Redis();

const rateLimiter = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const limit = 3;
  const windowSec = 60;
  const key = `rate-limit:${ip}`;
  console.log({ key });
  const requests = await redis.incr(key);
  if (requests === 1) {
    await redis.expire(key, windowSec);
  }
  if (requests > limit) {
    return res.status(429).json({
      message: "Too many requests,please try again later.",
    });
  }
  next();
};

app.get("/", rateLimiter, (req, res) => {
  res.send("Hello, you are within the rate limit 🚀");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
