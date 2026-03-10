import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import api from "./api.js";
import socket from "./socket";

// --- RUBRICS ---
const firstReviewRubric = {
    Core: { criteria: "Problem Understanding & Solution Clarity", marks: "", max: 10 },
    UIUX: { criteria: "Innovation & Approach", marks: "", max: 10 },
    Technical: { criteria: "Working Prototype & Core Functionality", marks: "", max: 15 },
    Progress: { criteria: "Technical Feasibility & System Architecture", marks: "", max: 10 },
    team: { criteria: "Team Collaboration & Development Progress", marks: "", max: 5 },
};

const secondReviewRubric = {
    functionality: { criteria: "End-to-End System Functionality", marks: "", max: 15 },
    preformance: { criteria: "Technical Implementation & Code Quality", marks: "", max: 10 },
    UseCase: { criteria: "UI/UX Design & User Experience", marks: "", max: 10 },
    Demo: { criteria: "Real-World Impact, Innovation & Scalability", marks: "", max: 10 },
    extension: { criteria: "Jury Presentation, Demo Quality & Communication", marks: "", max: 5 },
};


// --- SVG Icons ---
const IconSkull = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40" fill="currentColor">
        <path d="M50 5C28 5 14 20 14 38c0 12 6 22 15 28v10h10v8h22v-8h10V66c9-6 15-16 15-28C86 20 72 5 50 5zm-14 38a8 8 0 1 1 16 0 8 8 0 0 1-16 0zm28 0a8 8 0 1 1 16 0 8 8 0 0 1-16 0z" />
    </svg>
);
const IconAnchor = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3" /><line x1="12" y1="22" x2="12" y2="8" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </svg>
);
const IconCompass = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
);
const IconScroll = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);
const IconSeal = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const IconLock = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
const IconKey = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
);
const IconLogout = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const IconWave = () => (
    <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-auto">
        <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1440,20 1440,40 L1440,80 L0,80 Z" fill="rgba(212,175,55,0.07)" />
    </svg>
);

// ── Inline Styles ──────────────────────────────────────────────────────────────
const inlineStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=IM+Fell+English:ital@0;1&display=swap');

  :root {
    --gold: #d4af37;
    --gold-light: #f0d060;
    --gold-dark: #a07820;
    --navy: #0a0e1a;
    --navy-mid: #101628;
    --navy-light: #1a2340;
    --parchment: #c8a96e;
    --rust: #8b2500;
    --wood: #3d1e0a;
  }

  @keyframes fadeUp { from { opacity:0; transform:translateY(24px);} to { opacity:1; transform:translateY(0);} }
  @keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
  @keyframes waveDrift { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-30px)} }
  @keyframes lanternSway { 0%,100%{transform:rotate(-4deg);} 50%{transform:rotate(4deg);} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes slowPulse { 0%,100%{opacity:0.15} 50%{opacity:0.4} }
  @keyframes float {0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes spinSlow { from{transform:rotate(0)} to{transform:rotate(360deg)} }

  .font-pirata { font-family: 'Pirata One', cursive; }
  .font-parchment { font-family: 'IM Fell English', serif; }

  .animate-fade-up { animation: fadeUp 0.7s ease-out forwards; }
  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
  .animate-wave { animation: waveDrift 8s ease-in-out infinite; }
  .animate-sway { animation: lanternSway 3s ease-in-out infinite; }
  .animate-slow-pulse { animation: slowPulse 4s ease-in-out infinite; }
  .animate-float { animation: float 5s ease-in-out infinite; }
  .animate-spin-slow { animation: spinSlow 20s linear infinite; }

  .gold-shimmer {
    background: linear-gradient(90deg, var(--gold-dark), var(--gold-light), var(--gold-dark));
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .rope-border {
    border: 2px solid transparent;
    background: linear-gradient(var(--navy-mid), var(--navy-mid)) padding-box,
                repeating-linear-gradient(45deg, var(--gold-dark) 0px, var(--gold-dark) 4px, transparent 4px, transparent 8px) border-box;
  }

  .glass-card {
    background: rgba(10,14,26,0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .parchment-card {
    background: rgba(25,18,8,0.85);
    backdrop-filter: blur(12px);
  }

  .skull-bg::before {
    content: '☠';
    position: absolute;
    font-size: 220px;
    opacity: 0.025;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    pointer-events: none;
    color: var(--gold);
  }

  .team-btn {
    transition: all 0.25s ease;
    border-left: 3px solid transparent;
  }
  .team-btn:hover {
    border-left-color: var(--gold-dark);
    background: rgba(212,175,55,0.07);
  }
  .team-btn.active {
    border-left-color: var(--gold);
    background: rgba(212,175,55,0.12);
    box-shadow: inset 0 0 30px rgba(212,175,55,0.05);
  }

  .score-row {
    background: rgba(16,22,40,0.8);
    border: 1px solid rgba(212,175,55,0.12);
    transition: all 0.2s;
  }
  .score-row:hover {
    border-color: rgba(212,175,55,0.35);
    background: rgba(212,175,55,0.05);
  }

  .score-input {
    background: rgba(0,0,0,0.5);
    border: 1px solid rgba(212,175,55,0.25);
    color: var(--gold-light);
    text-align: center;
    font-family: 'Pirata One', cursive;
    font-size: 1.3rem;
    transition: all 0.2s;
    outline: none;
  }
  .score-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 12px rgba(212,175,55,0.3);
  }

  .submit-btn {
    background: linear-gradient(135deg, #8b6914, #d4af37, #8b6914);
    background-size: 200% auto;
    transition: all 0.3s;
    color: #0a0e1a;
    font-family: 'Pirata One', cursive;
    letter-spacing: 0.1em;
    border: 1px solid var(--gold);
    box-shadow: 0 0 20px rgba(212,175,55,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .submit-btn:hover:not(:disabled) {
    background-position: right center;
    box-shadow: 0 0 35px rgba(212,175,55,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
    transform: translateY(-2px);
  }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .custom-scrollbar::-webkit-scrollbar { width: 5px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.6); }

  .stars {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 55% 25%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 75% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 45%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 20% 90%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(1px 1px at 65% 55%, rgba(255,255,255,0.35) 0%, transparent 100%);
  }
`;

// ── Component ──────────────────────────────────────────────────────────────────
function Review() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [judge, setJudge] = useState(null); // "judge1" or "judge2" (backend ID)
    const [judgeDisplay, setJudgeDisplay] = useState(""); // display name
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [reviewRound, setReviewRound] = useState(1);
    const [scores, setScores] = useState(firstReviewRubric);
    const [showPassword, setShowPassword] = useState(false);
    const [isFirstReviewOpen, setIsFirstReviewOpen] = useState(false);
    const [isSecondReviewOpen, setIsSecondReviewOpen] = useState(false);

    const isReviewOpen = reviewRound === 1 ? isFirstReviewOpen : isSecondReviewOpen;

    // Socket – review status
    useEffect(() => {
        socket.on('reviewStatusUpdate', (status) => {
            setIsFirstReviewOpen(status.isFirstReviewOpen);
            setIsSecondReviewOpen(status.isSecondReviewOpen);
        });
        socket.emit('judge:getReviewStatus');
        return () => { socket.off('reviewStatusUpdate'); };
    }, []);

    // Session restore
    useEffect(() => {
        const token = sessionStorage.getItem("judgeToken");
        const storedJudgeDisplay = sessionStorage.getItem("judgeDisplay");
        const storedJudgeId = sessionStorage.getItem("judgeId");

        if (token && storedJudgeId) {
            setIsAuthenticated(true);
            setJudge(storedJudgeId);
            setJudgeDisplay(storedJudgeDisplay || "Judge");
        } else {
            setLoading(false);
        }
    }, []);

    // Rubric reset on round change
    useEffect(() => {
        setScores(reviewRound === 1 ? firstReviewRubric : secondReviewRubric);
    }, [reviewRound]);

    // Fetch teams whenever judge is set
    useEffect(() => {
        if (!isAuthenticated || !judge) return;
        async function fetchData() {
            try {
                const res = await axios.get(`${api}/Hack/review/teams/${judge}`);
                const sorted = res.data.sort((a, b) => a.teamname.localeCompare(b.teamname));
                setTeams(sorted);
            } catch (err) {
                console.error("Error fetching teams:", err);
                setError("Failed to load the crew manifest. Sea connection unstable.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [isAuthenticated, judge]);

    const filteredTeams = useMemo(() => {
        if (!teams) return [];
        const numbered = teams.map((t, i) => ({ ...t, teamNumber: i + 1 }));
        if (!searchQuery) return numbered;
        return numbered.filter(t =>
            t.teamname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(t.teamNumber) === searchQuery
        );
    }, [teams, searchQuery]);

    const maxMarks = useMemo(() =>
        Object.values(scores).reduce((s, i) => s + i.max, 0)
        , [scores]);

    const resetScoreMarks = () => setScores(reviewRound === 1 ? firstReviewRubric : secondReviewRubric);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            let assumedIdentifier = "";
            if (password === "Harsha@35") assumedIdentifier = "judge1";
            else if (password === "Bhuvan@43") assumedIdentifier = "judge2";
            else assumedIdentifier = "unknown"; // will fail auth

            const response = await axios.post(`${api}/api/Hack/auth/login`, {
                identifier: assumedIdentifier,
                password: password
            });

            if (response.data.token) {
                const judgeId = response.data.identifier; // 'judge1'
                setIsAuthenticated(true);
                setJudge(judgeId);
                setJudgeDisplay(password);
                sessionStorage.setItem("judgeToken", response.data.token);
                sessionStorage.setItem("judgeId", judgeId);
                sessionStorage.setItem("judgeDisplay", password);
                setError("");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Invalid passkey. The Black Pearl denies entry.");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setJudge(null);
        setJudgeDisplay("");
        setPassword("");
        setTeams([]);
        sessionStorage.removeItem("judgeToken");
        sessionStorage.removeItem("judgeId");
        sessionStorage.removeItem("judgeDisplay");
    };

    const handleScoreChange = (key, value) => {
        const max = scores[key].max;
        const num = value === "" ? "" : Math.min(max, Math.max(0, parseInt(value, 10) || 0));
        setScores(prev => ({ ...prev, [key]: { ...prev[key], marks: num } }));
    };

    const calculateTotal = () =>
        Object.values(scores).reduce((s, i) => s + (Number(i.marks) || 0), 0);

    const handleTeamSelect = (index) => {
        setCurrentTeamIndex(index);
        resetScoreMarks();
        setSubmitStatus(null);
    };

    const handleSubmitScores = async () => {
        const currentTeam = filteredTeams[currentTeamIndex];
        if (!currentTeam?._id) {
            setSubmitStatus({ type: 'error', message: 'No crew selected.' });
            return;
        }
        setSubmitting(true);
        setSubmitStatus(null);
        const payload = {
            score: calculateTotal(),
            ...(reviewRound === 1 && { FirstReview: scores }),
            ...(reviewRound === 2 && { SecoundReview: scores }),
        };
        try {
            const endpoint = reviewRound === 1 ? 'score1' : 'score';
            await axios.post(`${api}/Hack/team/${endpoint}/${currentTeam._id}`, payload);
            const updated = [...teams];
            const idx = teams.findIndex(t => t._id === currentTeam._id);
            if (idx !== -1) {
                if (reviewRound === 1) {
                    updated[idx].FirstReviewScore = calculateTotal();
                    updated[idx].FirstReview = true;
                } else {
                    updated[idx].SecoundReviewScore = calculateTotal();
                    updated[idx].SecoundReview = true;
                }
                setTeams(updated);
            }
            setSubmitStatus({ type: 'success', message: 'Entry sealed in the ship\'s log!' });
        } catch (err) {
            setSubmitStatus({ type: 'error', message: err.response?.data?.message || 'Transaction failed. Try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const judgeLabel = judge === 'judge1' ? 'First Mate' : 'Quartermaster';

    // ── LOGIN SCREEN ───────────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #050810 0%, #0a0e1a 50%, #0d1520 100%)' }}>
                <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
                <div className="stars" />

                {/* Ocean glow */}
                <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(10,40,80,0.4), transparent)' }} />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none animate-slow-pulse"
                    style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />

                <div className="relative z-10 w-full max-w-md px-4 animate-fade-up">
                    {/* Card */}
                    <div className="relative rounded-2xl overflow-hidden"
                        style={{ background: 'linear-gradient(160deg, rgba(20,14,5,0.95) 0%, rgba(10,8,20,0.98) 100%)', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.05)' }}>

                        {/* Gold top line */}
                        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />

                        <div className="p-8 md:p-10">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
                                        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0.5) 100%)', border: '1px solid rgba(212,175,55,0.3)' }}>
                                        <span className="text-4xl animate-sway inline-block">☠️</span>
                                    </div>
                                </div>
                                <h1 className="font-pirata text-4xl mb-1" style={{ color: '#d4af37', textShadow: '0 0 20px rgba(212,175,55,0.4)' }}>
                                    Captain's Log
                                </h1>
                                <p className="font-parchment text-sm italic" style={{ color: 'rgba(200,169,110,0.7)' }}>
                                    Speak the secret and enter, or be cast overboard
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))' }} />
                                <IconAnchor />
                                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none" style={{ color: 'rgba(212,175,55,0.5)' }}>
                                        <IconKey />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter Passkey..."
                                        required
                                        className="w-full pl-12 pr-12 py-4 rounded-xl font-parchment text-base tracking-widest"
                                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.2)', color: '#f0d060', outline: 'none' }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
                                    />
                                    <button type="button" onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
                                        style={{ color: 'rgba(212,175,55,0.5)' }}>
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>

                                {error && (
                                    <div className="text-center py-3 px-4 rounded-xl text-sm font-parchment"
                                        style={{ background: 'rgba(139,37,0,0.2)', border: '1px solid rgba(139,37,0,0.4)', color: '#f87171' }}>
                                        ⚓ {error}
                                    </div>
                                )}

                                <button type="submit" className="submit-btn w-full py-4 rounded-xl text-lg font-bold uppercase">
                                    ⚓ Board the Ship
                                </button>
                            </form>
                        </div>

                        {/* Gold bottom line */}
                        <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />
                    </div>

                    <p className="text-center mt-4 text-xs font-parchment italic" style={{ color: 'rgba(200,169,110,0.4)' }}>
                        HackSail 2K26 · Evaluation Deck · Authorized Personnel Only
                    </p>
                </div>
            </div>
        );
    }

    // ── LOADING ────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center gap-6"
            style={{ background: 'linear-gradient(160deg, #050810, #0a0e1a)' }}>
            <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
            <div className="animate-spin-slow text-6xl">🧭</div>
            <p className="font-pirata text-xl tracking-widest animate-pulse" style={{ color: '#d4af37' }}>
                Charting the Seas...
            </p>
        </div>
    );

    const currentTeam = currentTeamIndex !== null ? filteredTeams[currentTeamIndex] : null;
    const isAlreadyMarked = currentTeam ? (reviewRound === 1 ? currentTeam.FirstReview : currentTeam.SecoundReview) : false;

    // ── MAIN DASHBOARD ─────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen text-gray-200"
            style={{ background: 'linear-gradient(160deg, #050810 0%, #0a0e1a 50%, #08121e 100%)' }}>
            <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
            <div className="stars" />

            {/* Ambient glows */}
            <div className="fixed top-0 left-0 w-full h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />
            <div className="fixed top-0 left-0 w-1/3 h-96 pointer-events-none animate-slow-pulse"
                style={{ background: 'radial-gradient(ellipse at top left, rgba(212,100,10,0.07), transparent)' }} />
            <div className="fixed bottom-0 right-0 w-1/3 h-64 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at bottom right, rgba(10,50,100,0.15), transparent)' }} />

            <div className="relative z-10 flex flex-col lg:flex-row h-screen">

                {/* ── SIDEBAR ── */}
                <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col h-[45vh] lg:h-screen z-20"
                    style={{ background: 'rgba(5,8,16,0.9)', borderRight: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(20px)' }}>

                    {/* Sidebar Header */}
                    <div className="p-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">🗺️</span>
                            <h2 className="font-pirata text-xl tracking-wider gold-shimmer">Crew Manifest</h2>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(212,175,55,0.5)' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search crew by name or #..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-parchment"
                                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.15)', color: '#d4af37', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                            />
                        </div>
                    </div>

                    {/* Team count pill */}
                    <div className="px-5 py-2 flex-shrink-0">
                        <span className="text-xs font-parchment tracking-widest" style={{ color: 'rgba(212,175,55,0.5)' }}>
                            {filteredTeams.length} crew aboard
                        </span>
                    </div>

                    {/* Team List */}
                    <div className="flex-grow overflow-y-auto px-3 pb-4 space-y-1.5 custom-scrollbar">
                        {filteredTeams.length > 0 ? (
                            filteredTeams.map((team, index) => {
                                const isMarked = reviewRound === 1 ? team.FirstReview : team.SecoundReview;
                                const isSelected = currentTeamIndex === index;
                                return (
                                    <button key={team._id} onClick={() => handleTeamSelect(index)}
                                        className={`team-btn w-full text-left px-4 py-3 rounded-xl flex items-center justify-between ${isSelected ? 'active' : ''}`}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-xs font-mono font-bold w-6 text-right flex-shrink-0"
                                                style={{ color: isSelected ? '#d4af37' : 'rgba(212,175,55,0.4)' }}>
                                                {team.teamNumber}
                                            </span>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="font-parchment font-bold truncate"
                                                    style={{ color: isSelected ? '#f0d060' : '#b0a080' }}>
                                                    {team.teamname}
                                                </span>
                                                <span className="text-[10px] tracking-widest uppercase truncate"
                                                    style={{ color: 'rgba(212,175,55,0.4)' }}>
                                                    {team.Sector} Sector
                                                </span>
                                            </div>
                                        </div>
                                        {isMarked && (
                                            <span className="ml-2 flex-shrink-0 text-green-400 animate-fade-in" title="Scored">
                                                <IconSeal />
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="text-center pt-10">
                                <p className="font-pirata text-lg" style={{ color: 'rgba(212,175,55,0.4)' }}>No Crew Found</p>
                                <p className="text-xs mt-1 font-parchment" style={{ color: 'rgba(200,169,110,0.3)' }}>The seas are empty...</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className="flex-1 flex flex-col h-[55vh] lg:h-screen relative z-10">

                    {/* Top Bar */}
                    <header className="flex-shrink-0 px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 z-20"
                        style={{ background: 'rgba(5,8,16,0.95)', borderBottom: '1px solid rgba(212,175,55,0.12)', backdropFilter: 'blur(20px)' }}>

                        {/* Phase selector */}
                        <div className="flex items-center gap-3">
                            <span style={{ color: 'rgba(212,175,55,0.6)' }}><IconCompass /></span>
                            <select
                                value={reviewRound}
                                onChange={e => { setReviewRound(Number(e.target.value)); setCurrentTeamIndex(null); }}
                                className="font-pirata text-sm tracking-wider px-4 py-2 rounded-lg appearance-none cursor-pointer"
                                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37', outline: 'none' }}>
                                <option value={1} className="bg-gray-900"> Phase I — First Review</option>
                                <option value={2} className="bg-gray-900"> Phase II — Final Review</option>
                            </select>
                        </div>

                        {/* Judge + logout */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(74,222,128,0.7)' }} />
                                <span className="font-parchment text-sm" style={{ color: 'rgba(212,175,55,0.8)' }}>
                                    {judgeLabel}: <span style={{ color: '#f0d060' }}>{judge === 'judge1' ? 'Harsha' : 'Bhuvan'}</span>
                                </span>
                            </div>
                            <button onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                                style={{ border: '1px solid rgba(139,37,0,0.4)', color: 'rgba(248,113,113,0.7)', background: 'rgba(139,37,0,0.1)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,37,0,0.25)'; e.currentTarget.style.color = '#f87171'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,37,0,0.1)'; e.currentTarget.style.color = 'rgba(248,113,113,0.7)'; }}>
                                <IconLogout /> <span className="hidden sm:inline">Log out</span>
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    {currentTeam ? (
                        <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar flex flex-col gap-6">

                            {/* Team Title */}
                            <div className="animate-fade-up">
                                <div className="flex flex-wrap items-start gap-3 mb-1">
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-mono text-2xl" style={{ color: 'rgba(212,175,55,0.4)' }}>
                                                #{currentTeam.teamNumber}
                                            </span>
                                            <h1 className="font-pirata text-4xl md:text-5xl" style={{ color: '#f0d060', textShadow: '0 0 20px rgba(212,175,55,0.25)' }}>
                                                {currentTeam.teamname}
                                            </h1>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                                                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37' }}>
                                                {currentTeam.Sector}
                                            </span>
                                        </div>
                                        <p className="font-parchment text-sm mt-1" style={{ color: 'rgba(200,169,110,0.6)' }}>
                                            Status: <em className="not-italic" style={{ color: isReviewOpen ? '#86efac' : '#f87171' }}>
                                                {isReviewOpen ? 'Awaiting Judgment...' : 'Gates Sealed by Order of the Captain'}
                                            </em>
                                        </p>
                                    </div>
                                </div>

                                {/* Rope divider */}
                                <div className="mt-4 h-px w-full" style={{ background: 'repeating-linear-gradient(90deg, rgba(212,175,55,0.2) 0px, rgba(212,175,55,0.2) 6px, transparent 6px, transparent 12px)' }} />
                            </div>

                            {/* Scoring Panel */}
                            {isReviewOpen ? (
                                <div className="space-y-2.5 animate-fade-up flex-grow">
                                    {Object.keys(scores).map((key, i) => (
                                        <div key={key} className="score-row rounded-xl px-5 py-4 flex items-center justify-between"
                                            style={{ animationDelay: `${i * 80}ms` }}>
                                            <div className="flex items-center gap-3">
                                                <span style={{ color: 'rgba(212,175,55,0.4)' }}><IconScroll /></span>
                                                <span className="font-parchment font-bold text-base" style={{ color: '#c8a96e' }}>
                                                    {scores[key].criteria}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <input
                                                    type="number"
                                                    value={scores[key].marks}
                                                    onChange={e => handleScoreChange(key, e.target.value)}
                                                    onWheel={e => e.target.blur()}
                                                    className="score-input w-16 py-2 rounded-lg"
                                                    max={scores[key].max}
                                                    min="0"
                                                    placeholder="0"
                                                />
                                                <span className="font-pirata text-base w-8 text-right" style={{ color: 'rgba(212,175,55,0.45)' }}>
                                                    /{scores[key].max}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center py-16 rounded-2xl animate-fade-up"
                                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,37,0,0.3)' }}>
                                    <div className="text-6xl mb-4 animate-float">🔒</div>
                                    <h2 className="font-pirata text-3xl mb-2" style={{ color: '#f87171', textShadow: '0 0 20px rgba(239,68,68,0.3)' }}>
                                        Admin locked
                                    </h2>
                                    <p className="font-parchment text-center max-w-sm" style={{ color: 'rgba(200,169,110,0.5)' }}>
                                        The Captain has locked this review phase. Stand by for orders.
                                    </p>
                                </div>
                            )}

                            {/* Footer Action Bar */}
                            <div className="flex-shrink-0 pt-4 flex flex-col md:flex-row justify-between items-center gap-4"
                                style={{ borderTop: '1px solid rgba(212,175,55,0.12)' }}>

                                {/* Total score */}
                                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl"
                                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.15)' }}>
                                    <span className="font-pirata text-sm tracking-widest uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                                        Total Bounty
                                    </span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-pirata text-4xl gold-shimmer">{calculateTotal()}</span>
                                        <span className="font-pirata text-xl" style={{ color: 'rgba(212,175,55,0.4)' }}>/{maxMarks}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {submitStatus && (
                                        <div className={`px-4 py-3 rounded-xl text-sm font-parchment flex items-center gap-2 animate-fade-in`}
                                            style={{
                                                background: submitStatus.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                border: `1px solid ${submitStatus.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                                color: submitStatus.type === 'success' ? '#86efac' : '#f87171'
                                            }}>
                                            {submitStatus.type === 'success' ? '⚓' : '⚠️'} {submitStatus.message}
                                        </div>
                                    )}

                                    {isAlreadyMarked ? (
                                        <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-pirata tracking-widest uppercase text-sm"
                                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', boxShadow: '0 0 15px rgba(34,197,94,0.1)' }}>
                                            <IconSeal /> Log Sealed
                                        </div>
                                    ) : (
                                        <button onClick={handleSubmitScores}
                                            disabled={submitting || !isReviewOpen}
                                            className="submit-btn w-full md:w-auto px-8 py-4 rounded-xl text-base">
                                            {submitting ? '⏳ Recording...' : '📜 Seal in the Log'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12"
                            style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <div className="relative animate-float">
                                <div className="absolute inset-0 rounded-full animate-slow-pulse"
                                    style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.1), transparent)' }} />
                                <span className="text-7xl relative z-10" style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.3))' }}>🧭</span>
                            </div>
                            <div className="text-center">
                                <h2 className="font-pirata text-3xl mb-2" style={{ color: 'rgba(212,175,55,0.6)' }}>
                                    Awaiting Orders, Captain
                                </h2>
                                <p className="font-parchment text-center max-w-sm" style={{ color: 'rgba(200,169,110,0.4)' }}>
                                    Select a crew from the manifest on the left to begin the assessment voyage.
                                </p>
                            </div>
                            <div className="flex gap-3 text-2xl opacity-30">
                                <span>⚓</span><span>🏴‍☠️</span><span>⚓</span>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Review;
