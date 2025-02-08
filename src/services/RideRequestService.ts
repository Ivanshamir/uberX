import { rideRequestEventPublisher } from "../exchange/RideRequestEventPublisher";
import { v4 as uuidv4 } from 'uuid';
import { Ride } from "../models/Ride";
import logger from '../config/logger';
import { locationServicePublisher } from "../exchange/LocationServicePublisher";
import { farePublisher } from '../exchange/FarePublisher';

export default class RideRequestService {
    constructor() {}

    async requestRide(rideRequest: any) {
        // do some basic validation
        const data = {
            ...rideRequest,
            correlation_id: uuidv4()
        }
        
        // queue publish
        await rideRequestEventPublisher(data);
        logger.info(`Ride request published to RabbitMQ with correlation_id: ${data.correlation_id}`);
    }

    async saveRideRequestConsumerData(data: any) {
        logger.info(`Saving ride request data with correlation_id: ${JSON.stringify(data)}`);
        const rideRequest = new Ride(data);
        await rideRequest.save();

        // send msg to external queue for distance location service
        const locationData = {
            start_location: `${data.start_location_latitude},${data.start_location_longitude}`,
            end_location: `${data.end_location_latitude},${data.end_location_longitude}`,
            RideId: rideRequest._id,
        }
        await this.sendRequestToLocationService(locationData);
    }

    private async sendRequestToLocationService(data: any) {
        logger.info(`Send request to location service: ${JSON.stringify(data)}`);
        await locationServicePublisher(data);
    }

    async consumeLocationServiceData(data: any) {
        logger.info(`Consume location service data: ${JSON.stringify(data)}`);
        // process and send location data to fare service
        const farePublisherData = {
            RideId: data.RideId,
            DistanceInKm: data.DistanceInKm,
            DurationInMinutes: data.DurationInMinutes,
        }
        await farePublisher(farePublisherData);
    }

    async consumeFareServiceData(data: any) {
        logger.info(`Consume fare service data: ${JSON.stringify(data)}`);
        // find ride info from mongodb
        // const ride = await Ride.findOne({ _id: data.RideId });
        // if (ride) {
        //     // const fare = {

        //     // }
        //     // await ride.save();
        //     logger.info(`Ride fare found: ${ride}`);
        // } else {
        //     logger.error(`Ride not found: ${data.RideId}`);
        // }

    }
}