
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockGetClassDetails } from '../../services/mockApi';
import { ClassDetails, EnrolledStudent } from '../../types';
import Header from '../../components/common/Header';
import { Spinner } from '../../components/common/Spinner';
import { ArrowLeft, TrendingUp, BarChart3, UserCheck, Users, Milestone } from 'lucide-react';

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
    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!classId) return;
            setLoading(true);
            try {
                const details = await mockGetClassDetails(classId);
                if (details) {
                    setClassDetails(details);
                } else {
                    setError('Class not found.');
                }
            } catch (err) {
                setError('Failed to load class details.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [classId]);
    
    const analytics = useMemo(() => {
        if (!classDetails) return null;

        const scoredStudents = classDetails.students.filter(s => s.pretestScore !== null && s.posttestScore !== null);
        const maleStudents = scoredStudents.filter(s => s.gender === 'MALE');
        const femaleStudents = scoredStudents.filter(s => s.gender === 'FEMALE');

        const getAverage = (arr: EnrolledStudent[], key: 'pretestScore' | 'posttestScore'): number => 
            arr.length > 0 ? arr.reduce((acc, s) => acc + (s[key] ?? 0), 0) / arr.length : 0;
        
        const getDelta = (arr: EnrolledStudent[]): number => 
            arr.length > 0 ? arr.reduce((acc, s) => acc + ((s.posttestScore ?? 0) - (s.pretestScore ?? 0)), 0) / arr.length : 0;

        return {
            overall: {
                avgPre: getAverage(scoredStudents, 'pretestScore'),
                avgPost: getAverage(scoredStudents, 'posttestScore'),
                avgDelta: getDelta(scoredStudents),
            },
            male: {
                avgPre: getAverage(maleStudents, 'pretestScore'),
                avgPost: getAverage(maleStudents, 'posttestScore'),
                avgDelta: getDelta(maleStudents),
            },
            female: {
                avgPre: getAverage(femaleStudents, 'pretestScore'),
                avgPost: getAverage(femaleStudents, 'posttestScore'),
                avgDelta: getDelta(femaleStudents),
            }
        }
    }, [classDetails]);

    const renderDelta = (delta: number) => {
        const color = delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-slate-500';
        const sign = delta > 0 ? '+' : '';
        return <span className={`font-bold ${color}`}>{sign}{delta.toFixed(1)}</span>;
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
    if (!classDetails || !analytics) return null;
    
    return (
        <div className="min-h-screen bg-slate-100">
            <Header title={`Analytics: ${classDetails.name}`} />
            <main className="container mx-auto p-8">
                <Link to="/teacher-dashboard" className="flex items-center gap-2 text-teal-600 font-semibold mb-6 hover:underline">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={<BarChart3 size={24}/>} title="Avg. Pre-Test Score" value={analytics.overall.avgPre.toFixed(1)} subtitle="Class Average" />
                    <StatCard icon={<TrendingUp size={24}/>} title="Avg. Post-Test Score" value={analytics.overall.avgPost.toFixed(1)} subtitle="Class Average" />
                    <StatCard icon={<Milestone size={24}/>} title="Avg. Score Improvement" value={renderDelta(analytics.overall.avgDelta)} subtitle="Class Average Delta" />
                    <StatCard icon={<Users size={24}/>} title="Total Students" value={classDetails.studentCount.toString()} subtitle="Enrolled in class" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Male Student Performance</h3>
                        <div className="flex justify-around text-center">
                            <div><p className="text-sm text-slate-500">Avg. Pre-Test</p><p className="text-2xl font-bold">{analytics.male.avgPre.toFixed(1)}</p></div>
                            <div><p className="text-sm text-slate-500">Avg. Post-Test</p><p className="text-2xl font-bold">{analytics.male.avgPost.toFixed(1)}</p></div>
                            <div><p className="text-sm text-slate-500">Improvement</p><p className="text-2xl font-bold">{renderDelta(analytics.male.avgDelta)}</p></div>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Female Student Performance</h3>
                        <div className="flex justify-around text-center">
                            <div><p className="text-sm text-slate-500">Avg. Pre-Test</p><p className="text-2xl font-bold">{analytics.female.avgPre.toFixed(1)}</p></div>
                            <div><p className="text-sm text-slate-500">Avg. Post-Test</p><p className="text-2xl font-bold">{analytics.female.avgPost.toFixed(1)}</p></div>
                            <div><p className="text-sm text-slate-500">Improvement</p><p className="text-2xl font-bold">{renderDelta(analytics.female.avgDelta)}</p></div>
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
                                {classDetails.students.map(student => {
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
    );
};

export default PerformanceAnalyticsPage;