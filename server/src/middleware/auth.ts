import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';


declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;


  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }


  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token missing',
    });
    return;
  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'rentease_jwt_secret_key_123456_change_me_in_prod'
    ) as DecodedToken;


    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found with this token',
      });
      return;
    }


    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token invalid',
    });
  }
};


export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || 'unknown'}' is not authorized to access this route`,
      });
      return;
    }
    next();
  };
};
