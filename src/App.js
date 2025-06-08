import React, { useState, useRef, useEffect } from 'react';
import { ArrowRightIcon, SparklesIcon, CodeBracketIcon, CommandLineIcon, RocketLaunchIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './components/Auth';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    text: "MimicText is at least twice as good as Copilot. Having an AI-powered writing assistant is an incredible accelerator.",
    name: "Ben Bernard",
    company: "Instacart",
    image: "https://i.pravatar.cc/150?img=1"
  },
  {
    text: "MimicText's code completion feature is sometimes truly magical - it predicts exactly what I want to do about 25% of the time.",
    name: "Kevin Whinnery",
    company: "OpenAI",
    image: "https://i.pravatar.cc/150?img=2"
  },
  {
    text: "MimicText is the biggest workflow improvement I've seen in years. It suggests multi-line edits and I just hit 'tab'.",
    name: "Sawyer Hood",
    company: "Figma",
    image: "https://i.pravatar.cc/150?img=3"
  },
  {
    text: "MimicText is so good and keeps getting better and more feature-rich every few weeks.",
    name: "Andrew Milich",
    company: "Notion",
    image: "https://i.pravatar.cc/150?img=4"
  },
  {
    text: "MimicText is awesome! Finally, someone has seamlessly integrated GPT into a code editor. So elegant and easy.",
    name: "Morgan McGuire",
    company: "Weights & Biases",
    image: "https://i.pravatar.cc/150?img=5"
  },
  {
    text: "MimicText is currently the best AI developer tool, use at your own risk.",
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

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('yazi');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [particles, setParticles] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setShowAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
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

  return (
    <>
      <style jsx>{styles}</style>
      <style jsx global>{`
@keyframes pop-glow {
  0% { transform: scale(1.2); color: #fffbe6; text-shadow: 0 0 8px #fffbe6, 0 0 16px #b026ff; }
  60% { transform: scale(1.4); color: #b026ff; text-shadow: 0 0 16px #b026ff, 0 0 32px #fffbe6; }
  100% { transform: scale(1); color: #fff; text-shadow: none; }
}
.animate-pop-glow { animation: pop-glow 0.5s cubic-bezier(0.4,0,0.2,1); }
@keyframes particle-float-glow {
  0% { opacity: 1; box-shadow: 0 0 12px 4px #fffbe6, 0 0 0 #b026ff; transform: translateY(0) scale(1); }
  40% { opacity: 1; box-shadow: 0 0 24px 8px #b026ff, 0 0 32px #fffbe6; }
  80% { opacity: 0.7; }
  100% { opacity: 0; box-shadow: 0 0 0 #fffbe6, 0 0 0 #b026ff; transform: translateY(-48px) scale(0.7); }
}
.animate-particle-float-glow { animation: particle-float-glow 1s linear; }
`}</style>
      <div className="min-h-screen bg-mat-black text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-mat-black via-mat-gray to-mat-black opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-purple/20 via-transparent to-transparent"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(176,38,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(176,38,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-neon-purple rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <nav className="relative backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent">
                  MimicText<span className="text-neon-purple">AI</span>
                </h1>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="#" className="text-gray-300 hover:text-neon-purple px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                  <a href="#" className="text-gray-300 hover:text-neon-purple px-3 py-2 rounded-md text-sm font-medium transition-colors">How It Works</a>
                  <a href="#" className="text-gray-300 hover:text-neon-purple px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
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
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-neon-purple/10 text-neon-purple animate-pulse-slow">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  AI Powered
                </span>
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent">Assignment Writing Assistant</span>
                <span className="block text-neon-purple mt-2 animate-pulse-slow">The Future of Writing Experience</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Prepare original and high-quality assignments tailored to your writing style. Complete your assignments quickly and efficiently with our AI technology.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-neon-purple/20 text-base font-medium rounded-md text-white bg-neon-purple/10 hover:bg-neon-purple/20 transition-all md:py-4 md:text-lg md:px-10 group hover:shadow-[0_0_15px_rgba(176,38,255,0.5)]">
                    Get Started
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
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
                  <CommandLineIcon className="h-6 w-6 text-neon-purple" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Fast Delivery</h3>
                <p className="text-gray-400">Prepare your assignments in a short time and save time.</p>
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
                      <span className="block text-lg font-semibold mb-2">Select a file or drag and drop</span>
                      <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                      <span className="block text-sm text-neon-purple mt-2">{uploadedFile ? uploadedFile.name : 'No file selected'}</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Loved by developers worldwide
              </h2>
              <p className="text-xl text-gray-300">
                Engineers from all over the world prefer MimicText
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
      </div>
    </>
  );
}
