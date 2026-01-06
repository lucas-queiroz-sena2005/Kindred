import express from 'express';
import { getTmdbConfiguration } from '../controllers/configController.js';

const router = express.Router();

router.get('/tmdb', getTmdbConfiguration);

export default router;
