import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { UserRouter } from './routes/users.js';
import { APIRouter } from './routes/api.js';

const app = express();

app.use(express.json());
app.use(cors());

// mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@users.abbiwhk.mongodb.net/postDB`);


const PORT = process.env.API_PORT;

app.use('/user', UserRouter);
app.use('/api', APIRouter);

app.listen(PORT, () => {
  console.log('express is listening at PORT ', PORT);
});
