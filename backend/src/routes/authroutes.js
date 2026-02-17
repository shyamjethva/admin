import { Router } from "express";
import { login, register, me } from "../controllers/authcontroller.js";
import { protect } from "../middleware/authmiddleware.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);

// Update user avatar
router.put("/avatar", protect, async (req, res) => {
    try {
        const { avatar } = req.body;
        const userId = req.user.id;

        const updated = await User.findByIdAndUpdate(
            userId,
            { avatar },
            { new: true }
        ).select('-password');

        if (!updated) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user profile (name, phone, department, designation)
router.put("/profile", protect, async (req, res) => {
    try {
        const { name, phone, department, designation } = req.body;
        const userId = req.user.id;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (department !== undefined) updateData.department = department;
        if (designation !== undefined) updateData.designation = designation;

        const updated = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        if (!updated) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Change password
router.put("/change-password", protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
