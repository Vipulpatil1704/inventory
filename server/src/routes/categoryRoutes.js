import express from 'express';
import categoryController from '../controllers/categoryController.js';
import validate from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/categoryValidators.js';

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *     responses:
 *       200:
 *         description: Category list
 */
router.get('/', categoryController.getCategories);

/**
 * @openapi
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  '/',
  authorize('admin', 'staff'),
  validate(createCategorySchema),
  categoryController.createCategory
);

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category
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
  validate(updateCategorySchema),
  categoryController.updateCategory
);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Category has products
 */
router.delete('/:id', authorize('admin'), categoryController.deleteCategory);

export default router;
