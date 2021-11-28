import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import { ParkingLot } from "../../types/ParkingLot";
import firestore = require("@google-cloud/firestore");

admin.initializeApp();

export const scrapeData = async () => {
    const url = `https://www.cityofperthparking.com.au/json/cpp/map/carpark/0?${Math.floor(
        Date.now()
    )}`;
    const { data } = await axios.get<ParkingLot[]>(url);
    return data;
};

export const scheduledCPPScrape = functions.pubsub
    .schedule("every 15 minutes")
    .onRun(async (context) => {
        const timestampValue = Math.floor(Date.now() / 1000);
        const parkingSpaceData = await scrapeData();
        await admin
            .firestore()
            .collection("liveParkingSpaceData")
            .doc("liveParkingSpaceData")
            .set({ data: parkingSpaceData });
        for (const parkingLot of parkingSpaceData) {
            await admin
                .firestore()
                .collection(`previousParkingSpaceData_${parkingLot.nid}`)
                .doc(`${timestampValue}`)
                .set({ timestamp: timestampValue, ...parkingLot });
        }
        return;
    });

export const exportDatabase = functions.pubsub
    .schedule("every 1 hour")
    .onRun((context) => {
        // Client
        const client = new firestore.v1.FirestoreAdminClient();

        // Get project ID
        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        functions.logger.log("Backing up project: ", projectId);

        // Bucket name - has to start with gs://
        let bucket = "gs://BUCKET_NAME_DEVELOPMENT";

        if (!projectId) throw new Error("No projectId found");

        // Get database name
        const databaseName = client.databasePath(projectId, "(default)");

        return client
            .exportDocuments({
                name: databaseName,
                outputUriPrefix: bucket,
                collectionIds: []
            })
            .then((responses: any) => {
                const response = responses[0];
                console.log(`Operation Name: ${response["name"]}`);
            })
            .catch((err: Error) => {
                console.error(err);
                throw new Error("Export operation failed");
            });
    });
