import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import nacl from "tweetnacl";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const solanaLogin = functions.https.onRequest((req, res) => {
  // --- CORS HEADERS ---
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).send("OK");
  }

  if (req.method !== "POST") {
    return res.status(400).json({ error: "POST only" });
  }

  const { publicKey, signature, message } = req.body;

  if (!publicKey || !signature || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const decodedSig = Buffer.from(signature, "base64");
    const encodedMsg = Buffer.from(message, "utf8");

    const isValid = nacl.sign.detached.verify(
      encodedMsg,
      decodedSig,
      Buffer.from(publicKey, "hex")
    );

    if (!isValid) {
      return res.status(403).json({ error: "Invalid signature" });
    }

    const uid = `wallet_${publicKey}`;

    admin
      .auth()
      .getUser(uid)
      .catch(() => admin.auth().createUser({ uid }));

    admin
      .auth()
      .createCustomToken(uid)
      .then((token) => res.json({ token }))
      .catch((err) => {
        console.error("Token error:", err);
        res.status(500).json({ error: "Internal error" });
      });
  } catch (err) {
    console.error("Solana login error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});
