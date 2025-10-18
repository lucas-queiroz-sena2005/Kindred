import { Router } from 'express';
import authRouter from './auth.js';

const router = Router();

/**
 * @route   GET /api
 * @desc    API health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({ message: 'API is alive and running!' });
});

router.use('/auth', authRouter);

export default router;