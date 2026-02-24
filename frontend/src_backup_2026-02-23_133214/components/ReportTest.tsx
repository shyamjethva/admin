import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';

export function ReportTest() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportService.getReports();
            setReports(response.data);
            console.log('Reports fetched:', response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReport = async (id) => {
        try {
            await reportService.deleteReport(id);
            fetchReports(); // Refresh the list
        } catch (error) {
            console.error('Error deleting report:', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Report Storage Test</h1>

            <div className="mb-4">
                <button
                    onClick={fetchReports}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh Reports'}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-4">Stored Reports ({reports.length})</h2>

                {reports.length === 0 ? (
                    <p className="text-gray-500">No reports found. Try downloading a report first.</p>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <div key={report._id} className="border border-gray-200 rounded p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">{report.fileName}</h3>
                                        <p className="text-sm text-gray-600">
                                            Type: {report.reportType} | Month: {report.month} | Year: {report.year}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Records: {report.recordCount} | Created: {new Date(report.createdAt).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Created by: {report.createdBy?.name || 'Unknown'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteReport(report._id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
                <h3 className="font-medium text-yellow-800">Test Instructions:</h3>
                <ol className="list-decimal list-inside text-yellow-700 mt-2 space-y-1">
                    <li>Go to the Reports page and download any report</li>
                    <li>Come back to this page and click "Refresh Reports"</li>
                    <li>You should see the downloaded report listed here</li>
                    <li>The report data is now stored in MongoDB</li>
                </ol>
            </div>
        </div>
    );
}