import React, { useState, useRef, useEffect, useCallback } from 'react';

const BRAND = {
  primary: '#971547',  // active track + tooltip + focus ring
  muted:   '#caabbf',  // inactive track + hover bg
  thumb:   '#431325',  // thumb border
};

const CustomSlider = ({ min, max, value, onChange, unit, step = 1 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const getPercentage = (currentValue) =>
    max > min ? ((currentValue - min) / (max - min)) * 100 : 0;

  const getValueFromPosition = useCallback((clientX) => {
    if (!sliderRef.current) return value;

    const { left, width } = sliderRef.current.getBoundingClientRect();
    if (width === 0) return value;

    const percentage = Math.max(0, Math.min(100, ((clientX - left) / width) * 100));
    const rawValue = min + (max - min) * (percentage / 100);

    const steppedValue = Math.round(rawValue / step) * step;
    const decimals = (step.toString().split('.')[1] || []).length;
    const finalValue = parseFloat(steppedValue.toFixed(decimals));

    return Math.max(min, Math.min(max, finalValue));
  }, [min, max, step, value]);

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInteractionMove = useCallback((clientX) => {
    if (!isDragging) return;
    const newValue = getValueFromPosition(clientX);
    onChange({ target: { value: newValue } });
  }, [isDragging, onChange, getValueFromPosition]);

  useEffect(() => {
    const handleMouseMove = (e) => handleInteractionMove(e.clientX);
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleInteractionMove(e.touches[0].clientX);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleInteractionEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleInteractionEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [isDragging, handleInteractionMove, handleInteractionEnd]);

  const handleInteractionStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTrackClick = (e) => {
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const newValue = getValueFromPosition(clientX);
    onChange({ target: { value: newValue } });
  };

  const percentage = getPercentage(value);
  const tooltipStyle = { left: `calc(${percentage}% - 1.75rem)` };

  return (
    <div className="relative w-full max-w-lg mx-auto pt-8 pb-4">
      {/* Tooltip */}
      <div className="relative h-8 mb-2">
        <div
          className="absolute px-4 py-2 text-base font-bold text-white rounded-lg shadow-lg"
          style={{
            ...tooltipStyle,
            transform: 'translateY(-100%)',
            whiteSpace: 'nowrap',
            backgroundColor: BRAND.primary,
          }}
        >
          {value} <span className="text-sm font-normal">{unit}</span>
        </div>
      </div>

      {/* Track */}
      <div
        ref={sliderRef}
        onClick={handleTrackClick}
        onTouchStart={handleTrackClick}
        className="relative w-full h-2.5 rounded-full cursor-pointer"
        style={{ backgroundColor: BRAND.muted }}
      >
        {/* Filled (active) segment */}
        <div
          className="absolute left-0 top-0 h-full rounded-full pointer-events-none"
          style={{ width: `${percentage}%`, backgroundColor: BRAND.primary }}
        />

        {/* Thumb */}
        <div
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
          className="absolute top-1/2 h-14 w-14 -translate-y-1/2 -translate-x-1/2 bg-white rounded-md shadow-lg cursor-pointer flex items-center justify-center transition-transform hover:scale-110"
          style={{
            left: `${percentage}%`,
            border: `0.1px solid ${BRAND.thumb}`,
            boxShadow: isDragging
              ? `0 0 0 4px ${BRAND.primary}33` // translucent focus ring
              : undefined,
          }}
        >
          <img
            src="/favicon.ico"
            alt="Slider Thumb"
            className="h-12 w-12 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomSlider;