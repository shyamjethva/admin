import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
// Removed auto-mark absent functionality - only create records when employees clock in/out

const PORT = process.env.PORT || 5000;

await connectDB();

// Removed auto-mark absent cron job
// Attendance records will only be created when employees actually clock in/out

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});