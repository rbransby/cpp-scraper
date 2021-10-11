import axios from 'axios';
import cheerio from 'cheerio';
import pretty from 'pretty';
import { ParkingLot } from './types/ParkingLot';

async function scrapeData() {
    const url = `https://www.cityofperthparking.com.au/json/cpp/map/carpark/0?${Math.floor(Date.now())}`;
    const {data} = await axios.get<ParkingLot[]>(url);
    for (const item of data)
    {
        console.log(`${item.title} : ${item.free_space}`);
    }
}


scrapeData();




