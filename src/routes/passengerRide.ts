import { Router } from "express";
import { PassengerRideController } from "../controllers/PassengerRide";
import asyncHandler from "express-async-handler";

const router = Router();
const passengerRideController = new PassengerRideController();

router.post(
  "/confirm",
  asyncHandler((req, res) => passengerRideController.confirm(req, res))
);

export default router;
