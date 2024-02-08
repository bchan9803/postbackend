import express from 'express';
import { UserModel } from '../models/Users.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const response = await UserModel.find({});
    res.json(response);
  }
  catch (err) {
    res.json(err);
  }
});

router.post('/addUser', async (req, res) => {
  try {
    const { newsOutlet, email } = req.body;
    const user = await UserModel.findOne({ email: email });

    if (user) {
      return res.json({ message: 'email already added!' });
    }

    const newUser = new UserModel({ newsOutlet: newsOutlet, email: email });
    newUser.save();

    res.json({ message: 'email added!' });
  }
  catch (err) {
    res.json(err);
  }
});

export { router as UserRouter };