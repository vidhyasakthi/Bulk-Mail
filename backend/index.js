const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected..."))
  .catch(err => console.log("Failed to Connect:", err));

const credential = mongoose.model("credential", {}, "bulkmail");

app.post("/sendemail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;
    const data = await credential.find();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER || data[0].toJSON().user,
        pass: process.env.MAIL_PASS || data[0].toJSON().pass,
      },
    });

    for (let email of emailList) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: email,
        subject: "A Message from Bulk Mail App",
        text: msg,
      });
      console.log("Email sent to:" + email);
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
