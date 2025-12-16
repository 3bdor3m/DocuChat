// Scrollbar auto-hide handler
let scrollTimeout: NodeJS.Timeout;

const handleScroll = () => {
  // This function is no longer used for window scroll, but kept for context
  document.body.classList.add('scrolling');
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    document.body.classList.remove('scrolling');
  }, 1000);
};

// Initialize scrollbar handler
export const initScrollbarHandler = () => {
  // Handle scrollable containers
  const scrollableElements = document.querySelectorAll('.scrollable');
  scrollableElements.forEach(element => {
    let containerScrollTimeout: NodeJS.Timeout;
    
    // Check if the element already has the listener to prevent duplicates
    if (element.getAttribute('data-scroll-listener') === 'true') {
        return;
    }
    
    element.addEventListener('scroll', () => {
      element.classList.add('scrolling');
      clearTimeout(containerScrollTimeout);
      
      containerScrollTimeout = setTimeout(() => {
        element.classList.remove('scrolling');
      }, 1000);
    }, { passive: true });
    
    element.setAttribute('data-scroll-listener', 'true');
  });
};

// Cleanup function (kept for completeness)
export const cleanupScrollbarHandler = () => {
  // ...
};
