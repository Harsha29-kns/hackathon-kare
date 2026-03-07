import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import api from "./api";
import socket from "./socket";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from "papaparse";
import JSZip from 'jszip';
import { Gem, ArrowLeft, ArrowRight } from "lucide-react";


const Notification = ({ message, type, onClear }) => {
    useEffect(() => {
        const timer = setTimeout(() => { onClear(); }, 3000);
        return () => clearTimeout(timer);
    }, [onClear]);
    const typeStyles = type === 'success'
        ? "bg-gradient-to-r from-emerald-600/90 to-teal-700/90 border border-emerald-400/40"
        : "bg-gradient-to-r from-red-700/90 to-rose-800/90 border border-red-400/40";
    return (
        <div className={`fixed top-6 right-6 z-[9999] px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold text-base backdrop-blur-md flex items-center gap-3 ${typeStyles}`}
            style={{ animation: 'slideInRight 0.4s ease-out' }}>
            <span>{type === 'success' ? '⚓' : '☠️'}</span>
            {message}
        </div>
    );
};

const PirateLoader = () => (
    <div className="flex flex-col items-center justify-center text-center gap-4">
        <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-t-amber-400 border-r-amber-400 border-b-transparent border-l-transparent animate-spin" />
            
        </div>
        <p className="text-amber-400 text-lg font-pirata tracking-widest">Charting the Seas...</p>
    </div>
);

const StatCard = ({ title, value, color }) => (
    <div className={`bg-black/30 border ${color} p-5 rounded-2xl shadow-lg text-center backdrop-blur-md hover:scale-105 transition-transform duration-200`}>
        <h2 className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-widest">{title}</h2>
        <p className="text-4xl font-bold text-white">{value}</p>
    </div>
);

const DomainMonitor = ({ teams, domains, onResetDomains }) => {
    const [isLoading, setIsLoading] = useState(false);


    const teamsWithDomain = useMemo(() => teams.filter(team => team.Domain), [teams]);
    const unassignedVerifiedTeams = useMemo(() => teams.filter(team => !team.Domain && team.verified), [teams]);

    const handleResetClick = async () => {
        if (window.confirm("Are you sure you want to reset ALL domain selections? This action cannot be undone.")) {
            setIsLoading(true);
            await onResetDomains();
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🗺️</span>
                    <h2 className="text-3xl font-pirata text-amber-400 tracking-wide">Problem Statements Monitor</h2>
                </div>
                <button
                    onClick={handleResetClick}
                    disabled={isLoading}
                    className="font-bold py-2 px-4 rounded-xl text-sm disabled:opacity-50 transition-all hover:scale-105"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                >
                    {isLoading ? "Resetting..." : "🔄 Reset All Domains"}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard title="Teams Assigned to a Statement" value={teamsWithDomain.length} color="border-emerald-500/50" />
                <StatCard title="Unassigned Statements" value={unassignedVerifiedTeams.length} color="border-amber-500/50" />
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-7/12">
                    <div className="rounded-2xl p-6 max-h-[calc(100vh-350px)] overflow-y-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,150,12,0.15)' }}>
                        <h3 className="text-lg font-bold mb-4 text-gray-200">Filled Statements</h3>
                        <div className="space-y-4">
                            {domains.map(domain => {
                                const assignedTeams = teams.filter(t => t.Domain === domain.name);
                                const totalSlots = domain.slots + assignedTeams.length;
                                const filledPercentage = totalSlots > 0 ? (assignedTeams.length / totalSlots) * 100 : 0;
                                return (
                                    <div key={domain.id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,150,12,0.1)' }}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-lg text-white">{domain.name}</span>
                                            <span className="font-semibold text-xl">
                                                {assignedTeams.length} <span className="text-sm text-gray-400">/ {totalSlots}</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                                            <div className="h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${filledPercentage}%`, background: 'linear-gradient(90deg, #c8960c, #f5c842)' }} />
                                        </div>
                                        {assignedTeams.length > 0 && (
                                            <div className="mt-3 text-sm text-gray-400 pt-3" style={{ borderTop: '1px solid rgba(200,150,12,0.1)' }}>
                                                <strong className="text-gray-500">Teams:</strong> {assignedTeams.map(t => t.teamname).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-5/12">
                    <div className="rounded-2xl p-6 max-h-[calc(100vh-350px)] overflow-y-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,150,12,0.15)' }}>
                        <h3 className="text-lg font-bold mb-4 text-gray-200">Unassigned Teams</h3>
                        {unassignedVerifiedTeams.length > 0 ? (
                            <ul className="space-y-2">
                                {unassignedVerifiedTeams.map(team => (
                                    <li key={team._id} className="p-3 rounded-xl text-gray-300 font-semibold" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        {team.teamname}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <p className="text-3xl">🎉</p>
                                <p className="mt-2 font-semibold">All verified teams have selected a domain!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


function Admin() {

    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem("adminAuthenticated") === "true");
    const [passwordInput, setPasswordInput] = useState("");
    const [loginError, setLoginError] = useState("");
    const [notification, setNotification] = useState({ message: '', type: '' });


    const [allTeams, setAllTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationTab, setVerificationTab] = useState('pending');
    const [expandedTeam, setExpandedTeam] = useState(null);
    const [showAttdModal, setShowAttdModal] = useState(false);
    const [selectedAttdRound, setSelectedAttdRound] = useState(null);
    const navigate = useNavigate();
    const [allDomains, setAllDomains] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [teamsWithIssues, setTeamsWithIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(false);
    const [reminderText, setReminderText] = useState("");
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const [reminderError, setReminderError] = useState("");
    const [showCredentialModal, setShowCredentialModal] = useState(false);
    const [selectedTeamForPass, setSelectedTeamForPass] = useState("");
    const [isGeneratingPass, setIsGeneratingPass] = useState(false);
    const [verificationSearchTerm, setVerificationSearchTerm] = useState("");
    const [pptTemplate, setPptTemplate] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [isZipping, setIsZipping] = useState(false);
    const [zipProgress, setZipProgress] = useState({ current: 0, total: 0 });
    const [verifyingTeamId, setVerifyingTeamId] = useState(null);
    const [sendingPassTeamId, setSendingPassTeamId] = useState(null);
    const [activeView, setActiveView] = useState('teams');
    const [activeSessionsCount, setActiveSessionsCount] = useState(0);
    const [selectedTeamScoring, setSelectedTeamScoring] = useState("");
    const [internalScoreInput, setInternalScoreInput] = useState("");
    const [isSubmittingScore, setIsSubmittingScore] = useState(false);
    const [scoringSearchTerm, setScoringSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);


    const [teamForPdf, setTeamForPdf] = useState(null);


    const ITEMS_PER_PAGE = 20;

    const handleInternalScoreSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeamScoring || internalScoreInput === "") {
            setNotification({ message: 'Please select a team and enter a score.', type: 'error' });
            return;
        }
        setIsSubmittingScore(true);
        const score = parseInt(internalScoreInput, 10);
        try {
            await axios.post(`${api}/Hack/team/${selectedTeamScoring}/internal-score`, { score });
            setNotification({ message: 'Score submitted successfully!', type: 'success' });
            fetchData(); // Refetch all data
            setSelectedTeamScoring("");
            setInternalScoreInput("");
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to submit score.";
            setNotification({ message: errorMsg, type: 'error' });
        } finally {
            setIsSubmittingScore(false);
        }
    };

    const handleResetAllDomains = async () => {
        try {
            await axios.post(`${api}/Hack/admin/reset-domains`);
            setNotification({ message: 'All domains have been reset!', type: 'success' });
            fetchData(); // Refetch all data
        } catch (error) {
            setNotification({ message: 'Failed to reset domains.', type: 'error' });
        }
    };

    const handleLogin = (e) => { e.preventDefault(); if (passwordInput === "harsha") { setIsAuthenticated(true); sessionStorage.setItem("adminAuthenticated", "true"); setLoginError(""); } else { setLoginError("Incorrect Secret Jutsu. Access Denied."); setPasswordInput(""); } };
    const handleLogout = () => { sessionStorage.removeItem("adminAuthenticated"); setIsAuthenticated(false); setPasswordInput(""); };
    const handleSendPPT = async () => { if (!pptTemplate) { setUploadError("Please select a file."); return; } setIsUploading(true); setUploadError(""); try { const formData = new FormData(); formData.append("file", pptTemplate); formData.append("upload_preset", "ppt_templet"); const response = await axios.post("https://api.cloudinary.com/v1_1/dsvwojzli/raw/upload", formData); socket.emit('admin:sendPPT', { fileUrl: response.data.secure_url, fileName: pptTemplate.name }); setPptTemplate(null); document.getElementById('ppt-input').value = null; setNotification({ message: 'PPT Sent!', type: 'success' }); } catch (error) { setUploadError("Upload failed."); setNotification({ message: 'PPT Upload Failed!', type: 'error' }); } finally { setIsUploading(false); } };

    // UPDATED: No longer needs to fetch. Uses `allTeams` state directly.
    const handleExportMembers = async () => {
        setNotification({ message: 'Preparing full report...', type: 'success' });
        try {
            const flatData = [];
            allTeams.forEach(team => {
                flatData.push({ "Team Name": team.teamname, "Payment Status": team.verified ? "Yes" : "No", "Member Name": team.name, "Role": "Lead", "Registration Number": team.registrationNumber, "Year": team.year, "Department": team.department, "Email": team.email, "Phone": team.phone, "Transaction ID": team.transtationId, "Payment Image URL": team.imgUrl, });
                team.teamMembers.forEach(member => {
                    flatData.push({ "Team Name": team.teamname, "Payment Status": team.verified ? "Yes" : "No", "Member Name": member.name, "Role": "Member", "Registration Number": member.registrationNumber, "Year": member.year, "Department": member.department, "Email": member.email, "Phone": member.phone, });
                });
            });
            const csv = Papa.unparse(flatData);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "full_members_export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            setNotification({ message: 'Failed to export members.', type: 'error' });
        }
    };

    const fetchIssues = async () => { setIssuesLoading(true); try { const res = await axios.get(`${api}/Hack/issues`); const pendingIssues = res.data.map(team => ({ ...team, issues: team.issues.filter(issue => issue.status === 'Pending') })).filter(team => team.issues.length > 0); setTeamsWithIssues(pendingIssues); } catch (error) { alert("Could not load support requests."); } finally { setIssuesLoading(false); } };
    const handleOpenSupportModal = () => { setShowSupportModal(true); fetchIssues(); };
    const handleResolveIssue = async (teamId, issueId) => { const originalIssues = [...teamsWithIssues]; setTeamsWithIssues(prevTeams => prevTeams.map(team => team._id === teamId ? { ...team, issues: team.issues.filter(issue => issue._id !== issueId) } : team).filter(team => team.issues.length > 0)); try { await axios.post(`${api}/Hack/issue/resolve/${teamId}/${issueId}`); setNotification({ message: 'Issue Resolved!', type: 'success' }); } catch (error) { setTeamsWithIssues(originalIssues); setNotification({ message: 'Failed to Resolve Issue!', type: 'error' }); } };
    const handleSendReminder = () => { if (!reminderText.trim()) { setReminderError("Cannot be empty."); return; } setIsSendingReminder(true); setReminderError(""); socket.emit('admin:sendReminder', { message: reminderText.trim() }); setNotification({ message: 'Reminder Sent!', type: 'success' }); setTimeout(() => { setIsSendingReminder(false); setReminderText(""); }, 1000); };

    // UPDATED: Now only updates the master `allTeams` list.
    const handleVerifyTeam = async (teamId) => {
        setVerifyingTeamId(teamId);
        try {
            await axios.post(`${api}/Hack/verify/${teamId}`);
            setAllTeams(prev => prev.map(t => t._id === teamId ? { ...t, verified: true } : t));
            setNotification({ message: 'Team Verified!', type: 'success' });
        } catch (error) {
            setNotification({ message: 'Verification Failed!', type: 'error' });
        } finally {
            setVerifyingTeamId(null);
        }
    };

    const handleSendPassEmail = async (teamId) => {
        setSendingPassTeamId(teamId);
        try {
            await axios.post(`${api}/Hack/admin/send-credential/${teamId}`);
            setNotification({ message: 'Credentials Sent Successfully!', type: 'success' });
        } catch (error) {
            setNotification({ message: 'Failed to send credentials!', type: 'error' });
        } finally {
            setSendingPassTeamId(null);
        }
    };

    // UPDATED: Now only updates the master `allTeams` list.
    const handleDomainChange = async (teamId, newDomain) => {
        const originalTeams = [...allTeams];
        setAllTeams(prev => prev.map(t => t._id === teamId ? { ...t, Domain: newDomain } : t));
        try {
            await axios.post(`${api}/Hack/updateDomain`, { teamId, domain: newDomain });
            setNotification({ message: 'Domain Updated!', type: 'success' });
        } catch (error) {
            setAllTeams(originalTeams);
            setNotification({ message: 'Failed to Update Domain!', type: 'error' });
        }
    };

    const toggleTeamDetails = (teamId) => { setExpandedTeam(expandedTeam === teamId ? null : teamId); };

    // UPDATED: This function now just sets the state to trigger the PDF generation effect.
    const handleDownloadPass = async () => {
        if (!selectedTeamForPass) {
            alert("Please select a team.");
            return;
        }
        const team = allTeams.find(t => t._id === selectedTeamForPass);
        if (!team) {
            alert("Selected team not found.");
            return;
        }
        setIsGeneratingPass(true);
        setTeamForPdf(team); // This will trigger the useEffect for PDF generation
    };

    // NEW: This effect handles the actual PDF generation for a single pass.
    useEffect(() => {
        if (!teamForPdf || !isGeneratingPass) return;

        const generatePdf = async () => {
            const passElement = document.getElementById(`credential-pass-${teamForPdf._id}`);
            if (!passElement) {
                console.error("Pass element not found in DOM for PDF generation.");
                setIsGeneratingPass(false);
                setTeamForPdf(null);
                return;
            }
            try {
                const canvas = await html2canvas(passElement, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${teamForPdf.teamname}_Credentials.pdf`);
                setNotification({ message: 'Credentials Exported!', type: 'success' });
            } catch (error) {
                setNotification({ message: 'Export Failed!', type: 'error' });
            } finally {
                setIsGeneratingPass(false);
                setTeamForPdf(null); // Clean up the state after generation
            }
        };

        // Use a short timeout to ensure React has rendered the component before we try to capture it.
        const timer = setTimeout(generatePdf, 100);
        return () => clearTimeout(timer);

    }, [teamForPdf, isGeneratingPass]); // Effect runs when a team is set for PDF generation

    // UPDATED: Rewritten for efficiency. It now generates PDFs one by one.
    const handleDownloadAllPasses = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const verifiedTeams = allTeams.filter(t => t.verified);

            if (verifiedTeams.length === 0) {
                setNotification({ message: 'No verified teams to export!', type: 'error' });
                return;
            }

            setZipProgress({ current: 0, total: verifiedTeams.length });

            for (let i = 0; i < verifiedTeams.length; i++) {
                const team = verifiedTeams[i];
                setZipProgress({ current: i + 1, total: verifiedTeams.length });

                // Render the team pass temporarily
                setTeamForPdf(team);
                await new Promise(resolve => setTimeout(resolve, 50)); // Wait for render

                const passElement = document.getElementById(`credential-pass-${team._id}`);
                if (!passElement) continue;

                const canvas = await html2canvas(passElement, { scale: 2 });
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
                const pdfBlob = pdf.output('blob');

                const safeFileName = team.teamname.replace(/[/\\?%*:|"<>]/g, '-') || 'Unnamed Team';
                zip.file(`${safeFileName}_Credentials.pdf`, pdfBlob);
            }

            setTeamForPdf(null); // Clean up after loop

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(zipBlob);
            link.download = "All_Team_Credentials.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setNotification({ message: 'All credentials zipped!', type: 'success' });
        } catch (error) {
            console.error("ZIP export failed:", error);
            setNotification({ message: 'ZIP export failed!', type: 'error' });
        } finally {
            setIsZipping(false);
            setZipProgress({ current: 0, total: 0 });
            setTeamForPdf(null);
        }
    };

    // NEW: Download all team lead QR codes + passwords as a ZIP
    const handleDownloadLeadQRs = async () => {
        const verifiedTeams = allTeams.filter(t => t.verified && t.lead?.qrCode);
        if (verifiedTeams.length === 0) {
            setNotification({ message: 'No verified teams with QR codes found!', type: 'error' });
            return;
        }
        setNotification({ message: `Preparing ${verifiedTeams.length} QR codes...`, type: 'success' });
        try {
            const zip = new JSZip();
            const qrFolder = zip.folder('Lead_QR_Codes');

            // Build CSV
            const csvRows = ['Team Name,Lead Name,Registration Number,Password'];

            for (const team of verifiedTeams) {
                // Convert base64 data URL to binary for ZIP
                const base64Data = team.lead.qrCode.replace(/^data:image\/\w+;base64,/, '');
                const safeTeamName = team.teamname.replace(/[/\\?%*:|"<>]/g, '-');
                qrFolder.file(`${safeTeamName}_LeadQR.png`, base64Data, { base64: true });

                // Add CSV row
                const escapedName = `"${(team.teamname || '').replace(/"/g, '""')}"`;
                const escapedLead = `"${(team.name || '').replace(/"/g, '""')}"`;
                csvRows.push(`${escapedName},${escapedLead},${team.registrationNumber || ''},${team.password || 'N/A'}`);
            }

            zip.file('team_passwords.csv', csvRows.join('\n'));

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = 'LeadQRCodes_Passwords.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setNotification({ message: `${verifiedTeams.length} QR codes exported!`, type: 'success' });
        } catch (err) {
            console.error('QR export failed:', err);
            setNotification({ message: 'QR export failed!', type: 'error' });
        }
    };

    // UPDATED: Simplified to fetch all data at once.
    const fetchData = async () => {
        try {
            const [allTeamsRes, domainsRes, issuesRes] = await Promise.all([
                axios.get(`${api}/Hack/students`),
                axios.get(`${api}/domains`),
                axios.get(`${api}/Hack/issues`)
            ]);

            setAllTeams(allTeamsRes.data.teams);
            setAllDomains(domainsRes.data);

            const pendingIssuesTeams = issuesRes.data.map(team => ({ ...team, issues: team.issues.filter(issue => issue.status === 'Pending') })).filter(team => team.issues.length > 0);
            setTeamsWithIssues(pendingIssuesTeams);

        } catch (error) {
            console.error("Error fetching data:", error);
            setNotification({ message: 'Failed to load data.', type: 'error' });
        }
    };

    // UPDATED: Main effect now only runs once on auth change and fetches all data.
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        fetchData().finally(() => setLoading(false));

        const handleActiveSessionsUpdate = (data) => setActiveSessionsCount(data.count);
        const handleDomainsUpdate = () => fetchData(); // Refetches all data on update

        socket.on('admin:activeSessionsUpdate', handleActiveSessionsUpdate);
        socket.on('domains:updated', handleDomainsUpdate);
        socket.emit('admin:getActiveSessions');

        return () => {
            socket.off('admin:activeSessionsUpdate', handleActiveSessionsUpdate);
            socket.off('domains:updated', handleDomainsUpdate);
        };
    }, [isAuthenticated]);


    // NEW: Use useMemo to calculate derived data efficiently.
    const verifiedCount = useMemo(() => allTeams.filter(t => t.verified).length, [allTeams]);
    const notVerifiedCount = useMemo(() => allTeams.length - verifiedCount, [allTeams, verifiedCount]);
    const pendingIssuesCount = useMemo(() => teamsWithIssues.reduce((count, team) => count + team.issues.length, 0), [teamsWithIssues]);

    const verificationFilteredTeams = useMemo(() => {
        return allTeams
            .filter(t => (verificationTab === 'pending' ? !t.verified : t.verified))
            .filter(team =>
                team.teamname.toLowerCase().includes(verificationSearchTerm.toLowerCase()) ||
                team.email.toLowerCase().includes(verificationSearchTerm.toLowerCase())
            );
    }, [allTeams, verificationTab, verificationSearchTerm]);


    const totalPages = Math.ceil(allTeams.length / ITEMS_PER_PAGE);
    const paginatedTeams = useMemo(() => {
        return allTeams.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );
    }, [allTeams, currentPage]);


    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 40%, #1a0a0a 100%)' }}>
                {/* Animated ocean background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, #c8960c 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite' }} />
                    <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full opacity-5"
                        style={{ background: 'radial-gradient(circle, #8b0000 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite reverse' }} />
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute rounded-full bg-amber-400/5"
                            style={{ width: Math.random() * 4 + 2 + 'px', height: Math.random() * 4 + 2 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`, animationDelay: Math.random() * 4 + 's' }} />
                    ))}
                </div>
                <div className="relative z-10 w-full max-w-md">
                    {/* Logo area */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                            style={{ background: 'linear-gradient(135deg, rgba(200,150,12,0.2), rgba(200,150,12,0.05))', border: '2px solid rgba(200,150,12,0.4)', backdropFilter: 'blur(10px)' }}>
                            
                        </div>
                        <h1 className="text-5xl font-pirata text-amber-400 drop-shadow-lg tracking-wide">HackSail</h1>
                        <p className="text-amber-600/80 mt-1 text-sm tracking-[0.3em] uppercase">Command Deck</p>
                    </div>
                    {/* Login card */}
                    <form onSubmit={handleLogin}
                        className="rounded-3xl p-8 space-y-6 relative"
                        style={{ background: 'rgba(10, 10, 26, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(200,150,12,0.25)', boxShadow: '0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,150,12,0.1)' }}>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                            <p className="text-gray-500 text-sm mt-1">Restricted to authorized officers only</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-amber-500/80 mb-2 block uppercase tracking-widest" htmlFor="admin-password">Secret Passkey</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">🔑</span>
                                <input id="admin-password" type="password" value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    placeholder="Enter passkey..."
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,12,0.25)', backdropFilter: 'blur(5px)' }}
                                    onFocus={e => e.target.style.border = '1px solid rgba(200,150,12,0.7)'}
                                    onBlur={e => e.target.style.border = '1px solid rgba(200,150,12,0.25)'} />
                            </div>
                        </div>
                        {loginError && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-xl border border-red-500/20">
                                <span>☠️</span> {loginError}
                            </div>
                        )}
                        <button type="submit"
                            className="w-full font-bold py-4 px-8 rounded-xl text-black text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                            style={{ background: 'linear-gradient(135deg, #c8960c, #f5c842, #c8960c)', boxShadow: '0 8px 32px rgba(200,150,12,0.4)' }}>
                             Board the Ship
                        </button>
                        <p className="text-center text-gray-600 text-xs">HackSail 2K26 · Admin Portal</p>
                    </form>
                </div>
                <style>{`
                    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                    @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                `}</style>
            </div>
        );
    }

    const navItems = [
        { id: 'teams', label: 'Team Management' },
        { id: 'scoring', label: 'Manual Scoring' },
        { id: 'broadcast', label: 'Broadcast Center' },
        { id: 'controls', label: 'Event Controls' },
        { id: 'domains', label: 'Problem Monitor' },
        { id: 'export', label: 'Export Data' },
    ];

    return (
        <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #050510 0%, #0a0f1e 50%, #100508 100%)' }}>
            {notification.message && <Notification message={notification.message} type={notification.type} onClear={() => setNotification({ message: '', type: '' })} />}
            <style>{`
                @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(200,150,12,0.3); border-radius: 10px; }
                .nav-btn { position: relative; transition: all 0.2s; }
                .nav-btn.active::before { content: ''; position: absolute; left: 0; top: 20%; height: 60%; width: 3px; background: linear-gradient(180deg, #c8960c, #f5c842); border-radius: 0 4px 4px 0; }
            `}</style>

            <div className="flex h-screen">
                {/* Sidebar */}
                <aside className="w-64 flex flex-col flex-shrink-0 overflow-hidden" style={{ background: 'rgba(5,5,16,0.9)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(200,150,12,0.15)' }}>
                    {/* Brand */}
                    <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(200,150,12,0.1)' }}>
                        <div className="flex items-center gap-3 mb-1">
                            
                            <h1 className="text-xl font-pirata text-amber-400 tracking-wide">HackSail</h1>
                        </div>
                        <p className="text-gray-600 text-xs tracking-widest uppercase ml-9">Command Deck</p>
                    </div>
                    {/* Nav — scrollable */}
                    <nav className="flex flex-col gap-1 px-3 py-4 overflow-y-auto flex-1">
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => setActiveView(item.id)}
                                className={`nav-btn flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left w-full ${activeView === item.id
                                        ? 'active text-amber-300 bg-amber-500/10'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                    }`}>
                                <span className="text-lg w-6 text-center">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                    {/* Live Stats + Logout — pinned to bottom, never overflows */}
                    <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid rgba(200,150,12,0.12)' }}>
                        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 px-1">Live Stats</p>
                        <div className="grid grid-cols-1 gap-1 mb-3">
                            {[
                                { label: 'Active Logins', val: activeSessionsCount, color: '#22d3ee' },
                                { label: 'Total Teams', val: allTeams.length, color: '#f5c842' },
                                { label: 'Verified', val: verifiedCount, color: '#34d399' },
                                { label: 'Pending', val: notVerifiedCount, color: '#f87171' },
                                { label: 'Support Open', val: pendingIssuesCount, color: '#fb923c' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <span className="text-xs text-gray-500">{s.label}</span>
                                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full py-2 rounded-xl text-xs font-bold tracking-wide transition-colors duration-200"
                            style={{
                                background: 'rgba(127,29,29,0.4)',
                                border: '1px solid rgba(239,68,68,0.35)',
                                color: '#fca5a5',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(185,28,28,0.55)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(127,29,29,0.4)'; e.currentTarget.style.color = '#fca5a5'; }}
                        >
                            Log out
                        </button>
                    </div>
                </aside>

                <main className="flex-1 p-8 overflow-y-auto" style={{ background: 'transparent' }}>
                    {loading ? <div className="flex h-full items-center justify-center"><PirateLoader /></div> :
                        <>
                            {activeView === 'teams' && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-2xl">👥</span>
                                        <h2 className="text-3xl font-pirata text-amber-400 tracking-wide">Team Management</h2>
                                    </div>
                                    <div className="relative mb-6">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                                        <input type="text" placeholder="Search for a team on this page..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,12,0.2)' }}
                                            onFocus={e => e.target.style.border = '1px solid rgba(200,150,12,0.6)'}
                                            onBlur={e => e.target.style.border = '1px solid rgba(200,150,12,0.2)'} />
                                    </div>
                                    <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
                                        {/* UPDATED: Map over the calculated `paginatedTeams` */}
                                        {paginatedTeams.filter(team => team.teamname.toLowerCase().includes(searchTerm.toLowerCase())).map(team => {
                                            const totalGameScore = (team.memoryGameScore || 0) + (team.numberPuzzleScore || 0) + (team.internalGameScore || 0);
                                            return (
                                                <div key={team._id} className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01]"
                                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,150,12,0.12)', backdropFilter: 'blur(8px)' }}>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex-1">
                                                            <p className="font-bold text-white text-lg">{team.teamname}</p>
                                                            <div className="flex items-center gap-3 text-sm mt-1">
                                                                <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${team.verified ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30' : 'text-red-300 bg-red-500/20 border border-red-500/30'
                                                                    }`}>{team.verified ? '✓ Verified' : '✗ Pending'}</span>
                                                                <span className="text-gray-500">|</span>
                                                                <span className="text-gray-400 text-xs">Score: <strong className="text-amber-300">{totalGameScore}</strong></span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <select value={team.Domain || ''} onChange={(e) => handleDomainChange(team._id, e.target.value)}
                                                                className="w-44 p-2 rounded-xl text-white text-sm focus:outline-none"
                                                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(200,150,12,0.2)' }}>
                                                                <option value="">-- No Domain --</option>
                                                                {allDomains.map(d => (<option key={d.id} value={d.name}>{d.name}</option>))}
                                                            </select>
                                                            <button onClick={() => toggleTeamDetails(team._id)}
                                                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                                                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>
                                                                {expandedTeam === team._id ? 'Collapse' : 'Details'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {expandedTeam === team._id && (
                                                        <div className="mt-4 pt-4 text-sm space-y-1" style={{ borderTop: '1px solid rgba(200,150,12,0.15)' }}>
                                                            <p><strong className="text-amber-400 w-24 inline-block">Lead:</strong> {team.name} ({team.registrationNumber})</p>
                                                            <p><strong className="text-amber-400 w-24 inline-block">Members:</strong> {team.teamMembers.map(m => m.name).join(', ')}</p>
                                                            <p><strong className="text-amber-400 w-24 inline-block">Memory Game:</strong> {team.memoryGameScore ?? 'Not Played'}</p>
                                                            <p><strong className="text-amber-400 w-24 inline-block">Number Puzzle:</strong> {team.numberPuzzleScore ?? 'Not Played'}</p>
                                                            <p><strong className="text-amber-400 w-24 inline-block">Internal Game:</strong> {team.internalGameScore ?? 'N/A'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="flex justify-center items-center mt-6 gap-4">
                                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-30 transition-all"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,12,0.2)' }}>
                                            <ArrowLeft size={16} /> Previous
                                        </button>
                                        <span className="font-semibold text-amber-400/70 text-sm">Page {currentPage} of {totalPages}</span>
                                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-30 transition-all"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,12,0.2)' }}>
                                            Next <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* --- Other Views (scoring, domains, etc.) --- */}
                            {activeView === 'scoring' && (() => {
                                const scoringFilteredTeams = allTeams.filter(t =>
                                    t.teamname.toLowerCase().includes(scoringSearchTerm.toLowerCase())
                                );
                                const selectedTeamObj = allTeams.find(t => t._id === selectedTeamScoring);
                                return (
                                    <div className="h-full flex flex-col">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Gem className="text-amber-400" size={28} />
                                            <h2 className="text-3xl font-pirata text-amber-400 tracking-wide">Manual Score Entry</h2>
                                        </div>

                                        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                                            {/* ── Left: Team Picker ── */}
                                            <div className="flex flex-col w-full lg:w-1/2 bg-gray-900/50 border border-gray-700 rounded-2xl p-5">
                                                <h3 className="text-lg font-bold text-gray-200 mb-3">🔍 Search & Select Team</h3>

                                                {/* Search bar */}
                                                <div className="relative mb-4">
                                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                                                    <input
                                                        type="text"
                                                        placeholder="Search team name..."
                                                        value={scoringSearchTerm}
                                                        onChange={e => setScoringSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 text-white rounded-xl border border-gray-600 focus:outline-none focus:border-cyan-500 transition-colors placeholder-gray-500"
                                                    />
                                                    {scoringSearchTerm && (
                                                        <button
                                                            onClick={() => setScoringSearchTerm('')}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                                        >✕</button>
                                                    )}
                                                </div>

                                                {/* Team count */}
                                                <p className="text-xs text-gray-500 mb-3">
                                                    {scoringFilteredTeams.length} of {allTeams.length} teams
                                                </p>

                                                {/* Team cards */}
                                                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[calc(100vh-360px)]">
                                                    {scoringFilteredTeams.length > 0 ? scoringFilteredTeams.map(team => {
                                                        const isSelected = selectedTeamScoring === team._id;
                                                        return (
                                                            <div
                                                                key={team._id}
                                                                onClick={() => {
                                                                    setSelectedTeamScoring(isSelected ? '' : team._id);
                                                                    setInternalScoreInput('');
                                                                }}
                                                                className={`cursor-pointer flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${isSelected
                                                                    ? 'bg-cyan-900/50 border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-900/30'
                                                                    : 'bg-gray-800/60 border-gray-700 hover:border-cyan-600 hover:bg-gray-800'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-cyan-400' : 'bg-gray-600'
                                                                        }`} />
                                                                    <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-200'
                                                                        }`}>{team.teamname}</span>
                                                                </div>
                                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${(team.internalGameScore || 0) > 0
                                                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-600/40'
                                                                    : 'bg-gray-700 text-gray-400 border border-gray-600'
                                                                    }`}>
                                                                    {team.internalGameScore || 0} pts
                                                                </span>
                                                            </div>
                                                        );
                                                    }) : (
                                                        <div className="text-center py-12 text-gray-500">
                                                            <p className="text-3xl mb-2">🔍</p>
                                                            <p className="text-sm">No teams match your search</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── Right: Score Entry Panel ── */}
                                            <div className="w-full lg:w-1/2">
                                                <div className={`bg-gray-900/50 border rounded-2xl p-6 transition-all duration-300 ${selectedTeamObj
                                                    ? 'border-cyan-500/60 shadow-lg shadow-cyan-900/20'
                                                    : 'border-gray-700'
                                                    }`}>
                                                    {/* Selected team info */}
                                                    {selectedTeamObj ? (
                                                        <div className="mb-6 p-4 bg-cyan-900/20 border border-cyan-600/30 rounded-xl">
                                                            <p className="text-xs text-cyan-400 uppercase tracking-wide font-semibold mb-1">Selected Team</p>
                                                            <p className="text-2xl font-bold text-white">{selectedTeamObj.teamname}</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-sm text-gray-400">Current Score:</span>
                                                                <span className="text-lg font-bold text-cyan-300">{selectedTeamObj.internalGameScore || 0} pts</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mb-6 p-4 bg-gray-800/40 border border-dashed border-gray-600 rounded-xl text-center">
                                                            <p className="text-gray-500 text-sm">← Select a team from the list</p>
                                                        </div>
                                                    )}

                                                    {/* Score form */}
                                                    <form onSubmit={handleInternalScoreSubmit} className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-300 mb-2">New Score</label>
                                                            <input
                                                                type="number"
                                                                value={internalScoreInput}
                                                                onChange={e => setInternalScoreInput(e.target.value)}
                                                                placeholder="e.g. 150"
                                                                disabled={!selectedTeamObj}
                                                                className="w-full p-3 bg-gray-800 text-white text-lg rounded-xl border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                        </div>

                                                        <button
                                                            type="submit"
                                                            disabled={isSubmittingScore || !selectedTeamObj || internalScoreInput === ''}
                                                            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 font-bold py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 text-white shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 hover:scale-[1.02] active:scale-[0.98]"
                                                        >
                                                            {isSubmittingScore ? (
                                                                <span className="flex items-center justify-center gap-2">
                                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                                                    Submitting...
                                                                </span>
                                                            ) : '⚡ Submit Score'}
                                                        </button>

                                                        {selectedTeamObj && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { setSelectedTeamScoring(''); setInternalScoreInput(''); setScoringSearchTerm(''); }}
                                                                className="w-full py-2.5 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 text-sm transition-colors"
                                                            >
                                                                Clear Selection
                                                            </button>
                                                        )}
                                                    </form>

                                                    {/* Help text */}
                                                    <p className="mt-5 text-xs text-gray-500 text-center">
                                                        This will overwrite the team's current internal game score.
                                                    </p>
                                                </div>

                                                {/* Score leaderboard mini-preview */}
                                                {allTeams.some(t => t.internalGameScore > 0) && (
                                                    <div className="mt-4 bg-gray-900/50 border border-gray-700 rounded-2xl p-5">
                                                        <h4 className="text-sm font-bold text-gray-300 mb-3">🏆 Top Scored Teams</h4>
                                                        <div className="space-y-2">
                                                            {[...allTeams]
                                                                .filter(t => t.internalGameScore > 0)
                                                                .sort((a, b) => (b.internalGameScore || 0) - (a.internalGameScore || 0))
                                                                .slice(0, 5)
                                                                .map((team, idx) => (
                                                                    <div key={team._id} className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-xs font-bold w-5 text-center ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-500'
                                                                                }`}>#{idx + 1}</span>
                                                                            <span className="text-sm text-gray-300 truncate max-w-[160px]">{team.teamname}</span>
                                                                        </div>
                                                                        <span className="text-sm font-bold text-cyan-400">{team.internalGameScore} pts</span>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })()}
                            {activeView === 'domains' && (
                                <DomainMonitor
                                    teams={allTeams}
                                    domains={allDomains}
                                    onResetDomains={handleResetAllDomains}
                                />
                            )}
                            {activeView === 'broadcast' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">📡</span>
                                        <h2 className="text-3xl font-pirata text-amber-400 tracking-wide">Broadcast Center</h2>
                                    </div>
                                    <div className="p-6 rounded-2xl" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
                                        <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">📢 Send Reminder</h3>
                                        <textarea value={reminderText} onChange={(e) => setReminderText(e.target.value)}
                                            placeholder="e.g., Lunch will be served at 1:00 PM..."
                                            className="w-full h-28 p-4 rounded-xl text-white placeholder-gray-600 focus:outline-none resize-none transition-all"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(234,179,8,0.2)' }}
                                            disabled={isSendingReminder} />
                                        {reminderError && <p className="text-red-400 text-sm mt-2">{reminderError}</p>}
                                        <button onClick={handleSendReminder} disabled={isSendingReminder || !reminderText.trim()}
                                            className="mt-4 w-full font-bold py-3 rounded-xl text-black disabled:opacity-40 transition-all hover:scale-[1.01]"
                                            style={{ background: 'linear-gradient(135deg, #c8960c, #f5c842)' }}>
                                            {isSendingReminder ? 'Broadcasting...' : '📣 Send to All Teams'}
                                        </button>
                                    </div>
                                    <div className="p-6 rounded-2xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
                                        <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">📎 Send PPT Template</h3>
                                        <input id="ppt-input" type="file" accept=".ppt, .pptx" onChange={(e) => setPptTemplate(e.target.files[0])}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-purple-600/80 file:text-white hover:file:bg-purple-500"
                                            disabled={isUploading} />
                                        {uploadError && <p className="text-red-400 text-sm mt-2">{uploadError}</p>}
                                        <button onClick={handleSendPPT} disabled={isUploading || !pptTemplate}
                                            className="mt-4 w-full bg-purple-600 hover:bg-purple-500 font-bold py-3 rounded-xl disabled:opacity-40 transition-all">
                                            {isUploading ? 'Sending...' : '🚀 Broadcast Template'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {activeView === 'controls' && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-2xl">🎛️</span>
                                        <h2 className="text-3xl font-pirata text-amber-400 tracking-wide">Event Controls</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[{ label: ' Verify Payments', action: () => setShowVerificationModal(true), gradient: 'linear-gradient(135deg,#c8960c,#f5c842)', textColor: '#000' },
                                        { label: '🆘 Support Requests', action: handleOpenSupportModal, gradient: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', badge: pendingIssuesCount },
                                        { label: '🗺️ Domain Controls', action: () => navigate('/admin-controls'), gradient: 'linear-gradient(135deg,#374151,#4b5563)' },
                                        { label: '📋 Open Attendance', action: () => setShowAttdModal(true), gradient: 'linear-gradient(135deg,#0d9488,#14b8a6)' },
                                        ].map(btn => (
                                            <button key={btn.label} onClick={btn.action} className="relative p-6 rounded-2xl text-left font-bold text-lg transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl"
                                                style={{ background: btn.gradient, color: btn.textColor || '#fff' }}>
                                                {btn.badge > 0 && (
                                                    <span className="absolute -top-2 -right-2 flex h-6 w-6">
                                                        <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 items-center justify-center text-xs text-white">{btn.badge}</span>
                                                    </span>
                                                )}
                                                {btn.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeView === 'export' && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-2xl">📦</span>
                                        <h2 className="text-3xl font-pirata text-amber-400 tracking-wide">Export Data</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button onClick={handleExportMembers}
                                            className="p-6 rounded-2xl text-left font-bold text-lg transition-all hover:scale-[1.03] shadow-xl"
                                            style={{ background: 'linear-gradient(135deg,#065f46,#10b981)' }}>
                                            📊 Export All Members (CSV)
                                        </button>
                                        <button onClick={() => setShowCredentialModal(true)}
                                            className="p-6 rounded-2xl text-left font-bold text-lg transition-all hover:scale-[1.03] shadow-xl"
                                            style={{ background: 'linear-gradient(135deg,#0e4d6e,#0ea5e9)' }}>
                                            🪪 Export Credentials (PDF)
                                        </button>
                                        <button onClick={handleDownloadLeadQRs}
                                            className="p-6 rounded-2xl text-left font-bold text-lg transition-all hover:scale-[1.03] shadow-xl md:col-span-2"
                                            style={{ background: 'linear-gradient(135deg,#14532d,#16a34a,#15803d)' }}>
                                            <div className="flex items-center gap-3">
                                                
                                                <div>
                                                    <p>Download QR Codes Team Leads</p>
                                                    <p className="text-sm font-normal text-green-200/70 mt-0.5">ZIP — Lead QR images + passwords CSV (verified teams only)</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    }
                </main>
            </div>

            {/* --- ALL MODALS --- */}
            {showVerificationModal && (
                <div className="fixed inset-0 flex justify-center items-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
                    <div className="rounded-2xl shadow-2xl p-6 w-full max-w-4xl flex flex-col max-h-[90vh]" style={{ background: 'rgba(8,8,20,0.95)', border: '1px solid rgba(200,150,12,0.3)' }}>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-pirata text-amber-400 flex items-center gap-2"> Payment Verification</h2>
                            <button className="text-gray-500 hover:text-white text-2xl transition-colors" onClick={() => setShowVerificationModal(false)}>&times;</button>
                        </div>
                        <div className="flex mb-5" style={{ borderBottom: '1px solid rgba(200,150,12,0.15)' }}>
                            <button onClick={() => setVerificationTab('pending')} className={`py-2 px-5 font-semibold text-sm transition-colors ${verificationTab === 'pending' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-500 hover:text-gray-300'}`}>⏳ Pending ({notVerifiedCount})</button>
                            <button onClick={() => setVerificationTab('verified')} className={`py-2 px-5 font-semibold text-sm transition-colors ${verificationTab === 'verified' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}>✓ Verified ({verifiedCount})</button>
                        </div>
                        <div className="mb-4">
                            <input type="text" placeholder="Search by Team Name or Email..." value={verificationSearchTerm} onChange={(e) => setVerificationSearchTerm(e.target.value)}
                                className="w-full p-3 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,12,0.2)' }}
                                onFocus={e => e.target.style.border = '1px solid rgba(200,150,12,0.6)'}
                                onBlur={e => e.target.style.border = '1px solid rgba(200,150,12,0.2)'} />
                        </div>
                        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
                            {verificationFilteredTeams.length > 0 ? (verificationFilteredTeams.map((team) => (
                                <div key={team._id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,150,12,0.1)' }}>
                                    <div className="flex justify-between items-center">
                                        <div><p className="text-white font-semibold">{team.teamname}</p><p className="text-gray-500 text-sm">{team.email}</p></div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => toggleTeamDetails(team._id)} className="px-4 py-2 rounded-lg text-blue-300 text-sm font-semibold transition-all" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>{expandedTeam === team._id ? 'Collapse' : 'Expand'}</button>
                                            {verificationTab === 'pending' && (<button onClick={() => handleVerifyTeam(team._id)} disabled={verifyingTeamId === team._id} className="w-24 text-center px-4 py-2 rounded-lg text-sm font-bold text-black disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>{verifyingTeamId === team._id ? <div className="flex justify-center"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></div> : 'Verify'}</button>)}
                                            {verificationTab === 'verified' && (<button onClick={() => handleSendPassEmail(team._id)} disabled={sendingPassTeamId === team._id} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2" style={{ background: 'rgba(147,51,234,0.8)' }}>{sendingPassTeamId === team._id ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</> : 'Send Pass Email'}</button>)}
                                        </div>
                                    </div>
                                    {expandedTeam === team._id && (<div className="mt-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6" style={{ borderTop: '1px solid rgba(200,150,12,0.15)' }}>
                                        <div><h4 className="font-bold text-amber-400 mb-2">Team Members:</h4><ul className="list-disc list-inside text-gray-300 space-y-1"><li>{team.name} (Leader)</li>{team.teamMembers.map((m, i) => <li key={i}>{m.name}</li>)}</ul><h4 className="font-bold text-amber-400 mt-4 mb-2">Payment Details:</h4><p className="text-gray-300"><span className="text-gray-500">UPI:</span> {team.upiId}</p><p className="text-gray-300"><span className="text-gray-500">TXN ID:</span> {team.transtationId}</p></div>
                                        <div><h4 className="font-bold text-amber-400 mb-2">Payment Proof:</h4><a href={team.imgUrl} target="_blank" rel="noopener noreferrer"><img src={team.imgUrl} alt="Payment" className="rounded-xl w-full h-auto max-h-60 object-contain cursor-pointer" /></a></div>
                                    </div>)}
                                </div>
                            ))) : (<div className="text-center py-10"><p className="text-gray-500">No teams found matching your search.</p></div>)}
                        </div>
                    </div>
                </div>
            )}
            {showSupportModal && (
                <div className="fixed inset-0 flex justify-center items-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
                    <div className="rounded-2xl shadow-2xl p-6 w-full max-w-3xl flex flex-col" style={{ background: 'rgba(8,8,20,0.95)', border: '1px solid rgba(200,150,12,0.3)' }}>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-pirata text-amber-400 flex items-center gap-2">🆘 Support Requests</h2>
                            <button className="text-gray-500 hover:text-white text-2xl transition-colors" onClick={() => setShowSupportModal(false)}>&times;</button>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {issuesLoading ? (<div className="text-center text-gray-400 py-8">Loading crew requests...</div>) :
                                teamsWithIssues.length > 0 ? (teamsWithIssues.map(team => (team.issues.map(issue => (
                                    <div key={issue._id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,150,12,0.1)' }}>
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Sector: {team.Sector}</p>
                                                <p className="font-bold text-white">{team.teamname}</p>
                                                <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">{issue.text}</p>
                                            </div>
                                            <button onClick={() => handleResolveIssue(team._id, issue._id)}
                                                className="text-emerald-300 font-semibold py-2 px-4 rounded-xl text-sm whitespace-nowrap transition-all hover:scale-105"
                                                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>Resolve</button>
                                        </div>
                                        <p className="text-xs text-gray-600 text-right mt-2">{new Date(issue.timestamp).toLocaleString()}</p>
                                    </div>
                                ))))) : (<div className="text-center text-gray-400 py-12"><p className="text-3xl">🎉</p><p className="mt-2 font-semibold">All requests resolved!</p></div>)}
                        </div>
                    </div>
                </div>
            )}
            {showAttdModal && (
                <div className="fixed inset-0 flex justify-center items-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
                    <div className="rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col" style={{ background: 'rgba(8,8,20,0.95)', border: '1px solid rgba(200,150,12,0.3)' }}>
                        <h2 className="text-xl font-pirata text-amber-400 mb-5 flex items-center gap-2">📋 Select Attendance Round</h2>
                        <div className="flex flex-col gap-2">
                            {["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh"].map((round, idx) => (
                                <button key={round}
                                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${selectedAttdRound === idx + 1 ? 'text-black' : 'text-gray-300 hover:text-white'}`}
                                    style={{ background: selectedAttdRound === idx + 1 ? 'linear-gradient(135deg,#c8960c,#f5c842)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,12,0.2)' }}
                                    onClick={() => { setSelectedAttdRound(idx + 1); setShowAttdModal(false); navigate(`/qratt?round=${idx + 1}`); }}>
                                    {round} Attendance
                                </button>
                            ))}
                        </div>
                        <button className="mt-5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setShowAttdModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
            {showCredentialModal && (
                <div className="fixed inset-0 flex justify-center items-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
                    <div className="rounded-2xl shadow-2xl p-6 w-full max-w-lg flex flex-col" style={{ background: 'rgba(8,8,20,0.95)', border: '1px solid rgba(200,150,12,0.3)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-pirata text-amber-400 flex items-center gap-2">🪪 Export Team Credentials</h2>
                            <button className="text-gray-500 hover:text-white text-2xl transition-colors" onClick={() => setShowCredentialModal(false)}>&times;</button>
                        </div>
                        <div className="space-y-4 pb-6 mb-6" style={{ borderBottom: '1px solid rgba(200,150,12,0.15)' }}>
                            <p className="text-gray-400 text-center text-sm font-semibold">Download a Single Team Pass</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select value={selectedTeamForPass} onChange={(e) => setSelectedTeamForPass(e.target.value)}
                                    className="flex-grow p-3 rounded-xl text-white focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,150,12,0.2)' }}>
                                    <option value="">-- Select a Verified Team --</option>
                                    {allTeams.filter(t => t.verified).map(team => (<option key={team._id} value={team._id}>{team.teamname}</option>))}
                                </select>
                                <button onClick={handleDownloadPass} disabled={!selectedTeamForPass || isGeneratingPass}
                                    className="font-bold py-3 px-5 rounded-xl text-black disabled:opacity-40 flex items-center justify-center gap-2 transition-all hover:scale-105"
                                    style={{ background: 'linear-gradient(135deg,#0e4d6e,#0ea5e9)', color: '#fff' }}>
                                    {isGeneratingPass ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</> : '💾 Download Pass'}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3 text-center">
                            <p className="text-gray-400 text-sm font-semibold">Download All Verified Team Passes</p>
                            <p className="text-xs text-gray-600">Generates a PDF for every verified team in a single .zip file.</p>
                            <button onClick={handleDownloadAllPasses} disabled={isZipping}
                                className="w-full font-bold py-3 px-6 rounded-xl text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                style={{ background: 'linear-gradient(135deg,#6d28d9,#7c3aed)' }}>
                                {isZipping ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Zipping... ({zipProgress.current} / {zipProgress.total})</> : '📦 Download All as ZIP'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* UPDATED: This section is now highly efficient. It only renders ONE team pass when needed for PDF generation. */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -10 }}>
                {teamForPdf && (
                    <div
                        id={`credential-pass-${teamForPdf._id}`}
                        style={{
                            width: '620px', minHeight: '877px', padding: '2rem',
                            backgroundColor: '#f5f5f5', color: '#1a202c', fontFamily: 'sans-serif',
                            position: 'relative', overflow: 'hidden',
                        }}
                    >
                        {/* Pass template content using `teamForPdf` */}
                        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', backgroundColor: '#3b82f6', borderRadius: '50%', opacity: '0.1' }} />
                        <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '250px', height: '250px', backgroundColor: '#3b82f6', borderRadius: '50%', opacity: '0.05' }} />
                        <div style={{ textAlign: 'center', borderBottom: '2px solid #cbd5e0', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1a202c' }}>EVENT CREDENTIALS</h1>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 'normal', color: '#4a5568', marginTop: '0.5rem' }}>HACKSAIL 2026</h2>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'normal', color: '#4a5568', marginTop: '0.5rem' }}>DONT SHARE THIS PASSWOARDS WITH ANYONE!</h3>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'semibold', color: '#2d3748', marginBottom: '0.5rem' }}>Team: <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{teamForPdf.teamname}</span></p>
                            <p style={{ fontSize: '1.125rem', color: '#f82121ff' }}>Sector: {teamForPdf.Sector || 'N/A'}</p>
                        </div>
                        <div style={{ backgroundColor: '#e2e8f0', border: '1px solid #a0aec0', borderRadius: '1rem', textAlign: 'center', padding: '1.5rem', margin: '2rem 0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <p style={{ color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Team Secret Code / Password</p>
                            <p style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '0.1em' }}>
                                {teamForPdf.password || 'N/A'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                {teamForPdf.lead?.qrCode && teamForPdf.lead.qrCode.startsWith('data:image') ? (
                                    <img src={teamForPdf.lead.qrCode} alt={`QR Code for ${teamForPdf.name}`} style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', border: '2px solid #e2e8f0', padding: '0.25rem' }} />
                                ) : (
                                    <div style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e0', padding: '0.5rem', border: '2px solid #e2e8f0' }}>
                                        QR Code Data Invalid
                                    </div>
                                )}
                                <div>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {teamForPdf.name}
                                        <span style={{ fontSize: '0.8rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', marginLeft: '0.5rem', verticalAlign: 'middle' }}>LEADER</span>
                                    </p>
                                    <p style={{ color: '#4a5568' }}>Reg No: {teamForPdf.registrationNumber}</p>
                                </div>
                            </div>
                            {teamForPdf.teamMembers.map((member, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    {member.qrCode && member.qrCode.startsWith('data:image') ? (
                                        <img src={member.qrCode} alt={`QR Code for ${member.name}`} style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', border: '2px solid #e2e8f0', padding: '0.25rem' }} />
                                    ) : (
                                        <div style={{ width: '8rem', height: '8rem', borderRadius: '0.5rem', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e0', padding: '0.5rem', border: '2px solid #e2e8f0' }}>
                                            QR Code Data Invalid
                                        </div>
                                    )}
                                    <div>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{member.name}</p>
                                        <p style={{ color: '#4a5568' }}>Reg No: {member.registrationNumber}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#718096', fontSize: '0.875rem' }}>

                            <p>This pass must be presented for entry and attendance verification.</p>
                            <p>&copy; 2025 Scorecraft KARE</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Admin;