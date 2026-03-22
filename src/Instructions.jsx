import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, QrCode, Gamepad2, HelpCircle, Layers } from 'lucide-react';
import kalasalingam from "/kalasalingam.png";
import score from "/scorecraft.jpg";

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const SectionCard = ({ icon, title, children }) => (
    <motion.div 
        variants={cardVariants} 
        className="group relative bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:bg-white/[0.05] transition-all duration-500 overflow-hidden"
    >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full group-hover:bg-purple-500/30 transition-colors duration-500"></div>

        <div className="flex items-center gap-4 mb-5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-100 tracking-wide">{title}</h3>
        </div>
        <div className="space-y-4 text-gray-400 relative z-10 text-sm leading-relaxed">
            {children}
        </div>
    </motion.div>
);

function Instructions() {
    const nav = useNavigate();

    return (
        <div className="relative w-full min-h-screen bg-[#07070a] text-white font-sans overflow-x-hidden pt-12 pb-24 px-4 sm:px-6 lg:px-8">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
            <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
            
            <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center text-center space-y-6 mb-16"
                >
                    <div className="flex items-center gap-6">
                        <div className="relative group p-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <img src={kalasalingam} className="relative w-16 h-16 object-contain bg-white rounded-full p-1" alt="Kalasalingam Logo" />
                        </div>
                        <div className="h-10 w-[2px] bg-gradient-to-b from-transparent via-gray-500 to-transparent"></div>
                        <div className="relative group p-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <img src={score} className="relative w-16 h-16 object-cover rounded-full" alt="Score Logo" />
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-purple-400 tracking-[0.2em] mb-2 uppercase">Scorecraft KARE Presents</p>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">Hack</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Sail</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 ml-4 font-['Pirata_One'] font-normal hidden sm:inline-block">2k26</span>
                        </h1>
                    </div>
                </motion.div>

                {/* Instructions Grid */}
                <motion.div 
                    className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <SectionCard icon={<ShieldCheck size={24} />} title="Credentials & Identity">
                        <p><strong className="text-white">ID Cards are Mandatory:</strong> All team members must wear their official college ID cards at all times during the event.</p>
                        <p><strong className="text-white">Team Password:</strong> Your unique team password is required to log in. Keep it secure and do not share it.</p>
                        <p><strong className="text-white">Login Issues:</strong> For any login problems, seek the nearest Organizer (Club Member) in your designated sector.</p>
                    </SectionCard>
                    
                    <SectionCard icon={<QrCode size={24} />} title="Attendance Protocol">
                        <p><strong className="text-white">Unique QR Codes:</strong> Each member receives a unique QR code. This serves as your digital pass for the event.</p>
                        <p><strong className="text-white">7 Checkpoints:</strong> Attendance will be marked at 7 distinct checkpoints. It is crucial to be present for each one.</p>
                        <p><strong className="text-white">Keep it Ready:</strong> Have your QR code accessible on your mobile device at all times for quick scanning by the organizers.</p>
                    </SectionCard>

                    <SectionCard icon={<Layers size={24} />} title="Problem Statements">
                        <p><strong className="text-white">Explore the Sets:</strong> Problem Statements are grouped into distinct sets. Your team lead can select any set to view its problems.</p>
                        <p><strong className="text-white">Review the Problems:</strong> Inside a set, browse through the available problem statements. Choose the one that best fits your team's skills.</p>
                        <p><strong className="text-red-400">Confirm Your Choice:</strong> Once you select a problem statement and click 'Confirm', your choice is locked. This decision is final!</p>
                    </SectionCard>

                    <SectionCard icon={<Gamepad2 size={24} />} title="Side-Quest Game Rules">
                        <p><strong className="text-white">Captain's Decision:</strong> Match all pairs of cards as quickly as you can. Your score is based on speed and accuracy.</p>
                        <p><strong className="text-white">Black Pearl Cipher:</strong> A classic sliding puzzle. Solve it in the fewest moves and the shortest time for a higher score.</p>
                        <p><strong className="text-white">Lost Compass:</strong> A test of reflexes. Stop the moving bar perfectly on its mark to earn points.</p>
                        <p><strong className="text-purple-400">One Shot Only:</strong> Each game can be played only once per team. Make it count!</p>
                    </SectionCard>
                    
                    <SectionCard icon={<HelpCircle size={24} />} title="Requesting Assistance">
                        <p><strong className="text-white">Technical Issues:</strong> If you face any technical problems on the platform, use the "Request Help" button in your dashboard.</p>
                        <p><strong className="text-white">Describe Your Issue:</strong> Provide a clear description of your problem. Our support team will be notified and will come to your location.</p>
                        <p><strong className="text-white">Check the Intel Feed:</strong> The status of your request will appear in the "Intel Feed" on your dashboard.</p>
                    </SectionCard>
                </motion.div>

                {/* Call to Action */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                   {/* <button 
                        onClick={() => nav("/teamdash")}
                        className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 ease-out"></div>
                        <span className="relative z-10 flex items-center justify-center gap-3 text-lg font-semibold text-white tracking-wide">
                            <ShieldCheck size={22} className="text-purple-400 group-hover:text-white transition-colors" />
                            Proceed to Team Login
                        </span>
                    </button> */}
                </motion.div>
            </div>
        </div>
    );
}

export default Instructions;