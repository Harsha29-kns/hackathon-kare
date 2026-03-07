import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "./api";
import socket from "./socket";
import { useNavigate, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";
import { motion } from "framer-motion";
import "driver.js/dist/driver.css";

// --- CUSTOM LOADER ---
const PirateLoader = ({ size = 80, className = "mb-4" }) => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className={`flex justify-center items-center ${className}`}
    >
        <Compass size={size} className="text-[#c5a059] drop-shadow-[0_0_15px_rgba(197,160,89,0.5)]" />
    </motion.div>
);

const Domains = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Auth & Navigation State
    const [team, setTeam] = useState(null);
    const [domainSet, setDomainSet] = useState("");

    // Data State
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UI State
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const set = location.state?.selectedSet;
        if (!set) {
            navigate("/teamdash");
            return;
        }
        setDomainSet(set);

        // Fetch team data using token
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/teamdash");
            return;
        }

        const fetchTeamData = async () => {
            try {
                const res = await axios.post(`${api}/Hack/team/${token}`);
                if (res.data.Domain) {
                    // Already selected a domain, redirect back
                    navigate("/teamdash");
                } else {
                    setTeam(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch team data:", err);
                navigate("/teamdash");
            }
        };

        fetchTeamData();
        fetchDomains();

        // Listen for real-time domain slot updates
        const handleDomainDataUpdate = (data) => {
            if (data && Array.isArray(data)) {
                setDomains(data);
            }
        };

        socket.on("domaindata", handleDomainDataUpdate);

        return () => {
            socket.off("domaindata", handleDomainDataUpdate);
        };
    }, [navigate, location]);

    const fetchDomains = async () => {
        try {
            const res = await axios.get(`${api}/domains`);
            setDomains(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching problem statements", error);
            setErrorMsg("Failed to load problem statements.");
            setLoading(false);
        }
    };

    const handleSelectDomain = async (domainId) => {
        if (!team) {
            setErrorMsg("User session not found. Please log in again.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");
        try {
            const response = await axios.post(`${api}/Hack/updateDomain`, {
                teamId: team._id,
                domain: domainId
            });

            // Update local storage so Teamdash knows
            const updatedTeam = response.data.team;
            sessionStorage.setItem("team", JSON.stringify(updatedTeam));

            // Navigate back to dash
            navigate("/teamdash");
        } catch (error) {
            setIsSubmitting(false);
            setErrorMsg(error.response?.data?.error || "Failed to select domain.");
            // Refresh domains to get latest slots
            fetchDomains();
        }
    };

    const SlotProgressBar = ({ slots, total = 4 }) => {
        const percentage = total > 0 ? (slots / total) * 100 : 0;
        let barColor = 'bg-green-500';
        let textColor = 'text-green-400';
        if (slots === 0) {
            barColor = 'bg-red-700';
            textColor = 'text-red-500';
        } else if (percentage < 20) {
            barColor = 'bg-red-500';
            textColor = 'text-red-400';
        } else if (percentage < 50) {
            barColor = 'bg-yellow-500';
            textColor = 'text-yellow-400';
        } else {
            barColor = 'bg-green-500';
            textColor = 'text-green-400';
        }

        return (
            <div className="w-28 text-right flex-shrink-0">
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
                    <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                </div>
                <span className={`text-sm font-semibold ${textColor} transition-colors duration-300`}>{slots}/{total} slots</span>
            </div>
        );
    };

    // Filter to only their set
    const filteredDomains = domains.filter((d) => d.set === domainSet);

    return (
        <div className="min-h-screen bg-[#111827] text-white relative flex flex-col items-center py-10 px-4 md:px-10 overflow-hidden font-sans">
            {/* Background elements */}
            <div className="fixed inset-0 z-0 opacity-20 bg-[url('/mission.jpg')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-[#111827]/80 to-[#111827] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-7xl flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 border border-purple-500/30 p-6 rounded-2xl backdrop-blur-md shadow-2xl">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <Compass size={40} className="text-purple-500 animate-pulse" />
                        <div>
                            <h1 className="text-3xl md:text-5xl font-['Pirata_One'] text-purple-400 tracking-wider">
                                Choose Your Path
                            </h1>
                            {/* Tabs for Sets */}
                            <div className="flex gap-4 mt-2">
                                <button
                                    onClick={() => setDomainSet("Set 1")}
                                    className={`px-4 py-1.5 rounded-md font-bold font-mono text-sm transition-all
                                        ${domainSet === "Set 1"
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                                            : 'bg-transparent text-gray-400 border border-gray-700 hover:text-purple-300 hover:border-purple-500/30'
                                        }`}
                                >
                                    SET 1: AI & ML
                                </button>
                                <button
                                    onClick={() => setDomainSet("Set 2")}
                                    className={`px-4 py-1.5 rounded-md font-bold font-mono text-sm transition-all
                                        ${domainSet === "Set 2"
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                            : 'bg-transparent text-gray-400 border border-gray-700 hover:text-amber-300 hover:border-amber-500/30'
                                        }`}
                                >
                                    SET 2: AI + Full Stack
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/teamdash')}
                        className="px-6 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 hover:border-purple-500 transition-all text-gray-300 flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        <span>← Return to Dash</span>
                    </button>
                </div>

                {errorMsg && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl shadow-lg backdrop-blur-md animate-pulse text-center">
                        ⚠️ {errorMsg}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <PirateLoader size={120} />
                        <h2 className="text-2xl font-['Pirata_One'] mt-6 text-purple-400 animate-pulse">Decrypting Schematics...</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {filteredDomains.map((domain) => (
                            <div
                                key={domain.id}
                                className={`flex flex-col bg-black/50 border-2 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 shadow-xl group
                                    ${domain.slots === 0
                                        ? 'border-gray-800 opacity-60 grayscale'
                                        : 'border-purple-900/40 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1'
                                    }`
                                }
                            >
                                {/* Card Header */}
                                <div className="p-6 pb-4 border-b border-gray-800 bg-gradient-to-r from-gray-900/80 to-transparent flex justify-between items-start">
                                    <div className="pr-4">
                                        <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                                            {domain.name}
                                            {domain.slots === 0 && <span className="text-xs bg-red-900/80 text-red-200 px-2 py-1 rounded-md border border-red-500 font-mono tracking-widest uppercase ml-2">Locked</span>}
                                        </h3>
                                    </div>
                                    <SlotProgressBar slots={domain.slots} total={3} />
                                </div>

                                {/* Problem Statement */}
                                <div className="p-6 bg-gray-900/30">
                                    <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                                        Problem Statement
                                    </h4>
                                    <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                                        {domain.problemStatement || domain.description}
                                    </p>
                                </div>

                                {/* Features List */}
                                <div className="p-6 flex-grow bg-gradient-to-b from-transparent to-black/40">
                                    <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                                        Key Features to Build
                                    </h4>
                                    <ul className="space-y-3">
                                        {(domain.features && domain.features.length > 0) ? (
                                            domain.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    <span className="text-cyan-500 mr-3 mt-0.5 opacity-70">▹</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-gray-500 italic">No specific features listed. Build to solve the problem!</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Action Footer */}
                                <div className="p-6 pt-4 border-t border-gray-800 bg-black/60">
                                    <button
                                        onClick={() => handleSelectDomain(domain.id)}
                                        disabled={domain.slots === 0 || isSubmitting}
                                        className={`w-full py-3.5 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2
                                            ${domain.slots === 0
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)] hover:shadow-[0_0_25px_rgba(234,88,12,0.6)] border border-purple-400/50'
                                            }`
                                        }
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Committing Logic...
                                            </>
                                        ) : domain.slots === 0 ? (
                                            'Slots Filled'
                                        ) : (
                                            'Accept This Mission'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Domains;
