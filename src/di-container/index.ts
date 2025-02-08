import "reflect-metadata";
import { container } from "tsyringe";
import { RabbitMQService } from "../services/RabbitMQService";
import { PassengerRideService } from "../services/PassengerRideService";
import { PassengerRideController } from "../controllers/PassengerRideController";

container.registerSingleton<RabbitMQService>(RabbitMQService);
container.registerSingleton<PassengerRideService>(PassengerRideService);
container.register(PassengerRideController, {
  useFactory: (c) =>
    new PassengerRideController(c.resolve(PassengerRideService)),
});

export default container;
