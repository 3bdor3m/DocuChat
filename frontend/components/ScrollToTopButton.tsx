import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 bg-[#2873ec] hover:bg-[#4a8fff] text-white p-3 rounded-full shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
      }`}
      aria-label="الرجوع للأعلى"
    >
      <FaArrowUp size={20} />
    </button>
  );
};

export default ScrollToTopButton;