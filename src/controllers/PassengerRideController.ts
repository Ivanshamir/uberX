import { Request, Response } from "express";
import { PassengerRideService } from "../services/PassengerRideService";

export class PassengerRideController {
  constructor(private passengerRideService: PassengerRideService) {}

  async confirm(req: Request, res: Response): Promise<void> {
    try {
      const rideConfirmation = req.body;
      const result = await this.passengerRideService.confirm(rideConfirmation);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error confirming ride by passenger" });
    }
  }
}
