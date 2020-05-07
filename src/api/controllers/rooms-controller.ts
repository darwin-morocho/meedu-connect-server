/* eslint-disable no-throw-literal */
import { Request, Response } from 'express';
import Rooms from '../../mongo/schemes/rooms';

/**
 * create a room vinculated to one app and one user inside the app
 * @param req
 * @param res
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const name: string = req.body.name as string;
    if (!name || name.trim().length === 0) {
      throw { code: 400, message: 'Invalid name' };
    }
    const user = req.userAuth;
    const description: string = req.body.name as string;
    const room = await Rooms.create({
      name,
      description,
      app: user.thirdAuth.appId,
      user: {
        username: user.username,
        userId: user.userId,
        extra: user.extra,
      },
    });
    res.send(room); // send the room data
  } catch (e) {
    console.log(e);
    if (e.name && e.name === 'MongoError') {
      res.status(500).send('Error no se pudo procesar la solicitud');
    } else {
      const status = e.code || 500;
      res.status(status).send(e.message);
    }
  }
};
