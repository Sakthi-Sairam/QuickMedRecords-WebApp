import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';

const ShareHealthRecord = ({ backendUrl, token }) => {
    const [shareToken, setShareToken] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const generateShareLink = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/api/health-record/create-session`, {}, {
                headers: { token }
            });

            if (response.data.success) {
                setShareToken(response.data.token);
            }
        } catch (error) {
            console.error('Error generating share link:', error);
        } finally {
            setLoading(false);
        }
    };

    const getShareUrl = () => {
        return `http://localhost:5174/patient-record/${shareToken}`;
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(getShareUrl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto">
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
                                'Generate Share Link'
                            )}
                        </button>
                    </div>

                    {shareToken && (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="p-4 bg-white rounded-lg shadow-lg">
                                    <QRCode 
                                        value={getShareUrl()}
                                        size={200}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 200 200`}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={getShareUrl()}
                                    readOnly
                                    className="flex-1 p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="text-center text-sm text-gray-500">
                                This link will expire after 24 hours
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareHealthRecord;