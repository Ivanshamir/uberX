import { Router, RequestHandler } from 'express';
import { RideStatusController as RideStatusCtrl } from '../controllers/RideStatusController';

const router = Router();
const rideStatusController = new RideStatusCtrl();

const startRide: RequestHandler = async (req, res, next) => {
  try {
    await rideStatusController.start(req, res);
  } catch (error) {
    next(error);
  }
};

router.post('/start', startRide);

const endRide: RequestHandler = async (req, res, next) => {
  try {
    await rideStatusController.end(req, res);
  } catch (error) {
    next(error);
  }
};

router.post('/end', endRide);

export default router;