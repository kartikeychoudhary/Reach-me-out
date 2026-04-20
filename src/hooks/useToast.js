import { useCallback, useRef, useState } from 'react';

export function useToast(duration = 2600) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback(
    (icon, message) => {
      setToast({ icon, message });
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  return { toast, show };
}
