import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "./api"; // Ensure this points to your backend
import { Loader2, CheckCircle, Clock, ExternalLink, Mail, Users, Edit, X, Save } from "lucide-react";

function AdminRegistrations() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("underVerification");
  const [verifyingId, setVerifyingId] = useState(null);
  const [generatingQRId, setGeneratingQRId] = useState(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

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

  // Action: Verify Single Team (no QR/pass — just approves)
  const handleVerify = async (teamId) => {
    if (!window.confirm("Are you sure you want to verify this team? An approval email will be sent.")) return;
    setVerifyingId(teamId);
    try {
      await axios.post(`${api}/Hack/verify/${teamId}`);
      alert("Team Verified! Approval email sent. Use 'Generate QR & Pass' when ready to send credentials.");
      fetchTeams();
    } catch (error) {
      alert("Verification Failed: " + (error.response?.data?.error || error.message));
    } finally {
      setVerifyingId(null);
    }
  };

  // Action: Generate QR codes + password for a verified team
  const handleGenerateQRPass = async (teamId) => {
    if (!window.confirm("Generate QR codes and a login password for this team? This will email them their credentials.")) return;
    setGeneratingQRId(teamId);
    try {
      await axios.post(`${api}/Hack/generate-qr-pass/${teamId}`);
      alert("✅ QR codes and password generated! Credentials emailed to the team.");
      fetchTeams();
    } catch (error) {
      alert("Generation Failed: " + (error.response?.data?.error || error.message));
    } finally {
      setGeneratingQRId(null);
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

  // Action: Edit Team
  const handleEditClick = (team) => {
    setEditingTeam({ ...team }); // Deep copy if needed, shallow for now
    setEditModalOpen(true);
  };

  const handleEditChange = (e, field, memberIndex = null, memberField = null) => {
    if (memberIndex !== null) {
      // Safe immutable update for members array
      const newMembers = editingTeam.teamMembers.map((member, index) =>
        index === memberIndex ? { ...member, [memberField]: e.target.value } : member
      );
      setEditingTeam({ ...editingTeam, teamMembers: newMembers });
    } else {
      setEditingTeam({ ...editingTeam, [field]: e.target.value });
    }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${api}/Hack/update-team/${editingTeam._id}`, editingTeam);
      alert("Team Updated Successfully!");
      setEditModalOpen(false);
      fetchTeams();
    } catch (error) {
      alert("Update Failed: " + (error.response?.data?.error || error.message));
    }
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
            <TeamCard key={team._id} team={team} type="registered" onAction={handleSendLink} onEdit={handleEditClick} />
          ))}

          {activeTab === "underVerification" && underVerificationTeams.map(team => (
            <TeamCard key={team._id} team={team} type="verification" onAction={handleVerify} loadingId={verifyingId} onEdit={handleEditClick} />
          ))}

          {activeTab === "verified" && verifiedTeams.map(team => (
            <TeamCard key={team._id} team={team} type="verified" onEdit={handleEditClick} onGenerateQR={handleGenerateQRPass} generatingQRId={generatingQRId} />
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

      {editModalOpen && editingTeam && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-bold text-orange-500 font-naruto tracking-wide">Edit Team Details</h2>
                <p className="text-xs text-gray-500 mt-1">Update information for {editingTeam.teamname}</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-8">

              {/* Section: Team Info */}
              <div className="bg-gray-800/20 p-5 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                  Team Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Team Name</label>
                    <input className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" value={editingTeam.teamname || ''} onChange={(e) => handleEditChange(e, 'teamname')} />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Team Email</label>
                    <input className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" value={editingTeam.email || ''} onChange={(e) => handleEditChange(e, 'email')} />
                  </div>
                </div>
              </div>

              {/* Section: Team Lead */}
              <div className="bg-gray-800/20 p-5 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                  Team Lead Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Lead Name</label>
                    <input className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" value={editingTeam.name || ''} onChange={(e) => handleEditChange(e, 'name')} />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Registration Number</label>
                    <input className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" value={editingTeam.registrationNumber || ''} onChange={(e) => handleEditChange(e, 'registrationNumber')} />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Phone Number</label>
                    <input
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      value={editingTeam.phoneNumber || ''}
                      onChange={(e) => handleEditChange(e, 'phoneNumber')}
                      placeholder="+91..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Room</label>
                    <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm" value={editingTeam.room || ''} onChange={(e) => handleEditChange(e, 'room')} />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Type</label>
                    <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm" value={editingTeam.type || ''} onChange={(e) => handleEditChange(e, 'type')} />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Year</label>
                    <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm" value={editingTeam.year || ''} onChange={(e) => handleEditChange(e, 'year')} />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Dept</label>
                    <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm" value={editingTeam.department || ''} onChange={(e) => handleEditChange(e, 'department')} />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Section</label>
                    <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm" value={editingTeam.section || ''} onChange={(e) => handleEditChange(e, 'section')} />
                  </div>
                </div>
              </div>

              {/* Section: Members */}
              <div className="bg-gray-800/20 p-5 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                  Team Members
                </h3>
                <div className="space-y-4">
                  {editingTeam.teamMembers && editingTeam.teamMembers.map((member, idx) => (
                    <div key={idx} className="bg-gray-900 p-4 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-gray-800 text-gray-400 text-xs font-bold px-2 py-1 rounded">Member {idx + 1}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-gray-500 text-xs mb-1">Name</label>
                          <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm focus:border-green-500 focus:outline-none" value={member.name || ''} onChange={(e) => handleEditChange(e, null, idx, 'name')} />
                        </div>
                        <div>
                          <label className="block text-gray-500 text-xs mb-1">Registration Number</label>
                          <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-sm focus:border-green-500 focus:outline-none" value={member.registrationNumber || ''} onChange={(e) => handleEditChange(e, null, idx, 'registrationNumber')} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-gray-600 text-[10px] uppercase font-bold mb-1">Room</label>
                          <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-xs" value={member.room || ''} onChange={(e) => handleEditChange(e, null, idx, 'room')} />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-[10px] uppercase font-bold mb-1">Type</label>
                          <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-xs" value={member.type || ''} onChange={(e) => handleEditChange(e, null, idx, 'type')} />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-[10px] uppercase font-bold mb-1">Year</label>
                          <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-xs" value={member.year || ''} onChange={(e) => handleEditChange(e, null, idx, 'year')} />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-[10px] uppercase font-bold mb-1">Dept</label>
                          <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-xs" value={member.department || ''} onChange={(e) => handleEditChange(e, null, idx, 'department')} />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-[10px] uppercase font-bold mb-1">Section</label>
                          <input className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-xs" value={member.section || ''} onChange={(e) => handleEditChange(e, null, idx, 'section')} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-800 bg-gray-900/50 sticky bottom-0 backdrop-blur-md flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-6 py-2.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-8 py-2.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-900/20"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Card Component
const TeamCard = ({ team, type, onAction, loadingId, onEdit, onGenerateQR, generatingQRId }) => (
  <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-lg hover:border-gray-700 transition-all flex flex-col h-full">
    {/* Header */}
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-bold text-white leading-tight mb-1">{team.teamname}</h3>
        <p className="text-xs text-gray-500 font-mono">{team.email}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {type === "verified" ? <CheckCircle className="text-green-500 shrink-0" /> : <Clock className="text-yellow-500 shrink-0" />}
        <button onClick={() => onEdit(team)} className="text-gray-500 hover:text-orange-400 p-1"><Edit size={16} /></button>
      </div>
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
    <div className="mt-auto space-y-2">
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
        <>
          <div className="w-full text-center text-green-500 font-semibold py-2 bg-green-900/10 rounded-lg border border-green-900/30 text-sm">
            ✓ Verified
          </div>
          <button
            onClick={() => onGenerateQR(team._id)}
            disabled={generatingQRId === team._id}
            className="w-full bg-purple-700 hover:bg-purple-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
          >
            {generatingQRId === team._id
              ? <><Loader2 className="animate-spin" size={16} /> Generating...</>
              : team.password
                ? "↻ Re-generate QR & Pass"
                : "⊕ Generate QR & Pass"
            }
          </button>
        </>
      )}
    </div>
  </div>
);

export default AdminRegistrations;
