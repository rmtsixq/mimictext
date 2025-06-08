import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AnalysisStep1 from './components/AnalysisStep1';
import { ArrowRightIcon, SparklesIcon, CodeBracketIcon, CommandLineIcon, RocketLaunchIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './components/Auth';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import Pricing from './pages/Pricing';

const testimonials = [
  {
    text: "MimicText has been a game-changer for my assignments. It helps me write in my own style and saves so much time!",
    name: "Ben Bernard",
    company: "Harvard University",
    image: "https://i.pravatar.cc/150?img=1"
  },
  {
    text: "I love how MimicText analyzes my writing style and generates content that sounds just like me. It's like having a personal writing assistant!",
    name: "Kevin Whinnery",
    company: "Stanford University",
    image: "https://i.pravatar.cc/150?img=2"
  },
  {
    text: "MimicText has improved my writing skills significantly. The AI suggestions are always on point and help me express my ideas better.",
    name: "Sawyer Hood",
    company: "MIT",
    image: "https://i.pravatar.cc/150?img=3"
  },
  {
    text: "Using MimicText has made my assignments more engaging and original. It's a must-have tool for any student!",
    name: "Andrew Milich",
    company: "Oxford University",
    image: "https://i.pravatar.cc/150?img=4"
  },
  {
    text: "MimicText is the best writing assistant I've ever used. It understands my style and helps me create unique content every time.",
    name: "Morgan McGuire",
    company: "Cambridge University",
    image: "https://i.pravatar.cc/150?img=5"
  },
  {
    text: "MimicText has transformed how I approach my writing assignments. It's intuitive and incredibly helpful!",
    name: "Deniz Aydın",
    company: "Sabancı University",
    image: "https://i.pravatar.cc/150?img=6"
  }
];

const aiDetectors = [
  {
    name: "GPTZero",
    logo: "https://www.gptzero.com/favicon.ico",
    result: "Human Written",
    confidence: 98,
    color: "from-green-500 to-emerald-500"
  },
  {
    name: "QuillBot",
    logo: "https://quillbot.com/favicon.ico",
    result: "Human Content",
    confidence: 95,
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Copyleaks",
    logo: "https://www.copyleaks.com/favicon.ico",
    result: "Human Generated",
    confidence: 97,
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Grammarly",
    logo: "https://img.icons8.com/?size=256&id=rFdotO9u820V&format=png",
    result: "Human Written",
    confidence: 96,
    color: "from-orange-500 to-red-500"
  },
  {
    name: "ZeroGPT",
    logo: "https://www.zerogpt.com/favicon.ico",
    result: "Human Content",
    confidence: 94,
    color: "from-indigo-500 to-violet-500"
  }
];

const styles = `
  @keyframes progress {
    from {
      width: 0;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-gradient {
    animation: gradient 15s ease infinite;
    background-size: 200% 200%;
  }
`;

async function analyzeTextWithOpenAI(text) {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Sen bir metin analiz uzmanısın.' },
        { role: 'user', content: `Aşağıdaki metni analiz et. Kullanıcı hangi cümlelere odaklanıyor, yazım tarzı nasıl, duygusal mı, önemli bulduğun cümleleri ve kısa analizini madde madde yaz:\n\n${text}\n\nAyrıca, kullanıcının İngilizce seviyesi nedir? (beginner, intermediate, advanced) ve neden bu seviyede olduğunu kısaca açıkla.` }
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Analiz alınamadı.';
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('yazi');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [particles, setParticles] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const [uploadedText, setUploadedText] = useState('');
  const [isLearning, setIsLearning] = useState(false);
  const [mockMode, setMockMode] = useState(true); // true: OpenAI'ya istek atma
  const [stage, setStage] = useState('scan'); // 'scan' | 'learn'
  const [showDashboard, setShowDashboard] = useState(false);

  // Particle network için gerekli değişkenler
  const particleCount = 150;
  const particleSize = 2;
  const connectionDistance = 150;
  const particleSpeed = 0.5;

  const heroText = "Assignment Writing Assistant";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setShowAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Canvas boyutlarını ayarla
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse pozisyonunu takip et
    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Mouse parçacığını güncelle
      mouseParticle.x = mouseX;
      mouseParticle.y = mouseY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Parçacıkları oluştur
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * particleSpeed,
        vy: (Math.random() - 0.5) * particleSpeed,
        size: particleSize
      });
    }

    // Mouse parçacığını ekle
    const mouseParticle = {
      x: 0,
      y: 0,
      size: particleSize * 2
    };

    // Animasyon fonksiyonu
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Tüm parçacıkları güncelle ve çiz
      particles.forEach((particle, index) => {
        // Parçacığı hareket ettir
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Ekran sınırlarını kontrol et
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Parçacığı çiz
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(176, 38, 255, 0.5)';
        ctx.fill();

        // Mouse parçacığı ile bağlantıyı kontrol et
        const dx = mouseParticle.x - particle.x;
        const dy = mouseParticle.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(mouseParticle.x, mouseParticle.y);
          ctx.lineTo(particle.x, particle.y);
          ctx.strokeStyle = `rgba(176, 38, 255, ${0.6 * (1 - distance / connectionDistance)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Diğer parçacıklarla bağlantıları kontrol et
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = otherParticle.x - particle.x;
          const dy = otherParticle.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(176, 38, 255, ${0.3 * (1 - distance / connectionDistance)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Mouse parçacığını çiz
      ctx.beginPath();
      ctx.arc(mouseParticle.x, mouseParticle.y, mouseParticle.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(176, 38, 255, 0.8)';
      ctx.fill();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedText(event.target.result);
      };
      reader.readAsText(files[0]); // Sadece ilk dosyayı oku
    } else {
      setUploadedText('');
    }
  };

  const removeFile = (indexToRemove) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Particle animation logic
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    // Only animate if a new character is added
    if (newValue.length > inputValue.length) {
      const inputRect = inputRef.current?.getBoundingClientRect();
      const inputWidth = inputRect ? inputRect.width : 300;
      // Daha düzgün aralıklı dağıtım için:
      const maxParticles = 10;
      const idx = newValue.length % maxParticles;
      const left = (inputWidth / maxParticles) * idx + (inputWidth / maxParticles) * 0.2;
      setParticles((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          left,
          color: [
            'bg-neon-purple',
            'bg-neon-pink',
            'bg-neon-blue',
            'bg-white',
            'bg-yellow-400',
            'bg-green-400',
            'bg-pink-400',
          ][Math.floor(Math.random() * 7)],
          shape: ['rounded-full', 'rounded-md'][Math.floor(Math.random() * 2)], // sadece daire ve kare
        },
      ]);
    }
    setInputValue(newValue);
  };

  // Remove particles after animation
  React.useEffect(() => {
    if (particles.length === 0) return;
    const timeout = setTimeout(() => {
      setParticles((prev) => prev.slice(1));
    }, 900);
    return () => clearTimeout(timeout);
  }, [particles]);

  // Helper for star shape
  const Star = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><polygon points="10,2 12,7.5 18,8 13.5,12 15,18 10,14.5 5,18 6.5,12 2,8 8,7.5" /></svg>
  );

  // Find the text to analyze
  let analysisText = '';
  if (activeTab === 'yazi') {
    analysisText = inputValue;
  } else if (activeTab === 'yukle' && uploadedFiles.length > 0) {
    const file = uploadedFiles[0];
    if (file && file.name && file.name.toLowerCase().endsWith('.txt')) {
      analysisText = uploadedText;
    } else {
      analysisText = 'Analyzing your text...';
    }
  }

  // When showAnalysis starts, simulate AI analysis
  useEffect(() => {
    if (showAnalysis) {
      setIsAnalyzing(true);
      setAiAnalysis('');
      // Scan animasyonu bitince AI analizi başlatılacak
    }
  }, [showAnalysis]);

  // Scan animasyonu bitince aşama değiştir
  const handleScanComplete = () => {
    setIsAnalyzing(false);
    setTimeout(() => setStage('learn'), 600); // 600ms sonra scan UI fade out
  };

  // Fake analiz cümleleri
  const mockAnalysisLines = [
    'Kullanıcı özellikle giriş cümlelerine odaklanıyor.',
    'Duygusal bir yazım tarzı ön planda.',
    'Bazı cümlelerde tekrarlar mevcut.',
    'Önemli bulduğum cümle: "Hayat bir yolculuktur."',
    'Yazının genel tonu pozitif.'
  ];

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-mat-black text-white relative overflow-hidden">
        {/* Particle Network Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        />

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(176,38,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(176,38,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        {/* Mor Parlaklık Efekti */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-purple/20 via-transparent to-transparent"></div>

        {/* Navigation */}
        <nav className="relative backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent">
                  MimicText<span className="text-neon-purple">AI</span>
                </Link>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link to="/" className="text-gray-300 hover:text-neon-purple px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                  <Link to="/how-it-works" className="text-gray-300 hover:text-neon-purple px-3 py-2 rounded-md text-sm font-medium transition-colors">How It Works</Link>
                  <Link to="/pricing" className="text-gray-300 hover:text-neon-purple px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</Link>
                  <button
                    onClick={() => setShowDashboard(true)}
                    className="text-gray-300 hover:text-neon-purple px-3 py-2 rounded-md text-sm font-medium transition-colors bg-transparent border-none cursor-pointer"
                  >
                    Dashboard
                  </button>
                  {user ? (
                    <button
                      onClick={() => auth.signOut()}
                      className="bg-neon-purple/10 text-neon-purple px-4 py-2 rounded-md text-sm font-medium hover:bg-neon-purple/20 transition-all hover:shadow-[0_0_15px_rgba(176,38,255,0.5)]"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAuth(true)}
                      className="bg-neon-purple/10 text-neon-purple px-4 py-2 rounded-md text-sm font-medium hover:bg-neon-purple/20 transition-all hover:shadow-[0_0_15px_rgba(176,38,255,0.5)]"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-neon-purple/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neon-purple"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isMobileMenuOpen ? (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-mat-black/95 backdrop-blur-sm">
              <Link to="/" className="text-gray-300 hover:text-neon-purple block px-3 py-2 rounded-md text-base font-medium">Home</Link>
              <Link to="/how-it-works" className="text-gray-300 hover:text-neon-purple block px-3 py-2 rounded-md text-base font-medium">How It Works</Link>
              <Link to="/pricing" className="text-gray-300 hover:text-neon-purple block px-3 py-2 rounded-md text-base font-medium">Pricing</Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setShowDashboard(true); }}
                className="w-full text-left text-gray-300 hover:text-neon-purple block px-3 py-2 rounded-md text-base font-medium bg-transparent border-none cursor-pointer"
              >
                Dashboard
              </button>
              {user ? (
                <button
                  onClick={() => auth.signOut()}
                  className="w-full text-left bg-neon-purple/10 text-neon-purple px-3 py-2 rounded-md text-base font-medium hover:bg-neon-purple/20 transition-all"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="w-full text-left bg-neon-purple/10 text-neon-purple px-3 py-2 rounded-md text-base font-medium hover:bg-neon-purple/20 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <div className="relative pt-16 pb-20 sm:pt-24 sm:pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <div className="inline-block mb-4">
                      <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-neon-purple/10 text-neon-purple animate-pulse-slow">
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        AI Powered
                      </span>
                    </div>
                    <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                      <span className="block bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent">
                        {heroText}
                        <span className="inline-block w-2 h-8 bg-neon-purple animate-pulse ml-1"></span>
                      </span>
                      <span className="block text-neon-purple mt-2 animate-pulse-slow">
                        The Future of Writing Experience
                      </span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                      Prepare original and high-quality assignments tailored to your writing style. Complete your assignments quickly and efficiently with our AI technology.
                    </p>
                    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                      <div className="rounded-md shadow">
                        <button
                          onClick={() => {
                            setShowDashboard(true);
                            setActiveTab('yazi');
                          }}
                          className="w-full flex items-center justify-center px-8 py-3 border border-neon-purple/20 text-base font-medium rounded-md text-white bg-neon-purple/10 hover:bg-neon-purple/20 transition-all md:py-4 md:text-lg md:px-10 group hover:shadow-[0_0_15px_rgba(176,38,255,0.5)]"
                        >
                          Get Started
                          <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="relative py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="p-6 rounded-lg bg-mat-gray/50 backdrop-blur-sm border border-neon-purple/20 hover:border-neon-purple/40 transition-all group hover:shadow-[0_0_15px_rgba(176,38,255,0.3)]">
                      <div className="w-12 h-12 rounded-lg bg-neon-purple/10 flex items-center justify-center mb-4 group-hover:bg-neon-purple/20 transition-colors">
                        <CodeBracketIcon className="h-6 w-6 text-neon-purple" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Writing Style Analysis</h3>
                      <p className="text-gray-400">Upload your own writing samples and let the AI analyze your style.</p>
                    </div>
                    <div className="p-6 rounded-lg bg-mat-gray/50 backdrop-blur-sm border border-neon-purple/20 hover:border-neon-purple/40 transition-all group hover:shadow-[0_0_15px_rgba(176,38,255,0.3)]">
                      <div className="w-12 h-12 rounded-lg bg-neon-purple/10 flex items-center justify-center mb-4 group-hover:bg-neon-purple/20 transition-colors">
                        <SparklesIcon className="h-6 w-6 text-neon-purple" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Original Content</h3>
                      <p className="text-gray-400">Unique and high-quality content is generated just for you.</p>
                    </div>
                    <div className="p-6 rounded-lg bg-mat-gray/50 backdrop-blur-sm border border-neon-purple/20 hover:border-neon-purple/40 transition-all group hover:shadow-[0_0_15px_rgba(176,38,255,0.3)]">
                      <div className="w-12 h-12 rounded-lg bg-neon-purple/10 flex items-center justify-center mb-4 group-hover:bg-neon-purple/20 transition-colors">
                        <RocketLaunchIcon className="h-6 w-6 text-neon-purple" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Fast Delivery</h3>
                      <p className="text-gray-400">Prepare your assignments in a short time and save time. Research and rewrite articles from millions of people, combining human insights for a unique perspective!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag & Drop + Yazı Yazma Alanı */}
              <section className="relative flex flex-col items-center justify-center py-20">
                <div className="w-full max-w-2xl mx-auto">
                  {/* Main Box with glassmorphism and animated gradient border */}
                  <div className="relative rounded-3xl bg-white/10 backdrop-blur-2xl border-2 border-transparent shadow-2xl flex flex-col items-center transition-all duration-300 group overflow-hidden animate-fade-in-up" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.37)'}}>
                    {/* Animated Gradient Border */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none border-2 border-transparent group-hover:border-neon-purple/60 transition-all duration-500" style={{boxShadow:'0 0 40px 0 #b026ff33'}} />
                    {/* Tabbed Top */}
                    <div className="flex justify-center w-full pt-6 pb-2 relative z-10">
                      <button
                        className={`px-6 py-2 rounded-t-xl font-semibold transition-all duration-300 focus:outline-none ${activeTab === 'yazi' ? 'text-neon-purple bg-mat-black/80 shadow border-b-2 border-neon-purple scale-105' : 'text-white bg-mat-black/60 hover:bg-mat-gray/80'}`}
                        onClick={() => setActiveTab('yazi')}
                      >
                        Write Text
                      </button>
                      <button
                        className={`px-6 py-2 rounded-t-xl font-semibold transition-all duration-300 focus:outline-none ml-2 ${activeTab === 'yukle' ? 'text-neon-purple bg-mat-black/80 shadow border-b-2 border-neon-purple scale-105' : 'text-white bg-mat-black/60 hover:bg-mat-gray/80'}`}
                        onClick={() => setActiveTab('yukle')}
                      >
                        Upload Text
                      </button>
                    </div>
                    {/* Drag & Drop Area */}
                    <div className="w-full flex flex-col items-center justify-center px-8 py-10 text-center cursor-pointer border-2 border-dashed border-neon-purple/30 hover:border-neon-purple/60 bg-white/10 transition-all duration-300 rounded-b-3xl" style={{minHeight:'180px', position:'relative'}}>
                      {activeTab === 'yazi' ? (
                        <>
                          <span className="text-lg md:text-xl text-white/90 font-semibold select-none mb-6 transition-all duration-300">Drop your text here or start writing</span>
                          <div className="relative w-full max-w-md mx-auto">
                            <input
                              ref={inputRef}
                              type="text"
                              value={inputValue}
                              onChange={handleInputChange}
                              placeholder="Write your text here..."
                              className="w-full px-4 py-2 rounded-lg bg-mat-black/70 border border-neon-purple/20 text-white focus:outline-none focus:border-neon-purple/60 transition-all mb-2 mt-6 shadow-lg text-xl tracking-wide"
                              style={{letterSpacing:'0.04em'}}
                            />
                            {/* Particles */}
                            <div className="pointer-events-none absolute left-0 top-0 w-full h-0 z-20">
                              {particles.map((p) => (
                                <div
                                  key={p.id}
                                  className={`absolute w-3 h-3 ${p.color} ${p.shape} animate-particle-float-glow`}
                                  style={{left: p.left}}
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <label htmlFor="file-upload" className="block cursor-pointer w-full max-w-md mx-auto px-6 py-8 rounded-xl border-2 border-dashed border-neon-purple/40 bg-mat-black/60 text-white/80 hover:border-neon-purple/80 hover:bg-mat-black/80 transition-all duration-300 shadow-lg animate-fade-in-up">
                            <span className="block text-lg font-semibold mb-2">Select files or drag and drop</span>
                            <input 
                              id="file-upload" 
                              type="file" 
                              multiple 
                              className="hidden" 
                              onChange={handleFileChange} 
                            />
                            <span className="block text-sm text-neon-purple mt-2">
                              {uploadedFiles.length > 0 
                                ? `${uploadedFiles.length} file(s) selected` 
                                : 'No files selected'}
                            </span>
                          </label>

                          {/* File List */}
                          {uploadedFiles.length > 0 && (
                            <div className="w-full max-w-md mx-auto mt-4 space-y-2">
                              {uploadedFiles.map((file, index) => (
                                <div 
                                  key={index}
                                  className="flex items-center justify-between p-3 rounded-lg bg-mat-black/40 border border-neon-purple/20 hover:border-neon-purple/40 transition-all"
                                >
                                  <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm text-white/90 truncate max-w-[200px]">{file.name}</span>
                                  </div>
                                  <button
                                    onClick={() => removeFile(index)}
                                    className="p-1 rounded-full hover:bg-neon-purple/20 transition-colors"
                                  >
                                    <svg className="w-4 h-4 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* Analyze Button */}
                      <button
                        onClick={() => {
                          if (!user) {
                            setShowAuth(true);
                            return;
                          }
                          
                          if (activeTab === 'yazi' && inputValue.length >= 80) {
                            setShowAnalysis(true);
                          } else if (activeTab === 'yukle' && uploadedFiles.length > 0) {
                            setShowAnalysis(true);
                          }
                        }}
                        disabled={!((activeTab === 'yazi' && inputValue.length >= 80) || (activeTab === 'yukle' && uploadedFiles.length > 0))}
                        className={`mt-6 px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                          (activeTab === 'yazi' && inputValue.length >= 80) || (activeTab === 'yukle' && uploadedFiles.length > 0)
                            ? 'bg-neon-purple text-white hover:bg-neon-purple/90 hover:shadow-[0_0_15px_rgba(176,38,255,0.5)]'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Analyze!
                        <span className="ml-2 text-sm">
                          {activeTab === 'yazi' 
                            ? `${inputValue.length}/80 characters`
                            : uploadedFiles.length > 0 
                              ? `${uploadedFiles.length} file(s) ready`
                              : 'No files selected'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonials Section */}
              <section className="py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                      Loved by students worldwide
                    </h2>
                    <p className="text-xl text-gray-300">
                      Students from all over the world prefer MimicText
                    </p>
                  </div>
                  
                  <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative perspective-1000 h-[600px]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {testimonials.map((testimonial, index) => (
                          <div
                            key={index}
                            className="absolute w-full max-w-md transform transition-all duration-500 ease-out"
                            style={{
                              transform: `rotateY(${(index - currentIndex) * 60}deg) translateZ(400px)`,
                              opacity: index === currentIndex ? 1 : 0.5,
                              zIndex: testimonials.length - Math.abs(index - currentIndex)
                            }}
                          >
                            <div className="bg-mat-black/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative">
                                  <p className="text-lg text-white/90 mb-6">{testimonial.text}</p>
                                  <div className="flex items-center space-x-4">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                                      <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-full h-full object-cover relative z-10"
                                      />
                                    </div>
                                    <div>
                                      <h4 className="text-white font-medium">{testimonial.name}</h4>
                                      <p className="text-white/60 text-sm">{testimonial.company}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center space-x-4">
                        <button
                          onClick={prevTestimonial}
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="flex space-x-2">
                          {testimonials.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                index === currentIndex ? 'bg-white' : 'bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={nextTestimonial}
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="h-32 w-full bg-gradient-to-b from-transparent via-[#2a1836]/80 to-[#18181b] -mt-16 z-10 relative pointer-events-none" />

              {/* AI Detection Results Section */}
              <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-mat-black via-mat-black/95 to-mat-black/90" />
                
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" />
                  <div className="absolute top-1/2 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                  <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                      AI Detection Results
                    </h2>
                    <p className="text-xl text-gray-400">
                      Our content has been verified by leading AI detection tools
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                    {aiDetectors.map((detector, index) => (
                      <div
                        key={detector.name}
                        className="group relative"
                        style={{
                          animationDelay: `${index * 0.2}s`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl transform transition-transform duration-500 group-hover:scale-105" />
                        <div className="relative p-6 rounded-2xl border border-white/10 bg-mat-black/50 backdrop-blur-sm">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-[#18181b] flex items-center justify-center overflow-hidden">
                              <div className="flex items-center justify-center">
                                <img
                                  src={detector.logo}
                                  alt={detector.name}
                                  className="w-10 h-10 object-contain drop-shadow-lg"
                                />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{detector.name}</h3>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm text-green-400">{detector.result}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Confidence</span>
                              <span className="text-white">{detector.confidence}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${detector.color} rounded-full transition-all duration-500`}
                                style={{
                                  width: `${detector.confidence}%`,
                                  animation: 'progress 1.5s ease-out forwards'
                                }}
                              />
                            </div>
                          </div>

                          {/* Hover Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Card */}
                  <div className="mt-16 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl" />
                    <div className="relative p-8 rounded-2xl border border-white/10 bg-mat-black/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Overall Result</h3>
                          <p className="text-gray-400">Average confidence across all detectors</p>
                        </div>
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                          {Math.round(aiDetectors.reduce((acc, curr) => acc + curr.confidence, 0) / aiDetectors.length)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          } />
        </Routes>

        {/* Auth Modal */}
        <AnimatePresence>
          {showAuth && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAuth(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <Auth onClose={() => setShowAuth(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Step */}
        <AnimatePresence>
          {showAnalysis && !showDashboard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              {/* SCAN + HEADER (fade out) */}
              <AnimatePresence>
                {stage === 'scan' && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full absolute inset-0 z-10"
                  >
                    <AnalysisStep1 userText={analysisText} isAnalyzing={isAnalyzing} onScanComplete={handleScanComplete} onContinue={() => setShowDashboard(true)} />
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
                    className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-transparent"
                  >
                    {/* Brain SVG */}
                    <svg width="120" height="120" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8 animate-pulse">
                      <ellipse cx="40" cy="40" rx="36" ry="28" fill="#a78bfa" fillOpacity="0.3" />
                      <ellipse cx="40" cy="40" rx="28" ry="20" fill="#a78bfa" fillOpacity="0.5" />
                      <ellipse cx="40" cy="40" rx="20" ry="14" fill="#a78bfa" fillOpacity="0.8" />
                      <ellipse cx="40" cy="40" rx="12" ry="8" fill="#fff" fillOpacity="0.9" />
                    </svg>
                    {/* Sağdan gelen analiz cümleleri */}
                    <div className="relative w-full flex flex-col items-center" style={{ maxWidth: 600 }}>
                      {mockAnalysisLines.map((line, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 200 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.7, duration: 0.7 }}
                          className="bg-neon-purple/20 px-6 py-3 rounded-lg shadow text-base w-full max-w-xl text-center mb-2"
                          style={{ position: 'relative', zIndex: 2 }}
                        >
                          {line}
                          {/* Fade-out efekt: beyne giriyormuş gibi */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0, x: 0 }}
                            transition={{ delay: 1.7 + i * 0.7, duration: 0.7 }}
                            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%' }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}
