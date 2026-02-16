import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Skull, Map, Compass, Sword, Shield, Clock, Lock, Trophy, Calendar, HelpCircle, Users, MessageCircle, ChevronDown, ChevronUp, Gem, ScrollText, Ship, Flag } from 'lucide-react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import api from './api';

const socket = io(api);

function Landing() {
  const [registrationStatus, setRegistrationStatus] = useState({
    isClosed: true, // Default to closed to prevent flash of open
    openTime: null,
    count: 0,
    limit: 0,
  });
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    socket.on('registrationStatus', (status) => {
      setRegistrationStatus({
        isClosed: status.isClosed,
        openTime: status.openTime,
        count: status.count || 0,
        limit: status.limit || 0,
      });
    });

    socket.emit('check');
    const statusCheckInterval = setInterval(() => {
      socket.emit('check');
    }, 5000);

    return () => {
      socket.off('registrationStatus');
      clearInterval(statusCheckInterval);
    };
  }, []);

  useEffect(() => {
    if (!registrationStatus.openTime || !registrationStatus.isClosed) {
      setIsCountingDown(false);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const openTime = new Date(registrationStatus.openTime).getTime();
      const distance = openTime - now;

      if (distance <= 0) {
        setIsCountingDown(false);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        socket.emit('check');
      } else {
        setIsCountingDown(true);
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [registrationStatus.openTime, registrationStatus.isClosed]);

  const isFull = registrationStatus.count >= registrationStatus.limit;
  const showRegistrationButton = !registrationStatus.isClosed && !isFull;
  const showClosedMessage = registrationStatus.isClosed && !isCountingDown;
  const showFullMessage = isFull && !registrationStatus.isClosed;

  /* Custom Cursor Logic */
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [cursorVariant, setCursorVariant] = useState("default");

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  const variants = {
    default: {
      height: 32,
      width: 32,
      backgroundColor: "#ffffff",
      mixBlendMode: "difference"
    },
    text: {
      height: 150,
      width: 150,
      x: -59, // Adjust relative position for larger circle (75 - 16)
      y: -59,
      backgroundColor: "#ffffff",
      mixBlendMode: "difference"
    }
  };

  const textEnter = () => setCursorVariant("text");
  const textLeave = () => setCursorVariant("default");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0d4b4] overflow-hidden font-['Cinzel'] relative cursor-none" onMouseEnter={textLeave} onMouseLeave={textLeave}>
      {/* Custom Cursor */}
       <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[100]"
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
        }}
        variants={variants}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?q=80&w=2070')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black/60 to-black"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 border-b border-[#c5a059]/30 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-1 flex justify-between items-center">
          <div className="text-3xl font-bold font-['Pirata_One'] text-[#c5a059] tracking-widest flex items-center gap-2" onMouseEnter={textEnter} onMouseLeave={textLeave}>
            <img src="/pirate.png" alt="Pirate Symbol" className="w-12 h-12 object-cover rounded-full border-2 border-[#c5a059]" /> HACKSAIL
          </div>
          {showRegistrationButton && (
            <Link to="/register" onMouseEnter={textEnter} onMouseLeave={textLeave} className="bg-[#c5a059] hover:bg-[#b08d48] text-black px-6 py-2 rounded font-bold font-['Pirata_One'] tracking-wide transition-all transform hover:scale-105 border-2 border-[#8c6b30] shadow-[0_0_15px_rgba(197,160,89,0.5)]">
              Join the Crew
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-4 pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex items-center justify-center gap-6 mb-8" onMouseEnter={textEnter} onMouseLeave={textLeave}>
             <img src="/scorecraft.jpg" alt="Scorecraft" className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.3)]" />
             <span className="text-4xl font-['Pirata_One'] text-[#c5a059]">X</span>
             <img src="/coll.png" alt="College Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
          </div>
          <h1 className="text-7xl md:text-9xl font-['Pirata_One'] mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#f3e5ab] to-[#c5a059] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]" onMouseEnter={textEnter} onMouseLeave={textLeave}>
            HACKSAIL 2K26
          </h1>
          <p className="text-2xl md:text-3xl text-[#a89f91] mb-12 font-['Cinzel'] tracking-widest max-w-3xl mx-auto border-y border-[#c5a059]/30 py-4">
            The Ultimate Code Plunder
          </p>
        </motion.div>

        <AnimatePresence mode='wait'>
          {isCountingDown ? (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Compass className="text-[#c5a059] animate-spin-slow" size={32} />
                <h2 className="text-2xl font-['Pirata_One'] text-[#c5a059] tracking-wider"> Registrations begins in</h2>
              </div>
              <div className="flex gap-4 md:gap-8 justify-center flex-wrap" onMouseEnter={textEnter} onMouseLeave={textLeave}>
                {Object.entries(countdown).map(([label, value]) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className="w-20 h-24 md:w-24 md:h-32 bg-[#1a1a1a] border-2 border-[#c5a059] rounded-lg flex items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(197,160,89,0.2)]">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20"></div>
                      <span className="text-4xl md:text-5xl font-['Pirata_One'] text-[#f3e5ab] relative z-10">
                        {value.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-sm md:text-base text-[#8c6b30] mt-2 uppercase font-bold tracking-widest">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : showFullMessage ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-12 bg-red-900/20 border-2 border-red-800/50 p-8 rounded-lg max-w-lg backdrop-blur-sm relative"
            >
              <div className="absolute -top-6 -left-6 transform -rotate-12">
                <Skull className="text-red-700 w-16 h-16" />
              </div>
              <h2 className="text-4xl font-['Pirata_One'] text-red-500 mb-2">QUARTERS FULL!</h2>
              <p className="text-xl text-[#a89f91]">The ship has reached capacity.</p>
              <p className="text-sm text-red-400 mt-2 font-bold uppercase tracking-wider">No more souls can board.</p>
            </motion.div>
          ) : showClosedMessage ? (
            <motion.div
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-12"
            >
               <div className="relative inline-block p-8">
                 <div className="absolute inset-0 border-[6px] border-[#8c6b30] rounded-sm pointer-events-none opacity-80"></div>
                 <div className="absolute inset-2 border-[2px] border-[#c5a059] rounded-sm pointer-events-none opacity-60"></div>
                 <div className="absolute -inset-2 border border-[#8c6b30]/50 rounded-sm pointer-events-none"></div>
                 
                 {/* Corner decorations */}
                 <div className="absolute top-0 left-0 w-4 h-4 border-t-[6px] border-l-[6px] border-[#c5a059] -ml-1 -mt-1"></div>
                 <div className="absolute top-0 right-0 w-4 h-4 border-t-[6px] border-r-[6px] border-[#c5a059] -mr-1 -mt-1"></div>
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[6px] border-l-[6px] border-[#c5a059] -ml-1 -mb-1"></div>
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[6px] border-r-[6px] border-[#c5a059] -mr-1 -mb-1"></div>

                 <div className="bg-[#1a1a1a]/90 p-10 rounded-lg backdrop-blur-md relative z-10 max-w-md mx-auto">
                    <Lock className="w-12 h-12 text-[#5a5a5a] mx-auto mb-4" />
                    <h2 className="text-3xl font-['Pirata_One'] text-[#a89f91] mb-2 tracking-wide">PORT CLOSED</h2>
                    <p className="text-lg text-[#6b6b6b]">The harbor master has locked the gates.</p>
                 </div>
               </div>
            </motion.div>
          ) : (
            showRegistrationButton && (
              <motion.div
                key="register"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                tabIndex={0}
                className="mb-12"
              >
                <Link to="/register" onMouseEnter={textEnter} onMouseLeave={textLeave} className="group relative inline-flex items-center justify-center px-12 py-5 text-2xl font-bold font-['Pirata_One'] text-[#2a1a08] transition-all duration-200 bg-[#c5a059] border-4 border-[#8c6b30] rounded-lg hover:bg-[#b08d48] hover:scale-105 hover:shadow-[0_0_30px_rgba(197,160,89,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c5a059]">
                  <span className="mr-3">HOIST THE SAILS</span>
                  <Anchor className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <div className="absolute inset-0 border-2 border-[#f3e5ab] rounded opacity-20 group-hover:opacity-40 pointer-events-none"></div>
                </Link>
                {registrationStatus.limit > 0 && (
                  <p className="mt-4 text-[#8c6b30] font-bold tracking-widest text-sm uppercase">
                    {registrationStatus.count} / {registrationStatus.limit} Crew Members Aboard
                  </p>
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-gradient-to-t from-black to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-['Pirata_One'] text-[#c5a059] mb-4">THE TREASURE MAP</h2>
            <div className="h-1 w-24 bg-[#8c6b30] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Map, title: "Uncharted Domains", desc: "Navigate through 20+ treacherous problem statements." },
              { icon: Shield, title: "Captain's Code", desc: "Verified teams and secure passage for all sailors." },
              { icon: Clock, title: "The Long Night", desc: "Survive the 24-hour storm of coding fury." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
                className="bg-[#121212] border border-[#3a3a3a] p-8 rounded-xl relative group overflow-hidden hover:border-[#c5a059] transition-colors duration-300"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10">
                  <feature.icon className="text-[#c5a059] mb-6 w-12 h-12" />
                  <h3 className="text-2xl font-['Pirata_One'] text-[#f3e5ab] mb-3">{feature.title}</h3>
                  <p className="text-[#a89f91] leading-relaxed">{feature.desc}</p>
                </div>
                <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sword className="w-24 h-24 text-[#c5a059]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="relative z-10 py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="inline-block p-4 border-2 border-[#c5a059] rounded-full mb-4 bg-[#8c6b30]/20 animate-pulse">
              <Gem className="w-16 h-16 text-[#c5a059]" />
            </div>
            <h2 className="text-6xl font-['Pirata_One'] text-[#c5a059] drop-shadow-[0_0_15px_rgba(197,160,89,0.5)]">
              TOTAL BOUNTY
            </h2>
            <p className="text-5xl md:text-7xl font-['Cinzel'] text-[#f3e5ab] mt-4 font-bold" onMouseEnter={textEnter} onMouseLeave={textLeave}>
              ₹15,000
            </p>
          </motion.div>

          {/* Top 3 Prizes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-end">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onMouseEnter={textEnter} onMouseLeave={textLeave}
              className="order-2 md:order-1 bg-[#1a1a1a] border-4 border-gray-400 p-6 rounded-t-xl relative h-80 flex flex-col items-center justify-end shadow-[0_0_20px_rgba(156,163,175,0.3)]"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
              <div className="text-gray-400 font-['Pirata_One'] text-3xl mb-2">QUARTERMASTER</div>
              <Trophy className="w-20 h-20 text-gray-400 mb-4" />
              <div className="text-4xl font-bold text-[#f3e5ab]">₹5,000</div>
              <div className="text-sm text-gray-500 mt-2 font-bold uppercase tracking-widest">2nd Place</div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onMouseEnter={textEnter} onMouseLeave={textLeave}
              className="order-1 md:order-2 bg-[#1a1a1a] border-4 border-[#c5a059] p-8 rounded-t-xl relative h-96 flex flex-col items-center justify-end shadow-[0_0_30px_rgba(197,160,89,0.5)] z-10"
            >
              <div className="absolute -top-8 text-[#c5a059]">
                <Skull className="w-16 h-16 animate-bounce" />
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
              <div className="text-[#c5a059] font-['Pirata_One'] text-4xl mb-4">CAPTAIN'S SHARE</div>
              <Trophy className="w-24 h-24 text-[#c5a059] mb-6" />
              <div className="text-5xl font-bold text-[#f3e5ab]">₹7,000</div>
              <div className="text-sm text-[#8c6b30] mt-4 font-bold uppercase tracking-widest bg-[#f3e5ab] px-4 py-1 rounded-full">1st Place</div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              onMouseEnter={textEnter} onMouseLeave={textLeave}
              className="order-3 bg-[#1a1a1a] border-4 border-[#cd7f32] p-6 rounded-t-xl relative h-64 flex flex-col items-center justify-end shadow-[0_0_20px_rgba(205,127,50,0.3)]"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
              <div className="text-[#cd7f32] font-['Pirata_One'] text-2xl mb-2">BOATSWAIN</div>
              <Trophy className="w-16 h-16 text-[#cd7f32] mb-4" />
              <div className="text-3xl font-bold text-[#f3e5ab]">₹3,000</div>
              <div className="text-sm text-[#a05a2c] mt-2 font-bold uppercase tracking-widest">3rd Place</div>
            </motion.div>
            </div>

            {/* Participation Rewards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onMouseEnter={textEnter} onMouseLeave={textLeave}
              className="mt-16 bg-[#1a1a1a] border-2 border-[#c5a059]/50 p-8 rounded-xl max-w-4xl mx-auto relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-10"></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
                  <div className="bg-[#0a0a0a] p-4 rounded-full border border-[#c5a059]">
                     <ScrollText className="w-12 h-12 text-[#f3e5ab]" />
                  </div>
                  <div>
                     <h3 className="text-3xl font-['Pirata_One'] text-[#c5a059] mb-2">TREASURE FOR ALL HANDS</h3>
                     <p className="text-[#a89f91] text-lg font-['Cinzel']">
                        Every sailor who braves the storm receives:
                     </p>
                     <ul className="text-[#f3e5ab] mt-2 font-bold tracking-wide space-y-1">
                        <li className="flex items-center justify-center md:justify-start gap-2">
                           <Gem size={16} className="text-[#c5a059]" /> Official Certificate of Participation
                        </li>
                        <li className="flex items-center justify-center md:justify-start gap-2">
                           <Gem size={16} className="text-[#c5a059]" /> 2 EE Credits
                        </li>
                     </ul>
                     <p className="text-[#5a5a5a] text-sm mt-3 italic">
                        *Includes all winners (1st, 2nd, 3rd place)
                     </p>
                  </div>
               </div>
            </motion.div>
         </div>
       </section>

      {/* Timeline Section */}
      <section className="relative z-10 py-24 bg-[#050505] overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-['Pirata_One'] text-[#c5a059] mb-4">THE Timeline LOG</h2>
            <div className="h-1 w-24 bg-[#8c6b30] mx-auto rounded-full"></div>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[#8c6b30]/30 border-l-2 border-dashed border-[#c5a059]/50"></div>

            {[
              { time: "Day 1 - 09:00 AM", title: "Anchors Aweigh", desc: "Opening Ceremony & Team Formation", icon: Anchor },
              { time: "Day 1 - 10:00 AM", title: "Set Sail", desc: "Hacking Begins", icon: Ship },
              { time: "Day 1 - 01:00 PM", title: "Rations", desc: "Lunch Break", icon: ScrollText },
              { time: "Day 1 - 06:00 PM", title: "High Seas", desc: "Mentoring Round 1", icon: Map },
              { time: "Day 2 - 08:00 AM", title: "Land Ho!", desc: "Hacking Ends & Submission", icon: Flag },
              { time: "Day 2 - 10:00 AM", title: "Victory Feast", desc: "Closing Ceremony & Prizes", icon: Gem }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex items-center justify-between mb-12 w-full ${idx % 2 === 0 ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-5/12"></div>
                <div className="z-10 bg-[#0a0a0a] border-2 border-[#c5a059] p-3 rounded-full shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                  <item.icon className="w-6 h-6 text-[#f3e5ab]" />
                </div>
                <div
                      onMouseEnter={textEnter}
                      onMouseLeave={textLeave}
                      className={`w-5/12 p-6 bg-[#121212] border border-[#3a3a3a] rounded-xl hover:border-[#c5a059] transition-colors duration-300 relative group ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}
                    >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <div className="text-[#c5a059] font-bold text-sm mb-1 font-['Cinzel']">{item.time}</div>
                  <h3 className="text-xl font-['Pirata_One'] text-[#f3e5ab] mb-2">{item.title}</h3>
                  <p className="text-[#a89f91] text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="relative z-10 py-24 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-['Pirata_One'] text-[#c5a059] mb-4">THE PIRATE'S CODE</h2>
            <p className="text-[#a89f91]">Answers to your burning questions.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "Who can join the crew?", a: "Any student with a thirst for code and adventure. Teams of 2-4 members." },
              { q: "Is there a bounty fee?", a: "Nay! Participation is free for all valid teams." },
              { q: "What should we bring aboard?", a: "Your laptops, chargers, and the spirit of a pirate. Food and drinks will be provided." },
              { q: "Can we start hacking before the signal?", a: "Negative. Any code written before the event starts will be walked the plank (disqualified)." }
            ].map((faq, idx) => (
              <div key={idx} className="border border-[#3a3a3a] rounded-lg overflow-hidden bg-[#121212]">
                <button
                  onClick={() => toggleFaq(idx)}
                  onMouseEnter={textEnter}
                  onMouseLeave={textLeave}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[#1a1a1a] transition-colors focus:outline-none"
                >
                  <span className="text-xl font-['Pirata_One'] text-[#f3e5ab] tracking-wide">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="text-[#c5a059]" /> : <ChevronDown className="text-[#5a5a5a]" />}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-[#a89f91] font-['Cinzel'] border-t border-[#3a3a3a] bg-[#151515]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-[#c5a059]/20 bg-black text-center">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
          <div>
            <div className="flex items-center gap-2 mb-4" onMouseEnter={textEnter} onMouseLeave={textLeave}>
              <img src="/pirate.png" alt="Hacksail Logo" className="w-10 h-10 object-cover rounded-full border border-[#c5a059]" />
              <span className="text-2xl font-['Pirata_One'] text-[#f3e5ab]">HACKSAIL 2025</span>
            </div>
            <p className="text-[#5a5a5a] text-sm">
              The seas of code await. Set sail for glory and gold.
            </p>
          </div>
          <div>
            <h4 className="text-[#c5a059] font-bold mb-4 font-['Cinzel']">QUICK LINKS</h4>
            <ul className="space-y-2 text-[#a89f91] text-sm">
              <li><a href="#" className="hover:text-[#f3e5ab]" onMouseEnter={textEnter} onMouseLeave={textLeave}>Voyage Log</a></li>
              <li><a href="#" className="hover:text-[#f3e5ab]" onMouseEnter={textEnter} onMouseLeave={textLeave}>The Code</a></li>
              <li><a href="#" className="hover:text-[#f3e5ab]" onMouseEnter={textEnter} onMouseLeave={textLeave}>Prizes</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#c5a059] font-bold mb-4 font-['Cinzel']">JOIN THE FLEET</h4>
            <a href="#" className="inline-flex items-center gap-2 text-[#a89f91] hover:text-[#f3e5ab] transition-colors" onMouseEnter={textEnter} onMouseLeave={textLeave}>
              <MessageCircle size={20} /> Join Discord / WhatsApp
            </a>
          </div>
        </div>
        <div className="border-t border-[#3a3a3a] pt-8 flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-[#5a5a5a] font-['Cinzel'] text-sm">&copy; 2025 </span>
            <div className="flex items-center gap-2" onMouseEnter={textEnter} onMouseLeave={textLeave}>
              <img src="/scorecraft.jpg" alt="Scorecraft Logo" className="w-8 h-8 rounded-full border border-[#5a5a5a]" />
              <span className="text-[#c5a059] font-['Pirata_One'] text-lg">SCORECRAFT</span>
            </div>
            <span className="text-[#5a5a5a] font-['Cinzel'] text-sm">. Dead men tell no tales.</span>
          </div>
          <p className="text-[#4a4a4a] text-xs">
            Designed & Developed by <span className="text-[#c5a059]">Harsha</span> & <span className="text-[#c5a059]">Vamsi</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;