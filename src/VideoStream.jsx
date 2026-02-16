import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Anchor, Map, Phone, Skull, Ship, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';

const VideoStream = () => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        // Attempt to auto-play on mount
        if (videoRef.current) {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                console.log("Autoplay prevented:", error);
                setIsPlaying(false);
            });
        }
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleUnmuteOverlayClick = () => {
        if (videoRef.current) {
            videoRef.current.muted = false;
            setIsMuted(false);
            // Ensure it's playing
            if (!isPlaying) {
                videoRef.current.play().then(() => setIsPlaying(true));
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#e0d4b4] font-['Cinzel'] relative overflow-hidden flex flex-col items-center">

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547623641-d2c56c03e2a7?q=80&w=2070')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black/80 to-black"></div>
            </div>

            {/* Navbar */}
            <nav className="w-full z-50 border-b border-[#c5a059]/30 bg-black/80 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold font-['Pirata_One'] text-[#c5a059] tracking-widest flex items-center gap-2 hover:scale-105 transition-transform">
                        <Anchor className="w-8 h-8" /> HACKSAIL
                    </Link>
                    <Link to="/" className="text-[#a89f91] hover:text-[#c5a059] transition-colors text-sm font-bold tracking-widest">
                        RETURN TO PORT
                    </Link>
                </div>
            </nav>

            <div className="z-10 w-full max-w-6xl px-4 py-12 flex flex-col items-center gap-12">

                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="inline-block px-4 py-1 border border-[#c5a059]/50 rounded-full bg-[#8c6b30]/10 mb-4">
                        <span className="text-[#c5a059] text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Live Transmission
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-['Pirata_One'] text-transparent bg-clip-text bg-gradient-to-b from-[#f3e5ab] to-[#c5a059] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                        CAPTAIN'S LOG
                    </h1>
                </motion.div>

                {/* Video Player Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full relative group"
                >
                    {/* The Gold Frame */}
                    <div className="absolute -inset-1 bg-gradient-to-b from-[#c5a059] to-[#8c6b30] rounded-xl opacity-50 blur-sm group-hover:opacity-75 transition-opacity duration-500"></div>
                    <div className="relative rounded-xl overflow-hidden border-2 border-[#c5a059] shadow-[0_0_50px_rgba(197,160,89,0.2)] bg-black">

                        {/* Corner Decorations */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#c5a059] z-20"></div>
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#c5a059] z-20"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#c5a059] z-20"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#c5a059] z-20"></div>

                        <video
                            ref={videoRef}
                            className="w-full aspect-video object-cover"
                            src="/open-video.mp4"
                            loop
                            muted={isMuted}
                            playsInline
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Unmute Overlay */}
                        {isMuted && (
                            <div
                                onClick={handleUnmuteOverlayClick}
                                className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group/overlay transition-all duration-300"
                            >
                                <div className="bg-[#0a0a0a]/80 border-2 border-[#c5a059] px-8 py-4 rounded-full flex items-center gap-4 transform group-hover/overlay:scale-110 transition-transform shadow-[0_0_30px_rgba(197,160,89,0.3)]">
                                    <VolumeX className="w-8 h-8 text-[#c5a059] animate-pulse" />
                                    <span className="text-[#f3e5ab] font-['Pirata_One'] text-2xl tracking-widest">TAP TO UNMUTE</span>
                                </div>
                            </div>
                        )}

                        {/* Custom Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40">
                            <button onClick={togglePlay} className="text-[#f3e5ab] hover:text-white transition-colors">
                                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                            </button>
                            <button onClick={toggleMute} className="text-[#f3e5ab] hover:text-white transition-colors">
                                {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                            </button>
                        </div>
                    </div>

                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0a0a0a] border border-[#c5a059] px-6 py-2 rounded-lg shadow-xl z-20">
                        <p className="text-[#c5a059] font-['Pirata_One'] text-xl tracking-wide">OFFICIAL TEASER</p>
                    </div>
                </motion.div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8">

                    {/* Registration Box */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#121212] border border-[#3a3a3a] p-8 rounded-xl relative group overflow-hidden hover:border-[#c5a059] transition-colors duration-300 text-center"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-5 group-hover:opacity-10 transition-opacity"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-[#0a0a0a] p-4 rounded-full border border-[#c5a059] mb-4 shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                                <Ship className="w-8 h-8 text-[#f3e5ab]" />
                            </div>
                            <h2 className="text-3xl font-['Pirata_One'] text-[#c5a059] mb-2">REGISTRATION OPEN</h2>
                            <div className="h-px w-24 bg-[#8c6b30] my-4"></div>
                            <p className="text-[#a89f91] mb-2 uppercase tracking-widest text-sm">Port Gates Open On</p>
                            <p className="text-4xl font-bold text-[#f3e5ab] font-['Pirata_One']">18/02/2026</p>
                            <p className="text-xs text-[#5a5a5a] mt-4 italic">"Prepare your crew, sharpen your cutlasses."</p>
                        </div>
                    </motion.div>

                    {/* Contact Box */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-[#121212] border border-[#3a3a3a] p-8 rounded-xl relative group overflow-hidden hover:border-[#c5a059] transition-colors duration-300 text-center"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-5 group-hover:opacity-10 transition-opacity"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-[#0a0a0a] p-4 rounded-full border border-[#c5a059] mb-4 shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                                <Map className="w-8 h-8 text-[#f3e5ab]" />
                            </div>
                            <h2 className="text-3xl font-['Pirata_One'] text-[#c5a059] mb-2">QUARTERMASTER</h2>
                            <div className="h-px w-24 bg-[#8c6b30] my-4"></div>
                            <div className="flex items-center gap-2 mb-2">
                                <Skull className="w-4 h-4 text-[#8c6b30]" />
                                <span className="text-[#f3e5ab] text-xl font-bold">Harsha</span>
                            </div>
                            <a href="tel:7671084221" className="flex items-center gap-3 text-[#a89f91] hover:text-[#c5a059] transition-colors px-6 py-2 border border-[#3a3a3a] rounded hover:border-[#c5a059] bg-[#0a0a0a]">
                                <Phone size={18} />
                                <span className="font-mono text-lg">7671084221</span>
                            </a>
                        </div>
                    </motion.div>
                </div>

            </div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-full py-8 border-t border-[#c5a059]/20 bg-black text-center mt-auto relative z-10"
            >
                <p className="text-[#5a5a5a] font-['Cinzel'] text-sm">
                    Powered by <span className="text-[#c5a059] font-bold">Scorecraft Team</span>
                </p>
            </motion.footer>
        </div>
    );
};

export default VideoStream;