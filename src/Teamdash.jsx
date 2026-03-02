import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "./api";
import socket from "./socket";
import "driver.js/dist/driver.css";
import Modal from 'react-modal';
import MemoryFlipGame from "./MemoryFlipGame"; //game file
import NumberPuzzleGame from "./NumberPuzzleGame"; // Import the NumberPuzzleGame component
import StopTheBarGame from "./StopTheBarGame";
import { useNavigate } from "react-router-dom";
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';

// Import your images
const scorecraft = "/scorecraft.jpg";
const king = "/king.png";
const hacksail = "/HackSail.png";
const hacksailr = "/HackSailr.png";
const missionBg = "/mission.jpg";

// --- MODAL STYLES ---
const customModalStyles = {
    content: {
        top: '50%', left: '50%', right: 'auto', bottom: 'auto',
        transform: 'translate(-50%, -50%)', backgroundColor: '#111827',
        border: '1px solid #f97316', borderRadius: '1rem', padding: '2rem',
        maxWidth: '90vw', width: 'auto', maxHeight: '90vh', color: 'white', zIndex: 1001,
    },
    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1000 },
};

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
// --- UPDATED TIMELINE COMPONENT ---


const ImageBackground = () => (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <img src="/home-wall.jpg" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 w-full h-full bg-black/70"></div>
    </div>
);

// --- TOAST NOTIFICATION SYSTEM ---
const TOAST_ICONS = {
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
    ),
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
    ),
};

const TOAST_STYLES = {
    success: 'bg-gray-900 border-l-4 border-green-500 text-green-300',
    error: 'bg-gray-900 border-l-4 border-red-500 text-red-300',
    info: 'bg-gray-900 border-l-4 border-orange-500 text-orange-300',
};

const ToastContainer = ({ toasts, onDismiss }) => (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '360px' }}>
        {toasts.map(toast => (
            <div
                key={toast.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-2xl pointer-events-auto
                    ${TOAST_STYLES[toast.type] || TOAST_STYLES.info}
                    animate-[slideInRight_0.3s_ease-out]`}
                style={{ animation: 'slideInRight 0.3s ease-out' }}
            >
                <span className={toast.type === 'success' ? 'text-green-400' : toast.type === 'error' ? 'text-red-400' : 'text-orange-400'}>
                    {TOAST_ICONS[toast.type] || TOAST_ICONS.info}
                </span>
                <p className="flex-1 text-sm font-medium text-gray-100 leading-snug">{toast.message}</p>
                <button
                    onClick={() => onDismiss(toast.id)}
                    className="text-gray-500 hover:text-gray-200 transition-colors text-lg leading-none ml-1 flex-shrink-0"
                >
                    ×
                </button>
            </div>
        ))}
        <style>{`
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(100%); }
                to   { opacity: 1; transform: translateX(0); }
            }
        `}</style>
    </div>
);

// --- MODAL COMPONENTS ---

const QrModal = ({ isOpen, onClose, qrUrl, name }) => (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={{ ...customModalStyles, content: { ...customModalStyles.content, width: '320px' } }} contentLabel="QR Code">
        <div className="flex flex-col items-center justify-center gap-4">
            <h3 className="text-xl font-bold text-orange-400">{name}</h3>
            {qrUrl ? (
                <img src={qrUrl} alt={`QR Code for ${name}`} className="w-64 h-64 bg-white p-2 rounded-lg" />
            ) : (
                <p>QR Code not available.</p>
            )}
            <button onClick={onClose} className="mt-4 px-8 py-2 bg-orange-600 rounded-lg font-semibold hover:bg-orange-700 transition-colors">Close</button>
        </div>
    </Modal>
);

// --- CORRECTED COUNTDOWN TIMER ---
function CountdownTimer({ targetTime, onTimerEnd }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const target = new Date(targetTime);
            const difference = target - now;

            if (difference > 0) {
                // Correctly calculates days, hours, minutes, and seconds
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                let timeString = "";
                if (days > 0) timeString += `${days}d `; // Add days if they exist
                timeString += `${hours}h ${minutes}m ${seconds}s`;
                setTimeLeft(timeString);

            } else {
                setTimeLeft("Opening...");
                clearInterval(interval);
                if (onTimerEnd) onTimerEnd();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime, onTimerEnd]);

    return (
        <div className="text-center text-gray-400 flex flex-col items-center justify-center gap-3 h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <p className="font-semibold text-lg">Problem Statements selection opens in:</p>
            <p className="text-2xl font-bold text-white">{timeLeft}</p>
        </div>
    );
}



const AttendanceModal = ({ isOpen, onClose, team, attendanceIcon }) => {
    const getAttendanceStatus = (member, round) => member?.attendance?.find(a => a.round === round)?.status || null;
    const rounds = [1, 2, 3, 4, 5, 6, 7];

    // Calculate overall attendance percentage
    const totalMembers = (team?.teamMembers?.length || 0) + 1; // +1 for the lead
    let totalPresent = 0;
    if (team) {
        const allMembers = [team.lead, ...team.teamMembers];
        allMembers.forEach(member => {
            rounds.forEach(round => {
                if (getAttendanceStatus(member, round) === 'Present') {
                    totalPresent++;
                }
            });
        });
    }


    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{
                ...customModalStyles,
                content: {
                    ...customModalStyles.content,
                    width: '95vw',
                    maxWidth: '1000px',
                    background: 'rgba(10, 10, 10, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    boxShadow: '0 0 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(249, 115, 22, 0.1)',
                    padding: '0' // Remove default padding for custom edge-to-edge header
                }
            }}
            contentLabel="Attendance Tracker"
            appElement={document.getElementById('root') || undefined}
        >
            <div className="relative overflow-hidden flex flex-col h-full rounded-2xl">
                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-orange-900/40 via-black/40 to-black px-6 py-5 flex justify-between items-center border-b border-orange-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.2)] text-2xl">
                            📊
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500 font-naruto tracking-widest leading-none drop-shadow-md">
                                ATTENDANCE
                            </h2>
                            <p className="text-orange-200/60 text-xs tracking-widest uppercase mt-1">Directory: {team?.teamname}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-orange-500/20 border border-transparent hover:border-orange-500/50 transition-all text-xl">✕</button>
                </div>

                {/* Content */}
                <div className="max-w-[75vw] md:max-w-none overflow-x-auto p-6 md:p-8">
                    <div className="min-w-[700px]">
                        {team ? (
                            <div className="inline-flex flex-col gap-5 w-full">
                                {/* Lead Card */}
                                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border border-yellow-500/30 p-5 rounded-2xl relative overflow-hidden group shadow-[0_0_20px_rgba(234,179,8,0.05)]">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-orange-500"></div>
                                    <div className="absolute -inset-20 bg-yellow-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                                    <div className="flex justify-between items-center mb-4 relative z-10">
                                        <div>
                                            <p className="font-bold text-xl text-yellow-400 tracking-wide flex items-center gap-2">
                                                {team.name}
                                                <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">Lead</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-3 relative z-10">
                                        {rounds.map(round => (
                                            <div key={`lead-${round}`} className="flex flex-col items-center bg-black/40 rounded-xl p-2 border border-white/5 group-hover:border-yellow-500/20 transition-colors">
                                                <span className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">R{round}</span>
                                                <div className="transform group-hover:scale-110 transition-transform duration-300">
                                                    {attendanceIcon(getAttendanceStatus(team.lead, round))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Member Cards */}
                                {team.teamMembers.map((member, idx) => (
                                    <div key={idx} className="bg-black/40 border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-colors shadow-lg">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-500 to-gray-700"></div>

                                        <div className="flex justify-between items-center mb-4 relative z-10">
                                            <div>
                                                <p className="font-semibold text-lg text-white tracking-wide flex items-center gap-2">
                                                    {member.name}
                                                    <span className="bg-white/5 text-gray-400 border border-white/10 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">Member</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-7 gap-3 relative z-10">
                                            {rounds.map(round => (
                                                <div key={`member-${idx}-${round}`} className="flex flex-col items-center bg-white/[0.02] rounded-xl p-2 border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                                                    <span className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">R{round}</span>
                                                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                                                        {attendanceIcon(getAttendanceStatus(member, round))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-48">
                                <div className="w-12 h-12 border-t-2 border-orange-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-orange-400 font-mono tracking-widest text-sm animate-pulse">DECRYPTING DATA...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};



const ReminderModal = ({ isOpen, onClose, reminderText }) => (<Modal isOpen={isOpen} onRequestClose={onClose} style={{ ...customModalStyles, content: { ...customModalStyles.content, width: '850px' } }} contentLabel="Admin Reminder" appElement={document.getElementById('root') || undefined}> <div className="flex justify-between items-center mb-6"> <div className="flex items-center gap-3"> <span className="text-3xl animate-pulse">📢</span> <h2 className="text-2xl font-bold text-yellow-400 font-['Pirata_One']">IMPORTANT REMINDER</h2> </div> <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">×</button> </div> <div className="text-center text-lg bg-gray-900/50 p-6 rounded-lg border border-yellow-500/50"> <p>{reminderText}</p> </div> <div className="mt-6 flex justify-end"> <button onClick={onClose} className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700">Acknowledged</button> </div> </Modal>);
const AssistanceModal = ({ isOpen, onClose, isSubmittingIssue, issueError, issueText, setIssueText, handleIssueSubmit }) => (<Modal isOpen={isOpen} onRequestClose={onClose} style={{ ...customModalStyles, content: { ...customModalStyles.content, width: '850px' } }} contentLabel="Request Assistance" appElement={document.getElementById('root') || undefined}> <div className="text-white"> <div className="flex justify-between items-center mb-6"> <h2 className="text-2xl font-bold text-orange-400 font-['Pirata_One']">Request Assistance</h2> <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl" disabled={isSubmittingIssue}>×</button> </div> {issueError && (<div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 text-center">{issueError}</div>)} <p className="text-gray-300 mb-4">If you have a technical problem or need help, please describe it below. Our team will reach you shortly.</p> <textarea value={issueText} onChange={(e) => setIssueText(e.target.value)} placeholder="Describe your problem here..." className="w-full h-40 p-4 bg-gray-700 border border-gray-600 rounded-xl" disabled={isSubmittingIssue} /> <div className="mt-6 flex justify-end gap-4"> <button onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-600 hover:bg-gray-700" disabled={isSubmittingIssue}>Cancel</button> <button onClick={handleIssueSubmit} className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50" disabled={isSubmittingIssue || !issueText.trim()}> {isSubmittingIssue ? 'Submitting...' : 'Submit Request'} </button> </div> </div> </Modal>);

const customModalStyles2 = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        background: '#1f2937',
        border: '1px solid #4b5563',
        borderRadius: '0.75rem', // rounded-lg

        padding: '1.5rem', // p-6, a base padding for the content
    },
    overlay: {
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        zIndex: 50,
    }
};

// --- NEW CONFIRMATION MODAL COMPONENT ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, isSubmitting, title, children }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => !isSubmitting && onClose()}
            style={{ ...customModalStyles, content: { ...customModalStyles.content, width: '500px' } }}
            contentLabel="Confirmation Modal"
            appElement={document.getElementById('root') || undefined}
        >
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-yellow-400 font-['Pirata_One']">{title}</h2>
                <div className="text-gray-300 bg-gray-900/50 p-4 rounded-lg border border-yellow-500/30">
                    {children}
                </div>
                <div className="mt-2 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-600 hover:bg-gray-700" disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Confirm and Submit'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};




const DomainSelectionModal = ({ isOpen, onClose, isSubmitting, selectedSet, domainData, selectedDomain, handleSelect, handleSubmit, isLoading }) => {
    const SlotProgressBar = ({ slots, total }) => {
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

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            // THE ONLY CHANGE: Make the modal width responsive.
            style={{
                ...customModalStyles2,
                content: {
                    ...customModalStyles2.content,
                    width: '90vw',
                    maxWidth: '1100px'
                }
            }}
            contentLabel="Domain Selection"
            appElement={document.getElementById('root') || undefined}
        >
            <div className="relative">
                {isSubmitting && (
                    <div className="absolute inset-0 bg-gray-900/80 flex flex-col justify-center items-center rounded-lg z-20">
                        <PirateLoader size={100} />
                        <p className="text-orange-400 font-['Pirata_One'] text-2xl mt-4">Confirming Your Path...</p>
                    </div>
                )}

                <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-4">
                    <h2 className="text-2xl font-bold text-orange-400 font-['Pirata_One']">Choose Your Path in {selectedSet}</h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 disabled:opacity-50 transition-colors"
                            disabled={!selectedDomain || isSubmitting}
                        >
                            Confirm Selection
                        </button>
                        <button onClick={onClose} className="text-3xl text-gray-400 hover:text-white" disabled={isSubmitting}>×</button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-[40vh] flex flex-col justify-center items-center">
                        <PirateLoader size={100} />
                        <p className="text-orange-400 font-['Pirata_One'] text-xl mt-4">Fetching Problem Statements...</p>
                    </div>
                ) : (
                    <div className="max-h-[70vh] overflow-y-auto pr-2 flex flex-col gap-4 py-2">
                        {domainData.filter(d => d.set === selectedSet).map(domain => (
                            <div
                                key={domain.id}
                                onClick={() => domain.slots > 0 && handleSelect(domain.id)}
                                className={`flex items-start justify-between p-6 rounded-xl border-2 transition-all duration-200
                                    ${selectedDomain === domain.id
                                        ? 'bg-orange-600/80 border-orange-400 scale-[1.02]'
                                        : domain.slots === 0
                                            ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                                            : 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-orange-500 cursor-pointer'
                                    }`
                                }
                            >
                                <div className="flex-1 mr-6">
                                    <h3 className="font-bold text-lg mb-1 text-slate-100">{domain.name}</h3>
                                    <p className="text-sm text-slate-300 leading-relaxed">{domain.description}</p>
                                </div>
                                <SlotProgressBar slots={domain.slots} total={4} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

const GameModal = ({ isOpen, onClose, onGameEnd, isSubmitting }) => (
    <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={{ ...customModalStyles, content: { ...customModalStyles.content, width: 'auto', maxWidth: '500px' } }}
        contentLabel="Memory Flip Game"
        appElement={document.getElementById('root') || undefined}
    >
        <div className="relative">
            {isSubmitting && (
                <div className="absolute inset-0 bg-gray-900/80 flex flex-col justify-center items-center rounded-lg z-20">
                    <PirateLoader size={120} />
                    <p className="text-orange-400 font-['Pirata_One'] text-2xl mt-4">Saving Your Score...</p>
                </div>
            )}
            <div className="flex justify-end">
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl font-light" disabled={isSubmitting}>×</button>
            </div>
            <MemoryFlipGame onGameEnd={onGameEnd} />
        </div>
    </Modal>
);


const AttendanceInfo = ({ onOpenModal }) => {
    return (
        <div
            onClick={onOpenModal}
            className="group relative bg-black/50 border border-orange-500/30 rounded-lg p-6 flex flex-col items-center justify-center text-center h-48 w-full cursor-pointer overflow-hidden transition-all duration-300 hover:border-orange-400 hover:bg-black/70 hover:shadow-lg hover:shadow-orange-500/20"
        >
            {/* --- Decorative Corner Brackets --- */}
            <div className="absolute top-0 left-0 w-full h-full p-2">
                <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-orange-500/60 group-hover:border-orange-400 transition-colors duration-300"></span>
                <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-orange-500/60 group-hover:border-orange-400 transition-colors duration-300"></span>
                <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-orange-500/60 group-hover:border-orange-400 transition-colors duration-300"></span>
                <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-orange-500/60 group-hover:border-orange-400 transition-colors duration-300"></span>
            </div>

            {/* --- Content --- */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                {/* Large Icon with Glow */}
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-400 transition-all duration-300 group-hover:text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {/* Glow effect */}
                    <div className="absolute inset-0 -z-10 bg-orange-500 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>

                {/* Title and Call to Action */}
                <h2 className="text-xl font-bold font-['Pirata_One'] text-orange-400 tracking-wider">
                    ATTENDANCE
                </h2>
                <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors duration-300 tracking-widest">
                    VIEW LOG
                </p>
            </div>
        </div>
    );
};

// --- EVENT SCHEDULE COMPONENT ---
const EventSchedule = ({ domainOpenTime, isDomainOpen, gameOpenTime, puzzleOpenTime, barGameOpenTime, isFirstReviewOpen, isSecondReviewOpen, team, currentTime }) => {
    const now = currentTime || new Date();
    const fmt = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : null;
    const tStatus = (iso, played) => played ? 'done' : !iso ? 'pending' : new Date(iso) > now ? 'upcoming' : 'open';
    const h = now.getHours();
    // Domain status: check isDomainOpen bool first (handles immediate-open with no timestamp)
    const domainStatus = team?.Domain ? 'done' : (isDomainOpen || (domainOpenTime && new Date(domainOpenTime) <= now)) ? 'open' : domainOpenTime ? 'upcoming' : 'pending';
    const domainSub = team?.Domain
        ? `✅ ${team.Domain}`
        : isDomainOpen || (domainOpenTime && new Date(domainOpenTime) <= now)
            ? '🔓 Currently Open — Select your problem statement!'
            : domainOpenTime
                ? `Opens at ${fmt(domainOpenTime)}`
                : 'Not opened yet';
    const items = [
        { icon: '🗂️', label: 'Domain Selection', time: fmt(domainOpenTime), status: domainStatus, sub: domainSub },
        { icon: '🍽️', label: 'Lunch Break', time: '01:00 PM', status: h >= 13 && h < 14 ? 'open' : h >= 14 ? 'done' : 'upcoming', sub: h >= 13 && h < 14 ? '🥪 Lunch time now!' : h >= 14 ? 'Done' : 'Upcoming' },
        { icon: '🧠', label: 'Memory Flip Game', time: fmt(gameOpenTime), status: tStatus(gameOpenTime, team?.memoryGamePlayed), sub: team?.memoryGamePlayed ? `✅ Score: ${team.memoryGameScore}` : gameOpenTime ? (new Date(gameOpenTime) > now ? `Opens at ${fmt(gameOpenTime)}` : '🔓 Open now!') : 'Not scheduled' },
        { icon: '⏱️', label: 'Sequence Challenge', time: fmt(barGameOpenTime), status: tStatus(barGameOpenTime, team?.stopTheBarPlayed), sub: team?.stopTheBarPlayed ? `✅ Score: ${team.stopTheBarScore}` : barGameOpenTime ? (new Date(barGameOpenTime) > now ? `Opens at ${fmt(barGameOpenTime)}` : '🔓 Open now!') : 'Not scheduled' },
        { icon: '🔢', label: 'Number Puzzle', time: fmt(puzzleOpenTime), status: tStatus(puzzleOpenTime, team?.numberPuzzlePlayed), sub: team?.numberPuzzlePlayed ? `✅ Score: ${team.numberPuzzleScore}` : puzzleOpenTime ? (new Date(puzzleOpenTime) > now ? `Opens at ${fmt(puzzleOpenTime)}` : '🔓 Open now!') : 'Not scheduled' },
        { icon: '📋', label: 'Review 1', time: '03:00 PM', status: isFirstReviewOpen ? 'open' : 'pending', sub: isFirstReviewOpen ? '🟢 Judges are reviewing now' : '⭕ Not started yet' },
        { icon: '🏆', label: 'Final Review', time: '05:00 PM', status: isSecondReviewOpen ? 'open' : 'pending', sub: isSecondReviewOpen ? '🟢 Final review in progress' : '⭕ Not started yet' },
        { icon: '🏁', label: 'Hackathon Ends', time: '11:00 PM', status: h >= 23 ? 'done' : 'upcoming', sub: h >= 23 ? '✅ Hackathon completed! Great work!' : '⏳ Finish & submit before this!' },
    ];
    const dot = { done: 'bg-green-400', open: 'bg-orange-400 ring-4 ring-orange-400/20 animate-pulse', upcoming: 'bg-blue-400', pending: 'bg-gray-600' };
    const card = { done: 'bg-green-900/20 border-green-500/30', open: 'bg-orange-900/20 border-orange-500/40', upcoming: 'bg-blue-900/20 border-blue-500/30', pending: 'bg-gray-800/40 border-gray-600/30' };
    const txt = { done: 'text-green-300', open: 'text-orange-300', upcoming: 'text-blue-300', pending: 'text-gray-400' };
    return (
        <div className="bg-black/20 rounded-xl border border-gray-700/50 p-5 h-full">
            <h2 className="text-xl font-bold font-['Pirata_One'] text-orange-400 border-b-2 border-orange-500/30 pb-2 mb-5">📅 TODAY'S SCHEDULE</h2>
            <div className="relative pl-6">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-700/60 rounded-full" />
                <div className="space-y-3">
                    {items.map((item, i) => (
                        <div key={i} className="relative flex items-center gap-3">
                            <div className={`absolute -left-[15px] w-3 h-3 rounded-full flex-shrink-0 ${dot[item.status]}`} />
                            <div className={`flex-1 flex items-center justify-between p-3 rounded-lg border ${card[item.status]} transition-all duration-300`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{item.icon}</span>
                                    <div>
                                        <p className="font-semibold text-sm text-white leading-tight">{item.label}</p>
                                        <p className={`text-xs ${txt[item.status]}`}>{item.sub}</p>
                                    </div>
                                </div>
                                {item.time && <span className="text-xs font-mono font-bold bg-black/30 px-2 py-0.5 rounded ml-2 flex-shrink-0 text-gray-300">{item.time}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- ACHIEVEMENT BADGES ---
const BADGES = [
    {
        id: 'domain',
        icon: '📁',
        name: 'Pathfinder',
        desc: 'Selected a Problem Statement',
        colors: ['#f97316', '#b45309'],
        glow: 'rgba(249,115,22,0.7)',
        unlocked: (t) => !!t.Domain,
    },
    {
        id: 'memory',
        icon: '🧠',
        name: 'Mind Master',
        desc: 'Won Memory Flip',
        colors: ['#818cf8', '#6d28d9'],
        glow: 'rgba(129,140,248,0.7)',
        unlocked: (t) => !!t.memoryGamePlayed,
    },
    {
        id: 'stopbar',
        icon: '⏱️',
        name: 'Speed Demon',
        desc: 'Mastered Sequence Challenge',
        colors: ['#f472b6', '#be185d'],
        glow: 'rgba(244,114,182,0.7)',
        unlocked: (t) => !!t.stopTheBarPlayed,
    },
    {
        id: 'puzzle',
        icon: '🔢',
        name: 'Puzzle King',
        desc: 'Solved the Number Puzzle',
        colors: ['#34d399', '#065f46'],
        glow: 'rgba(52,211,153,0.7)',
        unlocked: (t) => !!t.numberPuzzlePlayed,
    },
    {
        id: 'trihero',
        icon: '🎮',
        name: 'Tri-Quest Hero',
        desc: 'Completed all 3 Side Quests',
        colors: ['#fbbf24', '#d97706'],
        glow: 'rgba(251,191,36,0.8)',
        unlocked: (t) => !!(t.memoryGamePlayed && t.stopTheBarPlayed && t.numberPuzzlePlayed),
    },
    {
        id: 'review1',
        icon: '📋',
        name: 'Battle Tested',
        desc: 'Completed First Review',
        colors: ['#38bdf8', '#0369a1'],
        glow: 'rgba(56,189,248,0.7)',
        unlocked: (t) => !!(t.FirstReview && Object.keys(t.FirstReview).length > 0),
    },
    {
        id: 'champion',
        icon: '🏆',
        name: 'Champion',
        desc: 'Survived the Final Review',
        colors: ['#facc15', '#a16207'],
        glow: 'rgba(250,204,21,0.9)',
        unlocked: (t) => !!(t.SecoundReview && Object.keys(t.SecoundReview).length > 0),
    },
    {
        id: 'attendance',
        icon: '💯',
        name: 'Iron Will',
        desc: 'Full squad, all 7 rounds present',
        colors: ['#4ade80', '#15803d'],
        glow: 'rgba(74,222,128,0.8)',
        unlocked: (t) => {
            const rounds = [1, 2, 3, 4, 5, 6, 7];
            const allMembers = [t.lead, ...(t.teamMembers || [])];
            return allMembers.length > 0 && allMembers.every(
                member => member && rounds.every(
                    round => member.attendance?.find(a => a.round === round)?.status === 'Present'
                )
            );
        },
    },
];

const BadgeWall = ({ team }) => (
    <div className="bg-black/20 rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-xl font-bold font-['Pirata_One'] text-orange-400 border-b-2 border-orange-500/30 pb-2 mb-6">
            🏅 ACHIEVEMENT BADGES
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5 justify-items-center">
            {BADGES.map((badge, idx) => {
                const isUnlocked = badge.unlocked(team);
                return (
                    <div key={badge.id} className="flex flex-col items-center gap-2" style={{ perspective: '600px' }}>
                        {/* Animated 3D coin wrapper */}
                        <div
                            className="relative w-[76px] h-[76px] cursor-default"
                            style={{
                                transformStyle: 'preserve-3d',
                                animation: isUnlocked
                                    ? `coinFloat ${3.5 + idx * 0.3}s ease-in-out infinite`
                                    : 'none',
                                animationDelay: `${idx * 0.45}s`,
                                transition: 'transform 0.3s ease',
                            }}
                            onMouseEnter={e => {
                                if (isUnlocked) {
                                    e.currentTarget.style.animation = 'none';
                                    e.currentTarget.style.transform = 'rotateX(-15deg) rotateY(30deg) scale(1.15)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (isUnlocked) {
                                    e.currentTarget.style.transform = '';
                                    e.currentTarget.style.animation =
                                        `coinFloat ${3.5 + idx * 0.3}s ease-in-out infinite`;
                                    e.currentTarget.style.animationDelay = `${idx * 0.45}s`;
                                }
                            }}
                        >
                            {/* Blurred drop shadow (floating illusion) */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: isUnlocked ? badge.colors[1] : '#1f2937',
                                    transform: 'translateZ(-14px) translateY(12px) scale(0.8)',
                                    filter: 'blur(8px)',
                                    opacity: 0.55,
                                }}
                            />
                            {/* Coin rim (back layer) */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: isUnlocked
                                        ? `linear-gradient(135deg, ${badge.colors[1]}, #000)`
                                        : '#374151',
                                    transform: 'translateZ(-6px)',
                                }}
                            />
                            {/* Side edge strip (gives thickness) */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: isUnlocked
                                        ? `linear-gradient(180deg, ${badge.colors[0]}88, ${badge.colors[1]}88)`
                                        : '#2d3748',
                                    transform: 'translateZ(-3px) scaleX(1.04) scaleY(1.04)',
                                }}
                            />
                            {/* Main coin face */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: isUnlocked
                                        ? `radial-gradient(circle at 30% 30%, ${badge.colors[0]}, ${badge.colors[1]})`
                                        : 'radial-gradient(circle at 35% 35%, #374151, #111827)',
                                    boxShadow: isUnlocked
                                        ? `0 0 0 2.5px ${badge.colors[1]}, 0 0 22px ${badge.glow}, 0 0 45px ${badge.glow}`
                                        : '0 0 0 2px #374151',
                                    filter: isUnlocked ? 'none' : 'grayscale(1)',
                                    opacity: isUnlocked ? 1 : 0.3,
                                    transform: 'translateZ(0)',
                                }}
                            >
                                {/* Gloss highlight */}
                                {isUnlocked && (
                                    <div
                                        className="absolute inset-0 rounded-full pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(140deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 50%, transparent 70%)',
                                        }}
                                    />
                                )}
                                {/* Sweeping shimmer */}
                                {isUnlocked && (
                                    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '-50%', left: '-75%',
                                                width: '45%', height: '200%',
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                                transform: 'skewX(-20deg)',
                                                animation: `badgeShimmer ${4 + idx * 0.5}s ease-in-out infinite`,
                                                animationDelay: `${idx * 0.6}s`,
                                            }}
                                        />
                                    </div>
                                )}
                                {/* Emoji icon — pops forward in Z */}
                                <span
                                    className="absolute inset-0 flex items-center justify-center select-none"
                                    style={{
                                        fontSize: '2rem',
                                        transform: 'translateZ(8px)',
                                        textShadow: isUnlocked
                                            ? `0 3px 6px rgba(0,0,0,0.6), 0 -1px 0 rgba(255,255,255,0.25), 0 0 12px ${badge.glow}`
                                            : 'none',
                                        filter: isUnlocked
                                            ? `drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 0 8px ${badge.glow})`
                                            : 'none',
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    {isUnlocked ? badge.icon : '🔒'}
                                </span>
                            </div>
                            {/* Outer pulsing glow ring */}
                            {isUnlocked && (
                                <div
                                    className="absolute -inset-1.5 rounded-full pointer-events-none"
                                    style={{
                                        background: `radial-gradient(circle, ${badge.glow} 0%, transparent 65%)`,
                                        opacity: 0.45,
                                        animation: `glowPulse ${2 + idx * 0.2}s ease-in-out alternate infinite`,
                                        animationDelay: `${idx * 0.3}s`,
                                    }}
                                />
                            )}
                        </div>
                        {/* Label */}
                        <div className="text-center max-w-[80px]">
                            <p className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>
                                {badge.name}
                            </p>
                            <p className={`text-[10px] leading-tight mt-0.5 ${isUnlocked ? 'text-gray-400' : 'text-gray-700'}`}>
                                {badge.desc}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
        <style>{`
            @keyframes coinFloat {
                0%   { transform: rotateX(8deg)  rotateY(-12deg) translateY(0px);    }
                25%  { transform: rotateX(2deg)  rotateY(16deg)  translateY(-7px);   }
                50%  { transform: rotateX(14deg) rotateY(6deg)   translateY(-4px);   }
                75%  { transform: rotateX(-2deg) rotateY(-18deg) translateY(-9px);   }
                100% { transform: rotateX(8deg)  rotateY(-12deg) translateY(0px);    }
            }
            @keyframes badgeShimmer {
                0%   { left: -75%; }
                45%  { left: 130%; }
                100% { left: 130%; }
            }
            @keyframes glowPulse {
                from { opacity: 0.25; transform: scale(0.97); }
                to   { opacity: 0.65; transform: scale(1.07); }
            }
        `}</style>
    </div>
);

// --- REVIEW ALERT BANNER ---
const REVIEW_BANNER_STYLES = {
    first: {
        bg: 'from-orange-600 via-red-600 to-orange-700',
        border: 'border-orange-400',
        glow: 'shadow-orange-500/60',
        icon: '📋',
        title: 'REVIEW 1 IS NOW LIVE!',
        msg: 'Judges are reviewing teams now. Be ready at your sector!',
    },
    second: {
        bg: 'from-yellow-500 via-amber-600 to-yellow-600',
        border: 'border-yellow-400',
        glow: 'shadow-yellow-400/60',
        icon: '🏆',
        title: 'FINAL REVIEW IS NOW LIVE!',
        msg: 'This is it! Final round judges are here. Give it your best!',
    },
};

const ReviewAlertBanner = ({ type, onDismiss }) => {
    const s = REVIEW_BANNER_STYLES[type];
    if (!s) return null;
    return (
        <div
            className={`relative overflow-hidden w-full rounded-xl border-2 ${s.border} shadow-2xl ${s.glow} bg-gradient-to-r ${s.bg}`}
            style={{ animation: 'bannerSlideDown 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
            {/* Animated scan line */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
                    animation: 'scanLine 2.5s ease-in-out infinite',
                }}
            />
            {/* Pulsing left bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/60 animate-pulse" />
            <div className="relative flex items-center gap-4 px-6 py-4">
                {/* Icon with ring pulse */}
                <div className="relative flex-shrink-0">
                    <span className="text-4xl" style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.8))' }}>
                        {s.icon}
                    </span>
                    <span className="absolute -inset-2 rounded-full border-2 border-white/40 animate-ping" />
                </div>
                {/* Text */}
                <div className="flex-1">
                    <p className="text-white font-['Pirata_One'] text-xl font-extrabold tracking-widest drop-shadow-lg">
                        {s.title}
                    </p>
                    <p className="text-white/90 text-sm font-medium mt-0.5">{s.msg}</p>
                </div>
                {/* LIVE badge */}
                <span className="hidden sm:flex items-center gap-1.5 bg-white/20 border border-white/40 px-3 py-1 rounded-full text-white text-xs font-bold backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE
                </span>
                {/* Dismiss */}
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 text-white/70 hover:text-white text-2xl leading-none transition-colors ml-2"
                >
                    ×
                </button>
            </div>
            <style>{`
                @keyframes bannerSlideDown {
                    from { opacity: 0; transform: translateY(-30px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes scanLine {
                    0%, 100% { transform: translateY(-100%); opacity: 0; }
                    30%, 70%  { opacity: 1; }
                    50%       { transform: translateY(200%); opacity: 0.4; }
                }
            `}</style>
        </div>
    );
};

function Teamdash() {
    // --- STATE AND LOGIC ---
    const [pass, setPass] = useState("");
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };
    const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
    const [teamName, setTeamName] = useState(""); // ✨ NEW: State for team name input
    const [isLoginVisible, setIsLoginVisible] = useState(false); // ✨ NEW: State for login animation
    const [team, setTeam] = useState(null);
    const [DomainOpen, setDomainOpen] = useState(false);
    const [domainOpenTime, setDomainOpenTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDomain, setSelectedDomain] = useState();
    const [DomainData, setDomainData] = useState([]);
    const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
    const [issueText, setIssueText] = useState("");
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
    const [issueError, setIssueError] = useState("");
    const [isSubmittingDomain, setIsSubmittingDomain] = useState(false);
    const [isDomainListLoading, setIsDomainListLoading] = useState(true);
    const [isAssistanceModalOpen, setIsAssistanceModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [activeReminder, setActiveReminder] = useState("");
    const [reminders, setReminders] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [pptData, setPptData] = useState(null);
    const [selectedSet, setSelectedSet] = useState(null);
    const [viewingQr, setViewingQr] = useState(null);
    const [isNumberPuzzleModalOpen, setIsNumberPuzzleModalOpen] = useState(false);
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);
    const [isSubmittingGameScore, setIsSubmittingGameScore] = useState(false);
    const [isSubmittingPuzzleScore, setIsSubmittingPuzzleScore] = useState(false);
    const [isGameOpen, setIsGameOpen] = useState(false);
    const [gameOpenTime, setGameOpenTime] = useState(null);
    const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
    const [puzzleOpenTime, setPuzzleOpenTime] = useState(null);
    const [isStopTheBarModalOpen, setIsStopTheBarModalOpen] = useState(false);
    const [isSubmittingBarScore, setIsSubmittingBarScore] = useState(false);
    const [isBarGameOpen, setIsBarGameOpen] = useState(false);
    const [barGameOpenTime, setBarGameOpenTime] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [logoutMessage, setLogoutMessage] = useState('');
    const [isFirstReviewOpen, setIsFirstReviewOpen] = useState(false);
    const [isSecondReviewOpen, setIsSecondReviewOpen] = useState(false);
    const [reviewBanner, setReviewBanner] = useState(null); // null | 'first' | 'second'
    const prevFirstReview = React.useRef(false);
    const prevSecondReview = React.useRef(false);
    const nav = useNavigate();

    //const handleDomainTimerEnd = useCallback(() => {
    //setDomainOpen(true);
    //}, []);



    const verify = (isUpdate = false) => {
        const token = localStorage.getItem("token") || pass;
        if (!token) {
            setError("No token found. Please log in.");
            setLoading(false);
            return;
        }
        if (!isUpdate) {
            setLoading(true);
        }
        setError("");


        // These will be automatically removed after they fire once.
        socket.once('login:success', () => {
            // The server approved our session. Now we can complete the login.
            axios.post(`${api}/Hack/team/${token}`)
                .then(res => {
                    setTeam(res.data);
                    if (pass) localStorage.setItem("token", pass);
                })
                .catch(() => {
                    setError("Session approved, but failed to fetch final team data.");
                    localStorage.removeItem("token");
                })
                .finally(() => {
                    setLoading(false);
                });
        });

        socket.once('login:error', (data) => {
            // The server rejected our session (multi-login detected).
            setError(data.message);
            localStorage.removeItem("token");
            setTeam(null);
            setLoading(false);
        });

        // First, do the HTTP check.
        axios.post(`${api}/Hack/team/${token}`)
            .then(res => {
                // If HTTP is successful, ask the server for a session lock.
                // The .once() listeners we just set up will handle the response.
                socket.emit('team:login', res.data._id);
            })
            .catch(() => {
                // If the initial HTTP check fails, show error and clean up the listeners.
                setError("Invalid access code. Please check and try again.");
                localStorage.removeItem("token");
                setTeam(null);
                setLoading(false);
                socket.off('login:success');
                socket.off('login:error');
            });
    };

    const refreshTeamData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            handleLogout(); // Logout if no token is found
            return;
        }
        try {
            const res = await axios.post(`${api}/Hack/team/${token}`);
            setTeam(res.data);
        } catch (error) {
            console.error("Failed to refresh team data. Logging out.", error);
            handleLogout(); // Logout on error
        }
    };

    useEffect(() => {
        // This effect runs only ONCE on component mount to set up login listeners.
        const token = localStorage.getItem("token");


        const handleLoginSuccess = async () => {

            const currentToken = localStorage.getItem("token") || pass;
            if (currentToken) {
                try {
                    const res = await axios.post(`${api}/Hack/team/${currentToken}`);
                    setTeam(res.data);
                    if (pass) localStorage.setItem("token", pass); // Save the token only if it was from a manual login
                } catch {
                    setError("Session approved, but failed to fetch team data.");
                    localStorage.removeItem("token");
                } finally {
                    setLoading(false);
                }
            }
        };

        const handleLoginError = (data) => {

            setError(data.message);
            localStorage.removeItem("token");
            setTeam(null);
            setLoading(false);
        };

        socket.on('login:success', handleLoginSuccess);
        socket.on('login:error', handleLoginError);


        if (token) {
            verify(); // Start the 2-stage login flow if a token is found
        } else {
            setLoading(false);
            const timer = setTimeout(() => setIsLoginVisible(true), 100);
            return () => clearTimeout(timer);
        }

        // Cleanup login listeners when the component unmounts
        return () => {
            socket.off('login:success', handleLoginSuccess);
            socket.off('login:error', handleLoginError);
        };
    }, []); // Empty dependency array [] ensures this effect runs only ONCE.

    useEffect(() => {
        // This effect sets up all listeners that should only be active AFTER a successful login.
        if (!team) return;

        const handleDomainStat = (res) => {
            if (res && new Date(res) > new Date()) {
                setDomainOpen(false);
                setDomainOpenTime(res);
            } else if (res) {
                setDomainOpen(true);
                setDomainOpenTime(null);
            }
            else {
                setDomainOpen(false);
                setDomainOpenTime(null);
            }
        };

        // Start emitting requests for initial dashboard data
        socket.emit("domainStat");
        socket.emit("client:getDomains");
        socket.emit("getGameStatus"); // also fetches hackathonEndTime & puzzle/bar times
        socket.emit("judge:getReviewStatus");

        const timeUpdater = setInterval(() => {
            setCurrentTime(new Date());
            if (gameOpenTime && new Date() > new Date(gameOpenTime)) {
                setIsGameOpen(true);
            }

            if (puzzleOpenTime && new Date() > new Date(puzzleOpenTime)) {
                setIsPuzzleOpen(true);
            }
            if (domainOpenTime && new Date() > new Date(domainOpenTime)) {
                setDomainOpen(true);
            }
            if (barGameOpenTime && new Date() > new Date(barGameOpenTime)) setIsBarGameOpen(true);
        }, 1000);



        const handleTeamUpdate = (updatedTeam) => {
            if (team && updatedTeam._id === team._id) {
                setTeam(updatedTeam);
            }
        };

        const handleAdminReminder = (data) => {
            setReminders(prev => [...prev, { ...data, time: new Date(data.time) }]);
            setActiveReminder(data.message);
            setIsReminderModalOpen(true);
        };

        const handleDomainData = (data) => {
            setDomainData(data || []);
            setIsDomainListLoading(false);
        };

        {/*const handleDomainStat = (res) => {
            if (typeof res === 'string' && new Date(res) > new Date()) {
                setDomainOpen(false);
                setDomainOpenTime(res);
            } else {
                setDomainOpen(!!res);
                setDomainOpenTime(null);
            }
        };*/}




        const handleDomainSelected = (data) => {
            setIsSubmittingDomain(false);
            setIsConfirmModalOpen(false);
            if (data.error) {
                addToast(`❌ ${data.error}`, 'error');
            } else if (data.success) {
                addToast(`✅ Problem statement "${data.domain.name}" selected!`, 'success');
                setIsDomainModalOpen(false);
                setSelectedSet(null);
                refreshTeamData();
            }
        };

        const handleGameStatusUpdate = (serverTime) => {
            if (serverTime && new Date(serverTime) > new Date()) {
                setGameOpenTime(serverTime);
                setIsGameOpen(false);
            } else {
                setGameOpenTime(null);
                setIsGameOpen(true);
            }
        };
        const handlePuzzleStatusUpdate = (serverTime) => {
            if (serverTime && new Date(serverTime) > new Date()) {
                setPuzzleOpenTime(serverTime);
                setIsPuzzleOpen(false);
            } else {
                setPuzzleOpenTime(null);
                setIsPuzzleOpen(true);
            }
        };
        const handleStopTheBarStatusUpdate = (serverTime) => {
            if (serverTime && new Date(serverTime) > new Date()) {
                setBarGameOpenTime(serverTime);
                setIsBarGameOpen(false);
            } else {
                setBarGameOpenTime(null);
                setIsBarGameOpen(true);
            }
        };
        const handleForceLogout = (data) => {
            setLogoutMessage(data.message);
            setTimeout(() => {
                handleLogout();
                nav('/teamdash');
                setLogoutMessage('');
            }, 3000);
        };
        const handleReviewStatusUpdate = (data) => {
            if (data) {
                const firstNowOpen = !!data.isFirstReviewOpen;
                const secondNowOpen = !!data.isSecondReviewOpen;
                // Only show banner on a false → true transition (not on initial load)
                if (firstNowOpen && !prevFirstReview.current) {
                    setReviewBanner('first');
                }
                if (secondNowOpen && !prevSecondReview.current) {
                    setReviewBanner('second');
                }
                prevFirstReview.current = firstNowOpen;
                prevSecondReview.current = secondNowOpen;
                setIsFirstReviewOpen(firstNowOpen);
                setIsSecondReviewOpen(secondNowOpen);
            }
        };

        socket.on('forceLogout', handleForceLogout);
        socket.on("reviewStatusUpdate", handleReviewStatusUpdate);

        // Set up all in-app listeners
        socket.on("team", handleTeamUpdate);
        socket.on("admin:sendReminder", handleAdminReminder);
        socket.on("client:receivePPT", setPptData);
        socket.on("domaindata", handleDomainData);
        socket.on("domainStat", handleDomainStat);
        socket.on("domainSelected", handleDomainSelected);
        socket.on("gameStatusUpdate", handleGameStatusUpdate);
        socket.on("puzzleStatusUpdate", handlePuzzleStatusUpdate);
        socket.on("stopTheBarStatusUpdate", handleStopTheBarStatusUpdate);

        // Cleanup function for this effect
        return () => {
            clearInterval(timeUpdater);
            socket.off("team", handleTeamUpdate);
            socket.off("admin:sendReminder", handleAdminReminder);
            socket.off("client:receivePPT", setPptData);
            socket.off("domaindata", handleDomainData);
            socket.off("domainStat", handleDomainStat);
            socket.off("domainSelected", handleDomainSelected);
            socket.off("gameStatusUpdate", handleGameStatusUpdate);
            socket.off("puzzleStatusUpdate", handlePuzzleStatusUpdate);
            socket.off("stopTheBarStatusUpdate", handleStopTheBarStatusUpdate);
            socket.off('forceLogout', handleForceLogout);
            socket.off("reviewStatusUpdate", handleReviewStatusUpdate);
        };
    }, [team, domainOpenTime, gameOpenTime, puzzleOpenTime, barGameOpenTime]);
    const handleBarGameEnd = async (score) => {
        if (!team || team.stopTheBarPlayed) return;
        setIsSubmittingBarScore(true);
        try {
            await axios.post(`${api}/Hack/team/${team._id}/stop-the-bar-score`, { score });
            addToast(`⏱️ Challenge Complete! Your score of ${score} has been submitted.`, 'success');
            refreshTeamData();
            setTimeout(() => {
                setIsStopTheBarModalOpen(false);
                setIsSubmittingBarScore(false);
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Error submitting score.";
            addToast(errorMsg, 'error');
            setIsSubmittingBarScore(false);
            if (err.response?.status === 403) {
                setIsStopTheBarModalOpen(false);
            }
        }
    };

    const handleIssueSubmit = async () => { setIsSubmittingIssue(true); setIssueError(""); try { await axios.post(`${api}/Hack/issue/${team._id}`, { issueText: issueText.trim() }); setIsAssistanceModalOpen(false); setIssueText(""); refreshTeamData(); } catch (err) { setIssueError("Failed to submit request. Please try again later."); } finally { setIsSubmittingIssue(false); } };
    const handleDomain = async () => {
        setIsSubmittingDomain(true);
        socket.emit("domainSelected",
            { teamId: team._id, domain: selectedDomain });
    };
    const handleSetClick = (set) => { setSelectedSet(set); setIsDomainModalOpen(true); setIsDomainListLoading(true); socket.emit("client:getDomains", ""); };

    const handleLogout = () => {

        if (team) {
            socket.emit('team:logout');
        }
        localStorage.removeItem("token");
        setTeam(null);
        setIsLoginVisible(true);
        setLogoutMessage('');
    };

    const attendanceIcon = (status) => {
        switch (status) {
            case "Present":
                return (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                        <svg className="w-5 h-5 text-green-400 animate-[pulse-slow_2s_infinite]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline className="animate-[dash_1s_ease-out_forwards]" points="20 6 9 17 4 12" strokeDasharray="50" strokeDashoffset="50"></polyline>
                        </svg>
                        <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
                    </div>
                );
            case "Absent":
                return (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        <svg className="w-5 h-5 text-red-500 animate-[bounce_2s_infinite]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center mx-auto opacity-50">
                        <span className="text-gray-500 text-sm font-bold">?</span>
                    </div>
                );
        }
    };

    const handleGameEnd = async (score) => {
        if (!team || team.memoryGamePlayed) return;
        setIsSubmittingGameScore(true);
        try {
            await axios.post(`${api}/Hack/team/${team._id}/game-score`, { score });
            addToast(`🧠 Challenge Complete! Your score of ${score} has been submitted.`, 'success');
            refreshTeamData();
            setTimeout(() => { setIsGameModalOpen(false); setIsSubmittingGameScore(false); }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "There was an error submitting your score.";
            addToast(errorMsg, 'error');
            setIsSubmittingGameScore(false);
            if (err.response?.status === 403) { setIsGameModalOpen(false); }
        }
    };
    const handlePuzzleEnd = async (score) => {
        if (!team || team.numberPuzzlePlayed) return;
        setIsSubmittingPuzzleScore(true);
        try {
            await axios.post(`${api}/Hack/team/${team._id}/number-puzzle-score`, { score });
            addToast(`🔢 Puzzle Complete! Your score of ${score} has been submitted.`, 'success');
            refreshTeamData();
            setTimeout(() => {
                setIsNumberPuzzleModalOpen(false);
                setIsSubmittingPuzzleScore(false);
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "There was an error submitting your score.";
            addToast(errorMsg, 'error');
            setIsSubmittingPuzzleScore(false);
            if (err.response?.status === 403) {
                setIsNumberPuzzleModalOpen(false);

            }
        }
    };

    const formatUnlockTime = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };



    if (!team && !loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center text-white p-4 font-['Cinzel'] overflow-hidden">
                <ImageBackground />

                <div className={`relative z-10 w-full max-w-md transition-all duration-700 ease-out ${isLoginVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
                        <div className="text-center mb-8">
                            <h1
                                className="text-5xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-orange-300 via-orange-500 to-amber-700"
                                style={{ fontFamily: '"Pirata One", serif', textShadow: '0 0 30px rgba(251,146,60,0.5), 0 4px 8px rgba(0,0,0,0.8)', letterSpacing: '0.12em' }}
                            >
                                HACKSAIL 2K26
                            </h1>
                            <p className="text-orange-400/70 text-xs tracking-[0.3em] uppercase mt-1 font-medium">⚓ Set Sail &amp; Conquer ⚓</p>
                            <div className="mt-1 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                            <h2 className="text-2xl font-bold font-['Pirata_One'] tracking-wider text-orange-400 mt-4">Team Login</h2>
                            <p className="text-gray-400 mt-1">Welcome to the Arena</p>
                            <div className="mt-6 bg-orange-500/10 border border-orange-400/30 text-orange-300 text-sm rounded-lg p-3">
                                <p className="font-semibold">Note:</p>
                                <p className="mt-1">Login access is restricted to <span className="font-medium">Team Leads only</span>.</p>
                                <p>Each account can log in for <span className="font-medium">one device only</span>.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center" role="alert">
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="relative">
                                <input
                                    id="teamName" type="text" value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="block w-full px-3 py-4 text-white bg-white/5 rounded-lg border-2 border-transparent focus:border-orange-500 focus:outline-none peer transition"
                                    placeholder=" "
                                />
                                <label htmlFor="teamName" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:text-orange-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
                                    Team Name
                                </label>
                            </div>

                            <div className="relative">
                                <input
                                    id="pass" type="password" value={pass}
                                    onChange={(e) => { setPass(e.target.value); setError(""); }}
                                    onKeyPress={(e) => e.key === 'Enter' && !loading && pass && verify()}
                                    className="block w-full px-3 py-4 text-white bg-white/5 rounded-lg border-2 border-transparent focus:border-orange-500 focus:outline-none peer transition"
                                    placeholder=" "
                                />
                                <label htmlFor="pass" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:text-orange-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
                                    Team Access Code
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={() => verify()}
                            disabled={loading || !pass}
                            className="w-full mt-8 flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500 py-3 rounded-lg font-bold text-lg text-gray-900 hover:shadow-lg hover:shadow-orange-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </>
                            ) : "Enter Arena"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const selectedProblemStatement = team?.Domain && DomainData.length > 0
        ? DomainData.find(ps => ps.name === team.Domain)
        : null;



    const attendanceRounds = [
        { round: 1, time: '09:30 AM' },
        { round: 2, time: '11:30 AM' },
        { round: 3, time: '02:00 PM' },
        { round: 4, time: '04:30 PM' },
        { round: 5, time: '07:00 PM' },
        { round: 6, time: '09:30 PM' },
        { round: 7, time: '11:30 PM' }
    ];

    const intelFeed = [...(reminders?.map(r => ({ ...r, type: 'reminder', timestamp: new Date(r.time) })) || []), ...(team?.issues?.map(i => ({ ...i, type: 'issue', timestamp: new Date(i.timestamp) })) || [])].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="h-screen w-full overflow-hidden text-gray-200 font-['Cinzel'] bg-gray-900" style={{ backgroundImage: `url('/home-wall.jpg')`, backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' }}>
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            {logoutMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-orange-500 text-white p-8 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4 font-['Pirata_One'] text-orange-400">Forced Logout</h2>
                        <p className="text-lg">{logoutMessage}</p>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDomain}
                isSubmitting={isSubmittingDomain}
                title="Final Confirmation"
            >
                <p>You have selected the Problem Statement:</p>
                <p className="text-xl font-bold text-orange-400 my-2 text-center">
                    {DomainData.find(d => d.id === selectedDomain)?.name || "Unknown"}
                </p>
                <p className="text-center">
                    Be careful! This is your <strong className="text-red-400">final decision</strong>.
                    After this, your team cannot switch to a different project.
                </p>
            </ConfirmModal>

            <QrModal isOpen={!!viewingQr} onClose={() => setViewingQr(null)} qrUrl={viewingQr?.url} name={viewingQr?.name} />
            <ReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} reminderText={activeReminder} />
            <AssistanceModal isOpen={isAssistanceModalOpen} onClose={() => setIsAssistanceModalOpen(false)} isSubmittingIssue={isSubmittingIssue} issueError={issueError} issueText={issueText} setIssueText={setIssueText} handleIssueSubmit={handleIssueSubmit} />
            {team && <AttendanceModal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} team={team} attendanceIcon={attendanceIcon} />}
            <DomainSelectionModal isOpen={isDomainModalOpen} onClose={() => setIsDomainModalOpen(false)} isSubmitting={isSubmittingDomain} selectedSet={selectedSet} domainData={DomainData} selectedDomain={selectedDomain} handleSelect={setSelectedDomain} handleSubmit={() => setIsConfirmModalOpen(true)} isLoading={isDomainListLoading} />
            <GameModal isOpen={isGameModalOpen} onClose={() => !isSubmittingGameScore && setIsGameModalOpen(false)} onGameEnd={handleGameEnd} isSubmitting={isSubmittingGameScore} />
            <Modal isOpen={isNumberPuzzleModalOpen} onRequestClose={() => !isSubmittingPuzzleScore && setIsNumberPuzzleModalOpen(false)} style={{ ...customModalStyles, content: { ...customModalStyles.content, width: 'auto', maxWidth: '500px' } }} contentLabel="Number Puzzle Game">
                <div className="relative">
                    {isSubmittingPuzzleScore && (
                        <div className="absolute inset-0 bg-gray-900/80 flex flex-col justify-center items-center rounded-lg z-20">
                            <PirateLoader size={120} />
                            <p className="text-orange-400 font-['Pirata_One'] text-2xl mt-4">Saving Your Score...</p>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button onClick={() => setIsNumberPuzzleModalOpen(false)} className="text-gray-400 hover:text-white transition-colors text-3xl font-light" disabled={isSubmittingPuzzleScore}>×</button>
                    </div>
                    <NumberPuzzleGame onGameEnd={handlePuzzleEnd} />
                </div>
            </Modal>
            <Modal isOpen={isStopTheBarModalOpen} onRequestClose={() => !isSubmittingBarScore && setIsStopTheBarModalOpen(false)} style={{ ...customModalStyles, content: { ...customModalStyles.content, width: 'auto', maxWidth: '520px' } }} contentLabel="Stop The Bar Game">
                <div className="relative">
                    {isSubmittingBarScore && (
                        <div className="absolute inset-0 bg-gray-900/80 flex flex-col justify-center items-center rounded-lg z-20">
                            <PirateLoader size={120} />
                            <p className="text-orange-400 font-['Pirata_One'] text-2xl mt-4">Saving Your Score...</p>
                        </div>
                    )}
                    <StopTheBarGame onGameEnd={handleBarGameEnd} />
                </div>
            </Modal>


            {(loading || !team) ? (
                <div className="relative z-20 flex items-center justify-center h-screen">
                    <div className="text-center">
                        <PirateLoader size={160} />
                        <p className="text-xl font-['Pirata_One'] text-orange-400 mt-4">Loading Mission...</p>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col h-full w-full">
                    <header className="flex-shrink-0 w-full bg-black/40 backdrop-blur-md border-b border-orange-500/30 z-20 shadow-md">
                        <div className="w-full max-w-[100rem] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

                            {/* Left Section: Logo + Sector */}
                            <div className="flex items-center space-x-4">
                                <img src={scorecraft} className="h-10 rounded-full" alt="Scorecraft Logo" />
                                <span className="text-xl font-bold text-orange-400 font-['Pirata_One'] whitespace-nowrap hidden sm:inline-block">HackSail-2k25</span>
                                <p className="text-sm text-gray-400 italic">
                                    Sector{" "}
                                    <span className="font-mono font-bold text-gray-200">
                                        {team.Sector}
                                    </span>
                                </p>
                            </div>

                            {/* Center Section: Team Name */}
                            <h1 className="text-2xl font-bold text-orange-400 font-['Pirata_One'] tracking-widest text-center">
                                {team.teamname}
                            </h1>

                            {/* Right Section: Logout */}
                            <div className="flex items-center gap-4">

                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600/80 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="flex-grow overflow-y-auto custom-scrollbar w-full flex flex-col">
                        <main className="flex-grow w-full max-w-[100rem] mx-auto px-4 md:px-8 pt-8 pb-10 relative z-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                                {/* Review Alert Banner */}
                                {reviewBanner && (
                                    <div className="lg:col-span-12">
                                        <ReviewAlertBanner
                                            type={reviewBanner}
                                            onDismiss={() => setReviewBanner(null)}
                                        />
                                    </div>
                                )}

                                {/* --- LEFT COLUMN (Squad & Attendance) --- */}
                                <div className="lg:col-span-3 flex flex-col gap-6">
                                    {/* 1. Squad Roster */}
                                    <div className="bg-slate-800/70 backdrop-blur-md border border-cyan-500/40 rounded-xl p-5 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-sans hover:border-cyan-400 transition-all duration-300 cursor-default group">
                                        <div className="pb-3 border-b flex items-center justify-between border-cyan-500/30 mb-4 group-hover:border-cyan-400 transition-colors">
                                            <h2 className="text-2xl font-bold font-['Pirata_One'] text-cyan-300 tracking-widest drop-shadow">SQUAD ROSTER</h2>
                                            <span className="text-cyan-500/60 text-xl group-hover:text-cyan-400 transition-colors">⚓</span>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            {/* Team Lead */}
                                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-900/80 to-cyan-950/40 rounded-lg border border-cyan-500/50 hover:bg-gray-800 transition-all shadow-md">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <span className="w-11 h-11 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/30 rounded-full font-bold text-cyan-300 text-lg shadow-inner">
                                                            {team.name && team.name.trim().charAt(0)}
                                                        </span>
                                                        <span className="absolute -bottom-1 -right-1 text-base drop-shadow">⭐</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-white tracking-wide">{team.name}</p>
                                                        <p className="text-[10px] text-cyan-400/80 font-mono tracking-wider">{team.registrationNumber}</p>
                                                    </div>
                                                </div>
                                                {team.lead?.qrCode && (
                                                    <button onClick={() => setViewingQr({ url: team.lead.qrCode, name: team.name })} className="bg-white/90 p-1.5 rounded-lg hover:bg-white hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/40 transition-all">
                                                        <img src={team.lead.qrCode} alt="QR Code" className="w-8 h-8 mask mask-squircle" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Team Members */}
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1 ml-1">Crew Members</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {team.teamMembers.map((member, i) => (
                                                    <div key={i} className="group/member relative flex items-center justify-center h-[5.5rem] bg-gray-900/60 rounded-lg overflow-hidden cursor-pointer border border-gray-700/50 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                                        <div className="flex flex-col items-center gap-1.5 transition-opacity duration-300 group-hover/member:opacity-0 relative z-10">
                                                            <span className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 shadow-inner rounded-full font-semibold text-gray-300 text-sm border border-gray-600">
                                                                {member.name && member.name.trim().charAt(0)}
                                                            </span>
                                                            <div className="px-2 w-full">
                                                                <p className="font-semibold text-center text-gray-300 text-[11px] truncate leading-tight">{member.name}</p>
                                                            </div>
                                                        </div>
                                                        {member.qrCode && (
                                                            <div onClick={() => setViewingQr({ url: member.qrCode, name: member.name })} className="absolute inset-0 flex items-center justify-center p-2 bg-gradient-to-t from-gray-800 to-gray-900 opacity-0 group-hover/member:opacity-100 transition-all duration-300 z-20 overflow-hidden">
                                                                <div className="bg-white p-1 rounded-lg">
                                                                    <img src={member.qrCode} alt="QR Code" className="w-14 h-14" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendance Info */}
                                    <div className="w-full">
                                        <AttendanceInfo rounds={attendanceRounds} currentTime={currentTime} onOpenModal={() => setIsAttendanceModalOpen(true)} />
                                    </div>
                                </div>

                                {/* --- CENTER COLUMN (Mission Control & Log) --- */}
                                <div className="lg:col-span-6 flex flex-col gap-6">
                                    {/* 2. Problem Statements (Mission Control) */}
                                    <div
                                        className={`flex flex-col rounded-2xl p-6 sm:p-8 relative overflow-hidden group transition-colors ${(!selectedProblemStatement && !team.Domain && !DomainOpen && domainOpenTime)
                                            ? 'shadow-[0_0_30px_rgba(249,115,22,0.3)]'
                                            : 'bg-black/40 backdrop-blur-xl border-2 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:border-orange-400'
                                            }`}
                                        style={
                                            (!selectedProblemStatement && !team.Domain && !DomainOpen && domainOpenTime)
                                                ? {
                                                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${missionBg})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    backgroundRepeat: 'no-repeat'
                                                }
                                                : {}
                                        }
                                    >
                                        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-orange-500/20 group-hover:scale-110 transition-all duration-700"></div>
                                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-yellow-500/15 transition-all duration-700"></div>

                                        <div className="flex items-center justify-between border-b-2 border-orange-500/30 pb-4 mb-6">
                                            <h2 className="text-3xl font-bold font-['Pirata_One'] text-orange-400 flex items-center gap-3 drop-shadow">
                                                <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">🧭</span> MISSION CONTROL
                                            </h2>
                                            <span className="animate-pulse w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>
                                        </div>

                                        <div className={`p-6 sm:p-8 rounded-xl backdrop-blur-md relative z-10 flex-grow flex flex-col justify-center shadow-inner ${(!selectedProblemStatement && !team.Domain && !DomainOpen && domainOpenTime) ? 'bg-transparent border-transparent' : 'bg-gradient-to-b from-gray-900/90 to-black/90 border border-gray-700/60'}`}>
                                            {!(!selectedProblemStatement && !team.Domain && !DomainOpen && domainOpenTime) && (
                                                <h3 className="font-bold text-orange-500/60 text-xs mb-6 tracking-[0.2em] shadow-black uppercase text-center border-b border-gray-800 pb-2">Destiny Path</h3>
                                            )}

                                            {selectedProblemStatement ? (
                                                <div className="text-center py-2 px-2 sm:px-4">
                                                    <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-6 drop-shadow-md leading-tight">{selectedProblemStatement.name}</p>
                                                    <div className="relative">
                                                        <div className="absolute -left-2 top-0 text-3xl text-gray-700 font-serif">"</div>
                                                        <p className="text-base sm:text-lg text-gray-200 bg-gray-800/40 p-5 rounded-xl italic border border-gray-700/50 leading-relaxed shadow-lg backdrop-blur-sm z-10 relative">
                                                            {selectedProblemStatement.description}
                                                        </p>
                                                        <div className="absolute -right-2 bottom-0 text-3xl text-gray-700 font-serif rotate-180">"</div>
                                                    </div>
                                                </div>
                                            ) :
                                                team.Domain ? (
                                                    <div className="flex flex-col items-center justify-center py-10 fade-in">
                                                        <span className="text-5xl mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">✨</span>
                                                        <p className="text-center text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 drop-shadow">{team.Domain}</p>
                                                        <p className="text-green-500/70 font-mono tracking-widest mt-4 uppercase text-sm border border-green-500/30 px-4 py-1 rounded-full bg-green-500/10">Locked In Contract</p>
                                                    </div>
                                                ) : (
                                                    DomainOpen ? (
                                                        [...new Set(DomainData.map(item => item.set))].length > 0 ? (
                                                            <div className="flex flex-col gap-4 justify-center items-center py-4 fade-in">
                                                                <p className="text-orange-300 mb-2 animate-pulse font-['Pirata_One'] text-2xl tracking-widest">Select your destiny</p>
                                                                <button onClick={() => handleSetClick("Set 1")} className="w-full max-w-sm py-4 relative group/btn overflow-hidden rounded-xl font-bold text-lg transition-all hover:scale-105">
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 transition-all duration-300"></div>
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-0 group-hover/btn:opacity-100 transition-all duration-500"></div>
                                                                    <span className="relative z-10 text-white drop-shadow-md tracking-wide">Campus Community Box</span>
                                                                </button>
                                                                <button onClick={() => handleSetClick("Set 2")} className="w-full max-w-sm py-4 relative group/btn overflow-hidden rounded-xl font-bold text-lg transition-all hover:scale-105">
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-300"></div>
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-400 opacity-0 group-hover/btn:opacity-100 transition-all duration-500"></div>
                                                                    <span className="relative z-10 text-white drop-shadow-md tracking-wide">Lifestyle & Productivity Box</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <p className="text-center text-orange-400/70 animate-pulse text-xl py-10 font-['Pirata_One'] tracking-widest">Unsealing mystical parchment...</p>
                                                        )
                                                    ) : (
                                                        domainOpenTime ? (
                                                            <div className="py-8 scale-125 origin-center pt-10">
                                                                <CountdownTimer targetTime={domainOpenTime} />
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-gray-400 flex flex-col items-center justify-center gap-5 py-10">
                                                                <div className="p-5 bg-red-500/10 rounded-full border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-2xl text-red-400 font-['Pirata_One'] tracking-wide">Parchment Sealed</p>
                                                                    <p className="text-gray-500 mt-2 text-sm">Problem statements are not yet available.</p>
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                )}
                                        </div>
                                        <style>{`
                                        .fade-in { animation: fadeIn 0.5s ease-in-out; }
                                        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                                    `}</style>
                                    </div>

                                    {/* Intel Feed (Captain's Log) */}
                                    <div className="bg-black/30 backdrop-blur-md shadow-lg border border-gray-700/60 rounded-xl p-5 sm:p-6 flex flex-col font-sans text-white hover:border-gray-500 transition-colors h-full">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 border-b border-gray-700/80">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl filter grayscale opacity-70">📜</span>
                                                <div>
                                                    <h2 className="font-bold font-['Pirata_One'] text-gray-100 text-2xl tracking-widest drop-shadow-sm">CAPTAIN'S LOG</h2>
                                                    <p className="text-xs text-gray-400 font-mono">Recent comms & alerts</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 sm:mt-0 flex flex-wrap sm:flex-nowrap gap-2">
                                                {pptData && (
                                                    <a
                                                        href={pptData.fileUrl}
                                                        download
                                                        className="px-4 py-2 text-xs sm:text-sm font-semibold bg-gray-800 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors border border-gray-600 shadow-sm flex items-center gap-2"
                                                    >
                                                        <span>📥</span> Template
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => setIsAssistanceModalOpen(true)}
                                                    className="px-4 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-white hover:from-blue-600 hover:to-indigo-600 rounded-lg transition-colors shadow-lg shadow-blue-900/40 border border-blue-500/50 flex items-center gap-2"
                                                >
                                                    <span>🚨</span> SOS
                                                </button>
                                            </div>
                                        </div>

                                        {/* Feed Timeline */}
                                        <div className="mt-5 space-y-1 overflow-y-auto pr-3 flex-grow max-h-[250px] lg:max-h-full custom-scrollbar">
                                            {intelFeed.length > 0 ? (
                                                <ul>
                                                    {intelFeed.map((item, index) => (
                                                        <li key={index} className="flex gap-4 my-4 group/item">
                                                            {/* Icon and Timeline line */}
                                                            <div className="flex flex-col items-center">
                                                                <span className={`flex items-center justify-center w-8 h-8 rounded-full shadow-md z-10 ${item.type === 'reminder' ? 'bg-amber-900/70 text-amber-400 border border-amber-500/50' : 'bg-blue-900/70 text-blue-400 border border-blue-500/50'}`}>
                                                                    {item.type === 'reminder' ? '💡' : '💬'}
                                                                </span>
                                                                {index < intelFeed.length - 1 && <div className="w-px h-full bg-gradient-to-b from-gray-600 to-transparent mt-2 group-hover/item:from-gray-400 transition-colors"></div>}
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 bg-gradient-to-r from-gray-900/60 to-gray-800/40 p-4 rounded-xl border border-gray-700/50 hover:border-gray-500/50 hover:from-gray-800/80 transition-all shadow-sm">
                                                                {item.type === 'reminder' ? (
                                                                    <>
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <p className="font-bold text-amber-400/90 text-sm tracking-wide">Admiral Command</p>
                                                                            <p className="text-[10px] text-gray-500 font-mono bg-black/40 px-2 py-0.5 rounded text-right">{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                        </div>
                                                                        <p className="text-sm text-gray-200 mt-1 leading-relaxed">{item.message}</p>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <p className="font-bold text-blue-400/90 text-sm tracking-wide">Support Request</p>
                                                                            <p className="text-[10px] text-gray-500 font-mono bg-black/40 px-2 py-0.5 rounded text-right">{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                        </div>
                                                                        <p className="text-sm text-gray-300 mt-2 p-3 bg-black/40 rounded-lg italic border border-gray-800 border-l-2 border-l-blue-500/50">"{item.text}"</p>
                                                                        <div className="mt-3 text-right">
                                                                            <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${item.status === 'Resolved' ? 'bg-green-900/50 text-green-400 border border-green-700 shadow-[0_0_8px_rgba(74,222,128,0.2)]' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-700 shadow-[0_0_8px_rgba(250,204,21,0.2)]'}`}>
                                                                                {item.status}
                                                                            </span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 h-full opacity-60">
                                                    <div className="w-16 h-16 border-2 border-gray-700 rounded-full flex items-center justify-center mb-3 border-dashed">
                                                        <span className="text-2xl">🕊️</span>
                                                    </div>
                                                    <p className="font-bold text-gray-400 font-mono text-sm uppercase tracking-widest">No Transmissions</p>
                                                </div>
                                            )}
                                        </div>
                                        <style>{`
                                        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                                        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
                                        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(75,85,99,0.5); border-radius: 10px; }
                                        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(107,114,128,0.8); }
                                    `}</style>
                                    </div>
                                </div>

                                {/* --- RIGHT COLUMN (Quests & Schedule) --- */}
                                <div className="lg:col-span-3 flex flex-col gap-6">
                                    {/* Side Quests Mini Grid */}
                                    <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-purple-500/30 p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400 transition-colors group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700"></div>

                                        <div className="flex items-center justify-between border-b border-purple-500/30 pb-3 mb-4">
                                            <h2 className="text-xl font-bold font-['Pirata_One'] text-purple-300 tracking-widest drop-shadow text-shadow flex items-center gap-2">
                                                <span>⚔️</span> SIDE QUESTS
                                            </h2>
                                        </div>

                                        <div className="flex flex-col gap-3 relative z-10">
                                            <button
                                                onClick={() => setIsGameModalOpen(true)}
                                                disabled={team.memoryGamePlayed || !isGameOpen}
                                                className="w-full p-4 bg-gradient-to-br from-indigo-700 to-indigo-900 border border-indigo-500/40 hover:from-indigo-600 hover:to-indigo-800 hover:border-indigo-400 rounded-xl text-center font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/40 flex items-center justify-between group/quest overflow-hidden relative"
                                            >
                                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/quest:opacity-100 transition-opacity"></div>
                                                <div className="flex items-center gap-3 relative z-10 w-full text-left">
                                                    <div className="w-10 h-10 bg-black/30 rounded-lg flex items-center justify-center text-xl group-disabled/quest:grayscale">
                                                        🧠
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-indigo-100 text-sm">Memory Flip</p>
                                                        {team.memoryGamePlayed ? (<p className="text-green-400 text-xs font-mono mt-0.5">Score: {team.memoryGameScore}</p>) : isGameOpen ? (<p className="text-white text-xs mt-0.5 bg-indigo-500/50 inline-block px-2 py-0.5 rounded text-[10px] uppercase">Play Now</p>) : (
                                                            <p className="text-indigo-300/70 text-[10px] font-mono mt-0.5 tracking-tighter">At {formatUnlockTime(gameOpenTime)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setIsStopTheBarModalOpen(true)}
                                                disabled={team.stopTheBarPlayed || !isBarGameOpen}
                                                className="w-full p-4 bg-gradient-to-br from-pink-700 to-pink-900 border border-pink-500/40 hover:from-pink-600 hover:to-pink-800 hover:border-pink-400 rounded-xl text-center font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-pink-500/40 flex items-center justify-between group/quest overflow-hidden relative"
                                            >
                                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/quest:opacity-100 transition-opacity"></div>
                                                <div className="flex items-center gap-3 relative z-10 w-full text-left">
                                                    <div className="w-10 h-10 bg-black/30 rounded-lg flex items-center justify-center text-xl group-disabled/quest:grayscale">
                                                        ⏱️
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-pink-100 text-sm">Sequence Challenge</p>
                                                        {team.stopTheBarPlayed ? (<p className="text-green-400 text-xs font-mono mt-0.5">Score: {team.stopTheBarScore}</p>) : isBarGameOpen ? (<p className="text-white text-xs mt-0.5 bg-pink-500/50 inline-block px-2 py-0.5 rounded text-[10px] uppercase">Play Now</p>) : (
                                                            <p className="text-pink-300/70 text-[10px] font-mono mt-0.5 tracking-tighter">At {formatUnlockTime(barGameOpenTime)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setIsNumberPuzzleModalOpen(true)}
                                                disabled={team.numberPuzzlePlayed || !isPuzzleOpen}
                                                className="w-full p-4 bg-gradient-to-br from-teal-700 to-teal-900 border border-teal-500/40 hover:from-teal-600 hover:to-teal-800 hover:border-teal-400 rounded-xl text-center font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-teal-500/40 flex items-center justify-between group/quest overflow-hidden relative"
                                            >
                                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/quest:opacity-100 transition-opacity"></div>
                                                <div className="flex items-center gap-3 relative z-10 w-full text-left">
                                                    <div className="w-10 h-10 bg-black/30 rounded-lg flex items-center justify-center text-xl group-disabled/quest:grayscale">
                                                        🔢
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-teal-100 text-sm">Number Puzzle</p>
                                                        {team.numberPuzzlePlayed ? (<p className="text-green-400 text-xs font-mono mt-0.5">Score: {team.numberPuzzleScore}</p>) : isPuzzleOpen ? (<p className="text-white text-xs mt-0.5 bg-teal-500/50 inline-block px-2 py-0.5 rounded text-[10px] uppercase">Play Now</p>) : (
                                                            <p className="text-teal-300/70 text-[10px] font-mono mt-0.5 tracking-tighter">At {formatUnlockTime(puzzleOpenTime)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Today's Schedule */}
                                    <div className="h-full">
                                        <EventSchedule
                                            domainOpenTime={domainOpenTime}
                                            isDomainOpen={DomainOpen}
                                            gameOpenTime={gameOpenTime}
                                            puzzleOpenTime={puzzleOpenTime}
                                            barGameOpenTime={barGameOpenTime}
                                            isFirstReviewOpen={isFirstReviewOpen}
                                            isSecondReviewOpen={isSecondReviewOpen}
                                            team={team}
                                            currentTime={currentTime}
                                        />
                                    </div>
                                </div>

                                {/* --- BOTTOM ROW (Badges) --- */}
                                <div className="lg:col-span-12">
                                    <BadgeWall team={team} />
                                </div>
                            </div>
                        </main>

                        {/* --- PREMIUM FOOTER SECTION --- */}
                        <footer className="flex-shrink-0 w-full bg-gradient-to-b from-black/60 to-black/90 backdrop-blur-xl border-t-2 border-cyan-800/60 py-4 z-30 relative overflow-hidden mt-auto">
                            {/* Decorative top glow */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>

                            <div className="w-full max-w-[100rem] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative z-10">
                                {/* Left: Web Design Credits */}
                                <div className="flex items-center gap-2 px-4 py-1.5 opacity-80 hover:opacity-100 transition-opacity">
                                    <span className="text-gray-400 text-[10px] font-mono uppercase tracking-[0.2em]">Design By</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-cyan-300 font-bold font-['Pirata_One'] text-lg tracking-widest">Web Development</span>

                                        <span className="text-cyan-300 font-bold font-['Pirata_One'] text-lg tracking-widest">Team</span>
                                    </div>
                                </div>

                                {/* Center: Club Logo & Tagline */}
                                <div className="flex flex-col items-center justify-center group flex-grow">
                                    <div className="p-1 rounded bg-transparent group-hover:scale-105 transition-all duration-300">
                                        <img src={hacksailr} alt="HackSail Logo" className="h-13 filter drop-shadow-md group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-500 opacity-90 group-hover:opacity-100" />
                                    </div>
                                    <span className="text-[10px] text-gray-500/80 font-mono tracking-[0.15em] uppercase mt-1">Scorecraft Kare CSE</span>
                                </div>

                                {/* Right: WhatsApp Info Button */}
                                <div>
                                    <a href="#" target="_blank" rel="noopener noreferrer" className="group/wa flex items-center justify-center gap-2 bg-[#128C7E]/20 hover:bg-[#128C7E]/40 px-4 py-2 border border-[#25D366]/30 rounded-full cursor-pointer transition-all duration-300 shadow-[0_0_10px_rgba(37,211,102,0.1)] hover:shadow-[0_0_15px_rgba(37,211,102,0.2)]">
                                        <div className="text-[#25D366] group-hover/wa:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                                            </svg>
                                        </div>
                                        <span className="text-[#25D366] group-hover/wa:text-[#E0F2F1] text-[11px] font-bold tracking-wide uppercase transition-colors">Emergency Admin SOS</span>
                                    </a>
                                </div>
                            </div>
                        </footer>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Teamdash;
