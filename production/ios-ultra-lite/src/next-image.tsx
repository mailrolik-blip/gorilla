import React from 'react';

export default function Image(props: any) {
  const {
    src,
    alt = '',
    fill,
    width,
    height,
    priority,
    unoptimized,
    quality,
    placeholder,
    blurDataURL,
    loader,
    style,
    loading,
    sizes,
    ...rest
  } = props;

  const resolvedSrc =
    typeof src === 'string'
      ? src
      : src && typeof src === 'object' && src.src
        ? src.src
        : '';

  const imageStyle = fill
    ? {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        color: 'transparent',
        ...style,
      }
    : style;

  return (
    <img
      {...rest}
      src={resolvedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? 'eager' : (loading || 'lazy')}
      decoding="async"
      style={imageStyle}
    />
  );
}
