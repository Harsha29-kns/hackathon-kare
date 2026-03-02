import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import api from "./api.js";
import socket from "./socket";

// --- NEW RUBRICS ---
const firstReviewRubric = {
    Core: { criteria: "Core Functionality", marks: "", max: 20 },
    UIUX: { criteria: "UI/UX Design", marks: "", max: 10 },
    Technical: { criteria: "Technical Depth", marks: "", max: 10 },
    Progress: { criteria: "Progress & Team Effort", marks: "", max: 10 },
};

const secondReviewRubric = {
    functionality: { criteria: "End-to-End Functionality", marks: "", max: 15 },
    preformance: { criteria: "Scalability & Performance", marks: "", max: 10 },
    UseCase: { criteria: "Real-World Impact & Use Case", marks: "", max: 10 },
    Demo: { criteria: "Demo Quality & Communication", marks: "", max: 10 },
    extension: { criteria: "Innovation & Extension", marks: "", max: 5 },
};

// --- SVG Icons ---
const IconLogout = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const IconSearch = () => (<svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const IconCheckCircle = () => (<svg className="h-5 w-5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const IconTarget = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>);
const IconCrown = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>);

// Inline Styles for Animations
const inlineStyles = `
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slow-pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.5; } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes border-shimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
  .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
  .animate-slow-pulse { animation: slow-pulse 4s ease-in-out infinite; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 8px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(234,88,12,0.3); border-radius: 8px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(234,88,12,0.6); }
`;

function Review() {
    // --- STATE MANAGEMENT ---
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [judge, setJudge] = useState(null);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [reviewRound, setReviewRound] = useState(1);
    const [scores, setScores] = useState(firstReviewRubric);
    const [showPassword, setShowPassword] = useState(false);
    const [isFirstReviewOpen, setIsFirstReviewOpen] = useState(false);
    const [isSecondReviewOpen, setIsSecondReviewOpen] = useState(false);

    const isReviewOpen = reviewRound === 1 ? isFirstReviewOpen : isSecondReviewOpen;

    useEffect(() => {
        socket.on('reviewStatusUpdate', (status) => {
            setIsFirstReviewOpen(status.isFirstReviewOpen);
            setIsSecondReviewOpen(status.isSecondReviewOpen);
        });

        socket.emit('judge:getReviewStatus'); // Get initial status

        return () => {
            socket.off('reviewStatusUpdate');
        };
    }, []);

    useEffect(() => {
        const currentRubric = reviewRound === 1 ? firstReviewRubric : secondReviewRubric;
        setScores(currentRubric);
    }, [reviewRound]);

    useEffect(() => {
        const storedPassword = sessionStorage.getItem("judgePassword");
        if (storedPassword === "judge1" || storedPassword === "judge2") {
            setIsAuthenticated(true);
            setJudge(storedPassword);
        }
        async function fetchData() {
            if (!judge) return;

            try {
                const res = await axios.get(`${api}/Hack/review/teams/${judge}`);
                const sortedTeams = res.data.sort((a, b) => a.teamname.localeCompare(b.teamname));
                setTeams(sortedTeams);
            } catch (error) {
                console.error("Error fetching teams:", error);
                setError("Failed to load records. Connection unstable.");
            } finally {
                setLoading(false);
            }
        }
        if (isAuthenticated) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, judge]);

    const filteredTeams = useMemo(() => {
        if (!teams) return [];
        const numberedTeams = teams.map((team, index) => ({ ...team, teamNumber: index + 1 }));
        if (!searchQuery) return numberedTeams;
        return numberedTeams.filter(team =>
            team.teamname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(team.teamNumber) === searchQuery
        );
    }, [teams, searchQuery]);

    const maxMarks = useMemo(() => {
        return Object.values(scores).reduce((total, item) => total + item.max, 0);
    }, [scores]);

    // --- HANDLER FUNCTIONS ---
    const resetScoreMarks = () => {
        const currentRubric = reviewRound === 1 ? firstReviewRubric : secondReviewRubric;
        setScores(currentRubric);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === "judge1" || password === "judge2") {
            setIsAuthenticated(true);
            setJudge(password);
            sessionStorage.setItem("judgePassword", password);
            setError("");
        } else {
            setError("Authentication failed. Invalid passkey.");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setJudge(null);
        setPassword("");
        sessionStorage.removeItem("judgePassword");
    };

    const handleScoreChange = (key, value) => {
        const max = scores[key].max;
        const numValue = value === "" ? "" : Math.min(max, Math.max(0, parseInt(value, 10) || 0));
        setScores(prev => ({ ...prev, [key]: { ...prev[key], marks: numValue } }));
    };

    const calculateTotalMarks = () => {
        return Object.values(scores).reduce((total, item) => total + (Number(item.marks) || 0), 0);
    };

    const handleTeamSelect = (index) => {
        setCurrentTeamIndex(index);
        resetScoreMarks();
        setSubmitStatus(null);
    };

    const handleSubmitScores = async () => {
        const currentTeam = filteredTeams[currentTeamIndex];
        if (!currentTeam?._id) {
            setSubmitStatus({ type: 'error', message: 'Target team invalid.' });
            return;
        }

        setSubmitting(true);
        setSubmitStatus(null);
        const payload = {
            score: calculateTotalMarks(),
            ...(reviewRound === 1 && { FirstReview: scores }),
            ...(reviewRound === 2 && { SecoundReview: scores })
        };

        try {
            const endpoint = reviewRound === 1 ? 'score1' : 'score';
            await axios.post(`${api}/Hack/team/${endpoint}/${currentTeam._id}`, payload);

            const updatedTeams = [...teams];
            const teamIndexInAllTeams = teams.findIndex(t => t._id === currentTeam._id);
            if (teamIndexInAllTeams !== -1) {
                if (reviewRound === 1) {
                    updatedTeams[teamIndexInAllTeams].FirstReviewScore = calculateTotalMarks();
                    updatedTeams[teamIndexInAllTeams].FirstReview = true;
                } else if (reviewRound === 2) {
                    updatedTeams[teamIndexInAllTeams].SecoundReviewScore = calculateTotalMarks();
                    updatedTeams[teamIndexInAllTeams].SecoundReview = true;
                }
                setTeams(updatedTeams);
            }
            setSubmitStatus({ type: 'success', message: 'Evaluation committed to the ledger!' });
        } catch (error) {
            console.error("Submission Error:", error);
            const errorMessage = error.response?.data?.message || 'Transaction failed. Please try again.';
            setSubmitStatus({ type: 'error', message: errorMessage });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ backgroundImage: "url('/background.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />

                {/* Background Overlays */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] mix-blend-screen z-0 animate-slow-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] mix-blend-screen z-0"></div>

                <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                    <div className="bg-black/50 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 md:p-10 relative overflow-hidden group hover:border-orange-500/30 transition-colors duration-500">

                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>

                        <div className="text-center mb-8 space-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.4)] mb-6">
                                <IconCrown />
                            </div>
                            <h1 className="text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 font-naruto">EVALUATION DECK</h1>
                            <p className="text-gray-400 text-sm tracking-wide">Enter judge credentials to access</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6 relative">
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-12 pr-12 py-4 bg-black/50 border border-white/10 text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all font-mono tracking-widest text-lg shadow-inner"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="PASSKEY"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {error && <p className="text-red-400 text-xs text-center font-bold tracking-wide bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}
                            </div>

                            <button type="submit" disabled={submitting} className="w-full relative group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-500 hover:to-red-500 border border-orange-500/50 disabled:opacity-50 text-white py-4 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] transition-all font-bold tracking-widest uppercase hover:-translate-y-0.5 overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                {submitting ? 'Authenticating...' : 'Authorize'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gray-950 flex-col gap-6">
            <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin shadow-[0_0_15px_rgba(234,88,12,0.5)]"></div>
                <div className="absolute inset-2 rounded-full border-r-2 border-red-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
            </div>
            <p className="text-orange-500 font-mono tracking-widest text-lg animate-pulse font-bold">SYNCHRONIZING TERMINAL...</p>
        </div>
    );

    const currentTeam = currentTeamIndex !== null ? filteredTeams[currentTeamIndex] : null;
    const isAlreadyMarked = currentTeam ? (reviewRound === 1 ? currentTeam.FirstReview : currentTeam.SecoundReview) : false;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 font-sans relative overflow-hidden" style={{ backgroundImage: "url('/background.jpeg')", backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />

            {/* Background Effects */}
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-0 pointer-events-none"></div>
            <div className="fixed top-0 left-0 w-full h-[500px] bg-orange-600/5 rounded-[100%] blur-[120px] mix-blend-screen z-0 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row h-screen">

                {/* Sidebar - Team Roster */}
                <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col h-[45vh] lg:h-screen shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20">
                    <div className="p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
                        <h2 className="text-xl font-bold font-naruto text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 tracking-widest uppercase flex items-center gap-2">
                            <IconTarget /> Rosters
                        </h2>
                    </div>

                    <div className="p-4 relative">
                        <IconSearch />
                        <input
                            type="text"
                            placeholder="Filter by Name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 text-white rounded-xl pl-12 pr-4 py-3.5 border border-white/10 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all shadow-inner placeholder-gray-600 font-mono text-sm"
                        />
                    </div>

                    <div className="flex-grow overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
                        {filteredTeams.length > 0 ? (
                            filteredTeams.map((team, index) => {
                                const isMarked = reviewRound === 1 ? team.FirstReview : team.SecoundReview;
                                const isSelected = currentTeamIndex === index;
                                return (
                                    <button
                                        key={team._id}
                                        onClick={() => handleTeamSelect(index)}
                                        className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-all duration-300 border-l-4 ${isSelected ? 'bg-orange-500/10 border-orange-500 shadow-[inset_0_0_20px_rgba(234,88,12,0.1)]' : 'bg-white/[0.03] border-transparent hover:bg-white/[0.06] hover:border-orange-500/30'}`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className={`text-sm font-mono font-bold w-6 text-right ${isSelected ? 'text-orange-400' : 'text-gray-500'}`}>
                                                {team.teamNumber}.
                                            </span>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className={`font-bold truncate tracking-wide ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                    {team.teamname}
                                                </span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold truncate mt-0.5">
                                                    {team.Sector}
                                                </span>
                                            </div>
                                        </div>
                                        {isMarked && (
                                            <div className="ml-2 flex-shrink-0 animate-fade-in">
                                                <IconCheckCircle />
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-center text-gray-500 pt-8 font-mono text-sm tracking-widest">NO MATCHES FOUND</p>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-[55vh] lg:h-screen relative z-10 transition-all">

                    {/* Header Top Bar */}
                    <header className="flex-shrink-0 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-20">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <select
                                value={reviewRound}
                                onChange={(e) => { setReviewRound(Number(e.target.value)); setCurrentTeamIndex(null); }}
                                className="relative bg-black/50 border border-white/10 text-white font-bold tracking-widest text-sm uppercase px-5 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-orange-500 hover:border-orange-500/50 transition-all cursor-pointer pr-10 shadow-inner"
                            >
                                <option value={1} className="bg-gray-900">Phase 1 Evaluation</option>
                                <option value={2} className="bg-gray-900">Phase 2 Final Evaluation</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-[pulse_2s_infinite] shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                                <h2 className="text-sm font-bold tracking-widest uppercase text-gray-300">
                                    Terminal: <span className="text-orange-400">{judge === 'judge1' ? "Alpha" : "Beta"}</span>
                                </h2>
                            </div>
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded-lg transition-all text-xs font-bold uppercase tracking-wider">
                                <IconLogout /> <span className="hidden sm:inline">SignOut</span>
                            </button>
                        </div>
                    </header>

                    {/* Content Panel */}
                    {currentTeam ? (
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar flex flex-col justify-between h-full bg-black/20">

                            <div className="animate-fade-in-up flex-grow">
                                <div className="mb-8">
                                    <div className="flex flex-wrap items-center gap-4 mb-2">
                                        <h1 className="text-4xl md:text-5xl font-bold font-naruto text-white tracking-wide">
                                            <span className="text-orange-500/50 mr-3 text-3xl">#{currentTeam.teamNumber}</span>
                                            {currentTeam.teamname}
                                        </h1>
                                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest rounded-md shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                            {currentTeam.Sector} Sector
                                        </span>
                                    </div>
                                    <p className="text-gray-400 tracking-wide">Status: <strong className="text-white">{isReviewOpen ? "Awaiting Assessment..." : "Assessment Locked by Admin"}</strong></p>
                                </div>

                                {isReviewOpen ? (
                                    <div className="space-y-3">
                                        {Object.keys(scores).map((key, i) => (
                                            <div key={key} className="flex justify-between items-center bg-black/40 backdrop-blur-md border border-white/5 hover:border-orange-500/30 rounded-xl p-4 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(234,88,12,0.1)] relative overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <span className="text-lg font-bold text-white tracking-wide relative z-10 w-2/3">{scores[key].criteria}</span>
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <input
                                                        type="number"
                                                        value={scores[key].marks}
                                                        onChange={(e) => handleScoreChange(key, e.target.value)}
                                                        onWheel={(e) => e.target.blur()}
                                                        className="w-20 px-3 py-2 rounded-lg bg-white/5 text-white border border-gray-600 focus:border-orange-500 text-center text-xl font-bold font-mono focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner"
                                                        max={scores[key].max}
                                                        min="0"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-gray-500 font-bold font-mono text-xl w-10 text-right">/ {scores[key].max}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 bg-black/40 border border-white/5 rounded-3xl mt-8 text-center relative overflow-hidden">
                                        <div className="absolute -inset-10 bg-gradient-to-br from-red-500/10 to-transparent blur-3xl"></div>
                                        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white font-naruto tracking-widest mb-2">ASSESSMENT LOCKED</h2>
                                        <p className="text-gray-400">The gateway for this review phase is currently sealed by command.</p>
                                    </div>
                                )}
                            </div>

                            {/* Evaluation Action Bar */}
                            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 animate-fade-in">
                                <div className="flex items-center gap-4 bg-black/50 px-6 py-4 rounded-2xl border border-white/5 shadow-inner">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Aggregate Rating</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 font-mono tracking-tighter">
                                            {calculateTotalMarks()}
                                        </span>
                                        <span className="text-xl font-bold text-gray-600 font-mono">/{maxMarks}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {submitStatus && (
                                        <div className={`px-5 py-3 rounded-xl border flex items-center gap-2 text-sm font-bold tracking-wide animate-fade-in ${submitStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                                            {submitStatus.type === 'success' ? <IconCheckCircle /> : <span>⚠️</span>}
                                            {submitStatus.message}
                                        </div>
                                    )}

                                    {isAlreadyMarked ? (
                                        <div className="px-8 py-4 rounded-xl bg-green-500/10 text-green-400 border border-green-500/30 font-bold uppercase tracking-widest text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                                            <IconCheckCircle /> Verified & Sealed
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleSubmitScores}
                                            disabled={submitting || !isReviewOpen}
                                            className="w-full md:w-auto relative group bg-gradient-to-r from-orange-500 to-red-600 border border-orange-500/50 hover:from-orange-400 hover:to-red-500 text-white font-bold py-4 px-10 rounded-xl transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden hover:-translate-y-0.5"
                                        >
                                            <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity"></div>
                                            {submitting ? "Processing..." : "Commit Evaluation"}
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-black/20">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 opacity-50 relative animate-float">
                                <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-slow-pulse"></div>
                                <IconSearch />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-400 font-naruto tracking-widest uppercase mb-2">Awaiting Target</h2>
                            <p className="text-gray-500 max-w-sm tracking-wide">Select a crew from the roster database on the left to initialize the assessment sequence.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Review;
