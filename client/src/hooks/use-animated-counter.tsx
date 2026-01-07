import { useState, useEffect, useRef } from 'react';

interface UseAnimatedCounterOptions {
  duration?: number;
  decimals?: number;
  easing?: (t: number) => number;
}

// Easing function for smooth animation
const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export function useAnimatedCounter(
  targetValue: number,
  options: UseAnimatedCounterOptions = {}
) {
  const { duration = 800, decimals = 0, easing = easeOutExpo } = options;
  
  const [displayValue, setDisplayValue] = useState(targetValue);
  const previousValue = useRef(targetValue);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    // Don't animate on initial render or if value hasn't changed
    if (previousValue.current === targetValue) {
      return;
    }

    const startValue = previousValue.current;
    const difference = targetValue - startValue;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      
      const currentValue = startValue + difference * easedProgress;
      
      setDisplayValue(
        decimals > 0 
          ? parseFloat(currentValue.toFixed(decimals))
          : Math.round(currentValue)
      );

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        previousValue.current = targetValue;
        startTimeRef.current = undefined;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, decimals, easing]);

  // Update previous value when target changes
  useEffect(() => {
    return () => {
      previousValue.current = targetValue;
    };
  }, [targetValue]);

  return displayValue;
}

// Component wrapper for animated numbers with formatting
interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 800,
  decimals = 0,
  className = '',
  formatOptions,
}: AnimatedNumberProps) {
  const animatedValue = useAnimatedCounter(value, { duration, decimals });
  
  const formattedValue = formatOptions
    ? animatedValue.toLocaleString(undefined, formatOptions)
    : animatedValue.toLocaleString();

  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
