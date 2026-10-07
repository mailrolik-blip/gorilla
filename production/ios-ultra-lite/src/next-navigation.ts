import { useEffect, useState } from 'react';

export function usePathname() {
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);

    window.addEventListener('popstate', sync);

    return () => window.removeEventListener('popstate', sync);
  }, []);

  return pathname;
}

export function useRouter() {
  return {
    push(href: string) {
      window.location.href = href;
    },
    replace(href: string) {
      window.location.replace(href);
    },
    refresh() {
      window.location.reload();
    },
    back() {
      window.history.back();
    },
  };
}
