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
    const status: number = e.code || 500;
    res.status(status).send(e.message);
  }
};
