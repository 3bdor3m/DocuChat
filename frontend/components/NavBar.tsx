import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

interface NavBarProps {
  items: NavItem[];
  initialActiveIndex?: number;
  vertical?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ items, initialActiveIndex = 0, vertical = false }) => {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({});
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const location = useLocation();

  // Update active index based on current URL
  useEffect(() => {
    const currentIndex = items.findIndex(item => item.href === location.pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname, items]);

  const handleClick = (_e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    setActiveIndex(index);
  };

  // Update indicator position when active index changes
  useEffect(() => {
    if (itemRefs.current[activeIndex] && navRef.current) {
      const activeElement = itemRefs.current[activeIndex] as HTMLAnchorElement;
      const navElement = navRef.current;
      
      const activeRect = activeElement.getBoundingClientRect();
      
      // Check if RTL
      const isRTL = document.documentElement.dir === 'rtl';
      
      if (vertical) {
        setIndicatorStyle({
          top: `${activeElement.offsetTop}px`,
          left: '0',
          width: '100%',
          height: `${activeRect.height}px`,
        });
      } else {
        if (isRTL) {
          // For RTL, calculate from the right
          const rightOffset = navElement.offsetWidth - (activeElement.offsetLeft + activeElement.offsetWidth);
          setIndicatorStyle({
            top: '0',
            right: `${rightOffset}px`,
            left: 'auto',
            width: `${activeRect.width}px`,
            height: '100%',
          });
        } else {
          // For LTR
          setIndicatorStyle({
            top: '0',
            left: `${activeElement.offsetLeft}px`,
            right: 'auto',
            width: `${activeRect.width}px`,
            height: '100%',
          });
        }
      }
    }
  }, [activeIndex, vertical]);

  return (
    <nav
      ref={navRef}
      className={`
        relative flex ${vertical ? 'flex-col' : 'flex-row'} 
        gap-2
      `}
      role="navigation"
    >
      {/* Active indicator background */}
      <div
        className="absolute rounded-full bg-linear-to-r from-[#2873ec] to-[#4a8fff] shadow-[0_0_20px_rgba(40,115,236,0.4)] transition-all duration-500 ease-out -z-10"
        style={indicatorStyle}
      />
      
      {items.map((item, index) => (
        <Link
          key={item.id}
          ref={(el) => { itemRefs.current[index] = el as HTMLAnchorElement; }}
          to={item.href}
          onClick={(e) => handleClick(e as any, index)}
          className={`
            relative px-5 py-2.5 rounded-full font-medium text-sm ${vertical ? 'w-full text-center' : ''}
            transition-all duration-300 ease-out
            ${activeIndex === index 
              ? 'text-white' 
              : 'text-gray-300 hover:text-white hover:bg-white/5'
            }
          `}
          aria-current={activeIndex === index ? 'page' : undefined}
        >
          {/* Hover effect for non-active items */}
          {activeIndex !== index && (
            <span className="absolute inset-0 rounded-full bg-linear-to-r from-[#2873ec]/20 to-[#4a8fff]/20 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" />
          )}
          
          <span className="relative z-10">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;