import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import startAutoMarkAbsent from "./src/scripts/cronAutoMarkAbsent.js";

const PORT = process.env.PORT || 5000;

await connectDB();

// Start the auto-mark absent cron job
try {
    await startAutoMarkAbsent();
    console.log('✅ Auto-mark absent cron job started');
} catch (error) {
    console.error('❌ Error starting auto-mark absent cron job:', error);
}

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);

});
