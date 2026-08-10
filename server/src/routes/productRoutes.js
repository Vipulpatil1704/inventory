import express from 'express';
import productController from '../controllers/productController.js';
import validate from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/productValidators.js';

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products with search, filter, sort, pagination
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [In Stock, Low Stock, Out of Stock] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, quantity, unitPrice, createdAt] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product list
 */
router.get('/', validate(productQuerySchema, 'query'), productController.getProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/:id', productController.getProduct);

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create product
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  '/',
  authorize('admin', 'staff'),
  validate(createProductSchema),
  productController.createProduct
);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put(
  '/:id',
  authorize('admin', 'staff'),
  validate(updateProductSchema),
  productController.updateProduct
);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', authorize('admin', 'staff'), productController.deleteProduct);

export default router;
