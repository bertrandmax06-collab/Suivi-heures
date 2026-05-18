import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

export function Card({ children, className = '', onClick, padding = true }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-card ${padding ? 'p-4' : ''} ${onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow active:scale-[0.98]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
