
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClassAnalytics } from '../../services/api';
import { EnrolledStudent } from '../../types';
import Header from '../../components/common/Header';
import { Spinner } from '../../components/common/Spinner';
import { ArrowLeft, TrendingUp, BarChart3, UserCheck, Users, Milestone, Download, FileText, Table } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: React.ReactNode; subtitle: string }> = ({ icon, title, value, subtitle }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4">
        <div className="bg-teal-100 text-teal-600 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
    </div>
);

const PerformanceAnalyticsPage: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!classId) return;
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('No authentication token found');
                    return;
                }
                const data = await getClassAnalytics(classId, token);
                setAnalyticsData(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load analytics data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [classId]);
    
    const analytics = useMemo(() => {
        if (!analyticsData) return null;
        return {
            overall: {
                avgPre: analyticsData.overall?.avgPretestScore || 0,
                avgPost: analyticsData.overall?.avgPosttestScore || 0,
                avgDelta: analyticsData.overall?.avgScoreImprovement || 0,
            },
            male: {
                avgPre: analyticsData.malePerformance?.avgPretestScore || 0,
                avgPost: analyticsData.malePerformance?.avgPosttestScore || 0,
                avgDelta: analyticsData.malePerformance?.avgImprovement || 0,
            },
            female: {
                avgPre: analyticsData.femalePerformance?.avgPretestScore || 0,
                avgPost: analyticsData.femalePerformance?.avgPosttestScore || 0,
                avgDelta: analyticsData.femalePerformance?.avgImprovement || 0,
            },
            totalStudents: analyticsData.totalStudents || 0,
            students: analyticsData.detailedStudentScores || []
        };
    }, [analyticsData]);

    const renderDelta = (delta: number) => {
        const color = delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-slate-500';
        const sign = delta > 0 ? '+' : '';
        return <span className={`font-bold ${color}`}>{sign}{delta.toFixed(1)}</span>;
    };

    const chartData = useMemo(() => {
        if (!analytics?.students) return null;
        
        const scoredStudents = analytics.students.filter(
            (s: any) => s.pretestScore !== null && s.posttestScore !== null
        );

        // Performance trend data
        const trendData = [
            { name: 'Pre-Test', overall: analytics.overall.avgPre, male: analytics.male.avgPre, female: analytics.female.avgPre },
            { name: 'Post-Test', overall: analytics.overall.avgPost, male: analytics.male.avgPost, female: analytics.female.avgPost }
        ];

        // Score distribution data
        const scoreRanges = [
            { range: '0-20', count: 0 },
            { range: '21-40', count: 0 },
            { range: '41-60', count: 0 },
            { range: '61-80', count: 0 },
            { range: '81-100', count: 0 }
        ];

        scoredStudents.forEach((student: any) => {
            const score = student.posttestScore || 0;
            if (score <= 20) scoreRanges[0].count++;
            else if (score <= 40) scoreRanges[1].count++;
            else if (score <= 60) scoreRanges[2].count++;
            else if (score <= 80) scoreRanges[3].count++;
            else scoreRanges[4].count++;
        });

        // Gender performance comparison
        const genderData = [
            { name: 'Male', pretest: analytics.male.avgPre, posttest: analytics.male.avgPost, improvement: analytics.male.avgDelta },
            { name: 'Female', pretest: analytics.female.avgPre, posttest: analytics.female.avgPost, improvement: analytics.female.avgDelta }
        ];

        return { trendData, scoreRanges, genderData };
    }, [analytics]);

    const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
    const reportRef = useRef<HTMLDivElement>(null);

    const exportToPDF = async () => {
        if (!reportRef.current) return;
        
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Class_Analytics_Report.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };

    const exportToCSV = () => {
        if (!analytics || !analytics.students) return;

        const headers = ['Student Name', 'Gender', 'Pre-Test Score', 'Post-Test Score', 'Improvement'];
        const csvContent = [
            headers.join(','),
            ...analytics.students.map((student: any) => [
                `"${student.name || 'Unknown'}"`,
                student.gender || 'Unknown',
                student.pretestScore ?? 'N/A',
                student.posttestScore ?? 'N/A',
                student.scoreImprovement !== null 
                    ? student.scoreImprovement.toFixed(1) 
                    : 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Class_Analytics_Data.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
    if (!analyticsData || !analytics) return null;
    
    return (
        <div className="min-h-screen bg-slate-100">
            <Header title="Class Performance Analytics" />
            <div ref={reportRef}>
            <main className="container mx-auto p-8">
                <div className="flex items-center justify-between mb-6">
                    <Link to="/teacher-dashboard" className="flex items-center gap-2 text-teal-600 font-semibold hover:underline">
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Table size={18} />
                            Export CSV
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <FileText size={18} />
                            Export PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={<BarChart3 size={24}/>} title="Avg. Pre-Test Score" value={analytics.overall.avgPre.toFixed(1)} subtitle="Class Average" />
                    <StatCard icon={<TrendingUp size={24}/>} title="Avg. Post-Test Score" value={analytics.overall.avgPost.toFixed(1)} subtitle="Class Average" />
                    <StatCard icon={<Milestone size={24}/>} title="Avg. Score Improvement" value={renderDelta(analytics.overall.avgDelta)} subtitle="Class Average Delta" />
                    <StatCard icon={<Users size={24}/>} title="Total Students" value={analytics.totalStudents.toString()} subtitle="Enrolled in class" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Performance Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData?.trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="overall" stroke="#0d9488" strokeWidth={3} name="Overall" />
                                <Line type="monotone" dataKey="male" stroke="#3b82f6" strokeWidth={2} name="Male" />
                                <Line type="monotone" dataKey="female" stroke="#ec4899" strokeWidth={2} name="Female" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Gender Performance Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData?.genderData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="pretest" fill="#fbbf24" name="Pre-Test" />
                                <Bar dataKey="posttest" fill="#10b981" name="Post-Test" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Score Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData?.scoreRanges}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Improvement Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-600 font-medium">Male Avg Improvement</p>
                                <p className="text-2xl font-bold text-blue-800">{renderDelta(analytics.male.avgDelta)}</p>
                            </div>
                            <div className="text-center p-4 bg-pink-50 rounded-lg">
                                <p className="text-sm text-pink-600 font-medium">Female Avg Improvement</p>
                                <p className="text-2xl font-bold text-pink-800">{renderDelta(analytics.female.avgDelta)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <h2 className="text-2xl font-bold text-slate-800 p-6">Detailed Student Scores</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600">Student Name</th>
                                    <th className="p-4 font-semibold text-slate-600">Gender</th>
                                    <th className="p-4 font-semibold text-slate-600 text-center">Pre-Test Score</th>
                                    <th className="p-4 font-semibold text-slate-600 text-center">Post-Test Score</th>
                                    <th className="p-4 font-semibold text-slate-600 text-center">Improvement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.students.map((student: any) => {
                                    const delta = (student.posttestScore ?? 0) - (student.pretestScore ?? 0);
                                    let deltaColor = 'text-slate-500';
                                    if (delta > 0) deltaColor = 'text-green-600';
                                    if (delta < 0) deltaColor = 'text-red-600';

                                    return (
                                        <tr key={student.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                            <td className="p-4 font-medium text-slate-800">{student.name}</td>
                                            <td className="p-4 text-slate-600">{student.gender}</td>
                                            <td className="p-4 text-center font-mono text-slate-700">{student.pretestScore ?? 'N/A'}</td>
                                            <td className="p-4 text-center font-mono text-slate-700">{student.posttestScore ?? 'N/A'}</td>
                                            <td className={`p-4 text-center font-mono font-bold ${deltaColor}`}>
                                                {student.pretestScore !== null && student.posttestScore !== null ? (delta > 0 ? `+${delta}` : delta) : 'N/A'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            </div>
        </div>
    );
};

export default PerformanceAnalyticsPage;