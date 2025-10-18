import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
  };
}

export function isAuthenticated(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, authConfig.JWT_SECRET) as { id: number };
    req.user = { id: decoded.id };

    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
}