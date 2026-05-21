import "dotenv/config"; // ← dòng ĐẦU TIÊN, trước mọi import khác


import connectDB from "./shared/config/db.js";
import { createApp } from "./app.js";

connectDB();

const app = createApp();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});