import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'accent' | 'ghost';
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Button({ 
  variant = 'primary', 
  href, 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  
  // Base classes that apply to ALL buttons
  const baseStyles = "inline-flex items-center justify-center font-bold py-4 px-8 rounded-xl transition-all duration-300 cursor-pointer";
  
  // Variant-specific classes mapped from your design
  const variants = {
    // The Solid Gold "Buy Now" Button
    primary: "bg-kandyan-gold-dark hover:bg-amber-800 text-white shadow-md hover:shadow-lg",
    
    // The Boxline "Add to Cart" Button
    outline: "bg-transparent border-2 border-kandyan-gold-dark text-kandyan-gold-dark hover:bg-kandyan-gold-dark hover:text-white hover:shadow-lg",
    
    // The Gradient Maroon "Send Message" Button
    accent: "bg-gradient-to-r from-kandyan-maroon-dark to-kandyan-maroon hover:from-kandyan-maroon hover:to-rose-600 text-white shadow-kandyan-button hover:shadow-[0_12px_25px_rgba(159,18,57,0.3)] transform hover:-translate-y-1",
    
    // Simple text button (like "Read full history")
    ghost: "bg-transparent text-slate-900 hover:text-kandyan-maroon px-0 py-2 hover:translate-x-2"
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${className}`;

  // If an 'href' is passed, render a Next.js Link instead of a button
  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  // Otherwise, render a standard HTML button
  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}