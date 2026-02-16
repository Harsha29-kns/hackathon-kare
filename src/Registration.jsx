import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Users, User, Phone, Map, Skull, Anchor, Scroll, Compass, Volume2, VolumeX } from 'lucide-react';
import { io } from 'socket.io-client';
import RegistrationSuccess from './RegistrationSuccess';

const socket = io(api);

const Registration = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submittedTeamName, setSubmittedTeamName] = useState('');
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = React.useRef(new Audio("/music/regi.mp3"));

    useEffect(() => {
        const audio = audioRef.current;
        audio.loop = true;

        // Attempt to play on mount (might be blocked by browser)
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                setIsMusicPlaying(true);
            }).catch(error => {
                console.log("Autoplay prevented:", error);
                setIsMusicPlaying(false);
            });
        }

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    const toggleMusic = () => {
        const audio = audioRef.current;
        if (isMusicPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    // Registration status state
    const [isRegClosed, setIsRegClosed] = useState(false);
    const [currentCount, setCurrentCount] = useState(0);
    const [registrationLimit, setRegistrationLimit] = useState(0);

    // Initial State updated with 'room' and 'type'
    const [formData, setFormData] = useState({
        teamname: '',
        // Lead Details (Root level in schema)
        name: '',
        email: '',
        registrationNumber: '',
        year: '',
        department: '',
        section: '',
        phone: '',
        room: '',      // Added missing field
        type: '',      // Added missing field (Room Type)
        // Members (Array of 4)
        teamMembers: [
            { name: '', registrationNumber: '', year: '', department: '', section: '', room: '', type: '' },
            { name: '', registrationNumber: '', year: '', department: '', section: '', room: '', type: '' },
            { name: '', registrationNumber: '', year: '', department: '', section: '', room: '', type: '' },
            { name: '', registrationNumber: '', year: '', department: '', section: '', room: '', type: '' }
        ]
    });

    const handleLeadChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMemberChange = (index, field, value) => {
        const updatedMembers = [...formData.teamMembers];
        updatedMembers[index][field] = value;
        setFormData({ ...formData, teamMembers: updatedMembers });
    };

    const validateForm = () => {
        if (!formData.email.endsWith('@klu.ac.in')) {
            alert("Captain! The Team Lead email must be a valid @klu.ac.in ID.");
            return false;
        }
        return true;
    };

    // Listen for registration status updates
    useEffect(() => {
        socket.on('registrationStatus', (status) => {
            setIsRegClosed(status.isClosed);
            setCurrentCount(status.count);
            setRegistrationLimit(status.limit);
        });

        // Request initial status
        socket.emit('check');

        return () => {
            socket.off('registrationStatus');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isRegClosed) {
            alert("The recruitment books are closed! Contact the Quartermaster (ScoreCraft team).");
            return;
        }

        if (!validateForm()) return;

        setLoading(true);
        try {
            await axios.post(`${api}/Hack/register`, formData);
            setSubmittedTeamName(formData.teamname);
            setShowSuccess(true);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || "Registration Failed";
            alert(`Arrr! ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    // Show success page after registration
    if (showSuccess) {
        return <RegistrationSuccess teamName={submittedTeamName} />;
    }

    return (
        <div className="min-h-screen bg-pirate-ocean relative overflow-hidden font-body selection:bg-pirate-red/30 text-pirate-parchment">
            {/* Atmosphere layers */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none sticky top-0 h-32"></div>

            {/* Music Toggle Button */}
            <button
                onClick={toggleMusic}
                className="fixed top-6 right-6 z-50 p-4 bg-pirate-wood/90 text-pirate-gold rounded-full border-2 border-pirate-gold shadow-lg hover:scale-110 transition-transform duration-300 group"
                title={isMusicPlaying ? "Mute Shanty" : "Play Shanty"}
            >
                {isMusicPlaying ? <Volume2 className="w-6 h-6 animate-pulse" /> : <VolumeX className="w-6 h-6" />}
            </button>

            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-6xl md:text-7xl font-pirate text-pirate-gold mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-wider">
                        Join the Crew
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-pirate-parchment/80">
                        <span className="h-[2px] w-12 bg-pirate-gold/50"></span>
                        <p className="text-xl uppercase tracking-[0.2em] font-bold">HackSail 2K26</p>
                        <span className="h-[2px] w-12 bg-pirate-gold/50"></span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={`space-y-12 ${isRegClosed ? 'blur-sm pointer-events-none opacity-50' : ''}`}>

                    {/* Team Name - The Flag */}
                    <div className="bg-pirate-wood border-2 border-pirate-gold/30 rounded-lg p-8 shadow-2xl relative overflow-hidden group hover:border-pirate-gold/60 transition-colors duration-500">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pirate-gold to-transparent opacity-50"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-pirate-red/20 rounded-full border border-pirate-red/40">
                                <Skull className="text-pirate-red w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-pirate text-pirate-parchment">TEAM NAME</h2>
                        </div>
                        <InputGroup label="Team Name" name="teamname" value={formData.teamname} onChange={handleLeadChange} placeholder="e.g., The Black Pearl" required disabled={isRegClosed} />
                    </div>

                    {/* Team Lead Section - The Captain */}
                    <div className="bg-pirate-parchment text-pirate-wood-light rounded-sm p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)] transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <div className="border border-pirate-wood/40 border-dashed p-8 h-full bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
                            <div className="flex items-center gap-4 mb-8 border-b-2 border-pirate-wood/20 pb-4">
                                <div className="p-3 bg-pirate-wood/10 rounded-full">
                                    <Compass className="text-pirate-wood w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-pirate text-pirate-wood">The Captain</h2>
                                    <p className="text-pirate-wood/70 text-sm font-bold tracking-widest uppercase">Lead Applicant Details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputGroup variant="parchment" label="Captain's Name" name="name" value={formData.name} onChange={handleLeadChange} required disabled={isRegClosed} />
                                <InputGroup variant="parchment" label="Official Email (@klu.ac.in)" name="email" type="email" value={formData.email} onChange={handleLeadChange} required disabled={isRegClosed} />
                                <InputGroup variant="parchment" label="Reg.No" name="registrationNumber" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.registrationNumber} onChange={handleLeadChange} required disabled={isRegClosed} />
                                <InputGroup variant="parchment" label="Phone.no" name="phone" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.phone} onChange={handleLeadChange} required disabled={isRegClosed} />

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                    <SelectGroup variant="parchment" label="Quarters (Hostel)" name="type" value={formData.type} onChange={handleLeadChange} options={["Day Scholar", "LH-1", "LH-2", "LH-3", "LH-4", "MH-1", "MH-2", "MH-3", "MH-4", "MH-6"]} required disabled={isRegClosed} />
                                    <InputGroup variant="parchment" label="Cabin Number (Room)" name="room" value={formData.room} onChange={handleLeadChange} placeholder="e.g., F-101" required disabled={isRegClosed} />
                                </div>

                                <div className="md:col-span-2 grid grid-cols-3 gap-6 mt-4">
                                    <SelectGroup variant="parchment" label="Year" name="year" value={formData.year} onChange={handleLeadChange} options={["II", "III", "IV"]} required disabled={isRegClosed} />
                                    <InputGroup variant="parchment" label="Department" name="department" value={formData.department} onChange={handleLeadChange} placeholder="CSE" required disabled={isRegClosed} />
                                    <InputGroup variant="parchment" label="Section" name="section" value={formData.section} onChange={handleLeadChange} required disabled={isRegClosed} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Members Section - The Crew */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-2 px-4">
                            <Users className="text-pirate-gold w-8 h-8" />
                            <h2 className="text-3xl font-pirate text-pirate-gold">The Crew (4)</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {formData.teamMembers.map((member, index) => (
                                <div key={index} className="bg-pirate-wood/50 border border-pirate-gold/20 p-6 rounded-lg relative hover:bg-pirate-wood/80 transition-colors">
                                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-pirate-red text-white flex items-center justify-center font-pirate text-xl rounded shadow-lg transform rotate-12 z-10">
                                        {index + 1}
                                    </div>
                                    <div className="space-y-4">
                                        <InputGroup label="Name" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} required disabled={isRegClosed} />
                                        <InputGroup label="Reg. Number" type="text" inputMode="numeric" pattern="[0-9]*" value={member.registrationNumber} onChange={(e) => handleMemberChange(index, 'registrationNumber', e.target.value)} required disabled={isRegClosed} />

                                        <div className="grid grid-cols-2 gap-4">
                                            <SelectGroup label="Hostel" value={member.type} onChange={(e) => handleMemberChange(index, 'type', e.target.value)} options={["Day Scholar", "LH-1", "LH-2", "LH-3", "LH-4", "MH-1", "MH-2", "MH-3", "MH-4", "MH-6"]} required disabled={isRegClosed} />
                                            <InputGroup label="Room" value={member.room} onChange={(e) => handleMemberChange(index, 'room', e.target.value)} required disabled={isRegClosed} />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <SelectGroup label="Year" value={member.year} onChange={(e) => handleMemberChange(index, 'year', e.target.value)} options={["II", "III", "IV"]} required disabled={isRegClosed} />
                                            <InputGroup label="Dept" value={member.department} onChange={(e) => handleMemberChange(index, 'department', e.target.value)} required disabled={isRegClosed} />
                                            <InputGroup label="Sec" value={member.section} onChange={(e) => handleMemberChange(index, 'section', e.target.value)} required disabled={isRegClosed} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 pb-16">
                        <button
                            type="submit"
                            disabled={loading || isRegClosed}
                            className="w-full max-w-md mx-auto block bg-gradient-to-b from-pirate-gold to-pirate-gold-hover text-pirate-wood-light font-pirate text-3xl py-4 px-8 rounded border-b-4 border-b-pirate-wood/40 shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform hover:-translate-y-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <Anchor className="w-6 h-6" />
                                {loading ? "Signing the Articles..." : isRegClosed ? "Voyage Departed" : "Join the Adventure"}
                            </span>
                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </button>
                    </div>
                </form>

                {/* Closed Registration Overlay */}
                {isRegClosed && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                        <div className="bg-pirate-wood-light text-pirate-wood p-12 max-w-2xl text-center rounded-lg shadow-2xl border-8 border-pirate-wood relative bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
                            <Skull className="w-24 h-24 text-pirate-red mx-auto mb-6 opacity-80" />
                            <h2 className="text-6xl font-pirate text-pirate-red mb-6">Voyage Departed</h2>
                            <p className="text-2xl font-body mb-8">The ship has sailed, matey. Registration is closed.</p>
                            <div className="border-t-2 border-pirate-wood/20 pt-8 mt-8">
                                <p className="mb-4 font-bold uppercase tracking-widest">Quartermaster Contact</p>
                                <a href="tel:7671084221" className="text-4xl font-pirate text-pirate-wood hover:text-pirate-red transition-colors flex items-center justify-center gap-3">
                                    <Phone /> 7671084221
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// Reusable Input Components with Variants
const InputGroup = ({ label, type = "text", disabled, variant = "default", ...props }) => {
    const isParchment = variant === "parchment";

    return (
        <div className="relative group">
            <label className={`block text-xs font-bold uppercase tracking-widest mb-1 ${isParchment ? 'text-pirate-wood/60' : 'text-pirate-parchment/60'}`}>
                {label}
            </label>
            <input
                type={type}
                disabled={disabled}
                className={`w-full bg-transparent border-b-2 py-2 px-1 font-body text-lg transition-all focus:outline-none
                    ${isParchment
                        ? 'border-pirate-wood/30 text-pirate-wood focus:border-pirate-wood placeholder-pirate-wood/30'
                        : 'border-pirate-gold/30 text-pirate-parchment focus:border-pirate-gold placeholder-pirate-parchment/30'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                {...props}
            />
        </div>
    );
};

const SelectGroup = ({ label, options, disabled, variant = "default", ...props }) => {
    const isParchment = variant === "parchment";

    return (
        <div className="relative group">
            <label className={`block text-xs font-bold uppercase tracking-widest mb-1 ${isParchment ? 'text-pirate-wood/60' : 'text-pirate-parchment/60'}`}>
                {label}
            </label>
            <select
                disabled={disabled}
                className={`w-full bg-transparent border-b-2 py-2 px-1 font-body text-lg transition-all focus:outline-none appearance-none
                    ${isParchment
                        ? 'border-pirate-wood/30 text-pirate-wood focus:border-pirate-wood'
                        : 'border-pirate-gold/30 text-pirate-parchment focus:border-pirate-gold'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                {...props}
            >
                <option value="" className="text-black">Select</option>
                {options.map(opt => <option key={opt} value={opt} className="text-black">{opt}</option>)}
            </select>
        </div>
    );
};

export default Registration;
