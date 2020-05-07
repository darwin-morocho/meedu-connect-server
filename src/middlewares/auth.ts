/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-throw-literal */
import { Request, Response, NextFunction } from 'express';
import Apps from '../mongo/schemes/app';
import { UserAuthData } from '../models';
import AES from '../api/security/aes';

declare global {
  namespace Express {
    export interface Request {
      thirdAuth: {
        hostname: string;
        appId: string;
      };
      userAuth: UserAuthData;
    }
  }
}

/**
 * middleware to allow create a userToken
 * @param req
 * @param res
 * @param next
 */
export const thirdAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey: string = req.headers.apiKey as string;
    if (!apiKey || apiKey.trim().length === 0) {
      throw { code: 400, message: 'invalid api key' };
    }
    const app = await Apps.findOne({ apiKey });
    if (!app) {
      throw { code: 403, message: 'invalid api key' };
    }
    const host = req.hostname;
    if (app.hosts.length > 0) {
      if (!app.hosts.includes(host)) {
        throw {
          code: 403,
          message: `The host ${host} is not inside the whitelist for this api key`,
        };
      }
    }
    req.thirdAuth = { hostname: host, appId: app._id };
    next();
  } catch (e) {
    console.log(e);
    if (e.name && e.name === 'MongoError') {
      res.status(500).send('Error trying to process your request');
    } else {
      const status = e.code || 500;
      res.status(status).send(e.message);
    }
  }
};

/**
 * middleware to allow access to the users API
 * @param req
 * @param res
 * @param next
 */
export const userAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token: string = req.headers.token as string;
    if (!token || token.trim().length === 0) {
      throw { code: 400, message: 'invalid token' };
    }
    const data = AES.decrypt(token, true);
    req.userAuth = data;
    next();
  } catch (e) {
    console.log(e);
    const status = e.code || 500;
    res.status(status).send(e.message);
  }
};
