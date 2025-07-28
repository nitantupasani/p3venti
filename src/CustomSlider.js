import React, { useState, useRef, useEffect, useCallback } from 'react';

const CustomSlider = ({ min, max, value, onChange, unit, step = 1 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const getPercentage = (currentValue) => (max > min ? ((currentValue - min) / (max - min)) * 100 : 0);

  // --- FIX: Wrapped getValueFromX in useCallback and added dependencies ---
  const getValueFromX = useCallback((x) => {
    if (!sliderRef.current) return value;

    const { left, width } = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((x - left) / width) * 100));
    const rawValue = min + (max - min) * (percentage / 100);
    
    const steppedValue = Math.round(rawValue / step) * step;
    const decimals = (step.toString().split('.')[1] || []).length;
    const finalValue = parseFloat(steppedValue.toFixed(decimals));

    return Math.max(min, Math.min(max, finalValue));
  }, [min, max, step, value, sliderRef]);

  // --- FIX: Added getValueFromX to dependency array ---
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newValue = getValueFromX(e.clientX);
    onChange({ target: { value: newValue } });
  }, [isDragging, onChange, getValueFromX]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTrackClick = (e) => {
      const newValue = getValueFromX(e.clientX);
      onChange({ target: { value: newValue } });
  }

  const percentage = getPercentage(value);
  const tooltipStyle = { left: `calc(${percentage}% - 1.75rem)` };

  return (
    <div className="relative w-full max-w-lg mx-auto pt-8 pb-4">
      {/* --- Tooltip --- */}
      <div className="relative h-8 mb-2">
        <div
          className="absolute px-4 py-2 text-base font-bold text-white bg-indigo-600 rounded-lg shadow-lg"
          style={{ ...tooltipStyle, transform: 'translateY(-100%)', whiteSpace: 'nowrap' }}
        >
          {value} <span className="text-sm font-normal">{unit}</span>
        </div>
      </div>

      {/* --- Custom Slider Track and Thumb --- */}
      <div
        ref={sliderRef}
        onClick={handleTrackClick}
        className="relative w-full h-2.5 bg-gradient-to-r from-indigo-300 to-indigo-800 rounded-full cursor-pointer"
      >
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-1/2 h-14 w-14 -translate-y-1/2 -translate-x-1/2 bg-white rounded-md shadow-lg cursor-pointer flex items-center justify-center transition-transform transform hover:scale-110"
          style={{ left: `${percentage}%` }}
        >
          <img
            src="/favicon.ico"
            alt="Slider Thumb"
            className="h-12 w-12"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomSlider;