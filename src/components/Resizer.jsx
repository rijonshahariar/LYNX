import React from 'react';

const Resizer = ({ isDark }) => {
  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const container = document.getElementById('ide-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit the resize between 20% and 80% of the container width
    if (percentage > 20 && percentage < 80) {
      const leftPanel = document.getElementById('left-panel');
      const rightPanel = document.getElementById('right-panel');
      if (leftPanel && rightPanel) {
        leftPanel.style.width = `${percentage}%`;
        rightPanel.style.width = `${100 - percentage}%`;
      }
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="px-2 cursor-col-resize flex items-center justify-center hover:bg-opacity-10 hover:bg-green-500">
      <div
        className={`w-[5px] h-full transition-colors duration-200 ${
          isDark ? 'bg-gray-700 hover:bg-green-500' : 'bg-gray-200 hover:bg-green-400'
        }`}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default Resizer; 