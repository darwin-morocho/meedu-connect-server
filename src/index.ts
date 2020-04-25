/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import io from 'socket.io';
import dotenv from 'dotenv';
import ws from './ws';
import v1 from './api/routes';

dotenv.config();

const app: Application = express();
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
v1(app);
const server = http.createServer(app);

ws(io(server));

mongoose.set('useCreateIndex', true);
mongoose
  .connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to mongodb');
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      console.log(`connected to ${PORT}`);
    });
  })
  .catch((e) => {
    console.log(e);
  });
