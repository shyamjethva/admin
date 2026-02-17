import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: "admin12@gmail.com" });

        if (existingAdmin) {
            console.log("Admin user already exists");
        } else {
            // Create new admin
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const admin = await User.create({
                name: "Rakshit Patadiya",
                email: "admin12@gmail.com",
                password: hashedPassword,
                role: "admin",
                department: "Admin",
                designation: "Admin",
            });
            console.log("Admin user created:", admin.email);
        }

        await mongoose.disconnect();
        console.log("Done!");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

seedAdmin();
