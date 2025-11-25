
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import nacl from "tweetnacl";
import cors from "cors";

admin.initializeApp();

// Initialize cors middleware
const corsHandler = cors({ origin: true });

export const solanaLogin = functions.https.onRequest((req, res) => {
  // IMPORTANT: Wrap the entire function logic with the cors handler.
  // This will automatically handle the 'OPTIONS' preflight request.
  corsHandler(req, res, async () => {
    // For a 'POST' request, proceed with the logic.
    // For a preflight 'OPTIONS' request, the cors middleware will automatically
    // send the appropriate headers and end the response.
    if (req.method === 'POST') {
      try {
        // The callable function interface wraps the request body in a 'data' object.
        const { publicKey, signature, message } = req.body.data;

        if (!publicKey || !signature || !message) {
          console.error("Missing required fields. Received:", req.body.data);
          // Use a 400 Bad Request for client errors
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
           // Use a 403 Forbidden for auth failures
          res.status(403).json({
            error: {
              status: 'PERMISSION_DENIED',
              message: 'Invalid signature.'
            }
          });
          return;
        }

        // The UID should be based on the actual public key, not the hex version.
        const pubKeyString = Buffer.from(decodedPublicKey).toString('base64');
        const uid = `solana:${pubKeyString}`;

        try {
          await admin.auth().getUser(uid);
        } catch (error: any) {
          if (error.code === 'auth/user-not-found') {
            await admin.auth().createUser({ uid });
          } else {
            throw error; // Re-throw other auth errors
          }
        }

        const token = await admin.auth().createCustomToken(uid);
        // The callable function expects the response to be wrapped in a 'data' object.
        res.status(200).json({ data: { token } });

      } catch (error: any) {
        console.error("Error in solanaLogin function:", error);
        res.status(500).json({
           error: {
            status: 'INTERNAL',
            message: "An internal error occurred: " + error.message
          }
        });
      }
    } else {
      // If it's not a POST request (and not a preflight OPTIONS handled by cors),
      // it's not allowed. The cors handler might already end the response for OPTIONS.
      // This is a fallback.
      if (!res.headersSent) {
          res.status(405).send('Method Not Allowed');
      }
    }
  });
});

    