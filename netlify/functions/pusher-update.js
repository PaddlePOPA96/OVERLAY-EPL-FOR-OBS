// netlify/functions/pusher-update.js
const Pusher = require("pusher");

const requiredEnv = ["PUSHER_APP_ID", "PUSHER_KEY", "PUSHER_SECRET"];
const missing = requiredEnv.filter((name) => !process.env[name]);
if (missing.length) {
  console.error("Missing Pusher env vars:", missing.join(", "));
  throw new Error(`Missing env vars: ${missing.join(", ")}`);
}

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER || "ap1",
  useTLS: true,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    await pusher.trigger("scoreboard-channel", "update", data);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("Pusher error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to push update", detail: err?.message }),
    };
  }
};
