import Settings from "../models/Settings.js";
import { protect, authorize } from "../middleware/authmiddleware.js";
import { Router } from "express";

const settingsRouter = Router();

// Get settings (creates default if not exists)
settingsRouter.get("/", protect, async (req, res) => {
    try {
        console.log('📥 GET /settings called by user:', req.user?.id, req.user?.role);
        let settings = await Settings.findOne();
        console.log('📊 Found settings:', settings);

        if (!settings) {
            console.log('🆕 Creating default settings...');
            settings = await Settings.create({});
            console.log('✅ Created default settings:', settings);
        }

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('❌ Error in GET /settings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update company settings (admin only)
settingsRouter.put("/company", protect, authorize("admin"), async (req, res) => {
    try {
        console.log('💾 PUT /settings/company called by user:', req.user?.id, req.user?.role);
        console.log('📥 Request body:', req.body);

        const { companyName, industry, address, phone, email, website, timezone, currency } = req.body;

        let settings = await Settings.findOne();
        console.log('📊 Current settings:', settings);

        if (!settings) {
            console.log('🆕 Creating settings document...');
            settings = await Settings.create({});
        }

        settings.companyName = companyName || settings.companyName;
        settings.industry = industry || settings.industry;
        settings.address = address || settings.address;
        settings.phone = phone || settings.phone;
        settings.email = email || settings.email;
        settings.website = website || settings.website;
        settings.timezone = timezone || settings.timezone;
        settings.currency = currency || settings.currency;

        await settings.save();
        console.log('✅ Saved settings:', settings);

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('❌ Error in PUT /settings/company:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update notification settings
settingsRouter.put("/notifications", protect, async (req, res) => {
    try {
        const notifications = req.body;

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({});
        }

        settings.notificationSettings = {
            ...settings.notificationSettings,
            ...notifications
        };

        await settings.save();

        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default settingsRouter;