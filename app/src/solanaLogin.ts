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
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(400).json({ error: "POST only" });
      return;
    }

    const { publicKey, signature, message } = req.body;

    if (!publicKey || !signature || !message) {
      res.status(400).json({ error: "Missing fields" });
      return;
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
        res.status(403).json({ error: "Invalid signature" });
        return;
      }

      // Use the public key directly as UID for simplicity and consistency
      const uid = publicKey;

      admin
        .auth()
        .createCustomToken(uid)
        .then((token) => {
          // Check if user exists, if not, create them.
          // This is better than doing it on the client.
          return admin.auth().getUser(uid).catch(async (error) => {
            if (error.code === 'auth/user-not-found') {
              console.log(`Creating new user with uid: ${uid}`);
              await admin.auth().createUser({ uid });
            } else {
              throw error;
            }
          }).then(() => token);
        })
        .then((token) => {
           res.json({ token });
        })
        .catch((err) => {
          console.error("Token creation or user check error:", err);
          res.status(500).json({ error: "Internal server error" });
        });

    } catch (err) {
      console.error("Solana login error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});
