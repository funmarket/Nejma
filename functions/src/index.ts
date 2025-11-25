import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import nacl from "tweetnacl";
import cors from "cors";

admin.initializeApp();

const corsHandler = cors({ origin: true });

export const solanaLogin = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
      const { publicKey, signature, message } = req.body;

      if (!publicKey || !signature || !message) {
        console.error("Missing required fields. Received:", req.body);
        res.status(400).json({
          error: {
            status: 'INVALID_ARGUMENT',
            message: 'Missing required fields: publicKey, signature, and message are required.'
          }
        });
        return;
      }

      const decodedPublicKey = Buffer.from(publicKey, 'hex');
      const encodedMsg = new TextEncoder().encode(message);
      const decodedSig = Buffer.from(signature, 'base64');

      const isValid = nacl.sign.detached.verify(
        encodedMsg,
        decodedSig,
        decodedPublicKey
      );

      if (!isValid) {
        console.error("Signature verification failed.");
        res.status(403).json({
          error: {
            status: 'PERMISSION_DENIED',
            message: 'Invalid signature.'
          }
        });
        return;
      }

      const pubKeyString = Buffer.from(decodedPublicKey).toString('base64');
      const uid = `solana:${pubKeyString}`;

      try {
        await admin.auth().getUser(uid);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          await admin.auth().createUser({ uid });
        } else {
          throw error; 
        }
      }

      const token = await admin.auth().createCustomToken(uid);
      res.status(200).json({ token });

    } catch (error: any) {
      console.error("Error in solanaLogin function:", error);
      res.status(500).json({
         error: {
          status: 'INTERNAL',
          message: "An internal error occurred: " + error.message
        }
      });
    }
  });
});
