import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const register = async (req, res) => {
    const { name, email, password, role, employeeId } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role, employeeId: employeeId || null });

    res.status(201).json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, employeeId: user.employeeId }
    });
};

export const login = async (req, res) => {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    console.log('User found:', user ? user.email : 'NOT FOUND');

    // Don't auto-create users - they must be registered first
    if (!user) {
        console.log('User not found in database');
        return res.status(400).json({
            success: false,
            message: 'User not found. Please register first.'
        });
    }

    // Validate user role - only allow admin, hr, employee
    const allowedRoles = ['admin', 'hr', 'employee'];
    if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Only admin, HR, and employee roles are allowed to login.'
        });
    }

    const ok = await bcrypt.compare(password, user.password);
    console.log('Password match:', ok);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({ id: user._id, role: user.role });

    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            employeeId: user.employeeId,
            phone: user.phone || '',
            department: user.department || '',
            designation: user.designation || '',
            avatar: user.avatar || ''
        }
    });
};

export const me = async (req, res) => {
    res.json({ user: req.user });
};
