
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { UserCircleIcon, GlobeAltIcon, FolderIcon, TrashIcon } from '../components/icons/Icons';

const MePage: React.FC = () => {
    const { files, setFiles } = useAppContext();

    const handleDeleteFile = (fileId: string) => {
        if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا الملف وجميع محادثاته؟")) {
            setFiles(files.filter(f => f.id !== fileId));
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div className="text-center">
                <h1 className="text-4xl font-bold">الملف الشخصي</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">إدارة حسابك وتفضيلاتك</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <UserCircleIcon className="w-6 h-6 me-3 text-sky-500" />
                    معلومات الحساب
                </h2>
                <div className="flex items-center space-s-4">
                    <img src="https://picsum.photos/80" alt="صورة المستخدم" className="w-20 h-20 rounded-full" />
                    <div>
                        <p className="text-xl font-semibold">المستخدم التجريبي</p>
                        <p className="text-slate-500 dark:text-slate-400">user@example.com</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <GlobeAltIcon className="w-6 h-6 me-3 text-sky-500" />
                    التفضيلات
                </h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="language-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">لغة الواجهة</label>
                        <select 
                            id="language-select" 
                            className="mt-1 block w-full md:w-1/2 p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            defaultValue="ar"
                        >
                            <option value="ar">العربية</option>
                            <option value="en" disabled>English (Not available)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FolderIcon className="w-6 h-6 me-3 text-sky-500" />
                    إدارة الملفات
                </h2>
                <div className="space-y-3">
                    {files.length > 0 ? files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <div>
                                <p className="font-semibold">{file.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    تاريخ الإضافة: {new Date(file.createdAt).toLocaleDateString('ar-EG')} - {file.sessions.length} جلسة
                                </p>
                            </div>
                            <button 
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                                aria-label={`حذف ملف ${file.name}`}
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    )) : (
                        <p className="text-slate-500 dark:text-slate-400">لم تقم برفع أي ملفات بعد.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MePage;
