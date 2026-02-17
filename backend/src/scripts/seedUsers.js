import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const testUsers = [
    {
        name: "Admin User",
        email: "rakshit@gmail.com",
        password: "password",
        role: "admin",
        department: "Administration",
        designation: "System Administrator",
    },
    {
        name: "HR Manager",
        email: "hemal@gmail.com",
        password: "password",
        role: "hr",
        department: "Human Resources",
        designation: "HR Manager",
    },
    {
        name: "John Doe",
        email: "employee@company.com",
        password: "password",
        role: "employee",
        department: "Development",
        designation: "Senior Developer",
    },
];

async function seedUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing test users (optional)
        const testEmails = testUsers.map((u) => u.email);
        await User.deleteMany({ email: { $in: testEmails } });
        console.log("🗑️  Cleared existing test users");

        // Hash passwords and create users
        for (const userData of testUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await User.create({
                ...userData,
                password: hashedPassword,
            });
            console.log(`✅ Created user: ${user.email} (${user.role})`);
        }

        console.log("\n🎉 Seed completed successfully!");
        console.log("\nYou can now login with:");
        testUsers.forEach((u) => {
            console.log(`  📧 ${u.email} / 🔑 ${u.password} (${u.role})`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seedUsers();
