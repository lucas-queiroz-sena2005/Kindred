import { Request, Response, NextFunction } from 'express';
import { getTmdbConfig } from '../services/configService.js';

export const getTmdbConfiguration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await getTmdbConfig();
    res.json(config);
  } catch (error) {
    next(error);
  }
};
