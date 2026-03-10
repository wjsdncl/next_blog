/** 지연 시간 내 마지막 호출만 실행 */
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/** 지정 시간 간격 내 최대 1회만 실행 */
const throttle = <T extends (...args: any[]) => void>(fn: T, limit: number) => {
  let lastRan: number | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    const now = Date.now();

    if (lastRan === null || now - lastRan >= limit) {
      fn(...args);
      lastRan = now;
    } else if (!timeout) {
      timeout = setTimeout(
        () => {
          fn(...args);
          lastRan = Date.now();
          timeout = null;
        },
        limit - (now - lastRan)
      );
    }
  };
};

export { debounce, throttle };
