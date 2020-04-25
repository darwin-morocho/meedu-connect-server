import { Request, Response } from 'express';
import { v5 as uuidv5 } from 'uuid'; // For version 5

import Rooms from '../../mongo/schemes/rooms';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const MY_NAMESPACE = '092b2507-b8b8-5ac5-8da1-52f5fa8143ee';
    const name: string = uuidv5(Date.now().toString(), MY_NAMESPACE);
    await Rooms.create({ name });
    res.send(name);
  } catch (e) {
    const status: number = e.code || 500;
    res.status(status).send(e.message);
  }
};
