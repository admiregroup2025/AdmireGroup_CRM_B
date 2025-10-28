// server.js or index.js

import dotenv from "dotenv";
dotenv.config(); // ✅ Load env variables

import express from "express";
const app = express();

import connectDB from "./config/connection.js"; // ✅ Add .js extension
import adminRoutes from "./src/routes/adminRoutes.js"; // ✅ Add .js extension
import companyRoutes from "./src/routes/companyRoutes.js"; // ✅ Add .js extension
import employeeRoutes from "./src/routes/employeeRoutes.js"; // ✅ Add .js extension
import attendanceRoute from "./src/routes/attendanceRoute.js"; // ✅ Add .js extension
import SuperAdminRoutes from "./src/routes/SuperAdminRoutes.js"; // ✅ Add .js extension
import loginRoutes from "./src/routes/loginRoutes.js"
import leadRoutes from "./src/routes/leadRoutes.js"
import cors from "cors";
import { corsOptions } from "./config/corsOptions.js"; // ✅ Add .js extension
connectDB(); // ✅ Connect to MongoDB

app.use(express.json()); // ✅ Enable JSON body parsing
app.use(cors(corsOptions));

app.use("/", adminRoutes);
app.use("/company", companyRoutes);
app.use("/leads", leadRoutes);
app.use("/employee", employeeRoutes);
app.use("/attendance", attendanceRoute);
app.use('/AddSuperAdmin', SuperAdminRoutes);
app.use('/login' , loginRoutes)
app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
