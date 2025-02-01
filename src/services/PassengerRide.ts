import { PassengerRideConfirmation } from "../dto/PassengerRideConfirmation";
import { DriverMatchingRequestEvent } from "../dto/DriverMatchingRequest";
import { publishDriverMatchingRequestEvent } from "../exchange/DriverMatchingEvent";

export class PassengerRideService {
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

      // Publish the driver matching request event
      publishDriverMatchingRequestEvent(driverMatchingRequestEvent);

      return { message: "Ride confirmed successfully" };
    } catch (error) {
      throw new Error("Failed to confirm ride");
    }
  }
}
