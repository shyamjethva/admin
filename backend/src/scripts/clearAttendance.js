import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import dotenv from 'dotenv';

dotenv.config();

const clearAttendanceRecords = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hr-management');
        console.log('✅ Connected to MongoDB');

        // Count existing records
        const countBefore = await Attendance.countDocuments();
        console.log(`📊 Found ${countBefore} attendance records`);

        if (countBefore === 0) {
            console.log('✅ No attendance records to delete');
            return;
        }

        // Delete all attendance records
        const result = await Attendance.deleteMany({});
        console.log(`🗑️  Deleted ${result.deletedCount} attendance records`);

        // Verify deletion
        const countAfter = await Attendance.countDocuments();
        console.log(`✅ Remaining attendance records: ${countAfter}`);

        console.log('🎉 Attendance records cleared successfully!');
    } catch (error) {
        console.error('❌ Error clearing attendance records:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔒 Database connection closed');
    }
};

// Run the script
clearAttendanceRecords();