import { Request, Response } from 'express';
import { RideService } from '../services/RideService';
import { v4 as uuidv4 } from 'uuid';


export class RideInitiatorService {

    private rideService: RideService;
    
      constructor() {
        this.rideService = new RideService();
      }

  async RideRequest(req: Request, res: Response) {
    try {
        // TODO: Need to verify the user
      const ride = {
        id: uuidv4(),
        ...req.body
      }
      console.log('requiest data', ride)
      const id = await this.rideService.createRide(ride)
      console.log('created ride id', id);
      // await publishRideFairCalculationRequiest(ride)
      res.status(200)
    } catch (error) {
      res.status(500).json({ error: 'Error creating Ride ' });
    }
  }
}