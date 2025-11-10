
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { DocumentDuplicateIcon, SparklesIcon, TagIcon, ChartBarIcon } from '../components/icons/Icons';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex items-center">
        <div className={`p-3 rounded-full me-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const StatusPage: React.FC = () => {
    const { stats } = useAppContext();
    const maxCount = Math.max(...stats.commonTopics.map(t => t.count), 0);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold">لوحة الإحصائيات</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">نظرة عامة على نشاطك التعليمي</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    icon={<DocumentDuplicateIcon className="w-6 h-6 text-white"/>} 
                    label="الملفات المحللة" 
                    value={stats.filesAnalyzed}
                    color="bg-sky-500"
                />
                <StatCard 
                    icon={<SparklesIcon className="w-6 h-6 text-white"/>} 
                    label="متوسط الإبداع" 
                    value={`${stats.avgCreativity}%`}
                    color="bg-amber-500"
                />
                <StatCard 
                    icon={<TagIcon className="w-6 h-6 text-white"/>} 
                    label="أكثر موضوع" 
                    value={stats.commonTopics[0]?.topic || '-'}
                    color="bg-emerald-500"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                 <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <ChartBarIcon className="w-6 h-6 me-3 text-sky-500" />
                    المواضيع الأكثر تكرارًا
                </h2>
                <div className="space-y-4">
                    {stats.commonTopics.map((item) => (
                        <div key={item.topic} className="flex items-center">
                            <p className="w-1/3 text-slate-600 dark:text-slate-300">{item.topic}</p>
                            <div className="w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full h-6">
                                <div 
                                    className="bg-sky-500 h-6 rounded-full flex items-center justify-end px-2 text-white text-sm"
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                >
                                    {item.count}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatusPage;
