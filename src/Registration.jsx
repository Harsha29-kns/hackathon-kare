import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Users, User, Building, Mail, Hash, Home, AlertCircle, Phone } from 'lucide-react'; // Added Home icon
import { io } from 'socket.io-client';
import RegistrationSuccess from './RegistrationSuccess';

const socket = io(api);

const Registration = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submittedTeamName, setSubmittedTeamName] = useState('');

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
            alert("Team Lead email must be a valid @klu.ac.in ID.");
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
            alert("Registration is currently closed. Please contact the ScoreCraft team for assistance.");
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
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    // Show success page after registration
    if (showSuccess) {
        return <RegistrationSuccess teamName={submittedTeamName} />;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-orange-500 mb-2">Team Registration</h1>
                    <p className="text-gray-400">Assemble your squad. Prepare for battle.</p>
                </div>

                <form onSubmit={handleSubmit} className={`space-y-8 ${isRegClosed ? 'blur-sm pointer-events-none' : ''}`}>

                    {/* Team Name */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Users className="text-orange-500" /> Team Identity
                        </h2>
                        <InputGroup label="Team Name" name="teamname" value={formData.teamname} onChange={handleLeadChange} placeholder="e.g., Code Ninjas" required disabled={isRegClosed} />
                    </div>

                    {/* Team Lead Section */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <User className="text-blue-500" /> Team Lead (Hostel/Room Details)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Full Name" name="name" value={formData.name} onChange={handleLeadChange} required disabled={isRegClosed} />
                            <InputGroup label="Email (@klu.ac.in)" name="email" type="email" value={formData.email} onChange={handleLeadChange} required disabled={isRegClosed} />
                            <InputGroup label="Reg. Number" name="registrationNumber" type="number" value={formData.registrationNumber} onChange={handleLeadChange} required disabled={isRegClosed} />
                            <InputGroup label="Phone Number" name="phone" type="number" value={formData.phone} onChange={handleLeadChange} required disabled={isRegClosed} />

                            {/* NEW FIELDS FOR LEAD */}
                            <SelectGroup label="HOSTEL Type" name="type" value={formData.type} onChange={handleLeadChange} options={["Day Scholar", "LH-1", "LH-2", "LH-3", "LH-4", "MH-1", "MH-2", "MH-3", "MH-4", "MH-6"]} required disabled={isRegClosed} />
                            <InputGroup label="Room No OR NA" name="room" value={formData.room} onChange={handleLeadChange} placeholder="e.g., F-101" required disabled={isRegClosed} />


                            <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                <SelectGroup label="Year" name="year" value={formData.year} onChange={handleLeadChange} options={["I", "II", "III", "IV"]} required disabled={isRegClosed} />
                                <InputGroup label="Department" name="department" value={formData.department} onChange={handleLeadChange} placeholder="CSE" required disabled={isRegClosed} />
                                <InputGroup label="Section" name="section" value={formData.section} onChange={handleLeadChange} required disabled={isRegClosed} />
                            </div>
                        </div>
                    </div>

                    {/* Team Members Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white px-2 flex items-center gap-2">
                            <Users className="text-green-500" /> Team Members (4)
                        </h2>
                        {formData.teamMembers.map((member, index) => (
                            <div key={index} className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-md relative">
                                <span className="absolute top-4 right-4 text-gray-600 font-bold text-lg">#{index + 1}</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Name" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} required disabled={isRegClosed} />
                                    <InputGroup label="Reg. Number" type="number" value={member.registrationNumber} onChange={(e) => handleMemberChange(index, 'registrationNumber', e.target.value)} required disabled={isRegClosed} />

                                    {/* NEW FIELDS FOR MEMBERS */}
                                    <SelectGroup label="HOSTEL Type" value={member.type} onChange={(e) => handleMemberChange(index, 'type', e.target.value)} options={["Day Scholar", "LH-1", "LH-2", "LH-3", "LH-4", "MH-1", "MH-2", "MH-3", "MH-4", "MH-6"]} required disabled={isRegClosed} />
                                    <InputGroup label="Room No OR N/A" value={member.room} onChange={(e) => handleMemberChange(index, 'room', e.target.value)} required disabled={isRegClosed} />


                                    <SelectGroup label="Year" value={member.year} onChange={(e) => handleMemberChange(index, 'year', e.target.value)} options={["I", "II", "III", "IV"]} required disabled={isRegClosed} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <InputGroup label="Dept" value={member.department} onChange={(e) => handleMemberChange(index, 'department', e.target.value)} required disabled={isRegClosed} />
                                        <InputGroup label="Section" value={member.section} onChange={(e) => handleMemberChange(index, 'section', e.target.value)} required disabled={isRegClosed} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || isRegClosed}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                    >
                        {loading ? "Registering Team..." : isRegClosed ? "Registration Closed" : "Submit Registration"}
                    </button>
                </form>

                {/* Full-Screen Overlay when Registration is Closed */}
                {isRegClosed && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                        <div className="text-center px-8 py-12 max-w-2xl">
                            <div className="mb-8">
                                <AlertCircle className="text-red-500 mx-auto mb-6" size={80} />
                                <h2 className="text-5xl font-bold text-red-500 mb-4">
                                    Registration Closed
                                </h2>
                            </div>

                            <div className="bg-gray-900/90 border-2 border-red-500 rounded-2xl p-8 shadow-2xl">
                                <p className="text-gray-300 text-xl mb-6">
                                    For any doubts related to event contact this number:
                                </p>

                                <div className="mb-6">
                                    <a
                                        href="tel:7671084221"
                                        className="inline-flex items-center gap-3 text-white font-bold text-4xl hover:text-red-400 transition-colors"
                                    >
                                        <Phone size={40} className="text-red-500" />
                                        7671084221
                                    </a>
                                </div>

                                <p className="text-gray-400 text-lg italic">
                                    - ScoreCraft Team
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// Reusable Input Components
const InputGroup = ({ label, type = "text", disabled, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input
            type={type}
            disabled={disabled}
            className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...props}
        />
    </div>
);

const SelectGroup = ({ label, options, disabled, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <select
            disabled={disabled}
            className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...props}
        >
            <option value="">Select</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default Registration;