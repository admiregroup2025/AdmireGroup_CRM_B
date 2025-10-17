const dotenv = require("dotenv");
dotenv.config(); // ✅ Load env variables
const express = require("express");
const app = express();
const connectDB = require("./config/connection");
const adminRoutes = require("./src/routes/adminRoutes")
connectDB(); // ✅ Connect to MongoDB
app.use(express.json()); // ✅ Enable JSON body parsing


app.use("/", adminRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
