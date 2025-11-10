
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpenIcon, CogIcon } from './icons/Icons';

const Header: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-sky-500 text-white'
        : 'text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-800'
    }`;

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-sky-500" />
            <span className="font-bold text-xl ms-2 text-slate-800 dark:text-slate-100">المدرس الافتراضي</span>
          </div>
          <nav className="hidden md:flex items-center space-s-4">
            <NavLink to="/" className={navLinkClass}>الصفحة الرئيسية</NavLink>
            <NavLink to="/chat" className={navLinkClass}>الدردشة</NavLink>
            <NavLink to="/status" className={navLinkClass}>الحالة</NavLink>
            <NavLink to="/me" className={navLinkClass}>أنا</NavLink>
          </nav>
          <div className="flex items-center">
             <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <CogIcon className="h-6 w-6 text-gray-600 dark:text-gray-300"/>
             </button>
          </div>
        </div>
      </div>
       {/* Mobile Nav */}
       <nav className="md:hidden flex items-center justify-around p-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <NavLink to="/" className={navLinkClass}>الرئيسية</NavLink>
            <NavLink to="/chat" className={navLinkClass}>الدردشة</NavLink>
            <NavLink to="/status" className={navLinkClass}>الحالة</NavLink>
            <NavLink to="/me" className={navLinkClass}>أنا</NavLink>
        </nav>
    </header>
  );
};

export default Header;
