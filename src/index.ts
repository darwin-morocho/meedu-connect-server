/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import express, { Application } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import io from 'socket.io';
import dotenv from 'dotenv';
import ws from './ws';
import v1 from './api/routes';

dotenv.config();

const app: Application = express();
// Add headers
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Pass to next layer of middleware
  next();
});

app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');
// enable cors
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

v1(app);
const server = http.createServer(app);

ws(io(server));

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
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
