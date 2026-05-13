import dotenv from "dotenv";

import connectDB from "./shared/config/db.js";
import { createApp } from "./app.js";

dotenv.config();
connectDB();

const app = createApp();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
