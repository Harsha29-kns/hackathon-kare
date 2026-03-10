import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SECONDS_PER_QUESTION = 15; // timer per question

// ─── UTILITY ─────────────────────────────────────────────────────────────────
/** Fisher-Yates shuffle — returns a NEW array, original untouched */
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
// Raw bank — choices are shuffled at runtime so correct answer is never fixed
const QUESTION_BANK = [
    {
        id: 1,
        scene: '⚓ Your ship just spotted a rival vessel flying a black flag. Your crew is tense.',
        question: 'Enemy ship ahead. What do you do?',
        choices: [
            { text: '⚔️ Attack head-on — full speed!', correct: false, outcome: 'Their cannons were ready. Heavy damage before boarding.' },
            { text: '🌫️ Use the fog — hide and wait for their guard to drop', correct: true, outcome: 'Brilliant patience! You slipped past unseen.' },
            { text: '🎭 Raise a friendly flag and sail alongside them', correct: false, outcome: 'They saw through the ruse immediately and opened fire.' },
        ],
    },
    {
        id: 2,
        scene: '🏝️ Your crew finds a map with two routes to the treasure island.',
        question: 'Route A is shorter but shark-infested shallows. Route B is longer but deep water. Which?',
        choices: [
            { text: '🦈 Route A — speed is everything!', correct: false, outcome: 'Three crew members lost to the shallows. Speed cost you.' },
            { text: '🌊 Route B — safety first.', correct: true, outcome: 'Smart! Full crew reached the island intact.' },
            { text: '🪙 Flip a coin — let fate decide', correct: false, outcome: 'Fate chose Route A... the sharks chose your cargo.' },
        ],
    },
    {
        id: 3,
        scene: '🍺 A tavern keeper offers info about a hidden treasure — but wants half of it.',
        question: 'Do you accept his deal?',
        choices: [
            { text: '✅ Accept — information is power.', correct: true, outcome: 'Wise! The lead was golden. Half a treasure beats none.' },
            { text: '🗡️ Threaten him to reveal it for free', correct: false, outcome: 'He went silent and tipped off the harbour guards. Bad move.' },
            { text: '🚶 Walk away and find it yourself', correct: false, outcome: '3 weeks of searching, nothing. The map was in his drawer.' },
        ],
    },
    {
        id: 4,
        scene: '🌪️ A storm is approaching. Your ship has a small leak in the hull.',
        question: 'What is your priority before the storm hits?',
        choices: [
            { text: '🛡️ Repair the leak first, then batten down.', correct: true, outcome: 'Patched just in time. The ship survived with minor damage.' },
            { text: '⛵ Outrun the storm — sail full speed.', correct: false, outcome: 'The leak worsened at speed. You had to abandon ship.' },
            { text: '🤷 Do nothing, the crew is tired.', correct: false, outcome: 'The ship sank. Never ignore a hull breach.' },
        ],
    },
    {
        id: 5,
        scene: '🏴‍☠️ A captured prisoner claims to know where the legendary Crown Jewel is hidden.',
        question: 'How do you handle the prisoner?',
        choices: [
            { text: '⛓️ Offer freedom in exchange for the location.', correct: true, outcome: 'She led you straight to it. A fair deal sealed in gold.' },
            { text: '🔥 Scare the truth out.', correct: false, outcome: 'Under pressure, false coordinates. Sailed for days to nothing.' },
            { text: '🗝️ Search pockets and ignore him.', correct: false, outcome: 'His pockets were empty. The map was in his memory.' },
        ],
    },
    {
        id: 6,
        scene: '🔭 Your lookout spots a navy ship heading your way. You have stolen cargo on board.',
        question: 'What do you do?',
        choices: [
            { text: '🛟 Throw the stolen goods overboard to look innocent.', correct: true, outcome: 'Risky but right. The navy found nothing and let you pass.' },
            { text: '💨 Hoist all sails and flee.', correct: false, outcome: 'The navy ship was faster. Caught with the cargo.' },
            { text: '⚓ Anchor and pretend to be fishing.', correct: false, outcome: 'Zero fish + a pirate ship = instant suspicion. Boarded.' },
        ],
    },
    {
        id: 7,
        scene: '💰 You and your first mate disagree on splitting treasure. Crew is watching.',
        question: 'First mate wants 60% for the two of you. What do you do?',
        choices: [
            { text: '⚖️ Insist on a fair 50-50 split with the crew.', correct: true, outcome: 'The crew cheered. Loyalty is worth more than gold.' },
            { text: '💬 Side with your first mate privately.', correct: false, outcome: 'Word spread. Three crew members mutinied that night.' },
            { text: '🎲 Let the crew vote.', correct: false, outcome: 'The vote ended in chaos. Someone threw a lantern. Fire.' },
        ],
    },
    {
        id: 8,
        scene: '🗺️ You find a treasure chest with a combination lock. Clue: "Where the sun sets, count the stars, begin with the sea\'s name."',
        question: 'What do you try?',
        choices: [
            { text: '🔢 Number "7", symbol "⭐", letter "O" (ocean).', correct: true, outcome: 'Click! The chest opens. Logic wins, Captain.' },
            { text: '💪 Force the chest open with an axe.', correct: false, outcome: 'The lock triggered a poison-dart trap. Ouch.' },
            { text: '🤔 Give up and sail to the next island.', correct: false, outcome: 'You left behind 10,000 gold coins. The next crew found it.' },
        ],
    },
    {
        id: 9,
        scene: '🧭 Your compass is broken in the middle of the ocean on a foggy night.',
        question: 'How do you navigate?',
        choices: [
            { text: '🌟 Use the North Star visible through a cloud gap.', correct: true, outcome: 'Natural navigation: you reached port by dawn. Old-school wins.' },
            { text: '🔮 Trust your gut feeling.', correct: false, outcome: 'Your gut said east. The reef said otherwise.' },
            { text: '🛶 Lower a rowboat and follow the current.', correct: false, outcome: 'The current led circles. Three days later — back at the start.' },
        ],
    },
    {
        id: 10,
        scene: '🏰 The legendary pirate fortress gate shows a riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind."',
        question: 'What is your answer?',
        choices: [
            { text: '🌬️ An Echo', correct: true, outcome: 'The gate swings open! You\'ve mastered the Captain\'s ultimate test!' },
            { text: '👻 A Ghost', correct: false, outcome: '"Wrong," booms the fortress. The gate stays shut.' },
            { text: '🌊 The Ocean', correct: false, outcome: 'A good guess, but the riddle needed more thought. Gate does not move.' },
        ],
    },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const CaptainsDecisionGame = ({ onGameEnd }) => {
    // Build the game on first render:
    // 1. Shuffle question ORDER  (different for every team session)
    // 2. Shuffle CHOICES within each question (correct answer in random slot)
    const shuffledQuestions = useMemo(() => {
        return shuffle(QUESTION_BANK).map(q => ({
            ...q,
            choices: shuffle(q.choices),  // ← correct answer moves to random position
        }));
    }, []); // runs once on mount

    const totalQ = shuffledQuestions.length;

    const [phase, setPhase] = useState('intro');   // intro | playing | result
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
    const [timedOut, setTimedOut] = useState(false);
    const timerRef = useRef(null);

    // ── Timer logic ────────────────────────────────────────────────────────────
    const stopTimer = useCallback(() => {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }, []);

    const advanceToNext = useCallback((isCorrect, currentScore, currentStreak) => {
        const nextIdx = currentIdx + 1;
        if (nextIdx >= totalQ) {
            setPhase('result');
            const finalScore = currentScore;
            setTimeout(() => onGameEnd(finalScore), 2200);
        } else {
            setCurrentIdx(nextIdx);
            setSelectedChoice(null);
            setTimedOut(false);
            setTimeLeft(SECONDS_PER_QUESTION);
        }
    }, [currentIdx, totalQ, onGameEnd]);

    // Start timer when playing and no choice made yet
    useEffect(() => {
        if (phase !== 'playing') return;
        if (selectedChoice !== null || timedOut) return; // already answered

        setTimeLeft(SECONDS_PER_QUESTION);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    setTimedOut(true);
                    setStreak(0);
                    // Advance after timeout
                    setTimeout(() => {
                        setTimedOut(false);
                        advanceToNext(false, score, 0);
                        setTimeLeft(SECONDS_PER_QUESTION);
                    }, 1800);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [phase, currentIdx]); // restart timer on each new question

    // ── Choice handler ─────────────────────────────────────────────────────────
    const handleChoose = useCallback((choice) => {
        if (selectedChoice !== null || timedOut) return;
        stopTimer();
        setSelectedChoice(choice);

        const newScore = score + (choice.correct ? 2 : 0);
        const newStreak = choice.correct ? streak + 1 : 0;
        if (choice.correct) setScore(newScore);
        setStreak(newStreak);

        setTimeout(() => {
            advanceToNext(choice.correct, newScore, newStreak);
        }, 1800);
    }, [selectedChoice, timedOut, stopTimer, score, streak, advanceToNext]);

    // ── INTRO ──────────────────────────────────────────────────────────────────
    if (phase === 'intro') {
        return (
            <div className="text-center text-white p-4 space-y-6">
                <div className="text-6xl animate-bounce">🏴‍☠️</div>
                <h2 className="text-3xl font-bold font-naruto text-amber-400 drop-shadow-lg">Captain's Decision</h2>
                <p className="text-gray-300 text-sm max-w-sm mx-auto leading-relaxed">
                    You are the captain of the <span className="text-amber-300 font-bold">Black Compass</span>.
                    10 decisions await you on the high seas. Each right choice earns{' '}
                    <span className="text-green-400 font-bold">+2 points</span>.
                    You have <span className="text-red-400 font-bold">{SECONDS_PER_QUESTION}s</span> per question!
                </p>
                <div className="flex justify-center gap-3 text-sm text-gray-400">
                    <div className="bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700">
                        <p className="text-white font-bold text-lg">10</p>
                        <p>Questions</p>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700">
                        <p className="text-green-400 font-bold text-lg">+2 pts</p>
                        <p>Per correct</p>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700">
                        <p className="text-red-400 font-bold text-lg">{SECONDS_PER_QUESTION}s</p>
                        <p>Per question</p>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700">
                        <p className="text-amber-400 font-bold text-lg">20</p>
                        <p>Max score</p>
                    </div>
                </div>
                <button
                    onClick={() => { setPhase('playing'); setTimeLeft(SECONDS_PER_QUESTION); }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold py-3 px-8 rounded-xl shadow-lg text-lg transition-all hover:scale-105 active:scale-95"
                >
                    ⚓ Set Sail!
                </button>
            </div>
        );
    }

    // ── RESULT ─────────────────────────────────────────────────────────────────
    if (phase === 'result') {
        const pct = Math.round((score / 20) * 100);
        const rank = score >= 18 ? { label: 'Legendary Captain', icon: '👑', color: 'text-yellow-400' }
            : score >= 14 ? { label: 'Seasoned Buccaneer', icon: '⚓', color: 'text-cyan-400' }
                : score >= 10 ? { label: 'Brave Sailor', icon: '🌊', color: 'text-blue-400' }
                    : { label: 'Cabin Boy', icon: '🪣', color: 'text-gray-400' };

        return (
            <div className="text-center text-white p-4 space-y-5">
                <div className="text-5xl">{rank.icon}</div>
                <h2 className="text-2xl font-bold font-naruto text-amber-400">Voyage Complete!</h2>
                <div className={`text-xl font-bold ${rank.color}`}>{rank.label}</div>
                <div className="relative w-36 h-36 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#374151" strokeWidth="3.2" />
                        <circle
                            cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3.2"
                            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 1s ease' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-3xl font-bold text-amber-400">{score}</p>
                        <p className="text-xs text-gray-400">/ 20 pts</p>
                    </div>
                </div>
                <p className="text-gray-400 text-sm animate-pulse">Saving your score...</p>
            </div>
        );
    }

    // ── PLAYING ────────────────────────────────────────────────────────────────
    const q = shuffledQuestions[currentIdx];
    const progress = (currentIdx / totalQ) * 100;
    const timerPct = (timeLeft / SECONDS_PER_QUESTION) * 100;
    const timerColor = timeLeft > 8 ? '#22c55e' : timeLeft > 4 ? '#f59e0b' : '#ef4444';
    const isLocked = selectedChoice !== null || timedOut;

    return (
        <div className="text-white p-2 space-y-3 max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-amber-400 font-bold font-naruto">Captain's Decision</span>
                <div className="flex items-center gap-3">
                    {streak >= 2 && (
                        <span className="text-xs bg-orange-900/60 text-orange-300 border border-orange-500/40 px-2 py-0.5 rounded-full animate-pulse">
                            🔥 {streak} streak
                        </span>
                    )}
                    <span className="text-gray-400">{currentIdx + 1}/{totalQ}</span>
                    <span className="text-green-400 font-bold">{score} pts</span>
                </div>
            </div>

            {/* Question progress bar */}
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* ── TIMER ── */}
            <div className="flex items-center gap-3">
                {/* Circular timer */}
                <div className="relative w-10 h-10 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#1f2937" strokeWidth="4" />
                        <circle
                            cx="18" cy="18" r="15" fill="none"
                            stroke={timerColor}
                            strokeWidth="4"
                            strokeDasharray={`${timerPct} ${100 - timerPct}`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s' }}
                        />
                    </svg>
                    <span
                        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                        style={{ color: timerColor }}
                    >{timeLeft}</span>
                </div>
                {/* Linear timer bar */}
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{
                            width: `${timerPct}%`,
                            backgroundColor: timerColor,
                            transition: 'width 0.9s linear, background-color 0.3s',
                        }}
                    />
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{SECONDS_PER_QUESTION}s</span>
            </div>

            {/* Question card */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800/80 border border-amber-500/20 rounded-2xl p-4 shadow-xl">
                <p className="text-xs text-amber-300/70 mb-2 italic leading-relaxed">{q.scene}</p>
                <div className="w-12 h-0.5 bg-amber-500/40 mb-3" />
                <p className="font-bold text-sm text-white mb-4 leading-snug">{q.question}</p>

                {/* Choices */}
                <div className="space-y-2">
                    {q.choices.map((choice, idx) => {
                        let style = 'bg-gray-800/60 border-gray-700 hover:border-amber-500 hover:bg-gray-800 cursor-pointer';
                        if (isLocked) {
                            if (selectedChoice && choice === selectedChoice) {
                                style = choice.correct
                                    ? 'bg-green-900/60 border-green-400 ring-1 ring-green-400'
                                    : 'bg-red-900/60 border-red-400 ring-1 ring-red-400';
                            } else if (choice.correct) {
                                // Always reveal the correct one when locked
                                style = 'bg-green-900/30 border-green-600 opacity-80';
                            } else {
                                style = 'bg-gray-800/40 border-gray-700 opacity-40';
                            }
                        }

                        return (
                            <div
                                key={idx}
                                onClick={() => handleChoose(choice)}
                                className={`border rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 select-none ${style}`}
                            >
                                {choice.text}
                            </div>
                        );
                    })}
                </div>

                {/* Feedback: timed out */}
                {timedOut && (
                    <div className="mt-3 p-3 rounded-xl text-xs border bg-orange-900/30 border-orange-500/40 text-orange-300">
                        <p className="font-bold mb-0.5">⏰ Time's up!</p>
                        <p className="text-gray-300">Too slow, Captain. The moment passed. Moving on...</p>
                    </div>
                )}

                {/* Feedback: selected */}
                {selectedChoice && (
                    <div className={`mt-3 p-3 rounded-xl text-xs border ${selectedChoice.correct
                            ? 'bg-green-900/30 border-green-500/40 text-green-300'
                            : 'bg-red-900/30 border-red-500/40 text-red-300'
                        }`}>
                        <p className="font-bold mb-0.5">
                            {selectedChoice.correct ? '✅ Well played!' : '❌ A costly mistake...'}
                        </p>
                        <p className="text-gray-300 leading-relaxed">{selectedChoice.outcome}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaptainsDecisionGame;
