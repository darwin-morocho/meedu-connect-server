import { Application } from 'express';
import rooms from './rooms-router';

const v1 = (app: Application): void => {
  app.use('/api/v1/rooms', rooms);
};

export default v1;
