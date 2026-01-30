import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

app.use(bodyParser.json());
app.use(express.static("public"));

async function verifyOrder(orderID) {
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_SECRET).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}`, {
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json"
    }
  });

  return res.json();
}

app.post("/purchase", async (req, res) => {
  const { product, orderID, payer, name } = req.body;

  try {
    const order = await verifyOrder(orderID);

    if (order.status !== "COMPLETED") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    console.log("NEW PURCHASE:", product, orderID, name, payer);

    // TODO: store in database / delivery queue

    res.json({ status: "success" });

  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
