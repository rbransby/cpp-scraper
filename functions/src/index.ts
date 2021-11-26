import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import { ParkingLot } from "../../types/ParkingLot";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

export const scrapeData = async () => {
    const url = `https://www.cityofperthparking.com.au/json/cpp/map/carpark/0?${Math.floor(
        Date.now()
    )}`;
    const { data } = await axios.get<ParkingLot[]>(url);
    return data;
};

export const scheduledCPPScrape = functions.https.onRequest(
    async (req, res) => {
        const parkingSpaceData = await scrapeData();
        await admin
            .firestore()
            .collection("liveParkingSpaceData")
            .doc("liveParkingSpaceData")
            .set(parkingSpaceData);
        await admin
            .firestore()
            .collection("timeSeriesParkingSpaces")
            .doc(`${Math.floor(Date.now() / 1000)}`)
            .set(parkingSpaceData);
    }
);