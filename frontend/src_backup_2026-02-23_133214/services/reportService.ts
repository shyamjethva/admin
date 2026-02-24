// Report Service
import api from './api';

export const reportService = {
    // Store a report in MongoDB
    storeReport: async (reportData) => {
        try {
            const response = await api.post('/reports', reportData);
            return response.data;
        } catch (error) {
            console.error('Error storing report:', error);
            throw error;
        }
    },

    // Get all reports
    getReports: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/reports?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
    },

    // Get report by ID
    getReportById: async (id) => {
        try {
            const response = await api.get(`/reports/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching report:', error);
            throw error;
        }
    },

    // Delete report
    deleteReport: async (id) => {
        try {
            const response = await api.delete(`/reports/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting report:', error);
            throw error;
        }
    }
};