import React, { useState } from 'react';
import axios from 'axios';
import api from './api';
import { Mail, CreditCard, Upload, CheckCircle, Smartphone, DollarSign, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

// Move InputField OUTSIDE the component to prevent re-creation on every render
const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
        </div>
        <input
            {...props}
            className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
        />
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
    const [verifying, setVerifying] = useState(false); // Loading state for step 1

    const handleEmailCheck = async () => {
        if (!email) return alert("Please enter an email");
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
            alert(err.response?.data?.error || "Invalid Email");
        } finally {
            setVerifying(false);
        }
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmitPayment = async () => {
        if (!imageFile) return alert("Please select a screenshot of the payment.");
        if (!transactionId) return alert("Please enter the Transaction ID.");

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
                transtationId: transactionId,
                imgUrl: uploadedUrl
            });

            setStep(3);
        } catch (err) {
            console.error(err);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

            <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 p-8 rounded-2xl shadow-2xl relative z-10 transition-all duration-500">

                {/* Step 1: Verification */}
                {step === 1 && (
                    <div className="animate-fade-in-up space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                                <ShieldCheck className="w-8 h-8 text-orange-500" />
                            </div>
                            <h2 className="text-3xl font-bold font-naruto tracking-wide">Identity Check</h2>
                            <p className="text-gray-400 mt-2 text-sm">Enter your registered Team Lead email to proceed.</p>
                        </div>

                        <div className="space-y-4">
                            <InputField
                                icon={Mail}
                                type="email"
                                placeholder="lead.email@klu.ac.in"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            <button
                                onClick={handleEmailCheck}
                                disabled={verifying}
                                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-3 rounded-lg font-bold shadow-lg transform transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {verifying ? <Loader2 className="animate-spin" /> : <>Verify Identity <ArrowRight size={18} /></>}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                    <div className="animate-fade-in-up space-y-6">
                        <div className="text-center border-b border-gray-800 pb-4">
                            <h2 className="text-2xl font-bold text-white">Secure Payment</h2>
                            <p className="text-sm text-gray-400 mt-1">Team: <span className="text-orange-400 font-semibold">{teamData.teamname}</span></p>
                        </div>

                        {/* Amount Card */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-4 rounded-xl flex items-center justify-between shadow-inner">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Payable</p>
                                <p className="text-white text-xs mt-1">5 Members x ₹350</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-green-400">₹1750</span>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="p-3 bg-white rounded-xl shadow-lg transform transition hover:scale-105 duration-300">
                                <img src="/paymentqr.jpg" alt="Scan to Pay" className="w-40 h-40 object-contain" />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <Smartphone size={14} /> Scan with any UPI App
                            </p>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            <InputField
                                icon={CreditCard}
                                type="text"
                                placeholder="Transaction ID (Required)"
                                value={transactionId}
                                onChange={e => setTransactionId(e.target.value)}
                            />

                            <InputField
                                icon={DollarSign}
                                type="text"
                                placeholder="UPI ID (Optional)"
                                value={upiId}
                                onChange={e => setUpiId(e.target.value)}
                            />

                            {/* File Upload */}
                            <div className="relative">
                                <label className="flex items-center gap-3 w-full p-3 bg-gray-900/50 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-gray-800/50 transition-all group">
                                    <div className="p-2 bg-gray-800 rounded-md group-hover:bg-gray-700">
                                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                                    </div>
                                    <div className="flex-1 truncate">
                                        <span className="text-sm text-gray-300">
                                            {imageFile ? imageFile.name : "Upload Payment Screenshot"}
                                        </span>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>

                            <button
                                onClick={handleSubmitPayment}
                                disabled={uploading}
                                className={`w-full py-3.5 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transform transition-all ${uploading
                                        ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                                        : 'bg-green-600 hover:bg-green-500 text-white hover:scale-[1.02] active:scale-95'
                                    }`}
                            >
                                {uploading ? <><Loader2 className="animate-spin" /> Processing...</> : "Confirm Payment"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="animate-scale-in text-center py-10">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                            <CheckCircle className="w-12 h-12 text-green-500 drop-shadow-lg" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Submission Received!</h2>
                        <div className="space-y-2 text-gray-400 mt-4">
                            <p>We have received your payment proof.</p>
                            <p className="text-sm bg-gray-800/50 py-2 px-4 rounded inline-block">Status: <span className="text-yellow-400 font-semibold">Under Verification</span></p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <p className="text-xs text-gray-500">You may close this window safely.</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.4s ease-out forwards; }
                .font-naruto { font-family: 'Impact', sans-serif; letter-spacing: 1px; } 
            `}</style>
        </div>
    );
};

export default PaymentPortal;