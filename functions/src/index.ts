import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import nacl from "tweetnacl";
import cors from "cors";

admin.initializeApp();

const corsHandler = cors({ origin: true });

export const solanaLogin = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }
    
    // The callable function interface wraps the request body in a 'data' object.
    const { publicKey, signature, message } = req.body.data;

    if (!publicKey || !signature || !message) {
      console.error("Missing required fields. Received:", req.body);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }

    try {
      // The public key is sent as hex from the client, decode it back to a byte buffer.
      const decodedPublicKey = Buffer.from(publicKey, 'hex');
      const encodedMsg = new TextEncoder().encode(message);
      // The signature is sent as base64 from the client.
      const decodedSig = Buffer.from(signature, 'base64');

      const isValid = nacl.sign.detached.verify(
        encodedMsg,
        decodedSig,
        decodedPublicKey
      );

      if (!isValid) {
        console.error("Signature verification failed.");
        throw new functions.https.HttpsError(
          "permission-denied",
          "Invalid signature."
        );
      }

      // The UID should be based on the actual public key, not the hex version.
      const pubKeyString = Buffer.from(decodedPublicKey).toString('utf-8');
      const uid = `solana:${pubKeyString}`;

      try {
        await admin.auth().getUser(uid);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // If user does not exist, create one.
          await admin.auth().createUser({ uid });
        } else {
          // For other errors, re-throw them.
          throw error;
        }
      }

      // Create a custom token for the user.
      const token = await admin.auth().createCustomToken(uid);
      // The callable function expects the response to be wrapped in a 'data' object.
      res.json({ data: { token } });

    } catch (error: any) {
      console.error("Error in solanaLogin function:", error);
      if (error instanceof functions.https.HttpsError) {
        res.status(error.httpErrorCode.status).json({
          error: {
            status: error.code,
            message: error.message
          }
        });
      } else {
        res.status(500).json({
           error: {
            status: 'internal',
            message: "An internal error occurred: " + error.message
          }
        });
      }
    }
  });
});
