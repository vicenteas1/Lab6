import { Router } from 'express';
import { UserController } from '../controller/user.controller.js';
import { UserServiceImpl } from '../services/impl/user.service.impl';
import { validateToken } from 'middleware/authorization';

const router = Router();

const userService = new UserServiceImpl();
const userController = new UserController(userService);

router.post('/register',userController.create.bind(userController));
router.post('/login',userController.login.bind(userController));
router.get("/verifytoken", validateToken, userController.verifytoken.bind(userController));
router.put("/update/:id", validateToken, userController.update.bind(userController));

export default router;
