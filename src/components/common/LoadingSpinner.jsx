import React from "react";

export default function LoadingSpinner({ size = "md", text = "" }) {
  const sizeClasses = {
    xs: {
      container: "w-10 h-10",
      text: "text-xs mt-3"
    },
    sm: {
      container: "w-12 h-12", 
      text: "text-xs mt-3"
    },
    md: {
      container: "w-16 h-16",
      text: "text-sm mt-4"
    },
    lg: {
      container: "w-20 h-20",
      text: "text-sm mt-4"
    },
    xl: {
      container: "w-24 h-24",
      text: "text-base mt-5"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Isometric Blocks Spinner */}
      <div className={`${currentSize.container} relative flex items-center justify-center`}>
        
        {/* Central rotating assembly */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            animation: 'assemblyRotate 3s linear infinite',
            transformStyle: 'preserve-3d' 
          }}
        >
          
          {/* Core isometric blocks - inspired by your logo */}
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const angle = index * 60;
            const isGreen = index % 2 === 0;
            const delay = index * 0.2;
            
            return (
              <div
                key={index}
                className="absolute"
                style={{
                  width: '28%',
                  height: '28%',
                  transform: `rotate(${angle}deg) translateX(120%) rotate(-${angle}deg)`,
                  animation: `blockFloat ${2 + delay}s ease-in-out infinite ${delay}s, blockGlow 1.5s ease-in-out infinite ${delay * 0.5}s`,
                }}
              >
                {/* 3D Isometric Block */}
                <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                  
                  {/* Top face */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isGreen 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                        : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                      clipPath: 'polygon(0% 25%, 50% 0%, 100% 25%, 50% 50%)',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
                      animation: `topFace ${2 + delay}s ease-in-out infinite ${delay}s`
                    }}
                  />
                  
                  {/* Left face */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isGreen 
                        ? 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
                        : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      clipPath: 'polygon(0% 25%, 50% 50%, 50% 100%, 0% 75%)',
                      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))',
                    }}
                  />
                  
                  {/* Right face */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isGreen 
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      clipPath: 'polygon(50% 50%, 100% 25%, 100% 75%, 50% 100%)',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.18))',
                    }}
                  />
                  
                  {/* Highlight edge */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'rgba(255, 255, 255, 0.3)',
                      clipPath: 'polygon(45% 22%, 55% 17%, 55% 27%, 45% 32%)',
                      animation: `highlight ${1.5 + delay}s ease-in-out infinite ${delay * 0.3}s`
                    }}
                  />
                </div>
              </div>
            );
          })}
          
          {/* Central connecting elements */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'centerPulse 2s ease-in-out infinite' }}
          >
            {/* Central hub - hexagonal instead of circular */}
            <div
              className="w-4 h-4 relative"
              style={{
                background: 'conic-gradient(from 0deg, #fbbf24, #10b981, #f59e0b, #059669, #fbbf24)',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.2))',
                animation: 'hubRotate 4s linear infinite'
              }}
            >
              {/* Inner core */}
              <div
                className="absolute inset-1"
                style={{
                  background: 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)',
                  clipPath: 'polygon(35% 10%, 65% 10%, 90% 50%, 65% 90%, 35% 90%, 10% 50%)',
                  animation: 'innerGlow 1.5s ease-in-out infinite'
                }}
              />
            </div>
          </div>
          
          {/* Connecting lines - like the structure in your logo */}
          {[0, 1, 2].map((lineIndex) => (
            <div
              key={lineIndex}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `rotate(${lineIndex * 120}deg)`,
                animation: `lineGlow ${3 + lineIndex * 0.5}s ease-in-out infinite ${lineIndex * 0.3}s`
              }}
            >
              <div
                className="w-full h-0.5 opacity-40"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${lineIndex % 2 === 0 ? '#fbbf24' : '#10b981'} 50%, transparent 100%)`,
                  filter: 'blur(0.5px)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Orbital hexagonal shapes - replacing circles */}
        {[0, 1, 2, 3, 4, 5].map((orbitIndex) => (
          <div
            key={orbitIndex}
            className="absolute w-3 h-3"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
              animation: `orbit ${3 + orbitIndex * 0.5}s linear infinite ${orbitIndex * 0.3}s`,
              transform: `translate(-50%, -50%) rotate(${orbitIndex * 60}deg) translateX(${parseInt(currentSize.container.split('-')[1]) * 3.5}px)`,
              filter: 'none',
              opacity: 0.85
            }}
          >
            {/* Hexagonal shape */}
            <div
              className="w-full h-full"
              style={{
                background: orbitIndex % 2 === 0 ? 
                  'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                animation: `hexRotate ${2 + orbitIndex * 0.2}s ease-in-out infinite ${orbitIndex * 0.1}s`
              }}
            />
          </div>
        ))}
      </div>

      {/* Brand-inspired text */}
      {text && (
        <div className={`${currentSize.text} relative`}>
          <span
            className="font-semibold tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #10b981 50%, #f59e0b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              animation: 'textShimmer 3s ease-in-out infinite',
              filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.15))'
            }}
          >
            {text}
          </span>
        </div>
      )}

      {/* Custom animations inspired by your logo's geometry */}
      <style jsx>{`
        @keyframes assemblyRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes blockFloat {
          0%, 100% { 
            transform: translateY(0px) scale(1);
          }
          50% { 
            transform: translateY(-3px) scale(1.05);
          }
        }
        
        @keyframes blockGlow {
          0%, 100% { 
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
          }
          50% { 
            filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.15)) drop-shadow(0 0 6px rgba(16, 185, 129, 0.1));
          }
        }
        
        @keyframes topFace {
          0%, 100% { 
            transform: perspective(100px) rotateX(0deg);
          }
          50% { 
            transform: perspective(100px) rotateX(-5deg);
          }
        }
        
        @keyframes highlight {
          0%, 100% { 
            opacity: 0.3;
          }
          50% { 
            opacity: 0.8;
          }
        }
        
        @keyframes centerPulse {
          0%, 100% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(1.1);
          }
        }
        
        @keyframes hubRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        
        @keyframes innerGlow {
          0%, 100% { 
            opacity: 0.8;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes lineGlow {
          0%, 100% { 
            opacity: 0.4;
          }
          50% { 
            opacity: 0.8;
          }
        }
        
        @keyframes orbit {
          from { 
            transform: translate(-50%, -50%) rotate(0deg) translateX(var(--radius, 40px)) rotate(0deg); 
          }
          to { 
            transform: translate(-50%, -50%) rotate(360deg) translateX(var(--radius, 40px)) rotate(-360deg); 
          }
        }
        
        @keyframes hexRotate {
          0%, 100% { 
            transform: rotate(0deg) scale(1);
          }
          50% { 
            transform: rotate(180deg) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}