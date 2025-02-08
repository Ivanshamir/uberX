import { Ride } from "../models/Ride";

export class RideService {
    async createRide(userData: any) {
        try {
            console.log('user Data', userData)
            const ride = new Ride(userData);
            return await ride.save();
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
}