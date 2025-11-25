import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import nacl from "tweetnacl";

admin.initializeApp();

export const solanaLogin = functions.https.onCall(async (data, context) => {
  const { publicKey, signature, message } = data;

  if (!publicKey || !signature || !message) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields"
    );
  }

  try {
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
      throw new functions.https.HttpsError(
        "permission-denied",
        "Invalid signature."
      );
    }

    const uid = `solana:${publicKey}`;

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
    return { token };

  } catch (error: any) {
    console.error("Error in solanaLogin function:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An internal error occurred: " + error.message
    );
  }
});
