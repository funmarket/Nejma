import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import nacl from "tweetnacl";
import cors from "cors";

if (!admin.apps.length) {
  admin.initializeApp();
}

const corsHandler = cors({ origin: true });

export const solanaLogin = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    // Explicitly handle pre-flight requests.
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
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
});
