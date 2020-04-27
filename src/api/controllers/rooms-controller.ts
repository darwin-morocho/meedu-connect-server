/* eslint-disable no-throw-literal */
import { Request, Response } from 'express';
import Rooms from '../../mongo/schemes/rooms';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const name: string = req.body.name as string;
    if (!name || name.trim().length === 0) {
      throw { code: 400, message: 'Invalid name' };
    }

    const description: string = req.body.name as string;
    const room = await Rooms.create({ name, description });
    res.send(room);
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
