'use client';

import React, { useEffect, useState } from 'react';

export function ParticleBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  
  const particles = Array.from({ length: 40 });

  return (
    <div className="particle-background -z-10">
      {particles.map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 5 + 5}s`, // 5s to 10s
          animationDelay: `${Math.random() * 5}s`,
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
        };
        return <div key={i} className="particle" style={style}></div>;
      })}
    </div>
  );
}
