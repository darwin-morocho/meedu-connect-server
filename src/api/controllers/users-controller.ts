import { Request, Response } from 'express';
import AES from '../security/aes';
import { UserAuthData } from '../../models';

interface UserData {
  username: string;
  userId?: number | string;
  extra: any;
}

/**
 * creates a user token to allow connect to websockets and consume the API
 * @param req
 * @param res
 */
export const createUserToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as UserData;

    if (!data.username || data.username.trim().length === 0) {
      throw { code: 400, message: 'Invalid username' };
    }
    //
    const dataToEncrypt: UserAuthData = {
      username: data.username,
      extra: data.extra,
      userId: data.userId,
      thirdAuth: {
        appId: req.thirdAuth.appId,
      },
      createdAt: new Date(),
    };

    const encrypted = AES.encrypt(dataToEncrypt, true);
    res.send(encrypted); // send the token
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
