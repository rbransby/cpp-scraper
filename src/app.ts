import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import axios from 'axios';
import { ParkingLot } from './types/ParkingLot';

type ProxyHandler = Handler<void>
export const scrapeData : ProxyHandler = async () => {
    const url = `https://www.cityofperthparking.com.au/json/cpp/map/carpark/0?${Math.floor(Date.now())}`;
    const {data} = await axios.get<ParkingLot[]>(url);
    for (const item of data)
    {
        console.log(`${item.title} : ${item.free_space}`);
    }
}
