import Report from "../models/Report.js";
import User from "../models/User.js";

// Create a new report
export const createReport = async (req, res) => {
    try {
        const { reportType, fileName, month, year, data, recordCount, filters } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!reportType || !fileName || !month || !year || !data) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate report type
        const validReportTypes = ['attendance', 'leave', 'payroll', 'employee', 'recruitment'];
        if (!validReportTypes.includes(reportType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid report type'
            });
        }

        // Create new report
        const report = new Report({
            reportType,
            fileName,
            month,
            year,
            data,
            recordCount,
            createdBy: userId,
            filters: filters || {}
        });

        await report.save();

        // Populate the user reference
        await report.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Report stored successfully',
            data: report
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error storing report',
            error: error.message
        });
    }
};

// Get all reports
export const getReports = async (req, res) => {
    try {
        const { reportType, month, year } = req.query;
        let query = {};

        // Apply filters if provided
        if (reportType) query.reportType = reportType;
        if (month) query.month = month;
        if (year) query.year = year;

        const reports = await Report.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: reports,
            count: reports.length
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reports',
            error: error.message
        });
    }
};

// Get report by ID
export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findById(id).populate('createdBy', 'name email');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching report',
            error: error.message
        });
    }
};

// Delete report
export const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        await Report.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting report',
            error: error.message
        });
    }
};