import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_INTERVAL = 30000; // 30 seconds

/**
 * Custom hook for auto-refresh functionality
 */
function useAutoRefresh(options = {}) {
  const { interval = DEFAULT_INTERVAL, enabled = true, onRefresh = () => {} } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [nextRefresh, setNextRefresh] = useState(null);
  const [countdown, setCountdown] = useState(interval / 1000);

  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setNextRefresh(Date.now() + interval);
      setCountdown(interval / 1000);
    }
  }, [onRefresh, interval]);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  const pause = useCallback(() => {
    setIsEnabled(false);
  }, []);

  const resume = useCallback(() => {
    setIsEnabled(true);
  }, []);

  // Setup auto-refresh interval
  useEffect(() => {
    if (isEnabled && !isRefreshing) {
      intervalRef.current = setInterval(() => {
        refresh();
      }, interval);

      setNextRefresh(Date.now() + interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, interval, refresh, isRefreshing]);

  // Countdown timer
  useEffect(() => {
    if (isEnabled && !isRefreshing) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) return interval / 1000;
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [isEnabled, interval, isRefreshing]);

  return {
    isRefreshing,
    isEnabled,
    nextRefresh,
    countdown,
    refresh,
    toggle,
    pause,
    resume,
  };
}

export default useAutoRefresh;
