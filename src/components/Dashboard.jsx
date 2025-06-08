import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog6ToothIcon, UserCircleIcon, ArrowPathIcon, SparklesIcon, DocumentTextIcon, ChartBarIcon, LightBulbIcon, CommandLineIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { getUserAnalyses } from '../services/userAnalysisService';
import { generateText } from '../services/writingService';
import { auth } from '../firebase';
import MimicAzer from './MimicAzer';

const sidebarItems = [
  { icon: <DocumentTextIcon className="w-6 h-6" />, label: 'Documents', color: 'from-blue-500 to-cyan-500' },
  { icon: <ChartBarIcon className="w-6 h-6" />, label: 'Analytics', color: 'from-purple-500 to-pink-500' },
  { icon: <LightBulbIcon className="w-6 h-6" />, label: 'Mimic Azer', color: 'from-yellow-500 to-orange-500' },
  { icon: <CommandLineIcon className="w-6 h-6" />, label: 'Settings', color: 'from-green-500 to-emerald-500' },
];

function ModernModal({ message }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-neon-purple/40"
      >
        <SparklesIcon className="w-12 h-12 mx-auto text-neon-purple mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold mb-2 text-neon-purple">Access Restricted</h2>
        <p className="text-gray-700 text-lg mb-2">{message}</p>
        <div className="text-gray-400 text-sm">You will be redirected shortly...</div>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const [activeWindow, setActiveWindow] = useState(null);
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [showExamples, setShowExamples] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);

  useEffect(() => {
    const checkUserAndAnalysis = async () => {
      if (!auth.currentUser) {
        setModalInfo({
          message: 'You must be logged in to access the dashboard.'
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      try {
        const analyses = await getUserAnalyses(auth.currentUser.uid);
        if (analyses.length === 0) {
          setModalInfo({
            message: 'You must complete your writing style analysis to access the dashboard.'
          });
          setTimeout(() => {
            window.location.href = '/analysis';
          }, 2000);
        } else {
          setHasAnalysis(true);
        }
      } catch (error) {
        setModalInfo({
          message: 'You must complete your writing style analysis to access the dashboard.'
        });
        setTimeout(() => {
          window.location.href = '/analysis';
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserAndAnalysis();
  }, []);

  useEffect(() => {
    if (isLoading || !hasAnalysis) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        color: `rgba(176, 38, 255, ${Math.random() * 0.5})`,
      });
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLoading, hasAnalysis]);

  if (modalInfo) {
    return <ModernModal message={modalInfo.message} />;
  }
  if (isLoading) {
    return <div className="text-white text-center mt-20">Checking your account...</div>;
  }
  if (!hasAnalysis) {
    return null;
  }

  // Mesaj gönderme fonksiyonu
  const handleSend = async () => {
    if (inputValue.trim() === "") return;
    
    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInputValue("");
    setShowExamples(false);
    
    // Generate response
    setIsGenerating(true);
    try {
      if (auth.currentUser) {
        const generatedText = await generateText(userMessage, auth.currentUser.uid);
        setMessages(prev => [...prev, { role: "assistant", text: generatedText }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        text: "Sorry, I couldn't generate text at the moment. Please try again later." 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Enter ile gönderme
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Analytics sekmesine tıklandığında analiz geçmişini getir
  const handleSidebarClick = async (label) => {
    if (label === 'Analytics') {
      setActiveTab('analytics');
      setLoadingAnalysis(true);
      try {
        if (auth.currentUser) {
          const analyses = await getUserAnalyses(auth.currentUser.uid);
          setAnalysisHistory(analyses);
        }
      } catch (e) {
        setAnalysisHistory([]);
      }
      setLoadingAnalysis(false);
    } else if (label === 'Mimic Azer') {
      setActiveTab('mimicazer');
    } else {
      setActiveTab('chat');
    }
  };

  return (
    <div className="h-screen flex bg-mat-black relative overflow-hidden">
      {/* Animated Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      
      {/* Gradient Orbs */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute left-1/4 top-1/4 w-[600px] h-[400px] bg-gradient-to-tr from-purple-600 via-pink-500 to-blue-500 rounded-full blur-3xl opacity-60 shadow-2xl"
        />
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute right-1/4 bottom-1/4 w-[400px] h-[400px] bg-gradient-to-br from-fuchsia-500 via-purple-400 to-indigo-500 rounded-full blur-2xl opacity-50 shadow-2xl"
        />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-72 min-h-screen bg-white/5 backdrop-blur-xl border-r border-neon-purple/20 flex flex-col py-10 px-6 z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-12"
        >
          <SparklesIcon className="w-8 h-8 text-neon-purple" />
          <span className="text-2xl font-bold text-white tracking-wide">MimicText</span>
        </motion.div>

        <nav className="flex flex-col gap-4">
          {sidebarItems.map((item, i) => (
            <motion.button
              key={i}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white transition-all font-medium text-lg overflow-hidden ${activeTab === item.label.toLowerCase() ? 'bg-neon-purple/20' : ''}`}
              onClick={() => handleSidebarClick(item.label)}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
              <div className="relative z-10 flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
              </div>
            </motion.button>
          ))}
        </nav>

        <div className="flex-1" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-white/40 mt-8"
        >
          © 2024 MimicText
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 p-8">
        {activeTab === 'analytics' ? (
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-8">Your Writing Analytics</h2>
            {loadingAnalysis ? (
              <div className="text-white/70">Loading...</div>
            ) : analysisHistory.length === 0 ? (
              <div className="text-white/70">No analysis found.</div>
            ) : (
              <div className="space-y-6">
                {analysisHistory.map((item, idx) => (
                  <div key={item.id || idx} className="bg-white/10 border border-neon-purple/20 rounded-2xl p-6 shadow-lg">
                    <div className="text-sm text-white/60 mb-2">Analyzed on: {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown date'}</div>
                    <div className="mb-2">
                      <span className="font-bold text-white">Original Text:</span>
                      <div className="bg-mat-black/60 rounded p-2 mt-1 text-white/80 text-sm max-h-32 overflow-y-auto">{item.text}</div>
                    </div>
                    <div>
                      <span className="font-bold text-neon-purple">Analysis:</span>
                      <div className="bg-mat-black/40 rounded p-2 mt-1 text-white/90 text-sm whitespace-pre-line">{item.analysis}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'mimicazer' ? (
          <MimicAzer />
        ) : (
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-6 tracking-tight drop-shadow-lg">
            What would you like to write?
          </h1>
          <p className="text-lg text-white/60 mb-8 text-center max-w-xl">
                We've analyzed your writing style. Just tell us what you want to write, and we'll generate a text that sounds just like you.
              </p>
            </motion.div>

            {/* Modern Example Prompts */}
            {showExamples && (
              <div className="flex justify-center gap-6 mb-8">
                {[
                  "Write a motivational email to my team about our new project.",
                  "Generate a creative story about a robot learning emotions.",
                  "Summarize the key points of this article in bullet points."
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(example)}
                    className="group bg-gradient-to-br from-mat-black via-mat-gray to-mat-black/80 border border-neon-purple/40 hover:border-neon-purple/80 shadow-xl rounded-2xl px-6 py-5 min-w-[260px] max-w-xs text-left transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_#b026ff55] relative overflow-hidden"
                    style={{backdropFilter:'blur(12px)'}}
                  >
                    <span className="block text-white/90 font-semibold text-base mb-2 group-hover:text-neon-purple transition-colors">Example {idx+1}</span>
                    <span className="block text-white/70 text-sm leading-snug">{example}</span>
                    <span className="absolute right-4 bottom-4 text-neon-purple opacity-0 group-hover:opacity-100 transition-opacity">Click to use</span>
                  </button>
                ))}
              </div>
            )}

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-neon-purple text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-white rounded-2xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask me to write something in your style..."
                className="w-full h-24 bg-white/5 border border-neon-purple/20 rounded-2xl p-4 text-white placeholder-white/40 focus:outline-none focus:border-neon-purple/40 resize-none"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isGenerating}
                className={`absolute right-4 bottom-4 p-2 rounded-xl transition-all ${
                  inputValue.trim() && !isGenerating
                    ? 'bg-neon-purple text-white hover:bg-neon-purple/90'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ArrowRightIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 right-8 flex gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-full bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 transition-colors"
          >
            <SparklesIcon className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-full bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 transition-colors"
          >
            <ArrowPathIcon className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
} 