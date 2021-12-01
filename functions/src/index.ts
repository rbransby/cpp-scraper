import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import { ParkingLot } from "../../types/ParkingLot";

admin.initializeApp();

export const scrapeData = async () => {
  const url = `https://www.cityofperthparking.com.au/json/cpp/map/carpark/0?${Math.floor(
    Date.now()
  )}`;
  const { data } = await axios.get<ParkingLot[]>(url);
  return data;
};

export const scheduledCPPScrape = functions
  .region("australia-southeast1")
  .pubsub.schedule("every 15 minutes")
  .onRun(async () => {
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
  });
