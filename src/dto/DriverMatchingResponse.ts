export interface DriverMatchingRequestEvent {
    passengerId: string;
    pickupLocation: string;
    pickupLatitude: number;
    pickupLongitude: number;
    destinationLocation: string;
    destinationLatitude: number;
    destinationLongitude: number;
    expectedFare: number;
    driverId: string
  }
  