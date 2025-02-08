import { PassengerRideConfirmation } from "../dto/PassengerRideConfirmation";
import { DriverMatchingRequestEvent } from "../dto/DriverMatchingRequest";
import { IQueueService } from "./interfaces/IQueueService"; // Import the generic interface

export class PassengerRideService {
  constructor(private queueService: IQueueService) {}

  async confirm(
    rideConfirmation: PassengerRideConfirmation
  ): Promise<{ message: string }> {
    try {
      const {
        passengerId,
        pickupLocation,
        pickupLatitude,
        pickupLongitude,
        destinationLocation,
        destinationLatitude,
        destinationLongitude,
        expectedFare,
      } = rideConfirmation;

      // Create the driver matching request event
      const driverMatchingRequestEvent: DriverMatchingRequestEvent = {
        passengerId,
        pickupLocation,
        pickupLatitude,
        pickupLongitude,
        destinationLocation,
        destinationLatitude,
        destinationLongitude,
        expectedFare,
      };

      // Publish the driver matching request event using the queue service
      const exchange = process.env.DRIVER_MATCHING_REQUEST_EXCHANGE!;
      await this.queueService.publish(exchange, driverMatchingRequestEvent);

      return { message: "Ride confirmed successfully" };
    } catch (error) {
      throw new Error("Failed to confirm ride");
    }
  }
}
