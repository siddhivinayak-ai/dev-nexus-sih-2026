import React, { useState } from 'react';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, Award, 
  Settings, Edit2, Camera, Copy, CheckCircle2, AlertCircle, 
  TrendingUp, Users, FileText, Lock, Eye, EyeOff
} from 'lucide-react';

export default function Profile({ user, onBack, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Siddhivinayak W.',
    email: user?.email || 'siddhivinayak@cci.gov.in',
    phone: user?.phone || '+91 9876543210',
    department: user?.department || 'Cartel Investigation Department',
    role: user?.role || 'Senior CCI Auditor',
    location: user?.location || 'New Delhi, India',
    joinDate: user?.joinDate || '2024-03-15',
    bio: user?.bio || 'Expert in procurement fraud detection and cartel analysis. Dedicated to ensuring fair government e-procurement practices.'
  });

  const [copied, setCopied] = useState('');

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Save profile changes (would integrate with backend)
    setIsEditing(false);
    console.log('Profile updated:', formData);
  };

  // Mock stats
  const stats = [
    { label: 'Tenders Analyzed', value: '247', icon: FileText, color: 'blue' },
    { label: 'Fraud Cases Detected', value: '38', icon: AlertCircle, color: 'red' },
    { label: 'Accuracy Rate', value: '94.2%', icon: TrendingUp, color: 'green' },
    { label: 'Team Members', value: '12', icon: Users, color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12 space-y-8">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* AVATAR */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-4xl font-bold shadow-lg">
                {formData.name.charAt(0)}
              </div>
              {!isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* PROFILE INFO */}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="text-3xl font-bold bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 mb-2 w-full"
                />
              ) : (
                <h1 className="text-3xl font-bold mb-2">{formData.name}</h1>
              )}
              
              {isEditing ? (
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="text-lg bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                />
              ) : (
                <p className="text-lg text-blue-100">{formData.role}</p>
              )}
            </div>

            {/* VERIFICATION BADGE */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold">Verified</span>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const colors = {
              blue: 'bg-blue-50 text-blue-600 border-blue-200',
              red: 'bg-red-50 text-red-600 border-red-200',
              green: 'bg-green-50 text-green-600 border-green-200',
              purple: 'bg-purple-50 text-purple-600 border-purple-200'
            };
            
            return (
              <div key={idx} className={`${colors[stat.color]} border rounded-2xl p-6 text-center`}>
                <div className="flex justify-center mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm font-medium opacity-75">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: PERSONAL INFORMATION */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CONTACT INFORMATION */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Information
              </h2>

              <div className="space-y-5">
                
                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                      <span className="text-slate-700">{formData.email}</span>
                      <button
                        onClick={() => handleCopy(formData.email, 'email')}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {copied === 'email' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                      <span className="text-slate-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        {formData.phone}
                      </span>
                      <button
                        onClick={() => handleCopy(formData.phone, 'phone')}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {copied === 'phone' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* LOCATION */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700">{formData.location}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* PROFESSIONAL INFORMATION */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Professional Information
              </h2>

              <div className="space-y-5">
                
                {/* DEPARTMENT */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  ) : (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200/50">
                      <span className="text-slate-700 font-medium">{formData.department}</span>
                    </div>
                  )}
                </div>

                {/* JOIN DATE */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Join Date</label>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{new Date(formData.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* BIO */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                      <span className="text-slate-700">{formData.bio}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* SAVE BUTTON */}
            {isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md shadow-blue-600/20"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: SECURITY & SETTINGS */}
          <div className="space-y-6">
            
            {/* SECURITY SETTINGS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Security
              </h2>

              <div className="space-y-4">
                
                <button className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left text-slate-700 font-medium border border-slate-200/50 transition-all flex items-center justify-between">
                  <span>Change Password</span>
                  <Lock className="w-4 h-4 text-slate-400" />
                </button>

                <button className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left text-slate-700 font-medium border border-slate-200/50 transition-all flex items-center justify-between">
                  <span>Two-Factor Authentication</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </button>

                <button className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left text-slate-700 font-medium border border-slate-200/50 transition-all flex items-center justify-between">
                  <span>Active Sessions</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </button>

              </div>
            </div>

            {/* BADGES & ACHIEVEMENTS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Achievements
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200/50">
                  <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 font-bold">★</div>
                  <span className="text-sm font-medium text-slate-700">Master Auditor</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200/50">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center text-red-700 font-bold">🔍</div>
                  <span className="text-sm font-medium text-slate-700">Cartel Detective</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200/50">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold">✓</div>
                  <span className="text-sm font-medium text-slate-700">Accuracy Champion</span>
                </div>
              </div>
            </div>

            {/* ACCOUNT ACTIONS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Account
              </h2>

              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left text-slate-700 font-medium border border-slate-200/50 transition-all">
                  Preferences
                </button>
                <button className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left text-slate-700 font-medium border border-slate-200/50 transition-all">
                  Notifications
                </button>
                <button className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg text-left text-red-600 font-medium border border-red-200/50 transition-all">
                  Delete Account
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
