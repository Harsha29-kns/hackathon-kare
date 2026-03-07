import React, { useState, useEffect, useCallback, useRef } from 'react';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const TOTAL_ROUNDS = 10;
const MAX_SCORE = 10;    // per round (10 rounds × 10 = 100 total)
// Needle speed in degrees per second — increases each round
const BASE_SPEED = 120;   // deg/s round 1
const SPEED_STEP = 25;    // +deg/s per round
const getSpeed = (r) => BASE_SPEED + (r - 1) * SPEED_STEP;   // round 10 → 345 deg/s

// Score zones (angle error in degrees)
const ZONES = [
    { max: 8, pts: 10, label: '🎯 PERFECT!', color: '#22c55e' },
    { max: 18, pts: 8, label: '✅ Great!', color: '#86efac' },
    { max: 32, pts: 6, label: '👍 Good', color: '#fbbf24' },
    { max: 50, pts: 3, label: '😬 Off...', color: '#f97316' },
    { max: 180, pts: 0, label: '❌ Missed!', color: '#ef4444' },
];

const scoreZone = (errDeg) => ZONES.find(z => errDeg <= z.max) || ZONES[ZONES.length - 1];

const DIRECTIONS = [
    { label: 'NORTH', emoji: '⬆️', deg: 0, short: 'N', color: '#ef4444' },
    { label: 'EAST', emoji: '➡️', deg: 90, short: 'E', color: '#f59e0b' },
    { label: 'SOUTH', emoji: '⬇️', deg: 180, short: 'S', color: '#22c55e' },
    { label: 'WEST', emoji: '⬅️', deg: 270, short: 'W', color: '#60a5fa' },
];

const pickDir = () => DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

// ── SVG COMPASS ──────────────────────────────────────────────────────────────
const CompassFace = ({ needleDeg, targetDeg, showTarget, isStopped }) => {
    const cx = 80, cy = 80, r = 70;
    const toXY = (deg, radius) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return { x: cx + Math.cos(rad) * radius, y: cy + Math.sin(rad) * radius };
    };

    // Target zone arc (±15°)
    const ARC_HALF = 15;
    const arcPath = () => {
        const s = toXY(targetDeg - ARC_HALF, r - 4);
        const e = toXY(targetDeg + ARC_HALF, r - 4);
        const large = ARC_HALF * 2 > 180 ? 1 : 0;
        return `M ${s.x} ${s.y} A ${r - 4} ${r - 4} 0 ${large} 1 ${e.x} ${e.y}`;
    };

    // Needle tip and tail
    const tipLen = 52, tailLen = 22;
    const rad = ((needleDeg - 90) * Math.PI) / 180;
    const tip = { x: cx + Math.cos(rad) * tipLen, y: cy + Math.sin(rad) * tipLen };
    const tail = { x: cx - Math.cos(rad) * tailLen, y: cy - Math.sin(rad) * tailLen };
    // Side wings for diamond shape
    const pw = 8;
    const radp = (((needleDeg + 90) - 90) * Math.PI) / 180;
    const midT = { x: cx + Math.cos(rad) * 12, y: cy + Math.sin(rad) * 12 };
    const midTail = { x: cx - Math.cos(rad) * 6, y: cy - Math.sin(rad) * 6 };
    const w1 = { x: midT.x + Math.cos(radp) * pw, y: midT.y + Math.sin(radp) * pw };
    const w2 = { x: midT.x - Math.cos(radp) * pw, y: midT.y - Math.sin(radp) * pw };
    const wt1 = { x: midTail.x + Math.cos(radp) * pw, y: midTail.y + Math.sin(radp) * pw };
    const wt2 = { x: midTail.x - Math.cos(radp) * pw, y: midTail.y - Math.sin(radp) * pw };

    return (
        <svg viewBox="0 0 160 160" width="160" height="160">
            {/* Outer ring */}
            <circle cx={cx} cy={cy} r={r + 2} fill="#111827" stroke="#374151" strokeWidth="3" />

            {/* Target zone arc — glowing green */}
            {showTarget && (
                <path d={arcPath()} fill="none" stroke="#22c55e" strokeWidth="6"
                    strokeLinecap="round" opacity="0.55">
                    <animate attributeName="opacity" values="0.35;0.75;0.35" dur="1s" repeatCount="indefinite" />
                </path>
            )}

            {/* Degree tick marks */}
            {Array.from({ length: 36 }).map((_, i) => {
                const deg = i * 10;
                const isMajor = deg % 90 === 0;
                const inner = toXY(deg, r - (isMajor ? 14 : 8));
                const outer = toXY(deg, r);
                return (
                    <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                        stroke={isMajor ? '#6b7280' : '#374151'} strokeWidth={isMajor ? 2 : 1} />
                );
            })}

            {/* Cardinal labels */}
            {DIRECTIONS.map(d => {
                const pos = toXY(d.deg, r - 22);
                return (
                    <text key={d.short} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                        fill={d.color} fontSize="12" fontWeight="bold">{d.short}</text>
                );
            })}

            {/* Needle — diamond / kite shape */}
            {/* Red (north) half */}
            <polygon
                points={`${tip.x},${tip.y} ${w1.x},${w1.y} ${midTail.x},${midTail.y} ${w2.x},${w2.y}`}
                fill="#ef4444" opacity={isStopped ? 1 : 0.9}
            />
            {/* White (south) half */}
            <polygon
                points={`${tail.x},${tail.y} ${wt1.x},${wt1.y} ${midTail.x},${midTail.y} ${wt2.x},${wt2.y}`}
                fill="#e5e7eb" opacity="0.8"
            />
            {/* Center cap */}
            <circle cx={cx} cy={cy} r="5" fill="#1f2937" stroke="#9ca3af" strokeWidth="1.5" />

            {/* Stopped flash indicator */}
            {isStopped && (
                <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="0.6s" repeatCount="3" />
                </circle>
            )}
        </svg>
    );
};

// ── MAIN GAME ────────────────────────────────────────────────────────────────
const LostCompassGame = ({ onGameEnd }) => {
    const [phase, setPhase] = useState('intro');
    const [round, setRound] = useState(1);
    const [totalScore, setTotalScore] = useState(0);
    const [targetDir, setTargetDir] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const [feedback, setFeedback] = useState(null);  // { pts, zone, err }
    const [stoppedDeg, setStoppedDeg] = useState(null);

    // Needle angle — driven by RAF, exposed to React only for rendering
    const needleDegRef = useRef(0);
    const [needleDeg, setNeedleDeg] = useState(0);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(null);
    const isSpinningRef = useRef(false);
    const roundRef = useRef(1);

    // ── spin loop ──────────────────────────────────────────────────────────
    const startSpin = useCallback(() => {
        isSpinningRef.current = true;
        lastTimeRef.current = null;
        const loop = (ts) => {
            if (!isSpinningRef.current) return;
            if (lastTimeRef.current === null) lastTimeRef.current = ts;
            const dt = ts - lastTimeRef.current;
            lastTimeRef.current = ts;
            needleDegRef.current = (needleDegRef.current + getSpeed(roundRef.current) * dt / 1000) % 360;
            setNeedleDeg(needleDegRef.current);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
    }, []);

    const stopSpin = useCallback(() => {
        isSpinningRef.current = false;
        cancelAnimationFrame(rafRef.current);
    }, []);

    // ── start round ────────────────────────────────────────────────────────
    const startRound = useCallback((n) => {
        roundRef.current = n;
        const dir = pickDir();
        setTargetDir(dir);
        setStoppedDeg(null);
        setFeedback(null);
        setCountdown(3);
        setPhase('countdown');

        let c = 3;
        const iv = setInterval(() => {
            c--;
            if (c <= 0) {
                clearInterval(iv);
                setPhase('spinning');
                startSpin();
            } else {
                setCountdown(c);
            }
        }, 700);
    }, [startSpin]);

    const beginGame = useCallback(() => {
        setRound(1);
        setTotalScore(0);
        needleDegRef.current = 0;
        setNeedleDeg(0);
        startRound(1);
    }, [startRound]);

    // ── player stops the compass ───────────────────────────────────────────
    const handleStop = useCallback(() => {
        if (phase !== 'spinning') return;
        stopSpin();

        const stopped = needleDegRef.current;
        const target = targetDir.deg;
        let err = Math.abs(stopped - target) % 360;
        if (err > 180) err = 360 - err;
        err = Math.round(err);

        const zone = scoreZone(err);
        setStoppedDeg(stopped);
        setFeedback({ pts: zone.pts, zone, err });
        setTotalScore(s => s + zone.pts);
        setPhase('feedback');
    }, [phase, stopSpin, targetDir]);

    // Space bar = STOP
    useEffect(() => {
        const onKey = (e) => {
            if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); handleStop(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [handleStop]);

    // ── advance after feedback ─────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'feedback') return;
        const t = setTimeout(() => {
            if (round >= TOTAL_ROUNDS) {
                setPhase('result');
                setTimeout(() => onGameEnd(totalScore), 2200);
            } else {
                const next = round + 1;
                setRound(next);
                startRound(next);
            }
        }, 2200);
        return () => clearTimeout(t);
    }, [phase]); // eslint-disable-line

    useEffect(() => () => { stopSpin(); cancelAnimationFrame(rafRef.current); }, []);

    const isSpinning = phase === 'spinning';
    const isCountdown = phase === 'countdown';
    const isFeedback = phase === 'feedback';

    // ── INTRO ──────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="text-center text-white p-4 space-y-5">
            <div className="text-5xl">🧭</div>
            <h2 className="text-3xl font-bold font-naruto text-amber-400">Lost Compass</h2>
            <p className="text-gray-300 text-sm max-w-xs mx-auto leading-relaxed">
                A <span className="text-amber-300 font-bold">target direction</span> is shown.
                The needle spins wildly. Hit <span className="text-red-400 font-bold">STOP!</span> the
                instant the red tip points there. Closer = more points. Gets faster every round!
            </p>
            <div className="flex justify-center gap-3 text-xs text-gray-400">
                {[{ v: '10', l: 'Rounds' }, { v: '≤100', l: 'Pts/Round' }, { v: 'Faster!', l: 'Each Round' }].map(({ v, l }) => (
                    <div key={l} className="bg-gray-800/70 rounded-lg px-3 py-2 border border-gray-700">
                        <p className="text-white font-bold">{v}</p><p>{l}</p>
                    </div>
                ))}
            </div>
            <p className="text-gray-500 text-xs">⌨️ Spacebar works too!</p>
            <button onClick={beginGame}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold py-3 rounded-xl text-lg transition-all hover:scale-105 active:scale-95">
                ⚓ Start!
            </button>
        </div>
    );

    // ── RESULT ──────────────────────────────────────────────────────────────
    if (phase === 'result') {
        const max = MAX_SCORE * TOTAL_ROUNDS;
        const pct = Math.round((totalScore / max) * 100);
        const rank = totalScore >= max * 0.85 ? { label: 'Master Navigator', icon: '👑', color: 'text-yellow-400' }
            : totalScore >= max * 0.6 ? { label: 'Skilled Helmsman', icon: '⚓', color: 'text-cyan-400' }
                : totalScore >= max * 0.35 ? { label: 'Sea Wanderer', icon: '🌊', color: 'text-blue-400' }
                    : { label: 'Lost at Sea', icon: '🪣', color: 'text-gray-400' };
        return (
            <div className="text-center text-white p-4 space-y-4">
                <div className="text-5xl">{rank.icon}</div>
                <h2 className="text-2xl font-bold font-naruto text-amber-400">Voyage Complete!</h2>
                <div className={`text-lg font-bold ${rank.color}`}>{rank.label}</div>
                <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#374151" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3"
                            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 1.2s ease' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-amber-400">{totalScore}</p>
                        <p className="text-[10px] text-gray-400">/ {max}</p>
                    </div>
                </div>
                <p className="text-gray-400 text-sm animate-pulse">Saving your score...</p>
            </div>
        );
    }

    // ── PLAYING ──────────────────────────────────────────────────────────────
    const speedLabel = Math.round(getSpeed(round));

    return (
        <div className="text-white p-2 space-y-3 max-w-xs mx-auto">
            {/* Header */}
            <div className="flex justify-between text-sm">
                <span className="text-amber-400 font-naruto font-bold">Lost Compass</span>
                <div className="flex gap-3">
                    <span className="text-gray-400">Round {round}/{TOTAL_ROUNDS}</span>
                    <span className="text-green-400 font-bold">{totalScore} pts</span>
                </div>
            </div>

            {/* Round progress */}
            <div className="w-full h-1.5 bg-gray-800 rounded-full">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} />
            </div>

            {/* TARGET direction banner */}
            <div className="flex items-center justify-center gap-3 bg-gray-900 border border-amber-500/30 rounded-xl py-3 px-4">
                <span className="text-gray-400 text-xs uppercase tracking-widest">Point to</span>
                <span className="text-3xl">{targetDir?.emoji}</span>
                <span className="text-2xl font-black font-naruto" style={{ color: targetDir?.color }}>
                    {targetDir?.label}
                </span>
            </div>

            {/* Compass + stop button */}
            <div className="flex flex-col items-center gap-3">
                {/* Countdown overlay */}
                {isCountdown && (
                    <div className="flex items-center justify-center w-40 h-40 rounded-full bg-gray-900 border-4 border-gray-700">
                        <span className="text-7xl font-black text-amber-400 animate-pulse">{countdown}</span>
                    </div>
                )}

                {/* Compass SVG */}
                {(isSpinning || isFeedback) && (
                    <div className={`rounded-full ${isFeedback ? '' : 'cursor-pointer'}`}
                        onClick={handleStop}>
                        <CompassFace
                            needleDeg={needleDeg}
                            targetDeg={targetDir?.deg ?? 0}
                            showTarget={isFeedback}
                            isStopped={isFeedback}
                        />
                    </div>
                )}

                {/* Speed badge */}
                {isSpinning && (
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                        <span>⚡</span>
                        <span>{speedLabel}°/s</span>
                    </div>
                )}

                {/* STOP button */}
                {isSpinning && (
                    <button
                        onClick={handleStop}
                        className="w-full py-4 text-2xl font-black rounded-2xl text-white shadow-2xl
                            bg-gradient-to-r from-red-600 to-red-700
                            hover:from-red-500 hover:to-red-600
                            active:scale-95 transition-all duration-75
                            border-2 border-red-400/50
                            shadow-red-500/40"
                        style={{ letterSpacing: '0.15em' }}
                    >
                        ⛔ STOP!
                    </button>
                )}

                {/* Feedback panel */}
                {isFeedback && feedback && (
                    <div className="w-full rounded-2xl p-4 border text-center space-y-1"
                        style={{
                            borderColor: feedback.zone.color,
                            background: `${feedback.zone.color}18`,
                        }}>
                        <p className="text-2xl font-black" style={{ color: feedback.zone.color }}>
                            {feedback.zone.label}
                        </p>
                        <p className="text-sm text-gray-400">
                            Off by <span className="font-bold text-white">{feedback.err}°</span>
                        </p>
                        <p className="text-lg font-bold" style={{ color: feedback.zone.color }}>
                            +{feedback.pts} pts
                        </p>
                    </div>
                )}
            </div>

            <p className="text-center text-[10px] text-gray-600">Tap compass or STOP button · Spacebar works too</p>
        </div>
    );
};

export default LostCompassGame;
