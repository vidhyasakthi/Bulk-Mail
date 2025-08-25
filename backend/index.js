const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 MongoDB connection cache (for Vercel serverless)
let isConnected;
async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
  }
}

// Schema/collection
const credential = mongoose.model("credential", {}, "bulkmail");

// 🔹 Health Check Route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running fine" });
});

// 🔹 Send Email Route
app.post("/sendemail", async (req, res) => {
  try {
    await connectDB(); // ensure DB connection is ready

    const { msg, emailList } = req.body;

    if (!emailList || emailList.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No emails provided" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // ⚠️ MUST be a Gmail App Password
      },
    });

    for (let email of emailList) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: email,
        subject: "A Message from Bulk Mail App",
        text: msg,
      });
      console.log("📧 Sent to:", email);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error in /sendemail:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 👉 Export for Vercel (NO app.listen)
module.exports = app;
