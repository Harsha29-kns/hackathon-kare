import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "./api";
import socket from "./socket";
import { Loader2, Save, Lock, ShieldOff, ChevronLeft, CheckCircle, X, AlertTriangle, Search, Anchor, Compass, Skull, Mail } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Pirates of the Caribbean – Visual Theme, Normal Words
   Palette:
     bg:      #0a0806  (deep ocean black)
     card:    #120e06  (old ship timber)
     border:  #7c5c1e  (barnacled gold)
     accent:  #d4a017  (treasure gold)
     text:    #e8d5a3  (aged parchment)
     muted:   #8a7355  (worn leather)
   ───────────────────────────────────────────────────────── */

const input = "w-full bg-[#0a0806] border border-[#7c5c1e]/50 rounded-lg p-3 text-[#e8d5a3] placeholder-[#8a7355]/60 focus:border-[#d4a017] focus:ring-1 focus:ring-[#d4a017]/40 outline-none transition-all text-sm";
const inputRO = "w-full bg-[#0a0806]/30 border border-[#7c5c1e]/20 rounded-lg p-3 text-[#8a7355] cursor-not-allowed select-none text-sm";
const smInput = "w-full bg-[#0a0806] border border-[#7c5c1e]/40 rounded p-2 text-[#e8d5a3] text-xs focus:border-[#d4a017] focus:outline-none";
const smRO = "w-full bg-[#0a0806]/30 border border-[#7c5c1e]/20 rounded p-2 text-[#8a7355] text-xs cursor-not-allowed";
const label = "block text-[#d4a017] text-[10px] uppercase font-bold mb-1.5 tracking-widest";
const card = "bg-[#120e06] border border-[#7c5c1e]/50 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]";
const goldBtn = "bg-gradient-to-b from-[#c8920a] to-[#9a6e08] hover:from-[#d4a017] hover:to-[#b07d0f] text-[#0a0806] font-bold rounded-lg transition-all shadow-lg shadow-[#d4a017]/20 flex items-center justify-center gap-2 disabled:opacity-50";
const ghostBtn = "border border-[#7c5c1e]/50 hover:border-[#d4a017]/60 text-[#8a7355] hover:text-[#e8d5a3] rounded-lg transition-all flex items-center justify-center gap-2";

const Divider = () => (
    <div className="flex items-center gap-2 my-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#7c5c1e]/40 to-transparent" />
        <Anchor size={9} className="text-[#7c5c1e]/60" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#7c5c1e]/40 to-transparent" />
    </div>
);

export default function EditDetails() {
    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [isOpen, setIsOpen] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }, []);

    useEffect(() => {
        axios.get(`${api}/Hack/settings/edit-details-status`)
            .then(r => setIsOpen(r.data.isEditDetailsOpen))
            .catch(() => setIsOpen(false));
        socket.on("editDetailsStatusUpdate", d => setIsOpen(d.isEditDetailsOpen));
        return () => socket.off("editDetailsStatusUpdate");
    }, []);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email.toLowerCase().endsWith("@klu.ac.in")) {
            setError("Please enter a valid KLU email address (@klu.ac.in).");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${api}/Hack/team-by-email`, { email });
            setTeamData(res.data.team);
            setStep("form");
        } catch (err) {
            setError(err.response?.data?.error || "No team found for this email. Please check and try again.");
        } finally {
            setLoading(false);
        }
    };

    const doSave = async () => {
        setConfirmOpen(false);
        setSaving(true);
        try {
            await axios.put(`${api}/Hack/update-team/${teamData._id}`, teamData);
            showToast("success", "Details updated successfully!");
        } catch (err) {
            showToast("error", err.response?.data?.error || "Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const updateMember = (idx, field, val) =>
        setTeamData(prev => ({
            ...prev,
            teamMembers: prev.teamMembers.map((m, i) => i === idx ? { ...m, [field]: val } : m),
        }));

    /* ── LOADING ── */
    if (isOpen === null) return (
        <div className="min-h-screen bg-[#0a0806] flex items-center justify-center">
            <div className="text-center">
                <Compass size={52} className="text-[#d4a017] animate-spin mx-auto mb-4" />
                <p className="text-[#8a7355] text-sm tracking-widest">Loading…</p>
            </div>
        </div>
    );

    /* ── CLOSED ── */
    if (!isOpen) return (
        <div className="min-h-screen bg-[#0a0806] flex flex-col items-center justify-center p-8 text-center"
            style={{ backgroundImage: "radial-gradient(ellipse at center, #1a1208 0%, #0a0806 70%)" }}>
            <div className="w-24 h-24 rounded-full border-2 border-[#7c5c1e]/60 flex items-center justify-center bg-[#120e06] mb-6 shadow-[0_0_40px_rgba(212,160,23,0.08)]">
                <ShieldOff size={44} className="text-[#7c5c1e]" />
            </div>
            <h1 className="text-3xl font-bold text-[#d4a017] mb-3 tracking-wide font-serif">Edit Details Unavailable</h1>
            <Divider />
            <p className="text-[#8a7355] max-w-sm mt-3 text-sm leading-relaxed">
                The admin has currently disabled this feature. Please check back later or contact the organizers.
            </p>
        </div>
    );

    /* ── EMAIL STEP ── */
    if (step === "email") return (
        <div className="min-h-screen bg-[#0a0806] flex items-center justify-center p-6"
            style={{ backgroundImage: "radial-gradient(ellipse at center, #1a1208 0%, #0a0806 70%)" }}>

            {/* faint horizontal lines */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: "repeating-linear-gradient(0deg, #d4a017 0px, transparent 1px, transparent 44px)" }} />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#7c5c1e]/80 bg-[#120e06] mb-5 shadow-[0_0_30px_rgba(212,160,23,0.12)]">
                        <Mail size={36} className="text-[#d4a017]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#d4a017] font-serif tracking-wide mb-2">Edit Your Details</h1>
                    <Divider />
                    <p className="text-[#8a7355] text-sm mt-3">Enter your registered KLU team lead email to continue</p>
                </div>

                <div className={`${card} p-8 relative overflow-hidden`}>
                    {/* corner anchors – purely decorative */}
                    {[["top-3 left-3", ""], ["top-3 right-3", "rotate-90"], ["bottom-3 left-3", "-rotate-90"], ["bottom-3 right-3", "rotate-180"]].map(([pos, rot], i) => (
                        <Anchor key={i} size={11} className={`absolute ${pos} ${rot} text-[#7c5c1e]/25`} />
                    ))}

                    <form onSubmit={handleEmailSubmit}>
                        <label className={label}>Team Lead Email</label>
                        <input
                            type="email" value={email}
                            onChange={e => { setEmail(e.target.value); setError(""); }}
                            placeholder="yourname@klu.ac.in"
                            className={input + " mb-4"} required
                        />
                        {error && (
                            <div className="flex items-start gap-2 bg-[#5c1a1a]/20 border border-[#8b1a1a]/50 text-[#e8a0a0] text-sm rounded-lg px-4 py-3 mb-4">
                                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}
                        <button type="submit" disabled={loading} className={`${goldBtn} w-full py-3 text-sm`}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            {loading ? "Looking up…" : "Find My Team"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[#7c5c1e]/50 text-xs italic mt-6 font-serif">
                    "Not all treasure is silver and gold, mate."
                </p>
            </div>
        </div>
    );

    /* ── EDIT FORM ── */
    return (
        <div className="min-h-screen bg-[#0a0806] p-6 md:p-10"
            style={{ backgroundImage: "radial-gradient(ellipse at top, #1a1208 0%, #0a0806 60%)" }}>

            {/* subtle grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
                style={{ backgroundImage: "linear-gradient(#d4a017 1px,transparent 1px),linear-gradient(90deg,#d4a017 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

            <div className="max-w-4xl mx-auto relative z-10">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => { setStep("email"); setTeamData(null); setError(""); }} className={`${ghostBtn} px-3 py-2 text-xs font-serif`}>
                        <ChevronLeft size={15} /> Back
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#d4a017] font-serif tracking-wide">Edit Team Details</h1>
                        <p className="text-[#8a7355] text-xs mt-1">
                            Team: <span className="text-[#e8d5a3] font-semibold">{teamData?.teamname}</span>
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-[#5c1a1a]/20 border border-[#8b1a1a]/50 text-[#e8a0a0] text-sm rounded-lg px-4 py-3 mb-5">
                        <AlertTriangle size={15} className="shrink-0" /> {error}
                    </div>
                )}

                {/* Lock notice */}
                <div className="flex items-center gap-2 text-xs text-[#8a7355] bg-[#120e06] border border-[#7c5c1e]/30 rounded-lg px-4 py-3 mb-6">
                    <Lock size={13} className="shrink-0 text-[#7c5c1e]" />
                    <span>Name fields are locked and cannot be edited. Contact the organizers for name corrections.</span>
                </div>

                <div className="space-y-6">

                    {/* ── Team Info ── */}
                    <section className={`${card} p-6`}>
                        <h3 className="text-base font-bold text-[#d4a017] font-serif tracking-wide mb-4 pb-3 border-b border-[#7c5c1e]/30 flex items-center gap-2">
                            <Anchor size={15} /> Team Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={label}>Team Name</label>
                                <input className={input} value={teamData.teamname || ""} onChange={e => setTeamData(p => ({ ...p, teamname: e.target.value }))} />
                            </div>
                            <div>
                                <label className={label}>Team Email</label>
                                <input className={input} value={teamData.email || ""} onChange={e => setTeamData(p => ({ ...p, email: e.target.value }))} />
                            </div>
                        </div>
                    </section>

                    {/* ── Team Lead ── */}
                    <section className={`${card} p-6`}>
                        <h3 className="text-base font-bold text-[#d4a017] font-serif tracking-wide mb-4 pb-3 border-b border-[#7c5c1e]/30 flex items-center gap-2">
                            <Compass size={15} /> Team Lead Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
                            <div>
                                <label className={label}>Lead Name <span className="text-[#7c5c1e] normal-case font-normal">(locked)</span></label>
                                <input className={inputRO} value={teamData.name || ""} readOnly />
                            </div>
                            <div>
                                <label className={label}>Registration Number</label>
                                <input className={input} value={teamData.registrationNumber || ""} onChange={e => setTeamData(p => ({ ...p, registrationNumber: e.target.value }))} />
                            </div>
                            <div>
                                <label className={label}>Phone Number</label>
                                <input className={input} value={teamData.phoneNumber || ""} onChange={e => setTeamData(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="+91…" />
                            </div>
                        </div>
                        <Divider />
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                            {["room", "type", "year", "department", "section"].map(f => (
                                <div key={f}>
                                    <label className={label}>{f === "department" ? "Dept" : f.charAt(0).toUpperCase() + f.slice(1)}</label>
                                    <input className={smInput} value={teamData[f] || ""} onChange={e => setTeamData(p => ({ ...p, [f]: e.target.value }))} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Team Members ── */}
                    <section className={`${card} p-6`}>
                        <h3 className="text-base font-bold text-[#d4a017] font-serif tracking-wide mb-4 pb-3 border-b border-[#7c5c1e]/30 flex items-center gap-2">
                            <Skull size={15} /> Team Members
                        </h3>
                        <div className="space-y-4">
                            {teamData.teamMembers?.map((member, idx) => (
                                <div key={idx} className="bg-[#0f0b05] border border-[#7c5c1e]/25 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-5 h-5 rounded-full bg-[#d4a017]/10 border border-[#7c5c1e]/40 flex items-center justify-center text-[#d4a017] text-[9px] font-bold">{idx + 1}</span>
                                        <span className="text-[#8a7355] text-[10px] uppercase tracking-widest">Member {idx + 1}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className={label}>Name <span className="text-[#7c5c1e] normal-case font-normal">(locked)</span></label>
                                            <input className={smRO} value={member.name || ""} readOnly />
                                        </div>
                                        <div>
                                            <label className={label}>Registration Number</label>
                                            <input className={smInput} value={member.registrationNumber || ""} onChange={e => updateMember(idx, "registrationNumber", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {["room", "type", "year", "department", "section"].map(f => (
                                            <div key={f}>
                                                <label className={label}>{f === "department" ? "Dept" : f.charAt(0).toUpperCase() + f.slice(1)}</label>
                                                <input className={smInput} value={member[f] || ""} onChange={e => updateMember(idx, f, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Save */}
                    <div className="flex justify-end pb-10">
                        <button onClick={() => setConfirmOpen(true)} disabled={saving} className={`${goldBtn} px-10 py-3 text-sm`}>
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ════ CONFIRMATION MODAL ════ */}
            {confirmOpen && (
                <>
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40" onClick={() => setConfirmOpen(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
                        <div className={`${card} w-full max-w-sm p-7 pointer-events-auto relative overflow-hidden`}>
                            {[["top-2 left-2", ""], ["top-2 right-2", "rotate-90"], ["bottom-2 left-2", "-rotate-90"], ["bottom-2 right-2", "rotate-180"]].map(([pos, rot], i) => (
                                <Anchor key={i} size={9} className={`absolute ${pos} ${rot} text-[#7c5c1e]/25`} />
                            ))}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full border border-[#7c5c1e] bg-[#d4a017]/10 flex items-center justify-center shrink-0">
                                    <Save size={18} className="text-[#d4a017]" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#d4a017] text-lg font-serif leading-tight">Save Changes?</h2>
                                    <p className="text-[#8a7355] text-xs">Team: <span className="text-[#e8d5a3]">{teamData?.teamname}</span></p>
                                </div>
                            </div>
                            <Divider />
                            <p className="text-[#8a7355] text-sm my-4 leading-relaxed">
                                You are about to update your team's registration details. This will overwrite the existing information. Are you sure?
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmOpen(false)} className={`${ghostBtn} flex-1 py-2.5 text-sm`}>
                                    <X size={15} /> Cancel
                                </button>
                                <button onClick={doSave} className={`${goldBtn} flex-1 py-2.5 text-sm`}>
                                    <Save size={15} /> Yes, Save
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ════ TOAST ════ */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm max-w-sm
          ${toast.type === "success" ? "bg-[#0a1208] border-[#2d6a2d]" : "bg-[#120a0a] border-[#6a2d2d]"}`}>
                    {toast.type === "success"
                        ? <CheckCircle size={20} className="text-[#4caf50] shrink-0" />
                        : <AlertTriangle size={20} className="text-[#e88a8a] shrink-0" />
                    }
                    <div className="flex-1">
                        <p className={`font-bold text-xs uppercase tracking-wider mb-0.5 ${toast.type === "success" ? "text-[#4caf50]" : "text-[#e88a8a]"}`}>
                            {toast.type === "success" ? "Success!" : "Error"}
                        </p>
                        <p className="text-[#8a7355] text-xs">{toast.msg}</p>
                    </div>
                    <button onClick={() => setToast(null)} className="text-[#7c5c1e] hover:text-[#d4a017] transition-colors ml-1">
                        <X size={13} />
                    </button>
                </div>
            )}
        </div>
    );
}
