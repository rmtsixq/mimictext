import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { analyzeText } from '../services/mistralService';
import { saveAnalysis } from '../services/userAnalysisService';
import { auth } from '../firebase';

const analysisSteps = [
  'Analyzing writing style...',
  'Examining paragraph structure...',
  'Identifying key patterns...',
];

const USER_TEXT = 'Bu bir örnek kullanıcı yazısıdır. Scan efekti için buraya kendi yazınızı koyabilirsiniz!';

const mockAnalysisLines = [
  'Kullanıcı özellikle giriş cümlelerine odaklanıyor.',
  'Duygusal bir yazım tarzı ön planda.',
  'Bazı cümlelerde tekrarlar mevcut.',
  'Önemli bulduğum cümle: "Hayat bir yolculuktur."',
  'Yazının genel tonu pozitif.'
];

const AnalysisStep1 = ({ userText, isAnalyzing, onScanComplete, onContinue }) => {
  // Step animation state
  const [currentStep, setCurrentStep] = useState(0);
  const [scanX, setScanX] = useState(0);
  const [stage, setStage] = useState('scan'); // 'scan' | 'learn'
  const marqueeRef = useRef(null);
  const containerRef = useRef(null);
  const scanLineRef = useRef(null);

  // Particle effect state
  const [particles, setParticles] = useState([]);
  const particleRef = useRef(null);
  const animationRef = useRef(null);

  // Show 'Devam Et' button after all analysis lines are in
  const [showContinue, setShowContinue] = useState(false);

  // Random number for personal analysis count
  const [personalCount] = useState(() => Math.floor(Math.random() * 11) + 90);

  // Add new state for real analysis
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);

  // Force update state
  const [forceUpdate, setForceUpdate] = useState(false);

  // Animate steps
  useEffect(() => {
    if (stage !== 'scan') return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % analysisSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stage]);

  // Check if a character is intersecting with the scan line
  const isCharIntersecting = (charIndex) => {
    if (!marqueeRef.current || !scanLineRef.current) return false;
    
    const charElement = marqueeRef.current.children[charIndex];
    if (!charElement) return false;

    const charRect = charElement.getBoundingClientRect();
    const scanRect = scanLineRef.current.getBoundingClientRect();
    
    // Check if character intersects with scan line
    return (
      charRect.left <= scanRect.right &&
      charRect.right >= scanRect.left
    );
  };

  // Animate scan line (controlled by stage)
  useEffect(() => {
    if (stage !== 'scan') return;
    let raf;
    let x = -200;
    const speed = 0.8;
    const animate = () => {
      if (marqueeRef.current && containerRef.current) {
        const width = marqueeRef.current.offsetWidth;
        const containerWidth = containerRef.current.offsetWidth;
        x += speed;
        if (x > containerWidth) {
          setTimeout(() => setStage('learn'), 600);
          return;
        }
        setScanX(x);
        // Force re-render to update character intersections
        setForceUpdate(prev => !prev);
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  // Initialize particles
  useEffect(() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const createParticle = () => ({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      letter: letters[Math.floor(Math.random() * letters.length)],
      size: Math.random() * 15 + 8,
      speed: Math.random() * 0.3 + 0.1,
      opacity: 0.8
    });

    // Create initial particles
    const initialParticles = Array.from({ length: 18 }, createParticle);
    setParticles(initialParticles);

    // Add new particles periodically
    const interval = setInterval(() => {
      setParticles(prevParticles => {
        const newParticles = [...prevParticles, createParticle()];
        return newParticles.filter(p => p.y > -50);
      });
    }, 900);

    // Smooth animation using requestAnimationFrame
    const animate = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          y: particle.y - particle.speed,
          opacity: Math.max(0, particle.opacity - 0.0015)
        }))
      );
      animationRef.current = setTimeout(animate, 40);
    };
    animationRef.current = setTimeout(animate, 40);

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Show 'Devam Et' button after all analysis lines are in
  useEffect(() => {
    if (stage === 'learn') {
      const delay = 0.5 + mockAnalysisLines.length * 0.7 + 0.7;
      const timeout = setTimeout(() => setShowContinue(true), delay * 1000);
      return () => clearTimeout(timeout);
    } else {
      setShowContinue(false);
    }
  }, [stage]);

  // Real analysis effect
  useEffect(() => {
    if (stage === 'learn' && !isAnalysisComplete) {
      const performAnalysis = async () => {
        try {
          const analysis = await analyzeText(userText);
          const analysisLines = analysis.split('\n').filter(line => line.trim());
          setAnalysisResults(analysisLines);
          
          // Save analysis to database
          if (auth.currentUser) {
            await saveAnalysis(auth.currentUser.uid, userText, analysis);
          }
          
          setIsAnalysisComplete(true);
        } catch (error) {
          console.error('Error during analysis:', error);
          setAnalysisResults(['Error analyzing text. Please try again.']);
        }
      };
      
      performAnalysis();
    }
  }, [stage, userText, isAnalysisComplete]);

  return (
    <div className="min-h-screen bg-mat-black relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(176,38,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(176,38,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Floating Letters */}
      <div className="absolute inset-0 pointer-events-none" ref={particleRef}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute text-neon-purple font-bold"
            style={{
              left: particle.x,
              top: particle.y,
              fontSize: `${particle.size}px`,
              opacity: particle.opacity,
              textShadow: '0 0 8px rgba(176, 38, 255, 0.5)',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform, opacity'
            }}
          >
            {particle.letter}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-20 z-10" ref={containerRef}>
        {/* SCAN + HEADER (fade out) */}
        <AnimatePresence>
          {stage === 'scan' && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full absolute left-0 top-0 z-10"
              style={{ pointerEvents: 'none' }}
            >
              {/* Text Analysis Animation */}
              <div className="text-center mb-12">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-20 h-20 bg-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <SparklesIcon className="w-10 h-10 text-neon-purple" />
                </motion.div>
                <motion.h2 
                  className="text-3xl font-bold text-white mb-4"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  Yazın Analiz Ediliyor...
                </motion.h2>
              </div>

              {/* SCAN EFFECT */}
              <div className="relative h-32 flex items-center justify-center mb-12 overflow-hidden">
                {/* Vertical scan line (fixed in center) */}
                <div
                  ref={scanLineRef}
                  className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-400 to-transparent z-20 rounded-full shadow-[0_0_16px_4px_#4D7FFF99] pointer-events-none"
                  style={{transform: 'translateX(-50%)'}}
                />
                {/* Marquee text (scrolls from left to right) */}
                <div className="w-full relative h-16 flex items-center justify-center">
                  <div
                    ref={marqueeRef}
                    className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-3xl font-bold tracking-wide select-none"
                    style={{ 
                      transform: `translateX(${scanX}px)`,
                    }}
                  >
                    {Array.from("Scanning your text...").map((char, index) => (
                      <span
                        key={index}
                        className={`inline-block transition-all duration-200 ${
                          isCharIntersecting(index) 
                            ? 'text-blue-400 scale-125 font-extrabold' 
                            : 'text-white/70'
                        }`}
                        style={{
                          textShadow: isCharIntersecting(index)
                            ? '0 0 20px rgba(96, 165, 250, 0.9), 0 0 40px rgba(96, 165, 250, 0.6)'
                            : 'none'
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Animated Analysis Steps - Only one visible at a time, purple and blurred */}
              <div className="h-20 flex items-center justify-center mb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.7 }}
                    className="text-2xl md:text-3xl font-bold text-neon-purple drop-shadow-lg select-none"
                    style={{ textShadow: '0 0 16px #B026FF99' }}
                  >
                    {analysisSteps[currentStep]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* BEYİN + ANALİZ CÜMLELERİ (fade in) */}
        <AnimatePresence>
          {stage === 'learn' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center justify-center z-20 bg-transparent"
              style={{ minHeight: 400, boxShadow: 'none', background: 'none', border: 'none' }}
            >
              {/* Main analysis result */}
              <div className="text-2xl md:text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-[#b993fe] via-[#8ca6db] to-[#232347] bg-clip-text text-transparent" style={{letterSpacing:'-0.01em'}}>
                {analysisResults[0] || 'Analyzing your text...'}
              </div>

              {/* Other analysis points */}
              <div className="relative w-full flex flex-col items-center gap-3" style={{ maxWidth: 600 }}>
                {analysisResults.slice(1).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 200 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.7, duration: 0.7 }}
                    className="px-6 py-3 rounded-lg text-base w-full max-w-xl text-center font-medium bg-white/10 backdrop-blur-md border border-white/10 shadow-[0_2px_12px_0_rgba(30,22,54,0.10)]"
                    style={{
                      color: '#e6e6f0',
                      boxShadow: '0 2px 12px 0 rgba(30, 22, 54, 0.10)'
                    }}
                  >
                    {line}
                  </motion.div>
                ))}
              </div>

              {/* Continue button */}
              {isAnalysisComplete && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-8 px-10 py-4 rounded-2xl font-bold text-xl bg-gradient-to-r from-[#6a82fb] to-[#fc5c7d] text-white shadow-[0_8px_32px_0_rgba(108,99,255,0.25)] backdrop-blur-lg border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_#6a82fbcc] focus:outline-none focus:ring-4 focus:ring-[#6a82fb]/30"
                  onClick={() => onContinue && onContinue()}
                >
                  Continue
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnalysisStep1; 