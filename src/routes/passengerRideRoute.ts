import { Router } from "express";
import asyncHandler from "express-async-handler";
import container from "../di-container";
import { PassengerRideController } from "../controllers/PassengerRideController";

const router = Router();
const passengerRideController = container.resolve(PassengerRideController);

router.post(
  "/confirm",
  asyncHandler((req, res) => passengerRideController.confirm(req, res))
);

export default router;
