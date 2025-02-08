import { Router, RequestHandler } from 'express';
import { RideController } from '../controllers/RideController';
import { RideInitiatorService } from '../services/RideRestService';


const rideRouter = Router();
const rideController = new RideController();
const riderItiatorService =  new RideInitiatorService();

const createRide: RequestHandler = async (req, res, next) => {
  try {
    return rideController.RideRequest(req, res)
  } catch (error) {
    next(error);
  }
};


rideRouter.post('/create', createRide);

export default rideRouter;