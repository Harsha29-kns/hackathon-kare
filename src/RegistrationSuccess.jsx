import React from 'react';
import { CheckCircle, Mail, CreditCard, MessageCircle, Anchor, Skull, Map, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const RegistrationSuccess = ({ teamName }) => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-body text-pirate-parchment flex items-center justify-center p-4">
            {/* Background Image & Atmosphere */}
            <div className="fixed inset-0 bg-[url('/succ.jpg')] bg-cover bg-center bg-no-repeat z-0"></div>
            <div className="fixed inset-0 bg-black/80 z-0"></div> {/* Dark overlay for readability */}

            <motion.div
                className="relative z-10 max-w-4xl w-full bg-black/40 backdrop-blur-md border-[3px] border-pirate-gold/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Decoration Borders */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-pirate-gold rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-pirate-gold rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-pirate-gold rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-pirate-gold rounded-br-xl"></div>

                <div className="p-8 md:p-12 text-center">
                    {/* Header */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <div className="inline-block relative mb-6">
                            <Skull className="w-24 h-24 text-pirate-gold drop-shadow-[0_0_15px_rgba(197,160,89,0.5)] animate-bounce" />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2 border-2 border-pirate-parchment"
                            >
                                <CheckCircle className="w-6 h-6 text-white" />
                            </motion.div>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-pirate text-pirate-gold mb-2 tracking-wider drop-shadow-lg">
                            Welcome Aboard!
                        </h1>
                        <p className="text-2xl text-pirate-parchment/90 font-pirate">
                            Captain of <span className="text-pirate-red text-3xl mx-2">{teamName}</span>
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-green-900/40 border border-green-500/50 rounded-full text-green-400 font-bold tracking-widest text-sm uppercase">
                            <Anchor className="w-4 h-4" />
                            <span>Slot Secured Successfully</span>
                        </div>
                    </motion.div>

                    {/* Divider */}
                    <motion.div variants={itemVariants} className="flex items-center gap-4 my-8 opacity-50">
                        <div className="h-px bg-pirate-gold/50 flex-1"></div>
                        <div className="text-2xl">☠️</div>
                        <div className="h-px bg-pirate-gold/50 flex-1"></div>
                    </motion.div>

                    {/* Next Steps Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        {/* Step 1 */}
                        <div className="bg-black/30 border border-pirate-gold/20 p-6 rounded-xl relative group hover:border-pirate-gold/60 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-pirate-gold text-black font-pirate text-xl flex items-center justify-center rounded-full border-2 border-black z-10 shadow-lg group-hover:scale-110 transition-transform">1</div>
                            <div className="mb-4 text-green-500">
                                <Mail className="w-10 h-10" />
                            </div>
                            <h3 className="font-pirate text-xl text-pirate-gold mb-2">Registration Confirmed</h3>
                            <p className="text-sm text-pirate-parchment/70 leading-relaxed">
                                You have received a confirmation email. Your spot in the crew is tentatively reserved.
                            </p>
                            <div className="mt-3 text-xs text-green-400 font-bold flex items-center gap-1">
                                <CheckCircle size={12} /> SENT
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-black/30 border border-pirate-gold/20 p-6 rounded-xl relative group hover:border-pirate-gold/60 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-pirate-gold text-black font-pirate text-xl flex items-center justify-center rounded-full border-2 border-black z-10 shadow-lg group-hover:scale-110 transition-transform">2</div>
                            <div className="mb-4 text-pirate-red">
                                <CreditCard className="w-10 h-10" />
                            </div>
                            <h3 className="font-pirate text-xl text-pirate-gold mb-2">Payment Required</h3>
                            <p className="text-sm text-pirate-parchment/70 leading-relaxed">
                                A payment link will be sent to your <span className="text-pirate-parchment font-bold">KLU Email</span>.
                            </p>
                            <div className="mt-3 bg-pirate-red/10 border border-pirate-red/30 p-2 rounded">
                                <p className="text-xs text-pirate-red font-bold flex items-center gap-1">
                                    ⚠️ PAY WITHIN 5 MINS
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-black/30 border border-pirate-gold/20 p-6 rounded-xl relative group hover:border-pirate-gold/60 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-pirate-gold text-black font-pirate text-xl flex items-center justify-center rounded-full border-2 border-black z-10 shadow-lg group-hover:scale-110 transition-transform">3</div>
                            <div className="mb-4 text-blue-400">
                                <MessageCircle className="w-10 h-10" />
                            </div>
                            <h3 className="font-pirate text-xl text-pirate-gold mb-2">Join the Fleet</h3>
                            <p className="text-sm text-pirate-parchment/70 leading-relaxed">
                                After verification (2-3 days), you'll get a WhatsApp link to join the official communication channel.
                            </p>
                        </div>
                    </motion.div>

                    {/* Footer Action */}
                    <motion.div variants={itemVariants} className="mt-12">
                        <Link to="/" className="inline-flex items-center gap-3 px-8 py-4 bg-pirate-gold text-black font-pirate text-xl rounded hover:bg-pirate-gold/80 transition-all hover:scale-105 shadow-[0_0_20px_rgba(197,160,89,0.4)]">
                            <Map className="w-6 h-6" />
                            Return to Home Base
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <p className="mt-6 text-pirate-parchment/50 text-sm font-cinzel">
                            Keep a weather eye on your inbox, captain.
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegistrationSuccess;
