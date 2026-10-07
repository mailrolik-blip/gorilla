import React from 'react';

const Link = React.forwardRef(function Link(props: any, ref: any) {
  const {
    href,
    children,
    prefetch,
    replace,
    scroll,
    shallow,
    locale,
    onNavigate,
    legacyBehavior,
    ...rest
  } = props;

  let resolvedHref = '#';

  if (typeof href === 'string') {
    resolvedHref = href;
  } else if (href && typeof href === 'object') {
    resolvedHref = href.pathname || '#';
  }

  return (
    <a ref={ref} href={resolvedHref} {...rest}>
      {children}
    </a>
  );
});

export default Link;
