import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';

const ShareHealthRecord = ({ backendUrl, token }) => {
    const [shareToken, setShareToken] = useState('');
    const [copied, setCopied] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeSessions, setActiveSessions] = useState([]);
    const [selectedQR, setSelectedQR] = useState(null);

    const fetchActiveSessions = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/health-record/list-sessions`, {
                headers: { token }
            });
            if (response.data.success) {
                const currentTime = new Date();
                const activeSessions = response.data.sessions.filter(session => 
                    new Date(session.expiresAt) > currentTime
                );
                setActiveSessions(activeSessions);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    useEffect(() => {
        fetchActiveSessions();
        const interval = setInterval(fetchActiveSessions, 60000);
        return () => clearInterval(interval);
    }, []);

    const generateShareLink = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/api/health-record/create-session`, {}, {
                headers: { token }
            });

            if (response.data.success) {
                setShareToken(response.data.token);
                fetchActiveSessions();
            }
        } catch (error) {
            console.error('Error generating share link:', error);
        } finally {
            setLoading(false);
        }
    };

    const getShareUrl = (sessionToken) => {
        return `http://localhost:5174/patient-record/${sessionToken}`;
    };

    const copyToClipboard = async (sessionToken) => {
        await navigator.clipboard.writeText(getShareUrl(sessionToken));
        setCopied(sessionToken);
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto relative">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Share Health Record</h2>
                </div>
                
                <div className="space-y-6">
                    <div className="text-center">
                        <button
                            onClick={generateShareLink}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 mx-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                'Generate New Share Link'
                            )}
                        </button>
                    </div>

                    {/* Active Sessions List */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Active Sharing Sessions</h3>
                        <div className="space-y-4">
                            {activeSessions.length === 0 ? (
                                <p className="text-center text-gray-500">No active sharing sessions</p>
                            ) : (
                                activeSessions.map((session) => (
                                    <div key={session._id} className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={getShareUrl(session.token)}
                                                        readOnly
                                                        className="flex-1 p-2 text-sm border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        onClick={() => copyToClipboard(session.token)}
                                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1 transition-colors"
                                                    >
                                                        {copied === session.token ? (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span className="text-sm">Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                                </svg>
                                                                <span className="text-sm">Copy</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedQR(session.token)}
                                                className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <QRCode 
                                                    value={getShareUrl(session.token)}
                                                    size={64}
                                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                    viewBox={`0 0 64 64`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {selectedQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl max-w-sm w-full mx-4">
                        <div className="flex justify-end mb-2">
                            <button 
                                onClick={() => setSelectedQR(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 bg-white rounded-lg flex justify-center">
                            <QRCode 
                                value={getShareUrl(selectedQR)}
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Scan this QR code to access the health record
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareHealthRecord;