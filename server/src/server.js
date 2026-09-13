const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");
const universityRoutes = require("./routes/universityRoutes");
const projectRoutes = require("./routes/projectRoutes");
const studentRoutes = require("./routes/studentRoutes");
const investorRoutes = require("./routes/investorRoutes");
const aiRoutes = require("./routes/aiRoutes");

require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/university", universityRoutes);
app.use("/api/university/projects", projectRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
