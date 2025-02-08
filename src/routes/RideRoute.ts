import { Router, RequestHandler } from 'express';
import { RideController } from '../controllers/RideController';


const rideRouter = Router();
const rideController = new RideController();

const createRide: RequestHandler = async (req, res, next) => {
  try {
    console.log('request', req)
    await rideController.RideRequest(req, res)
  } catch (error) {
    next(error);
  }
};


rideRouter.post('/create', createRide);

export default rideRouter;