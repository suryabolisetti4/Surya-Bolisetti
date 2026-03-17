import React from 'react';
import { motion } from 'motion/react';

export const Logo = () => {
  return (
    <div className="relative group cursor-pointer">
      {/* Chip Body */}
      <div className="relative w-12 h-12 bg-bg-surface border-x-2 border-b-2 border-accent-primary flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.2)] group-hover:shadow-[0_0_25px_rgba(var(--accent-primary-rgb),0.4)] transition-all duration-300">
        
        {/* Scanline Effect in Logo */}
        <div className="absolute inset-0 pointer-events-none z-20 scanline-overlay opacity-[0.05]" />
        
        {/* Internal Circuit Lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-accent-primary" />
          <div className="absolute top-0 left-2/4 w-[1px] h-full bg-accent-primary" />
          <div className="absolute top-0 left-3/4 w-[1px] h-full bg-accent-primary" />
          <div className="absolute left-0 top-1/4 h-[1px] w-full bg-accent-primary" />
          <div className="absolute left-0 top-2/4 h-[1px] w-full bg-accent-primary" />
          <div className="absolute left-0 top-3/4 h-[1px] w-full bg-accent-primary" />
        </div>

        {/* Initials */}
        <span className="relative z-10 font-jetbrains text-accent-primary font-black text-xl tracking-tighter group-hover:scale-110 transition-transform duration-300">
          SB
        </span>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-accent-secondary" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-accent-secondary" />
      </div>

      {/* External Pins (Left) */}
      <div className="absolute -left-2 top-2 w-2 h-[2px] bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />
      <div className="absolute -left-2 top-5 w-2 h-[2px] bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />
      <div className="absolute -left-2 top-8 w-2 h-[2px] bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />
      
      {/* External Pins (Right) */}
      <div className="absolute -right-2 top-2 w-2 h-[2px] bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />
      <div className="absolute -right-2 top-5 w-2 h-[2px] bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />
      <div className="absolute -right-2 top-8 w-2 h-[2px] bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />

      {/* External Pins (Top) */}
      <div className="absolute left-2 -top-2 w-[2px] h-2 bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />
      <div className="absolute left-5 -top-2 w-[2px] h-2 bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />
      <div className="absolute left-8 -top-2 w-[2px] h-2 bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />

      {/* External Pins (Bottom) */}
      <div className="absolute left-2 -bottom-2 w-[2px] h-2 bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />
      <div className="absolute left-5 -bottom-2 w-[2px] h-2 bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />
      <div className="absolute left-8 -bottom-2 w-[2px] h-2 bg-accent-primary/40 group-hover:bg-accent-primary transition-colors" />
    </div>
  );
};
