import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get inventory dashboard statistics
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/stats', authenticate, dashboardController.getStats);

export default router;
