import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../services/apiService';

const PortfolioPage = () => {
    const { studentId } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await fetch(`${API_URL}/portfolio/${studentId}`);
                if (!res.ok) throw new Error('Failed to fetch portfolio data.');
                const data = await res.json();
                setPortfolio(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [studentId]);

    const handleDownloadPDF = () => {
        window.print();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500 italic">Generating your research portfolio...</div>;
    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Portfolio Not Ready</h2>
            <p className="text-gray-600 mb-6 text-center">{error}</p>
            <Link to="/synopsis" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Back to Dashboard</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div id="portfolio-content" className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 flex flex-col md:flex-row print:shadow-none print:border-none print:rounded-none">
                {/* Left Sidebar - Personal Info */}
                <div className="w-full md:w-1/3 bg-blue-900 text-white p-8 space-y-8 print:bg-blue-900">
                    <div className="text-center md:text-left">
                        <div className="w-32 h-32 bg-blue-700 rounded-2xl mx-auto md:mx-0 mb-4 flex items-center justify-center text-4xl font-bold border-4 border-blue-500 shadow-inner">
                            {portfolio.name?.charAt(0)}
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight">{portfolio.name}</h1>
                        <p className="text-blue-300 font-medium">Student ID: {portfolio.studentId}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Research Domain</h3>
                            <p className="text-sm font-semibold">{portfolio.domain}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Supervisor</h3>
                            <p className="text-sm font-semibold">{portfolio.supervisor}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Academic Year</h3>
                            <p className="text-sm font-semibold">{portfolio.year}</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-blue-800">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Technical Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {portfolio.toolsUsed?.split(',').map((tool, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-800 text-blue-200 text-xs font-bold rounded border border-blue-700">
                                    {tool.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* QR Code Placeholder for authenticity */}
                    <div className="mt-auto pt-12 text-center md:text-left print:hidden">
                        <div className="inline-block p-2 bg-white rounded-lg">
                           {/* Simplified SVG QR Code mockup */}
                           <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M7 7h.01M17 7h.01M17 17h.01M7 17h.01"></path></svg>
                        </div>
                        <p className="text-[10px] text-blue-400 mt-2">Verified Research Portfolio</p>
                    </div>
                </div>

                {/* Right Content - Research Details */}
                <div className="w-full md:w-2/3 p-8 md:p-12 space-y-10">
                    <div className="flex justify-between items-start print:hidden">
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-wider">Research Portfolio</span>
                        <div className="flex gap-2">
                             <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Copy Link">
                                 <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                             </button>
                             <button onClick={handleDownloadPDF} className="p-2 hover:bg-blue-50 rounded-full text-blue-600 transition-colors" title="Download PDF">
                                 <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                             </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-gray-900 leading-tight">{portfolio.title}</h2>
                        <div className="h-1.5 w-24 bg-blue-600 rounded-full"></div>
                    </div>

                    <section className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="p-1 bg-purple-100 text-purple-600 rounded-md">✦</span> 
                            Professional Summary
                        </h3>
                        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 relative italic text-purple-900 font-medium leading-relaxed">
                            "{portfolio.aiSummary}"
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Abstract</h3>
                        <p className="text-gray-600 text-sm leading-relaxed text-justify">
                            {portfolio.abstract}
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                        <section className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Methodology</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">{portfolio.methodology || 'Structured academic research approach.'}</p>
                        </section>
                        <section className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Outcomes</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">{portfolio.expectedOutcomes || 'Contributed to the field of AI and Machine Learning.'}</p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 italic">
                        <p>Generated by Acadexa Academic Platform</p>
                        <p className="mt-2 md:mt-0">Verification ID: {portfolio.studentId}-{portfolio.year}</p>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto mt-8 text-center print:hidden">
                <Link to="/synopsis" className="text-sm font-bold text-blue-600 hover:underline">
                    ← Back to Research Dashboard
                </Link>
            </div>

            <style>{`
                @media print {
                    nav, .ChatbotWidget, button, .print\\:hidden { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    #portfolio-content { margin: 0; max-width: 100%; width: 100%; border: none; shadow: none; }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                #portfolio-content { animation: fade-in 0.6s ease-out; }
            `}</style>
        </div>
    );
};

export default PortfolioPage;
