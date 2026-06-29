'use client';

import { useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Image from 'next/image';

export default function InteractiveBackground() {
  const { scrollYProgress } = useScroll();

  // Scroll-based animations
  const maskScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.2, 1.5]);
  const maskOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [0.8, 0.2, 0]);
  
  // Parallax for the scrolling text container
  const textY = useTransform(scrollYProgress, [0, 1], [0, -300]);

  // Mouse/Touch-based 3D Tilt animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the 3D rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { damping: 30, stiffness: 100 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { damping: 30, stiffness: 100 });

  useEffect(() => {
    // Helper to calculate relative position (-0.5 to 0.5) for both mouse and touch
    const handleMove = (clientX: number, clientY: number) => {
      const x = (clientX / window.innerWidth) - 0.5;
      const y = (clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center" style={{ perspective: 1000 }}>
      
      {/* 1. Animated Light Yellowish-Maroon Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-amber-50 via-rose-100 to-amber-50 bg-[length:200%_200%] opacity-80"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 15, ease: "linear", repeat: Infinity }}
      />

      {/* 2. Auto-Scrolling Horizontal Background Letters (Marquee Effect) */}
      <motion.div 
        style={{ y: textY }}
        className="absolute w-full flex opacity-40 mix-blend-overlay z-0"
      >
        <motion.div
          className="flex whitespace-nowrap"
          // Animates from 0 to -50% of its width, then loops endlessly
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          {/* We duplicate the text twice to create a seamless infinite loop */}
          <span className="text-[15vw] font-black text-white drop-shadow-2xl tracking-tighter px-8">
            KANDYAN CULTURAL CENTER • 
          </span>
          <span className="text-[15vw] font-black text-white drop-shadow-2xl tracking-tighter px-8">
            KANDYAN CULTURAL CENTER • 
          </span>
        </motion.div>
      </motion.div>

      {/* 3. Faux-3D Interactive Mask */}
      <motion.div
        style={{ 
          scale: maskScale, 
          opacity: maskOpacity,
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative w-[350px] h-[350px] md:w-[550px] md:h-[550px]"
      >
        <Image 
          src="/kandyan-mask.png" 
          alt="Traditional Kandyan Mask" 
          fill 
          className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.15)] pointer-events-auto"
          priority
        />
      </motion.div>
      
      {/* 4. Soft Animated Gradient Orbs to enhance the glass feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-300/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}