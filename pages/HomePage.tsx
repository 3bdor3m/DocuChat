
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ClockIcon, ChatBubbleLeftRightIcon } from '../components/icons/Icons';

const HomePage: React.FC = () => {
    const { files } = useAppContext();
    const navigate = useNavigate();

    const lastActivity = files.slice(0, 3);
    const lastQuestion = files[0]?.sessions[0]?.history.filter(m => m.sender === 'user').slice(-1)[0];

    const handleNavigateToChat = () => {
        navigate('/chat');
    };

    return (
        <div className="space-y-8">
            <div 
              className="text-center p-10 md:p-20 rounded-2xl bg-cover bg-center"
              style={{backgroundImage: "url('https://picsum.photos/1200/400?grayscale&blur=2')"}}
            >
                <div className="bg-black/50 p-8 rounded-xl backdrop-blur-sm inline-block">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">حوّل كتبك إلى حوار</h1>
                    <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto">
                        ارفع ملفاتك، ودع المدرس الافتراضي يساعدك على الفهم والتحليل والمراجعة بأسلوب تفاعلي وذكي.
                    </p>
                    <button 
                        onClick={handleNavigateToChat}
                        className="mt-8 px-8 py-3 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition-transform transform hover:scale-105"
                    >
                        ابدأ الآن
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Last Activity */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <ClockIcon className="w-6 h-6 me-3 text-sky-500" />
                        آخر نشاط
                    </h2>
                    <div className="space-y-4">
                        {lastActivity.length > 0 ? lastActivity.map(file => (
                            <div key={file.id} className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{file.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(file.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                                <button onClick={handleNavigateToChat} className="text-sky-500 hover:text-sky-600 font-medium">
                                    متابعة
                                </button>
                            </div>
                        )) : (
                            <p className="text-slate-500 dark:text-slate-400">لا يوجد نشاطات سابقة.</p>
                        )}
                    </div>
                </div>

                {/* Quick Question */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 me-3 text-sky-500" />
                        سؤال سريع
                    </h2>
                    {lastQuestion ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700">
                               <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">من ملف: {files[0].name}</p>
                               <p className="font-semibold">"{lastQuestion.text}"</p>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="اكتب إجابتك هنا..."
                                    className="w-full p-3 pe-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                />
                                <button className="absolute top-1/2 -translate-y-1/2 end-3 text-sky-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400">لا توجد أسئلة سابقة. ابدأ محادثة جديدة!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
