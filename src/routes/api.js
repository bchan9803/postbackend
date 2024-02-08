import express from 'express';
import nodemailer from 'nodemailer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { UserModel } from '../models/Users.js';

const router = express.Router();

// actual webscrapper
const fetchNewsHeadline = async (newsOutlet) => {
  const axiosURL = "https://www.axios.com";
  const politicoURL = "https://www.politico.com/";
  const latimesURL = "https://www.latimes.com/";

  const axiosJSPath = "#main-content > div.mx-auto.px-5.w-full.sm\\:px-8.lg\\:px-20.lg\\:max-w-container.grid.grid-cols-7.gap-x-10.min-h-screen.relative > div.col-span-full.lg\\:col-span-5.relative.lg\\:pl-10.lg\\:border-accent-blue-tint.lg\\:border-l-\\[1px\\].pb-20 > div.space-y-6.mx-auto.md\\:space-y-10.max-w-\\[787px\\].min-h-\\[25vh\\] > div.gtmView.grid-layout.border-b.border-accent-blue-tint.pb-6.sm\\:pb-10.last\\:border-b-0 > h2 > a > span";
  const politicoJSPath = "#main > section:nth-child(2) > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(1) > section > div:nth-child(1) > h3 > a";
  const latimesJSPath = "body > div.page-ad-margins > main > div:nth-child(2) > div > div:nth-child(1) > ul > li > ps-promo > div > div.promo-content > div.promo-title-container > h1 > a";

  let url = "";
  let jsPath = "";
  let newsHeadline = "";

  switch (newsOutlet) {
    case "Axios":
      url = axiosURL;
      jsPath = axiosJSPath;
      break;
    case "Politico":
      url = politicoURL;
      jsPath = politicoJSPath;
      break;
    case "LA Times":
      url = latimesURL;
      jsPath = latimesJSPath;
      break;
    default:
      break;
  }

  try {
    let res = await axios.get(url);
    let $ = await cheerio.load(res.data);

    $(jsPath).each((index, elem) => {
      newsHeadline = $(elem).text().trim();
      console.log(newsHeadline);
    });

    return newsHeadline;
  }
  catch (err) {
    console.log(err);
  }
};

// sends news updates to the user
router.get('/fetchUser', async (req, res) => {

  const CURR_URL = "https://post-backend-j0fd.onrender.com";

  try {
    const response = await UserModel.find({});
    res.json(response);

    for (let user of response) {
      try {
        await axios.post(`${CURR_URL}/api/sendEmail`, {
          emailRecipient: user.email,
          emailSubject: `POST! | New article from ${user.newsOutlet}`,
          emailText: `Article title: "${await fetchNewsHeadline(user.newsOutlet)}"`
        });
      } catch (err) {
        res.json(err);
      }
    }

  } catch (err) {
    res.json(err);
  }
});

// for nodemailer
router.post('/sendEmail', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      host: process.env.NODEMAILER_HOST,
      post: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS
      }
    });
    let message = {
      "from": process.env.NODEMAILER_EMAIL,
      "to": "undefined",
      "subject": "undefined subject",
      "text": "undefined text",
    };

    const { emailRecipient, emailSubject, emailText } = req.body;

    message.to = emailRecipient;
    message.subject = emailSubject;
    message.text = emailText;

    const r = await transporter.sendMail(message);

    try {
      res.send(r);
    } catch (error) {
      console.log(error);
    }
  }
  catch (err) {
    res.json(err);
  }
});


export { router as APIRouter };