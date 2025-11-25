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

    const { publicKey, signature, message } = req.body.data;

    if (!publicKey || !signature || !message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }

    try {
        const decodedPublicKey = Buffer.from(publicKey.data);
        const encodedMsg = new TextEncoder().encode(message);
        const decodedSig = new Uint8Array(signature.data);

        const isValid = nacl.sign.detached.verify(
            encodedMsg,
            decodedSig,
            decodedPublicKey,
        );

        if (!isValid) {
            console.error("Signature verification failed.");
            res.status(403).json({ error: 'Permission denied: Invalid signature.' });
            return;
        }

        const uid = `solana:${publicKey.data.toString('hex')}`;
        
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
        res.status(200).json({ data: { token } });

    } catch (error: any) {
        console.error("Error in solanaLogin function:", error);
        if (error instanceof functions.https.HttpsError) {
            res.status(error.httpErrorCode.status).json({
                error: {
                    message: error.message,
                    code: error.code,
                }
            });
        } else {
             res.status(500).json({ 
                error: { 
                    message: 'An internal error occurred: ' + error.message,
                    code: 'internal'
                }
             });
        }
    }
  });
});
