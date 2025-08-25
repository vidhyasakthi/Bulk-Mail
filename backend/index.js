const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


let isConnected;
async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log("Database connected");
  } catch (err) {
    console.error("DB Connection Failed:", err.message);
  }
}

const credential = mongoose.model("credential", {}, "bulkmail");

app.post("/sendemail", async (req, res) => {
  try {
    await connectDB();  

    const { msg, emailList } = req.body;
    const data = await credential.find();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER || data[0]?.user,
        pass: process.env.MAIL_PASS || data[0]?.pass,
      },
    });

    for (let email of emailList) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: email,
        subject: "A Message from Bulk Mail App",
        text: msg,
      });
      console.log(" Sent to:", email);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error in /sendemail:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = app;
