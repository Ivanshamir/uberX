import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

const createUser: RequestHandler = async (req, res, next) => {
  try {
    await userController.createUser(req, res);
  } catch (error) {
    next(error);
  }
};

const getUser: RequestHandler = async (req, res, next) => {
  try {
    await userController.getUser(req, res);
  } catch (error) {
    next(error);
  }
};

router.post('/', createUser);
router.get('/:id', getUser);

export default router;