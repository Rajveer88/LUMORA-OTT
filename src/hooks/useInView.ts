import React from 'react';

export function useInView(options = { threshold: 0.1 }) {
  const [isInView, setIsInView] = React.useState(false);
  const ref = React.useRef<any>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (ref.current) observer.unobserve(ref.current);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [options.threshold]);

  return { ref, isInView };
}
