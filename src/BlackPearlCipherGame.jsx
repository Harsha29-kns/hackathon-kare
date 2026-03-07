import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ── CIPHER KEY ─────────────────────────────────────────────────────────────────
// Each pirate symbol maps to a letter. Fixed mapping — players must figure it out.
const CIPHER = {
    '⚓': 'A', '🏴': 'B', '🦜': 'C', '💀': 'D', '🌊': 'E',
    '🔱': 'F', '⚔️': 'G', '🗺️': 'H', '🪝': 'I', '💣': 'J',
    '⛵': 'K', '🦁': 'L', '🌙': 'M', '🏝️': 'N', '🔭': 'O',
    '🪙': 'P', '☠️': 'Q', '⛈️': 'R', '🧭': 'S', '🌴': 'T',
    '🕯️': 'U', '🏹': 'V', '💎': 'W', '🦅': 'X', '⚡': 'Y',
    '🐚': 'Z',
};
// Reverse: letter → symbol
const REVERSE_CIPHER = Object.fromEntries(Object.entries(CIPHER).map(([k, v]) => [v, k]));

const encode = (word) => word.split('').map(ch => REVERSE_CIPHER[ch.toUpperCase()] || ch).join(' ');

// ── WORD BANK ──────────────────────────────────────────────────────────────────
// 10 themed words of increasing complexity
const WORD_BANK = [
    { word: 'SHIP', hint: '🚢 Sails the ocean', pts: 10 },
    { word: 'GOLD', hint: '💰 Pirate treasure metal', pts: 10 },
    { word: 'CREW', hint: '👥 Your mates on board', pts: 10 },
    { word: 'REEF', hint: '🪸 Underwater hazard', pts: 10 },
    { word: 'STORM', hint: '⛈️ Dangerous weather at sea', pts: 10 },
    { word: 'BLADE', hint: '⚔️ A pirate\'s weapon', pts: 10 },
    { word: 'ISLAND', hint: '🏝️ Land in the ocean', pts: 10 },
    { word: 'ANCHOR', hint: '⚓ Keeps the ship in place', pts: 10 },
    { word: 'CAPTAIN', hint: '🏴‍☠️ Leader of the crew', pts: 10 },
    { word: 'COMPASS', hint: '🧭 Navigate the seas', pts: 10 },
];

const TOTAL_ROUNDS = WORD_BANK.length; // 10
const MAX_TOTAL = WORD_BANK.reduce((a, w) => a + w.pts, 0); // 145
// NOTE: We cap submitted score at 100 to fit your backend

const SECONDS = 17; // timer per word

// ── HELPERS ────────────────────────────────────────────────────────────────────
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ── SYMBOL KEY CHEAT SHEET ─────────────────────────────────────────────────────
const CipherKey = () => (
    <div className="grid grid-cols-6 gap-1 text-[10px] bg-gray-900/60 border border-amber-500/20 rounded-xl p-3">
        {Object.entries(CIPHER).map(([sym, ltr]) => (
            <div key={ltr} className="flex items-center gap-1 bg-gray-800/60 rounded px-1 py-0.5">
                <span>{sym}</span>
                <span className="text-amber-400 font-bold">=</span>
                <span className="text-white font-mono font-bold">{ltr}</span>
            </div>
        ))}
    </div>
);

// ── LETTER INPUT ROW ───────────────────────────────────────────────────────────
const LetterRow = ({ word, userAnswer, onLetterChange, isLocked, shakeIdx }) => (
    <div className="flex gap-1.5 justify-center">
        {word.split('').map((correct, i) => {
            const typed = userAnswer[i] || '';
            let borderColor = 'border-gray-600';
            if (isLocked) {
                borderColor = typed.toUpperCase() === correct ? 'border-green-400' : 'border-red-400';
            } else if (typed) {
                borderColor = 'border-amber-400';
            }
            return (
                <div key={i} className={`w-9 h-9 flex items-center justify-center border-2 rounded-lg
                    text-lg font-black uppercase bg-gray-800/70 text-white
                    ${borderColor} ${shakeIdx === i ? 'animate-bounce' : ''}
                    transition-colors duration-200`}>
                    {typed || ''}
                </div>
            );
        })}
    </div>
);

// ── MAIN GAME ──────────────────────────────────────────────────────────────────
const BlackPearlCipherGame = ({ onGameEnd }) => {
    const [phase, setPhase] = useState('intro');  // intro | playing | feedback | result
    const [round, setRound] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [userAnswer, setUserAnswer] = useState([]);
    const [timeLeft, setTimeLeft] = useState(SECONDS);
    const [timedOut, setTimedOut] = useState(false);
    const [roundResult, setRoundResult] = useState(null); // {correct, pts, word}
    const [showKey, setShowKey] = useState(true);

    const timerRef = useRef(null);
    const inputRefs = useRef([]);

    // Shuffle word order once per game session
    const wordOrder = useMemo(() => shuffle(WORD_BANK), []);

    const current = wordOrder[round];
    const encoded = current ? encode(current.word) : '';

    // ── timer ──────────────────────────────────────────────────────────────────
    const stopTimer = () => clearInterval(timerRef.current);

    useEffect(() => {
        if (phase !== 'playing') return;
        setTimeLeft(SECONDS);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setTimedOut(true);
                    submitAnswer(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [phase, round]); // eslint-disable-line

    // ── start round ────────────────────────────────────────────────────────────
    const startRound = useCallback((idx) => {
        const word = wordOrder[idx].word;
        setRound(idx);
        setUserAnswer(Array(word.length).fill(''));
        setTimedOut(false);
        setRoundResult(null);
        setPhase('playing');
    }, [wordOrder]);

    // ── submit ─────────────────────────────────────────────────────────────────
    const submitAnswer = useCallback((isTimeout = false) => {
        if (phase !== 'playing') return;
        stopTimer();

        const word = wordOrder[round].word;
        setUserAnswer(prev => {
            const answer = prev.join('').toUpperCase();
            const correct = answer === word;
            const pts = correct ? wordOrder[round].pts : 0;
            setTotalScore(s => s + pts);
            setRoundResult({ correct, pts, word, answer, isTimeout });
            setPhase('feedback');
            return prev;
        });
    }, [phase, round, wordOrder]);

    // ── Global keyboard listener (physical keyboard, works without focus) ───────
    useEffect(() => {
        if (phase !== 'playing') return;

        const onGlobalKey = (e) => {
            if (e.key === 'Backspace') {
                e.preventDefault();
                setUserAnswer(prev => {
                    const next = [...prev];
                    const lastFilled = [...next].reverse().findIndex(c => c !== '');
                    if (lastFilled !== -1) {
                        next[next.length - 1 - lastFilled] = '';
                    }
                    return next;
                });
            } else if (e.key === 'Enter') {
                setUserAnswer(prev => {
                    if (prev.every(c => c !== '')) submitAnswer();
                    return prev;
                });
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                e.preventDefault();
                const ch = e.key.toUpperCase();
                setUserAnswer(prev => {
                    const idx = prev.findIndex(c => c === '');
                    if (idx === -1) return prev;
                    const next = [...prev];
                    next[idx] = ch;
                    return next;
                });
            }
        };

        window.addEventListener('keydown', onGlobalKey);
        return () => window.removeEventListener('keydown', onGlobalKey);
    }, [phase, submitAnswer]); // eslint-disable-line

    // ── advance ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'feedback') return;
        const t = setTimeout(() => {
            const next = round + 1;
            if (next >= TOTAL_ROUNDS) {
                setPhase('result');
                // Cap at 100 to fit the backend expectation
                setTimeout(() => onGameEnd(Math.min(totalScore + (roundResult?.pts || 0), 100)), 2200);
            } else {
                startRound(next);
            }
        }, 2000);
        return () => clearTimeout(t);
    }, [phase]); // eslint-disable-line

    // ── handle typing ──────────────────────────────────────────────────────────
    const handleKey = useCallback((e, idx) => {
        const word = current.word;
        if (e.key === 'Backspace') {
            e.preventDefault();
            setUserAnswer(prev => {
                const next = [...prev];
                if (next[idx]) { next[idx] = ''; return next; }
                if (idx > 0) {
                    next[idx - 1] = '';
                    setTimeout(() => inputRefs.current[idx - 1]?.focus(), 0);
                }
                return next;
            });
        } else if (e.key === 'Enter') {
            if (userAnswer.every(c => c !== '')) submitAnswer();
        } else if (/^[a-zA-Z]$/.test(e.key)) {
            e.preventDefault();
            const ch = e.key.toUpperCase();
            setUserAnswer(prev => {
                const next = [...prev];
                next[idx] = ch;
                if (idx + 1 < word.length) setTimeout(() => inputRefs.current[idx + 1]?.focus(), 0);
                return next;
            });
        }
    }, [current, userAnswer, submitAnswer]);

    // ── INTRO ──────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="text-center text-white p-4 space-y-5 max-w-sm mx-auto">
            <div className="text-5xl animate-pulse">☠️</div>
            <h2 className="text-3xl font-bold font-naruto text-amber-400">Black Pearl Cipher</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
                The Black Pearl's log is written in <span className="text-amber-300 font-bold">pirate symbols</span>.
                Decode each word by matching symbols to letters using the cipher key.
                You have <span className="text-red-400 font-bold">{SECONDS} seconds</span> per word!
            </p>
            <div className="text-left">
                <p className="text-amber-400 text-xs font-bold uppercase mb-2">📜 Cipher Key (first 15 symbols):</p>
                <CipherKey />
                <p className="text-gray-500 text-[10px] mt-1">More symbols revealed in-game. Memorize as many as you can!</p>
            </div>
            <div className="flex justify-center gap-3 text-xs text-gray-400">
                {[{ v: '10', l: 'Words' }, { v: `${SECONDS}s`, l: 'Per Word' }, { v: '100', l: 'Max Score' }].map(({ v, l }) => (
                    <div key={l} className="bg-gray-800/70 rounded-lg px-3 py-2 border border-gray-700">
                        <p className="text-white font-bold">{v}</p><p>{l}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => startRound(0)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold py-3 rounded-xl text-lg transition-all hover:scale-105 active:scale-95">
                ⚔️ Decrypt the Log!
            </button>
        </div>
    );

    // ── RESULT ──────────────────────────────────────────────────────────────────
    if (phase === 'result') {
        const capped = Math.min(totalScore, 100);
        const pct = Math.round((capped / 100) * 100);
        const rank = capped >= 85 ? { label: 'Master Cryptographer', icon: '🔐', color: 'text-yellow-400' }
            : capped >= 65 ? { label: 'Code Breaker', icon: '🗝️', color: 'text-cyan-400' }
                : capped >= 40 ? { label: 'Apprentice Decoder', icon: '📜', color: 'text-blue-400' }
                    : { label: 'Cabin Boy', icon: '🪣', color: 'text-gray-400' };
        return (
            <div className="text-center text-white p-4 space-y-4">
                <div className="text-5xl">{rank.icon}</div>
                <h2 className="text-2xl font-bold font-naruto text-amber-400">Log Deciphered!</h2>
                <div className={`text-lg font-bold ${rank.color}`}>{rank.label}</div>
                <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#374151" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3"
                            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 1.2s ease' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-amber-400">{capped}</p>
                        <p className="text-[10px] text-gray-400">/ 100</p>
                    </div>
                </div>
                <p className="text-gray-400 text-sm animate-pulse">Saving your score...</p>
            </div>
        );
    }

    // ── PLAYING + FEEDBACK ─────────────────────────────────────────────────────
    const timerPct = (timeLeft / SECONDS) * 100;
    const timerColor = timerPct > 60 ? '#22c55e' : timerPct > 30 ? '#f59e0b' : '#ef4444';
    const isPlaying = phase === 'playing';
    const isFeedback = phase === 'feedback';
    const isComplete = isPlaying && userAnswer.every(c => c !== '');

    // Split encoded into individual symbol tokens
    const symbolTokens = encoded.split(' ');

    return (
        <div className="text-white p-2 space-y-3 max-w-sm mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center text-sm">
                <span className="text-amber-400 font-naruto font-bold">⚫ Black Pearl Cipher</span>
                <div className="flex gap-3">
                    <span className="text-gray-400">Word {round + 1}/{TOTAL_ROUNDS}</span>
                    <span className="text-green-400 font-bold">{totalScore} pts</span>
                </div>
            </div>

            {/* Round progress */}
            <div className="w-full h-1.5 bg-gray-800 rounded-full">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
            </div>

            {/* Timer */}
            {isPlaying && (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tabular-nums" style={{ color: timerColor, minWidth: 22 }}>{timeLeft}s</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-none"
                            style={{ width: `${timerPct}%`, backgroundColor: timerColor }} />
                    </div>
                    <span className="text-[10px] text-gray-600">{current.pts} pts</span>
                </div>
            )}

            {/* Hint badge */}
            <div className="bg-gray-900/60 rounded-xl px-3 py-2 border border-gray-700 flex items-center gap-2">
                <span className="text-sm">💡</span>
                <p className="text-gray-300 text-xs">{current.hint}</p>
                <span className="ml-auto text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                    {current.word.length} letters
                </span>
            </div>

            {/* Encoded symbols card */}
            <div className="bg-gray-900 border border-amber-500/30 rounded-2xl p-4 shadow-xl">
                <p className="text-amber-400 text-[10px] uppercase tracking-widest mb-3 font-bold">📜 Pirate Script:</p>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {symbolTokens.map((sym, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="w-9 h-9 bg-gray-800 border border-amber-500/30 rounded-lg flex items-center justify-center text-lg shadow-inner">
                                {sym}
                            </div>
                            <span className="text-[9px] text-gray-600 font-mono">#{i + 1}</span>
                        </div>
                    ))}
                </div>

                {/* Answer boxes */}
                {isPlaying && (
                    <>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 text-center">Your Answer:</p>
                        <LetterRow word={current.word} userAnswer={userAnswer} isLocked={false} shakeIdx={-1} />
                        <div className="flex gap-1.5 justify-center mt-1 opacity-0 h-0 overflow-hidden">
                            {current.word.split('').map((_, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    onKeyDown={(e) => handleKey(e, i)}
                                    className="w-9 h-0"
                                    readOnly
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Feedback reveal */}
                {isFeedback && roundResult && (
                    <div className="mt-2">
                        <LetterRow word={current.word} userAnswer={current.word.split('')} isLocked={true}
                            shakeIdx={-1} />
                        <div className={`mt-3 p-3 rounded-xl text-center border ${roundResult.correct ? 'bg-green-900/30 border-green-500/40' : 'bg-red-900/30 border-red-500/40'}`}>
                            {roundResult.correct ? (
                                <>
                                    <p className="text-green-300 font-bold text-base">✅ Correct! +{roundResult.pts} pts</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-red-300 font-bold text-sm">
                                        {roundResult.isTimeout ? '⏰ Time\'s up!' : '❌ Wrong!'}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-0.5">Answer: <span className="text-white font-bold font-mono">{roundResult.word}</span></p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Cipher cheat sheet (collapsible) */}
            <div>
                <button onClick={() => setShowKey(k => !k)}
                    className="w-full text-[10px] text-gray-500 hover:text-amber-400 transition-colors text-center py-1">
                    {showKey ? '▲ Hide Cipher Key' : '▼ Show Cipher Key'}
                </button>
                {showKey && <CipherKey />}
            </div>

            {/* Submit button */}
            {isPlaying && (
                <button onClick={() => submitAnswer(false)}
                    disabled={!isComplete}
                    className="w-full py-3 rounded-xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black active:scale-95">
                    ⚔️ Submit Decryption
                </button>
            )}
        </div>
    );
};

export default BlackPearlCipherGame;
