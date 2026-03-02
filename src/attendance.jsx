import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "./api";
import { useLocation } from "react-router-dom";
import QrScannerModal from "./components/QrScanner";

// --- Custom Inline Styles for Premium Animations ---
const inlineStyles = `
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
  @keyframes pulse-slow { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.5; } }
  .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
  .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Custom Premium Icons ---
const IconScan = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" x2="17" y1="12" y2="12" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;

// --- Helper Components ---
const MemberRow = ({ member, status, onScan, onToggle, isDisabled }) => {
    const isPresent = status === "Present";
    const isAbsent = status === "Absent";

    // Dynamic styling based on status
    let cardBg = "bg-white/5 border-white/5 hover:bg-white/10";
    let statusGlow = "";
    if (isPresent) {
        cardBg = "bg-green-500/10 border-green-500/30";
        statusGlow = "shadow-[0_0_15px_rgba(34,197,94,0.15)]";
    } else if (isAbsent) {
        cardBg = "bg-red-500/10 border-red-500/30";
        statusGlow = "shadow-[0_0_15px_rgba(239,68,68,0.15)]";
    }

    return (
        <div className={`p-4 md:p-5 rounded-2xl transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border backdrop-blur-sm ${cardBg} ${statusGlow}`}>
            <div className="flex flex-col flex-1 pl-2">
                <h3 className="font-bold tracking-wide text-white text-lg flex items-center gap-2">
                    {member.name}
                    {member.isLead && <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-orange-500/50 tracking-wider shadow-[0_0_10px_rgba(234,88,12,0.4)]">Lead</span>}
                </h3>
                <p className="text-sm font-mono text-gray-400 mt-1">{member.registrationNumber}</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                    onClick={() => onScan(member)}
                    disabled={isDisabled}
                    className="flex-1 sm:flex-none h-12 w-12 flex items-center justify-center bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:-translate-y-0.5"
                    title={`Scan QR for ${member.name}`}>
                    <IconScan />
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => onToggle(member.registrationNumber, "Present")}
                        disabled={isDisabled}
                        className={`h-12 w-12 flex items-center justify-center rounded-xl transition-all duration-300 border ${isPresent ? "bg-green-500 text-white border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)] scale-105" : "bg-gray-800/60 text-gray-400 border-gray-700 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/50"}`}
                        title="Mark Present">
                        <IconCheck />
                    </button>
                    <button
                        onClick={() => onToggle(member.registrationNumber, "Absent")}
                        disabled={isDisabled}
                        className={`h-12 w-12 flex items-center justify-center rounded-xl transition-all duration-300 border ${isAbsent ? "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105" : "bg-gray-800/60 text-gray-400 border-gray-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"}`}
                        title="Mark Absent">
                        <IconX />
                    </button>
                </div>
            </div>
        </div>
    );
};

const AttenCard = ({ team, round }) => {
    const [attendance, setAttendance] = useState({});
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [done, setDone] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [memberToScan, setMemberToScan] = useState(null);

    useEffect(() => {
        const initialAttendance = {};
        let isSubmitted = false;

        const leadData = { ...team.lead, name: team.name, registrationNumber: team.registrationNumber, isLead: true };
        const allMembers = [leadData, ...team.teamMembers].filter(Boolean);

        allMembers.forEach(member => {
            if (member && member.attendance) {
                const memberAttd = member.attendance.find(a => a.round == round);
                if (memberAttd) {
                    initialAttendance[member.registrationNumber] = memberAttd.status;
                    if (member.isLead) isSubmitted = true;
                }
            }
        });

        setAttendance(initialAttendance);
        setDone(isSubmitted);
        setEditMode(false);
    }, [team, round]);

    const openScannerFor = (member) => {
        setMemberToScan(member);
        setIsScannerOpen(true);
    };

    const handleScan = (data) => {
        if (data) {
            setIsScannerOpen(false);
            try {
                const scannedData = JSON.parse(data.text);
                if (scannedData.teamId !== team._id) {
                    alert(`Error: This member is not from team "${team.teamname}".`);
                    setMemberToScan(null);
                    return;
                }
                if (scannedData.registrationNumber !== memberToScan.registrationNumber) {
                    const allTeamMembers = [{ name: team.name, registrationNumber: team.registrationNumber }, ...team.teamMembers];
                    const scannedMember = allTeamMembers.find((m) => m.registrationNumber === scannedData.registrationNumber);
                    const scannedMemberName = scannedMember ? scannedMember.name : "an unknown member";
                    alert(`Incorrect QR. You scanned ${scannedMemberName}'s code instead of ${memberToScan.name}'s code.`);
                    setMemberToScan(null);
                    return;
                }
                setAttendance((prev) => ({ ...prev, [scannedData.registrationNumber]: "Present" }));
                setMemberToScan(null);
            } catch (error) {
                console.error("Invalid QR code format:", error);
                alert("Invalid QR code format.");
                setMemberToScan(null);
            }
        }
    };

    const handleScanError = (err) => {
        console.error(err);
        alert("Could not start the camera. Please check permissions.");
        setIsScannerOpen(false);
        setMemberToScan(null);
    };

    const toggleAttendance = (registrationNumber, status) => {
        setAttendance((prev) => ({ ...prev, [registrationNumber]: status }));
    };

    const handleSubmit = async () => {
        const allMembers = [{ registrationNumber: team.registrationNumber }, ...team.teamMembers];
        const isComplete = allMembers.every(m => attendance[m.registrationNumber]);
        if (!isComplete) {
            alert("Please mark attendance for all members before submitting.");
            return;
        }

        try {
            await axios.post(`${api}/Hack/attendance/submit`, { teamId: team._id, roundNumber: parseInt(round), attendanceData: attendance });
            setDone(true);
            setEditMode(false);
            alert(editMode ? "Attendance updated successfully!" : "Attendance submitted successfully!");
        } catch (error) {
            alert("Error submitting attendance. Please try again.");
        }
    };

    return (
        <div className="animate-fade-in-up relative mt-6">
            {/* Glowing Orb Focus Effect */}
            <div className={`absolute -inset-4 bg-gradient-to-br ${done ? "from-green-500/20" : "from-orange-500/20"} to-transparent blur-[80px] -z-10 rounded-full opacity-60 transition-colors duration-500`}></div>

            <div className="bg-black/40 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden max-w-3xl mx-auto border border-white/10 relative z-10 hover:border-white/20 transition-all duration-300">
                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-white/5 to-transparent px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 tracking-wide font-naruto">{team.teamname}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            <p className="text-xs text-orange-200/60 tracking-widest uppercase font-semibold">Attendance File • Round {round}</p>
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg border backdrop-blur-md ${done ? "bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]"}`}>
                        {done ? "✔ Submitted" : "⏳ Pending"}
                    </span>
                </div>

                <div className="p-6 md:p-8 space-y-4">
                    <MemberRow member={{ name: team.name, registrationNumber: team.registrationNumber, isLead: true }} status={attendance[team.registrationNumber] || null} onScan={openScannerFor} onToggle={toggleAttendance} isDisabled={done && !editMode} />
                    {team.teamMembers.map((member) => <MemberRow key={member.registrationNumber} member={member} status={attendance[member.registrationNumber] || null} onScan={openScannerFor} onToggle={toggleAttendance} isDisabled={done && !editMode} />)}
                </div>

                {/* Action Footer */}
                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-end">
                    {done && <button className={`px-8 py-3.5 rounded-xl text-white font-bold tracking-wider transition-all shadow-lg text-sm ${editMode ? "bg-gray-700/80 hover:bg-gray-600 border border-gray-500/50" : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"} `} onClick={() => setEditMode(!editMode)}>{editMode ? "✕ Cancel Override" : "✏️ Override Input"}</button>}

                    {(!done || editMode) && (
                        <button
                            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 border border-orange-500/50 text-white px-10 py-3.5 rounded-xl font-bold tracking-widest text-sm uppercase shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] transition-all hover:-translate-y-0.5 whitespace-nowrap"
                            onClick={handleSubmit}>
                            {editMode ? "Confirm Override" : "Finalize Attendance"}
                        </button>
                    )}
                </div>
            </div>
            {isScannerOpen && <QrScannerModal onScan={handleScan} onError={handleScanError} onClose={() => { setIsScannerOpen(false); setMemberToScan(null); }} constraints={{ audio: false, video: { facingMode: "environment" } }} />}
        </div>
    );
}

function Attd() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedSector, setSelectedSector] = useState(null);
    const sectors = ["Naruto", "Sasuke", "Itachi"];
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const round = params.get("round") || "1";

    const sectorPasswords = {
        Naruto: "score2025",
        Sasuke: "hackforge",
        Itachi: "clubscore",
    };

    useEffect(() => {
        const storedSector = sessionStorage.getItem("sector");
        if (storedSector) {
            setIsAuthenticated(true);
            setSelectedSector(storedSector);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        async function fetchData() {
            if (!selectedSector) return;
            setLoading(true);
            try {
                const res = await axios.get(`${api}/Hack/students/${selectedSector}`);
                setTeams(res.data.teams);
            } catch (error) {
                console.error("Error fetching teams:", error);
                setError("Failed to load team data. Terminal access restricted.");
            } finally {
                setLoading(false);
            }
        }

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, selectedSector]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === sectorPasswords[selectedSector]) {
            sessionStorage.setItem("sector", selectedSector);
            setError("");
            setIsAuthenticated(true);
        } else {
            setError("Authentication failed. Invalid passkey.");
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("sector");
        setIsAuthenticated(false);
        setSelectedSector(null);
        setPassword("");
        setTeams([]);
        setSelectedTeam(null);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundImage: `url('/background.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />

                {/* Background Overlays & Decorative Elements */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] mix-blend-screen z-0 animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] mix-blend-screen z-0"></div>

                <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                    <div className="bg-black/50 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 md:p-10 relative overflow-hidden">

                        {/* Shimmer line */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>

                        {!selectedSector ? (
                            <div className="space-y-8 animate-fade-in">
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.4)] mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                    </div>
                                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-naruto tracking-wider drop-shadow-sm">Access Portal</h2>
                                    <p className="text-gray-400 text-sm tracking-wide">Select your assigned sector to continue</p>
                                </div>
                                <div className="space-y-4">
                                    {sectors.map(sector => (
                                        <button
                                            key={sector}
                                            onClick={() => setSelectedSector(sector)}
                                            className="w-full relative group bg-white/[0.03] hover:bg-white/10 border border-white/10 hover:border-orange-500/50 text-white py-4 rounded-xl shadow-lg transition-all duration-300 overflow-hidden flex items-center justify-between px-6">
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <span className="relative z-10 font-naruto text-xl tracking-wider">{sector}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-orange-400 transform group-hover:translate-x-1 transition-all"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-8 animate-fade-in relative">
                                <button
                                    type="button"
                                    onClick={() => { setSelectedSector(null); setError(""); setPassword(""); }}
                                    className="absolute -top-4 -left-4 p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
                                </button>

                                <div className="text-center space-y-2 mt-4">
                                    <h2 className="text-3xl font-bold text-white font-naruto tracking-wider uppercase">{selectedSector} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Sector</span></h2>
                                    <p className="text-gray-400 text-sm tracking-wide">Enter secure passkey</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all font-mono tracking-[0.3em] text-lg shadow-inner"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    {error && <p className="text-red-400 text-xs text-center font-bold tracking-wide bg-red-500/10 py-3 rounded-xl border border-red-500/20 animate-shake">{error}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full relative group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 border border-orange-500/50 text-white py-4 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] transition-all font-bold tracking-widest uppercase hover:-translate-y-0.5 overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                    Authenticate
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 font-sans relative overflow-x-hidden" style={{ backgroundImage: `url('/background1.jpeg')`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />

            {/* Background elements */}
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-0 pointer-events-none"></div>
            <div className="fixed top-0 left-1/4 w-[800px] h-[500px] bg-orange-600/10 rounded-[100%] blur-[120px] mix-blend-screen z-0 pointer-events-none transform -translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="sticky top-0 bg-black/40 backdrop-blur-3xl border-b border-white/10 z-50">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-orange-400 to-red-600 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.5)]"></div>
                            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500 font-naruto tracking-widest uppercase shadow-black drop-shadow-lg">
                                {selectedSector} <span className="opacity-50 text-white font-sans text-sm tracking-normal font-semibold">| R {round}</span>
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 text-gray-300 hover:text-red-400 rounded-xl transition-all duration-300 font-bold text-xs tracking-wider uppercase">
                            <IconLogout /> <span className="hidden sm:inline">Terminate</span>
                        </button>
                    </div>
                </header>

                <main className="container mx-auto p-4 md:p-8 md:pt-12 flex-grow">
                    {loading ? (
                        <div className="flex justify-center items-center flex-col h-[60vh] gap-8">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin shadow-[0_0_15px_rgba(234,88,12,0.5)]"></div>
                                <div className="absolute inset-2 rounded-full border-r-2 border-red-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                            </div>
                            <p className="text-orange-500 font-mono tracking-widest animate-pulse font-bold text-lg">SYNCING DATA...</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-8 relative group animate-fade-in-up">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div className="relative flex items-center bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 hover:border-orange-500/40 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                    <div className="pl-5 pr-3 text-orange-500">
                                        <IconSearch />
                                    </div>
                                    <select
                                        value={selectedTeam || ""}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                        className="w-full bg-transparent text-white text-lg px-2 py-4 appearance-none focus:outline-none cursor-pointer tracking-wide font-medium flex-1 hide-scrollbar">
                                        <option value="" className="bg-gray-900 text-gray-400">Scan directory for target team...</option>
                                        {teams.map((t) => <option key={t._id} value={t._id} className="bg-gray-900 text-white font-sans text-base">{t.teamname}</option>)}
                                    </select>
                                    <div className="pr-5 text-gray-500 pointer-events-none group-hover:text-orange-400 transition-colors">
                                        <IconChevronDown />
                                    </div>
                                </div>
                            </div>

                            <div className="transition-all duration-500 min-h-[500px]">
                                {selectedTeam ? (
                                    <AttenCard team={teams.find((t) => t._id === selectedTeam)} round={round} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 bg-black/30 backdrop-blur-md border border-white/5 rounded-[2rem] mt-12 text-center relative overflow-hidden animate-fade-in-up">
                                        <div className="absolute -inset-10 bg-gradient-to-br from-orange-500/10 to-transparent blur-3xl opacity-50"></div>
                                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                            <div className="text-orange-500/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3 font-naruto tracking-wider">AWAITING TARGET SELECTION</h3>
                                        <p className="text-gray-400 max-w-sm tracking-wide leading-relaxed">Select a team from the dropdown directory above to access their personnel records and begin the attendance marking procedure.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Attd;