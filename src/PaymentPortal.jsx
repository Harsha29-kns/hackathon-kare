import React, { useState } from 'react';
import axios from 'axios';
import api from './api';
import { Mail, CreditCard, Upload, CheckCircle, Smartphone, DollarSign, ShieldCheck, Loader2, ArrowRight, Anchor, Skull, Map, Scroll } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pirate styled input field
const InputField = ({ icon: Icon, label, ...props }) => (
    <div className="relative group mb-4">
        <label className="block text-pirate-gold font-cinzel text-xs font-bold uppercase tracking-widest mb-1 ml-1">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-pirate-gold/60 group-focus-within:text-pirate-red transition-colors" />
            </div>
            <input
                {...props}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border-b-2 border-pirate-gold/30 text-pirate-parchment placeholder-pirate-parchment/30 focus:outline-none focus:border-pirate-gold focus:bg-black/60 transition-all font-cinzel"
            />
        </div>
    </div>
);

const PaymentPortal = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [teamData, setTeamData] = useState(null);
    const [upiId, setUpiId] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const handleEmailCheck = async () => {
        if (!email) return alert("Arrr! Enter yer email, captain!");
        setVerifying(true);
        try {
            const res = await axios.post(`${api}/Hack/payment/validate-email`, { email });
            if (res.data.alreadySubmitted) {
                setStep(3);
            } else {
                setTeamData(res.data);
                setStep(2);
            }
        } catch (err) {
            alert(err.response?.data?.error || "This email uses no valid code! Try again.");
        } finally {
            setVerifying(false);
        }
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmitPayment = async () => {
        if (!imageFile) return alert("Show us the gold! Upload the payment screenshot.");
        if (!transactionId) return alert("We need the Transaction ID to verify the bounty.");

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", imageFile);
            formData.append("upload_preset", "Team_images");

            // Upload to Cloudinary
            const cloudinaryRes = await axios.post(
                "https://api.cloudinary.com/v1_1/dsvwojzli/image/upload",
                formData
            );
            const uploadedUrl = cloudinaryRes.data.secure_url;

            // Submit to Backend
            await axios.post(`${api}/Hack/payment/submit-proof`, {
                teamId: teamData.teamId,
                upiId: upiId,
                transtationId: transactionId, // Note: keeping typo 'transtationId' as per original backend expectation if applicable, or safe to assume it matches backend. sticking to original property name just in case.
                imgUrl: uploadedUrl
            });

            setStep(3);
        } catch (err) {
            console.error(err);
            alert("The winds are against us. Upload failed. Try again!");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-body text-pirate-parchment flex items-center justify-center p-4">
            {/* Background Image & Atmosphere */}
            <div className="fixed inset-0 bg-[url('/home-wall.jpg')] bg-cover bg-center bg-no-repeat z-0"></div>
            <div className="fixed inset-0 bg-black/80 z-0"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pirate-gold/10 via-transparent to-black pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg bg-black/60 backdrop-blur-md border-[3px] border-pirate-wood/60 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10"
            >
                {/* Decoration corners */}
                <div className="absolute top-[-2px] left-[-2px] w-8 h-8 border-t-4 border-l-4 border-pirate-gold rounded-tl-lg"></div>
                <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-4 border-r-4 border-pirate-gold rounded-tr-lg"></div>
                <div className="absolute bottom-[-2px] left-[-2px] w-8 h-8 border-b-4 border-l-4 border-pirate-gold rounded-bl-lg"></div>
                <div className="absolute bottom-[-2px] right-[-2px] w-8 h-8 border-b-4 border-r-4 border-pirate-gold rounded-br-lg"></div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Verification */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 bg-pirate-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-pirate-gold/40 animate-pulse">
                                    <ShieldCheck className="w-10 h-10 text-pirate-gold" />
                                </div>
                                <h2 className="text-4xl font-pirate text-pirate-gold tracking-wide">Captain's Log</h2>
                                <div className="h-1 w-24 bg-pirate-red mx-auto my-3 rounded-full"></div>
                                <p className="text-pirate-parchment/70 font-cinzel">Verify your identity to access the treasury.</p>
                            </div>

                            <div className="space-y-6">
                                <InputField
                                    icon={Mail}
                                    label="Captain's Email"
                                    type="email"
                                    placeholder="lead.email@klu.ac.in"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <button
                                    onClick={handleEmailCheck}
                                    disabled={verifying}
                                    className="w-full bg-pirate-red hover:bg-red-700 text-white py-4 rounded font-pirate text-xl tracking-widest shadow-lg transform transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-red-500/50"
                                >
                                    {verifying ? <Loader2 className="animate-spin" /> : <>Verify Credentials <ArrowRight size={20} /></>}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center border-b border-pirate-gold/20 pb-4">
                                <h2 className="text-3xl font-pirate text-pirate-gold">Offer Tribute</h2>
                                <p className="text-sm text-pirate-parchment/60 font-cinzel mt-1 uppercase tracking-widest">
                                    Crew: <span className="text-pirate-red font-bold text-base">{teamData.teamname}</span>
                                </p>
                            </div>

                            {/* Amount Card */}
                            <div className="bg-black/40 border border-pirate-gold/30 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
                                <div className="relative z-10">
                                    <p className="text-xs text-pirate-gold uppercase tracking-wider font-bold">Total Bounty</p>
                                    <p className="text-pirate-parchment text-xs mt-1 font-cinzel">5 Sailors x ₹350</p>
                                </div>
                                <div className="relative z-10 text-right">
                                    <span className="text-4xl font-pirate text-green-500 drop-shadow-md">₹1750</span>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex flex-col items-center justify-center py-2">
                                <div className="p-2 bg-white rounded-lg shadow-[0_0_20px_rgba(197,160,89,0.3)] transform transition hover:scale-105 duration-300 border-4 border-pirate-gold">
                                    <img src="/qrURL.jpg" alt="Treasure Map QR" className="w-40 h-40 object-contain" />
                                </div>
                                <p className="text-xs text-pirate-gold/70 mt-3 flex items-center gap-1 font-cinzel">
                                    <Smartphone size={14} /> Scan and Pay
                                </p>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                <InputField
                                    icon={CreditCard}
                                    label="Transaction Key"
                                    type="text"
                                    placeholder="Enter Transaction ID"
                                    value={transactionId}
                                    onChange={e => setTransactionId(e.target.value)}
                                />

                                <InputField
                                    icon={DollarSign}
                                    label="Sender Identity"
                                    type="text"
                                    placeholder="Your UPI ID (Optional)"
                                    value={upiId}
                                    onChange={e => setUpiId(e.target.value)}
                                />

                                {/* File Upload */}
                                <div className="relative mt-2">
                                    <label className="flex items-center gap-3 w-full p-4 bg-black/40 border-2 border-dashed border-pirate-gold/40 rounded cursor-pointer hover:border-pirate-gold hover:bg-black/60 transition-all group">
                                        <div className="p-2 bg-pirate-gold/10 rounded-full group-hover:bg-pirate-gold/20 transition-colors">
                                            <Upload className="w-5 h-5 text-pirate-gold" />
                                        </div>
                                        <div className="flex-1 truncate">
                                            <span className="text-sm text-pirate-parchment font-cinzel">
                                                {imageFile ? imageFile.name : "Upload Payment Proof"}
                                            </span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>

                                <button
                                    onClick={handleSubmitPayment}
                                    disabled={uploading}
                                    className={`w-full py-4 rounded font-pirate text-xl tracking-widest shadow-lg flex items-center justify-center gap-2 transform transition-all border border-green-500/30 ${uploading
                                        ? 'bg-gray-800 cursor-not-allowed text-gray-500'
                                        : 'bg-green-700 hover:bg-green-600 text-white hover:scale-[1.02] active:scale-95'
                                        }`}
                                >
                                    {uploading ? <><Loader2 className="animate-spin" /> Sending...</> : "Send Tribute"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500 animate-[bounce_2s_infinite]">
                                <CheckCircle className="w-12 h-12 text-green-500 drop-shadow-lg" />
                            </div>
                            <h2 className="text-4xl font-pirate text-pirate-gold mb-2">Message In A Bottle Sent!</h2>
                            <div className="h-px w-1/2 bg-pirate-gold/30 mx-auto my-4"></div>
                            <div className="space-y-3 text-pirate-parchment/80 mt-4 font-cinzel">
                                <p>We've received your tribute, captain.</p>
                                <p className="text-sm bg-black/60 border border-pirate-gold/20 py-2 px-4 rounded inline-block">
                                    Current Status: <span className="text-yellow-500 font-bold animate-pulse">Verifying...</span>
                                </p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-pirate-gold/20">
                                <p className="text-xs text-pirate-parchment/50">You may now close this log.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default PaymentPortal;