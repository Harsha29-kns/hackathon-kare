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

// Import your images
import lod from "/public/loading.gif";
import scorecraft from "/public/scorecraft.jpg";
import king from "/public/king.png";
import hackforge from "/public/hackforge.png";
import narutoLeaf from '/public/present.png';
import absent from '/public/ab.png';

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
// --- UPDATED TIMELINE COMPONENT ---


const VideoBackground = () => (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/login-video.webm" type="video/webm" />
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black/70"></div>
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
        <Modal isOpen={isOpen} onRequestClose={onClose} style={{ ...customModalStyles, content: { ...customModalStyles.content, width: '950px' } }} contentLabel="Attendance Tracker" appElement={document.getElementById('root') || undefined}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <span className="text-4xl">📊</span>
                    <div>
                        <h2 className="text-2xl font-bold text-orange-400 font-naruto">ATTENDANCE TRACKER</h2>
                        <p className="text-gray-400">Team: {team?.teamname}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl font-light">×</button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {team ? (
                    <>
                        {/* Lead Card */}
                        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                            <p className="font-bold text-lg text-yellow-300">{team.name}</p>
                            <p className="text-xs text-yellow-400/70 mb-3">Team Lead</p>
                            <div className="grid grid-cols-7 gap-2">
                                {rounds.map(round => (
                                    <div key={`lead-${round}`} className="flex flex-col items-center">
                                        <span className="text-xs font-bold text-gray-400 mb-1">R{round}</span>
                                        {attendanceIcon(getAttendanceStatus(team.lead, round))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Member Cards */}
                        {team.teamMembers.map((member, idx) => (
                            <div key={idx} className="bg-gray-800/60 p-4 rounded-lg">
                                <p className="font-semibold text-white text-lg">{member.name}</p>
                                <p className="text-xs text-gray-400/70 mb-3">Team Member</p>
                                <div className="grid grid-cols-7 gap-2">
                                    {rounds.map(round => (
                                        <div key={`member-${idx}-${round}`} className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-gray-400 mb-1">R{round}</span>
                                            {attendanceIcon(getAttendanceStatus(member, round))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <p className="text-center text-gray-400 py-8 col-span-2">Loading team attendance data...</p>
                )}
            </div>
        </Modal>
    );
};



const ReminderModal = ({ isOpen, onClose, reminderText }) => (<Modal isOpen={isOpen} onRequestClose={onClose} style={{ ...customModalStyles, content: { ...customModalStyles.content, width: '850px' } }} contentLabel="Admin Reminder" appElement={document.getElementById('root') || undefined}> <div className="flex justify-between items-center mb-6"> <div className="flex items-center gap-3"> <span className="text-3xl animate-pulse">📢</span> <h2 className="text-2xl font-bold text-yellow-400 font-naruto">IMPORTANT REMINDER</h2> </div> <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">×</button> </div> <div className="text-center text-lg bg-gray-900/50 p-6 rounded-lg border border-yellow-500/50"> <p>{reminderText}</p> </div> <div className="mt-6 flex justify-end"> <button onClick={onClose} className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700">Acknowledged</button> </div> </Modal>);
const AssistanceModal = ({ isOpen, onClose, isSubmittingIssue, issueError, issueText, setIssueText, handleIssueSubmit }) => (<Modal isOpen={isOpen} onRequestClose={onClose} style={{ ...customModalStyles, content: { ...customModalStyles.content, width: '850px' } }} contentLabel="Request Assistance" appElement={document.getElementById('root') || undefined}> <div className="text-white"> <div className="flex justify-between items-center mb-6"> <h2 className="text-2xl font-bold text-orange-400 font-naruto">Request Assistance</h2> <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl" disabled={isSubmittingIssue}>×</button> </div> {issueError && (<div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 text-center">{issueError}</div>)} <p className="text-gray-300 mb-4">If you have a technical problem or need help, please describe it below. Our team will reach you shortly.</p> <textarea value={issueText} onChange={(e) => setIssueText(e.target.value)} placeholder="Describe your problem here..." className="w-full h-40 p-4 bg-gray-700 border border-gray-600 rounded-xl" disabled={isSubmittingIssue} /> <div className="mt-6 flex justify-end gap-4"> <button onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-600 hover:bg-gray-700" disabled={isSubmittingIssue}>Cancel</button> <button onClick={handleIssueSubmit} className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50" disabled={isSubmittingIssue || !issueText.trim()}> {isSubmittingIssue ? 'Submitting...' : 'Submit Request'} </button> </div> </div> </Modal>);

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
                <h2 className="text-2xl font-bold text-yellow-400 font-naruto">{title}</h2>
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
                        <img src={lod} className="w-40 h-40" alt="Loading..." />
                        <p className="text-orange-400 font-naruto text-2xl mt-4">Confirming Your Path...</p>
                    </div>
                )}

                <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-4">
                    <h2 className="text-2xl font-bold text-orange-400 font-naruto">Choose Your Path in {selectedSet}</h2>
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
                        <img src={lod} className="w-32 h-32" alt="Loading..." />
                        <p className="text-orange-400 font-naruto text-xl mt-4">Fetching Problem Statements...</p>
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
                    <img src={lod} className="w-40 h-40" alt="Loading..." />
                    <p className="text-orange-400 font-naruto text-2xl mt-4">Saving Your Score...</p>
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
                <h2 className="text-xl font-bold font-naruto text-orange-400 tracking-wider">
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
const EventSchedule = ({ domainOpenTime, gameOpenTime, puzzleOpenTime, barGameOpenTime, isFirstReviewOpen, isSecondReviewOpen, team, currentTime }) => {
    const now = currentTime || new Date();
    const fmt = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : null;
    const tStatus = (iso, played) => played ? 'done' : !iso ? 'pending' : new Date(iso) > now ? 'upcoming' : 'open';
    const h = now.getHours();
    const items = [
        { icon: '🗂️', label: 'Domain Selection', time: fmt(domainOpenTime), status: team?.Domain ? 'done' : tStatus(domainOpenTime, false), sub: team?.Domain ? `✅ Domain selected` : domainOpenTime ? (new Date(domainOpenTime) > now ? `Opens at ${fmt(domainOpenTime)}` : '🔓 Currently Open') : 'Not opened yet' },
        { icon: '🍽️', label: 'Lunch Break', time: '01:00 PM', status: h >= 13 && h < 14 ? 'open' : h >= 14 ? 'done' : 'upcoming', sub: h >= 13 && h < 14 ? '🍛 Lunch time now!' : h >= 14 ? 'Done' : 'Upcoming' },
        { icon: '🧠', label: 'Memory Flip Game', time: fmt(gameOpenTime), status: tStatus(gameOpenTime, team?.memoryGamePlayed), sub: team?.memoryGamePlayed ? `✅ Score: ${team.memoryGameScore}` : gameOpenTime ? (new Date(gameOpenTime) > now ? `Opens at ${fmt(gameOpenTime)}` : '🔓 Open now!') : 'Not scheduled' },
        { icon: '⏱️', label: 'Sequence Challenge', time: fmt(barGameOpenTime), status: tStatus(barGameOpenTime, team?.stopTheBarPlayed), sub: team?.stopTheBarPlayed ? `✅ Score: ${team.stopTheBarScore}` : barGameOpenTime ? (new Date(barGameOpenTime) > now ? `Opens at ${fmt(barGameOpenTime)}` : '🔓 Open now!') : 'Not scheduled' },
        { icon: '🔢', label: 'Number Puzzle', time: fmt(puzzleOpenTime), status: tStatus(puzzleOpenTime, team?.numberPuzzlePlayed), sub: team?.numberPuzzlePlayed ? `✅ Score: ${team.numberPuzzleScore}` : puzzleOpenTime ? (new Date(puzzleOpenTime) > now ? `Opens at ${fmt(puzzleOpenTime)}` : '🔓 Open now!') : 'Not scheduled' },
        { icon: '📋', label: 'Review 1', time: null, status: isFirstReviewOpen ? 'open' : 'pending', sub: isFirstReviewOpen ? '🟢 Judges are reviewing now' : '⭕ Not started yet' },
        { icon: '🏆', label: 'Final Review', time: null, status: isSecondReviewOpen ? 'open' : 'pending', sub: isSecondReviewOpen ? '🟢 Final review in progress' : '⭕ Not started yet' },
        { icon: '🏁', label: 'Hackathon Ends', time: '11:00 PM', status: h >= 23 ? 'done' : 'upcoming', sub: h >= 23 ? '✅ Hackathon completed! Great work!' : '⏳ Finish & submit before this!' },
    ];
    const dot = { done: 'bg-green-400', open: 'bg-orange-400 ring-4 ring-orange-400/20 animate-pulse', upcoming: 'bg-blue-400', pending: 'bg-gray-600' };
    const card = { done: 'bg-green-900/20 border-green-500/30', open: 'bg-orange-900/20 border-orange-500/40', upcoming: 'bg-blue-900/20 border-blue-500/30', pending: 'bg-gray-800/40 border-gray-600/30' };
    const txt = { done: 'text-green-300', open: 'text-orange-300', upcoming: 'text-blue-300', pending: 'text-gray-400' };
    return (
        <div className="bg-black/20 rounded-xl border border-gray-700/50 p-5">
            <h2 className="text-xl font-bold font-naruto text-orange-400 border-b-2 border-orange-500/30 pb-2 mb-5">📅 TODAY'S SCHEDULE</h2>
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

function Teamdash() {
    // --- STATE AND LOGIC ---
    const [pass, setPass] = useState("");
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
                alert(`Error: ${data.error}`);
            } else if (data.success) {
                alert(`Successfully selected problem statement: ${data.domain.name}!`);
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
                setIsFirstReviewOpen(!!data.isFirstReviewOpen);
                setIsSecondReviewOpen(!!data.isSecondReviewOpen);
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
            alert(`Challenge Complete! Your score of ${score} has been submitted.`);
            refreshTeamData();
            setTimeout(() => {
                setIsStopTheBarModalOpen(false);
                setIsSubmittingBarScore(false);
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Error submitting score.";
            alert(errorMsg);
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
            case "Present": return (<div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mx-auto"><img src={narutoLeaf} alt="Present" className="w-5 h-5" /></div>);
            case "Absent": return (<div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mx-auto"><img src={absent} alt="Absent" className="w-5 h-5" /></div>);
            default: return (<div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mx-auto"><span className="text-gray-400 text-sm font-bold">?</span></div>);
        }
    };

    const handleGameEnd = async (score) => {
        if (!team || team.memoryGamePlayed) return;
        setIsSubmittingGameScore(true);
        try {
            await axios.post(`${api}/Hack/team/${team._id}/game-score`, { score });
            alert(`Challenge Complete! Your score of ${score} has been submitted.`);
            refreshTeamData();
            setTimeout(() => { setIsGameModalOpen(false); setIsSubmittingGameScore(false); }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "There was an error submitting your score.";
            alert(errorMsg);
            setIsSubmittingGameScore(false);
            if (err.response?.status === 403) { setIsGameModalOpen(false); }
        }
    };
    const handlePuzzleEnd = async (score) => {
        if (!team || team.numberPuzzlePlayed) return;
        setIsSubmittingPuzzleScore(true);
        try {
            await axios.post(`${api}/Hack/team/${team._id}/number-puzzle-score`, { score });
            alert(`Puzzle Complete! Your score of ${score} has been submitted.`);
            refreshTeamData();
            setTimeout(() => {
                setIsNumberPuzzleModalOpen(false);
                setIsSubmittingPuzzleScore(false);
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "There was an error submitting your score.";
            alert(errorMsg);
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
            <div className="min-h-screen flex flex-col justify-center items-center text-white p-4 font-sans overflow-hidden">
                <VideoBackground />

                <div className={`relative z-10 w-full max-w-md transition-all duration-700 ease-out ${isLoginVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
                        <div className="text-center mb-8">
                            <img src={hackforge} className="h-20 mx-auto mb-4" alt="Hackforge Logo" />
                            <h1 className="text-3xl font-bold font-naruto tracking-wider text-orange-400">Team Login</h1>
                            <p className="text-gray-400 mt-2">Welcome to the Arena</p>
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
        <div className="min-h-screen text-gray-200 font-sans bg-gray-900" style={{ backgroundImage: `url('https://www.pixelstalk.net/wp-content/uploads/2016/06/Dark-Wallpaper-HD-Desktop.jpg')`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            {logoutMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-orange-500 text-white p-8 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4 font-naruto text-orange-400">Forced Logout</h2>
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
                            <img src={lod} className="w-40 h-40" alt="Loading..." />
                            <p className="text-orange-400 font-naruto text-2xl mt-4">Saving Your Score...</p>
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
                            <img src={lod} className="w-40 h-40" alt="Loading..." />
                            <p className="text-orange-400 font-naruto text-2xl mt-4">Saving Your Score...</p>
                        </div>
                    )}
                    <StopTheBarGame onGameEnd={handleBarGameEnd} />
                </div>
            </Modal>


            {(loading || !team) ? (
                <div className="relative z-20 flex items-center justify-center h-screen">
                    <div className="text-center">
                        <img src={lod} className="w-48 h-48 mx-auto" alt="Loading" />
                        <p className="text-xl font-naruto text-orange-400 mt-4">Loading Mission...</p>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col h-screen">
                    <header className="flex-shrink-0 bg-black/30 backdrop-blur-lg border-b border-orange-500/30">
                        <div className="container mx-auto px-6 py-3 flex items-center justify-between">

                            {/* Left Section: Logo + Sector */}
                            <div className="flex items-center space-x-4">
                                <img src={hackforge} className="h-10" alt="Hackforge Icon" />
                                <p className="text-sm text-gray-400 italic">
                                    Sector{" "}
                                    <span className="font-mono font-bold text-gray-200">
                                        {team.Sector}
                                    </span>
                                </p>
                            </div>

                            {/* Center Section: Team Name */}
                            <h1 className="text-2xl font-bold text-orange-400 font-naruto tracking-widest text-center">
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


                    <main className="flex-grow max-w-7xl mx-auto px-6 pt-8 pb-6 w-full overflow-y-auto">
                        <div className="flex flex-col gap-6">

                            {/* 1. Squad */}
                            <div className="bg-slate-800/70 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-5 font-sans">
                                <div className="pb-4 mb-4">
                                    <h2 className="text-2xl font-bold text-cyan-300 tracking-wider">SQUAD ROSTER</h2>
                                </div>

                                {/* Grid Container */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Team Lead Banner (Spans full width) */}
                                    <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-cyan-500/50">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar with Star Icon */}
                                            <div className="relative">
                                                <span className="w-12 h-12 flex items-center justify-center bg-cyan-500/20 rounded-full font-bold text-cyan-300 text-xl">
                                                    {team.name && team.name.trim().charAt(0)}
                                                </span>
                                                <span className="absolute -bottom-1 -right-1 text-lg">⭐</span>
                                            </div>
                                            {/* Lead Info */}
                                            <div>
                                                <p className="font-bold text-lg text-white">{team.name}</p>
                                                <p className="text-sm text-cyan-400/70">{team.registrationNumber}</p>
                                            </div>
                                        </div>
                                        {/* QR Code */}
                                        {team.lead?.qrCode && (
                                            <button
                                                onClick={() => setViewingQr({ url: team.lead.qrCode, name: team.name })}
                                                className="bg-white p-1 rounded-lg hover:scale-105 transition-transform"
                                            >
                                                <img src={team.lead.qrCode} alt="QR Code" className="w-14 h-14" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Team Member Cards */}
                                    {team.teamMembers.map((member, i) => (
                                        <div
                                            key={i}
                                            className="group relative flex items-center justify-center h-28 bg-gray-900/50 rounded-lg overflow-hidden cursor-pointer"
                                        >
                                            {/* Member Info (Visible by default) */}
                                            <div className="flex flex-col items-center gap-2 transition-opacity duration-300 group-hover:opacity-0">
                                                <span className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full font-semibold text-gray-300">
                                                    {member.name && member.name.trim().charAt(0)}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-center text-gray-200">{member.name}</p>
                                                    <p className="text-xs text-center text-gray-400">{member.registrationNumber}</p>
                                                </div>
                                            </div>

                                            {/* QR Code (Visible on hover) */}
                                            {member.qrCode && (
                                                <div
                                                    onClick={() => setViewingQr({ url: member.qrCode, name: member.name })}
                                                    className="absolute inset-0 flex items-center justify-center p-2 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                >
                                                    <img src={member.qrCode} alt="QR Code" className="w-24 h-24" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* 2. Problem Statements (Mission Control) */}
                            <div className="bg-black/20 rounded-lg border border-gray-700/50 p-5">
                                <h2 className="text-xl font-bold font-naruto text-orange-400 border-b-2 border-orange-500/30 pb-2 mb-4">MISSION CONTROL</h2>
                                <div className="bg-gray-800/60 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg mb-3 text-center">Problem Statement Assignment</h3>
                                    {selectedProblemStatement ? (
                                        <div className="text-left py-2 px-4">
                                            <p className="text-2xl font-bold text-green-400 mb-2">{selectedProblemStatement.name}</p>
                                            <p className="text-base text-gray-300">{selectedProblemStatement.description}</p>
                                        </div>
                                    ) :
                                        team.Domain ? (
                                            <p className="text-center text-3xl font-bold text-green-400 py-2">{team.Domain}</p>
                                        ) : (
                                            DomainOpen ? (
                                                [...new Set(DomainData.map(item => item.set))].length > 0 ? (
                                                    <div className="flex gap-2 justify-center">
                                                        <button onClick={() => handleSetClick("Set 1")} className="w-full py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold">Campus Community Problem Statements</button>
                                                        <button onClick={() => handleSetClick("Set 2")} className="w-full py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold">Lifestyle & Productivity Problem Statements</button>
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-gray-400 animate-pulse">Loading statements sets...</p>
                                                )
                                            ) : (
                                                domainOpenTime ? (
                                                    <CountdownTimer targetTime={domainOpenTime} />
                                                ) : (
                                                    <div className="text-center text-gray-400 flex flex-col items-center justify-center gap-3 h-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                        <p className="font-semibold text-lg">Problem Statement selection is currently closed.</p>
                                                    </div>
                                                )
                                            )
                                        )}
                                </div>
                            </div>

                            {/* 3. Today's Schedule */}
                            <EventSchedule
                                domainOpenTime={domainOpenTime}
                                gameOpenTime={gameOpenTime}
                                puzzleOpenTime={puzzleOpenTime}
                                barGameOpenTime={barGameOpenTime}
                                isFirstReviewOpen={isFirstReviewOpen}
                                isSecondReviewOpen={isSecondReviewOpen}
                                team={team}
                                currentTime={currentTime}
                            />

                            {/* 4. Side Quests */}
                            <div className="bg-black/20 rounded-lg border border-gray-700/50 p-5">
                                <h2 className="text-xl font-bold font-naruto text-orange-400 border-b-2 border-orange-500/30 pb-2 mb-4">SIDE QUESTS</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setIsGameModalOpen(true)}
                                        disabled={team.memoryGamePlayed || !isGameOpen}
                                        className="w-full p-4 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg text-center font-bold disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 min-h-[72px]"
                                    >
                                        {team.memoryGamePlayed ? (<span className="text-lg">Flip Game Score: {team.memoryGameScore}</span>) : isGameOpen ? (<span className="text-lg">Memory Flip Challenge</span>) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                <span className="text-base">Game will Unlock at {formatUnlockTime(gameOpenTime)}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsStopTheBarModalOpen(true)}
                                        disabled={team.stopTheBarPlayed || !isBarGameOpen}
                                        className="w-full p-4 bg-pink-600/80 hover:bg-pink-700 rounded-lg text-center font-bold disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 min-h-[72px]"
                                    >
                                        {team.stopTheBarPlayed ? (
                                            <span className="text-lg"> Sequence Challenge Score: {team.stopTheBarScore}</span>
                                        ) : isBarGameOpen ? (
                                            <span className="text-lg">Sequence Challenge</span>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                <span className="text-base">Game will Unlock at {formatUnlockTime(barGameOpenTime)}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsNumberPuzzleModalOpen(true)}
                                        disabled={team.numberPuzzlePlayed || !isPuzzleOpen}
                                        className="w-full p-4 bg-teal-600/80 hover:bg-teal-700 rounded-lg text-center font-bold disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 min-h-[72px]"
                                    >
                                        {team.numberPuzzlePlayed ? (<span className="text-lg">Puzzle Score: {team.numberPuzzleScore}</span>) : isPuzzleOpen ? (<span className="text-lg">Number Puzzle Challenge</span>) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                <span className="text-base">Game will Unlock at {formatUnlockTime(puzzleOpenTime)}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* 4. Attendance and Intel Feed (Bottom Section) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Attendance */}
                                <AttendanceInfo rounds={attendanceRounds} currentTime={currentTime} onOpenModal={() => setIsAttendanceModalOpen(true)} />

                                {/* Intel Feed */}
                                <div className="bg-black rounded-lg shadow-sm border border-gray-700 p-6 flex flex-col font-sans text-white">
                                    {/* Header with Title and Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-700">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-100">Activity Log</h2>
                                            <p className="text-sm text-gray-400">Recent events and notifications.</p>
                                        </div>
                                        <div className="mt-3 sm:mt-0 flex flex-shrink-0 gap-2">
                                            {pptData && (
                                                <a
                                                    href={pptData.fileUrl}
                                                    download
                                                    className="px-4 py-2 text-sm font-semibold bg-gray-800 text-gray-100 hover:bg-gray-700 rounded-md transition-colors"
                                                >
                                                    Download "{pptData.fileName}"
                                                </a>
                                            )}
                                            <button
                                                onClick={() => setIsAssistanceModalOpen(true)}
                                                className="px-4 py-2 text-sm font-semibold bg-blue-700 text-white hover:bg-blue-600 rounded-md transition-colors"
                                            >
                                                Request Help
                                            </button>
                                        </div>
                                    </div>

                                    {/* Feed Timeline */}
                                    <div className="mt-6 space-y-1 overflow-y-auto pr-2 flex-grow min-h-[250px]">
                                        {intelFeed.length > 0 ? (
                                            <ul>
                                                {intelFeed.map((item, index) => (
                                                    <li key={index} className="flex gap-4 my-5">
                                                        {/* Icon and Timeline line */}
                                                        <div className="flex flex-col items-center">
                                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full ${item.type === 'reminder' ? 'bg-yellow-800/50 text-yellow-300' : 'bg-blue-800/50 text-blue-300'}`}>
                                                                {item.type === 'reminder' ? '💡' : '🎟️'}
                                                            </span>
                                                            {index < intelFeed.length - 1 && <div className="w-px h-full bg-gray-700 mt-2"></div>}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1">
                                                            {item.type === 'reminder' ? (
                                                                <>
                                                                    <p className="font-semibold text-gray-100">Admin Reminder</p>
                                                                    <p className="text-sm text-gray-300">{item.message}</p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <p className="font-semibold text-gray-100">Support Request</p>
                                                                    <p className="text-sm text-gray-300 my-1 p-2 bg-gray-900 rounded border border-gray-700 italic">"{item.text}"</p>
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'Resolved' ? 'bg-green-800/50 text-green-300' : 'bg-yellow-800/50 text-yellow-300'}`}>
                                                                        {item.status}
                                                                    </span>
                                                                </>
                                                            )}
                                                            <p className="text-xs text-gray-500 mt-1">{item.timestamp.toLocaleString()}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-center text-gray-500 pt-16">
                                                <span className="text-4xl">📭</span>
                                                <p className="mt-2 font-semibold">The log is empty</p>
                                                <p className="text-sm">There are no new events to display.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </main>

                </div>
            )}
        </div>
    );
}

export default Teamdash;