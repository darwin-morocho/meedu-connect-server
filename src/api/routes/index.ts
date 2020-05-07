import { Application } from 'express';
import rooms from './rooms-router';
import users from './users-router';

const v1 = (app: Application): void => {
  app.get('/', (req, res) => res.send('😜'));
  app.use('/api/v1/rooms', rooms);
  app.use('/api/v1/users', users);
};

export default v1;
