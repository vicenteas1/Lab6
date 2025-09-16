import { Router } from 'express';
import { ProductController } from '../controller/product.controller.js';
import { ProductServiceImpl } from '../services/impl/product.service.impl.js';
import { requireBuyer, requireSeller } from '../middleware/checkRole.js';
import { validateToken } from '../middleware/authorization.js';

const router = Router();

const productService = new ProductServiceImpl();
const productController = new ProductController(productService);

router.post('/create', validateToken, requireSeller, productController.create.bind(productController));
router.get('/readAll', validateToken, requireBuyer, productController.readAll.bind(productController));
router.get("/readOne/:id", validateToken, requireBuyer, productController.readOne.bind(productController));
router.put("/update/:id", validateToken, requireSeller, productController.update.bind(productController));
router.delete("/delete/:id", validateToken, requireSeller, productController.delete.bind(productController));

export default router;
