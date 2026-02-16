import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "./api"; // Ensure this points to your backend
import { Loader2, CheckCircle, Clock, ExternalLink, Mail, Users } from "lucide-react";

function AdminRegistrations() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("underVerification");
  const [verifyingId, setVerifyingId] = useState(null);
  const [bulkSending, setBulkSending] = useState(false);

  // Fetch all teams
  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${api}/Hack/students`);
      setTeams(res.data.teams || []);
    } catch (error) {
      console.error("Failed to fetch teams", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Filter Logic
  const registeredTeams = teams.filter(t => !t.verified && !t.imgUrl);
  const underVerificationTeams = teams.filter(t => !t.verified && t.imgUrl);
  const verifiedTeams = teams.filter(t => t.verified);

  // Action: Verify Single Team
  const handleVerify = async (teamId) => {
    if (!window.confirm("Are you sure you want to verify this team?")) return;
    setVerifyingId(teamId);
    try {
      await axios.post(`${api}/Hack/verify/${teamId}`);
      alert("Team Verified Successfully!");
      fetchTeams();
    } catch (error) {
      alert("Verification Failed: " + (error.response?.data?.error || error.message));
    } finally {
      setVerifyingId(null);
    }
  };

  // Action: Send Single Payment Link
  const handleSendLink = async (teamId) => {
    try {
      await axios.post(`${api}/Hack/admin/send-payment-link`, { teamId });
      alert("Payment Link Sent!");
    } catch (error) {
      alert("Failed to send link.");
    }
  };

  // Action: Send Bulk Payment Links
  const handleSendAllLinks = async () => {
    if (registeredTeams.length === 0) return;
    if (!window.confirm(`Are you sure you want to send payment emails to ALL ${registeredTeams.length} registered teams? This may take a moment.`)) return;

    setBulkSending(true);
    let successCount = 0;
    let failCount = 0;

    // Iterate through all registered teams
    for (const team of registeredTeams) {
      try {
        await axios.post(`${api}/Hack/admin/send-payment-link`, { teamId: team._id });
        successCount++;
      } catch (error) {
        console.error(`Failed for ${team.teamname}`, error);
        failCount++;
      }
    }

    setBulkSending(false);
    alert(`Bulk Send Complete!\n\n✅ Sent: ${successCount}\n❌ Failed: ${failCount}`);
  };

  const TabButton = ({ id, label, count, color }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 font-bold text-sm md:text-base rounded-t-lg transition-colors flex items-center gap-2
        ${activeTab === id ? `bg-gray-800 text-${color}-400 border-t-2 border-${color}-400` : "bg-gray-900 text-gray-400 hover:bg-gray-800"}`}
    >
      {label}
      <span className={`px-2 py-0.5 rounded-full text-xs bg-${color}-900 text-${color}-200`}>{count}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-orange-500 font-naruto">Registration Control</h1>
        
        {/* Bulk Send Button (Only visible in Registered Tab) */}
        {activeTab === "registered" && registeredTeams.length > 0 && (
          <button 
            onClick={handleSendAllLinks}
            disabled={bulkSending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bulkSending ? <Loader2 className="animate-spin" /> : <Mail size={20} />}
            {bulkSending ? "Sending Mails..." : `Send Link to All (${registeredTeams.length})`}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-800 mb-6">
        <TabButton id="registered" label="Registered (Unpaid)" count={registeredTeams.length} color="blue" />
        <TabButton id="underVerification" label="Under Verification" count={underVerificationTeams.length} color="yellow" />
        <TabButton id="verified" label="Verified Teams" count={verifiedTeams.length} color="green" />
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "registered" && registeredTeams.map(team => (
            <TeamCard key={team._id} team={team} type="registered" onAction={handleSendLink} />
          ))}
          
          {activeTab === "underVerification" && underVerificationTeams.map(team => (
            <TeamCard key={team._id} team={team} type="verification" onAction={handleVerify} loadingId={verifyingId} />
          ))}

          {activeTab === "verified" && verifiedTeams.map(team => (
            <TeamCard key={team._id} team={team} type="verified" />
          ))}

          {/* Empty States */}
          {((activeTab === "registered" && registeredTeams.length === 0) ||
            (activeTab === "underVerification" && underVerificationTeams.length === 0) ||
            (activeTab === "verified" && verifiedTeams.length === 0)) && (
            <div className="col-span-full text-center py-20 text-gray-500">
              <p className="text-xl">No teams found in this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable Card Component
const TeamCard = ({ team, type, onAction, loadingId }) => (
  <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-lg hover:border-gray-700 transition-all flex flex-col h-full">
    {/* Header */}
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-bold text-white leading-tight mb-1">{team.teamname}</h3>
        <p className="text-xs text-gray-500 font-mono">{team.email}</p>
      </div>
      {type === "verified" ? <CheckCircle className="text-green-500 shrink-0" /> : <Clock className="text-yellow-500 shrink-0" />}
    </div>

    {/* Lead & Department Info */}
    <div className="bg-gray-800/50 p-3 rounded-lg mb-4 text-sm space-y-1">
      <div className="flex justify-between">
        <span className="text-gray-400">Team Lead:</span>
        <span className="text-white font-medium">{team.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Reg. No:</span>
        <span className="text-gray-300">{team.registrationNumber}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Dept/Year:</span>
        <span className="text-gray-300">{team.department} - {team.year}</span>
      </div>
      {/* Transaction Details (If applicable) */}
      {type !== "registered" && (
        <div className="pt-2 mt-2 border-t border-gray-700">
           <div className="flex justify-between">
            <span className="text-gray-400">Txn ID:</span>
            <span className="text-orange-400 font-mono text-xs">{team.transtationId || "N/A"}</span>
          </div>
          {team.imgUrl && (
            <a href={team.imgUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 mt-2 text-xs justify-end">
              <ExternalLink size={12} /> View Payment Proof
            </a>
          )}
        </div>
      )}
    </div>

    {/* Members List (New Section) */}
    <div className="mb-4 flex-grow">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
        <Users size={12} /> Team Members ({team.teamMembers?.length || 0})
      </h4>
      <div className="bg-gray-950 rounded border border-gray-800 p-2 max-h-32 overflow-y-auto custom-scrollbar">
        {team.teamMembers && team.teamMembers.length > 0 ? (
          <ul className="space-y-2">
            {team.teamMembers.map((member, idx) => (
              <li key={idx} className="flex justify-between items-center text-xs">
                <span className="text-gray-300 truncate max-w-[60%]">{idx + 1}. {member.name}</span>
                <span className="text-gray-600 font-mono">{member.registrationNumber}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-xs italic text-center">No member details found.</p>
        )}
      </div>
    </div>

    {/* Actions */}
    <div className="mt-auto">
      {type === "registered" && (
        <button 
          onClick={() => onAction(team._id)}
          className="w-full bg-blue-600/90 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Mail size={16} /> Send Payment Link
        </button>
      )}
      {type === "verification" && (
        <button 
          onClick={() => onAction(team._id)}
          disabled={loadingId === team._id}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loadingId === team._id ? <Loader2 className="animate-spin" size={18} /> : "Verify & Approve"}
        </button>
      )}
      {type === "verified" && (
        <div className="w-full text-center text-green-500 font-semibold py-2 bg-green-900/10 rounded-lg border border-green-900/30 text-sm">
          Verified Status Active
        </div>
      )}
    </div>
  </div>
);

export default AdminRegistrations;