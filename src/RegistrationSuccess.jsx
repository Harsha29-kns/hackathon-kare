import React from 'react';
import { CheckCircle, Mail, CreditCard, MessageCircle, Anchor, Skull } from 'lucide-react';

const RegistrationSuccess = ({ teamName }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Pirate Theme Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 text-6xl">⚓</div>
                <div className="absolute top-20 right-20 text-5xl">🏴‍☠️</div>
                <div className="absolute bottom-20 left-20 text-5xl">💀</div>
                <div className="absolute bottom-10 right-10 text-6xl">⚓</div>
            </div>

            {/* Animated waves */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/30 to-transparent animate-pulse"></div>

            <div className="max-w-3xl w-full bg-gradient-to-br from-amber-900/20 via-slate-900/90 to-black border-4 border-amber-700/50 rounded-3xl shadow-2xl p-8 md:p-12 relative z-10">

                {/* Pirate Skull Header */}
                <div className="text-center mb-8">
                    <div className="inline-block relative">
                        <Skull className="w-20 h-20 text-amber-500 mx-auto mb-4 animate-bounce" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2 font-pirate tracking-wider drop-shadow-lg">
                        Ahoy, Matey! 🏴‍☠️
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        Registration Successful!
                    </h2>
                    <p className="text-amber-200 text-lg">
                        Welcome aboard, <span className="font-bold text-amber-400">{teamName}</span>!
                    </p>
                    <div className="mt-4 inline-block bg-green-900/30 border-2 border-green-500 rounded-full px-6 py-2">
                        <p className="text-green-400 font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Slot Secured! ⚓
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
                    <Anchor className="w-6 h-6 text-amber-600" />
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
                </div>

                {/* Main Content - Treasure Map Style */}
                <div className="bg-amber-50/5 border-2 border-amber-700/40 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-amber-400 mb-6 text-center flex items-center justify-center gap-2">
                        <Mail className="w-6 h-6" />
                        Your Treasure Map to Payment
                    </h3>

                    <p className="text-gray-300 text-center mb-8 text-lg">
                        The Team Leader will receive <span className="text-amber-400 font-bold">3 important emails</span>.
                        Keep a weather eye on your inbox! 📧
                    </p>

                    {/* Step 1 */}
                    <div className="mb-6 bg-gradient-to-r from-green-900/20 to-transparent border-l-4 border-green-500 rounded-lg p-5 hover:scale-[1.02] transition-transform">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                1
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-bold text-green-400 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Registration Confirmed
                                </h4>
                                <p className="text-gray-300 leading-relaxed">
                                    <span className="font-semibold text-white">First Email:</span> Confirmation that your registration is successful and your slot is secured.
                                    <span className="text-green-400 font-semibold"> You've already received this! ✓</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="mb-6 bg-gradient-to-r from-orange-900/20 to-transparent border-l-4 border-orange-500 rounded-lg p-5 hover:scale-[1.02] transition-transform">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                2
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-bold text-orange-400 mb-2 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Portal Access
                                </h4>
                                <p className="text-gray-300 leading-relaxed mb-3">
                                    <span className="font-semibold text-white">Second Email:</span> Payment portal link will be sent shortly.
                                    <span className="text-orange-400 font-semibold"> Team Leader must login using KLU email.</span>
                                </p>
                                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mt-2">
                                    <p className="text-red-300 text-sm font-semibold flex items-start gap-2">
                                        <span className="text-xl">⚠️</span>
                                        <span>
                                            <strong>IMPORTANT:</strong> Complete payment within <span className="text-red-400 font-bold">5 minutes</span> of receiving the link,
                                            or your slot will be released to others!
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="mb-2 bg-gradient-to-r from-blue-900/20 to-transparent border-l-4 border-blue-500 rounded-lg p-5 hover:scale-[1.02] transition-transform">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                3
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-bold text-blue-400 mb-2 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    Verification Complete
                                </h4>
                                <p className="text-gray-300 leading-relaxed">
                                    <span className="font-semibold text-white">Third Email:</span> After payment verification (2-3 days),
                                    you'll receive a confirmation email with the <span className="text-blue-400 font-semibold">WhatsApp group link</span> for event updates and announcements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="mt-8 text-center">
                    <div className="inline-block bg-amber-900/30 border-2 border-amber-600/50 rounded-xl px-6 py-4 backdrop-blur-sm">
                        <p className="text-amber-200 text-sm mb-2">
                            <span className="text-amber-400 font-bold text-lg">⚓ Fair winds and following seas! ⚓</span>
                        </p>
                        <p className="text-gray-400 text-xs">
                            Keep your spyglass on your inbox for further instructions.
                        </p>
                    </div>
                </div>

                {/* Decorative Compass */}
                <div className="absolute -bottom-4 -right-4 opacity-10 text-9xl">
                    🧭
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Pirata+One&display=swap');
                
                .font-pirate {
                    font-family: 'Pirata One', cursive;
                }
                
                @keyframes wave {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                .animate-wave {
                    animation: wave 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default RegistrationSuccess;
