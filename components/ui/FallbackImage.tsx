"use client";

import { useState } from "react";

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

export default function FallbackImage({ fallback, src, alt, className, ...props }: FallbackImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
