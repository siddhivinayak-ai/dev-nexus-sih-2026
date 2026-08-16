import React, { useState, useEffect } from 'react';
import './App.css';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TenderDetails from './pages/TenderDetails';
import ReportGenerator from './pages/ReportGenerator';
import Profile from './pages/Profile';
import TenderVerification from './pages/TenderVerification';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('landing');
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [pendingTenderData, setPendingTenderData] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('devnexus_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setActivePage('dashboard');
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('devnexus_user');
    setCurrentUser(null);
    setActivePage('landing');
    setSelectedTenderId(null);
  };

  const handleSelectTender = (tenderId) => {
    setSelectedTenderId(tenderId);
    setActivePage('tender_details');
  };

  const handleGoBackToDashboard = () => {
    setSelectedTenderId(null);
    setActivePage('dashboard');
  };

  const handleOpenReport = () => {
    setActivePage('report_generator');
  };

  const handleGoBackToTender = () => {
    setActivePage('tender_details');
  };

  const handleOpenProfile = () => {
    setActivePage('profile');
  };

  const handleBackFromProfile = () => {
    setActivePage('dashboard');
  };

  const handleOpenTenderVerification = (tenderData) => {
    setPendingTenderData(tenderData);
    setActivePage('tender_verification');
  };

  const handleSaveTenderVerification = (verifiedTenderData) => {
    if (verifiedTenderData) {
      const existing = JSON.parse(localStorage.getItem('devnexus_tenders') || '[]');
      const updated = [verifiedTenderData, ...existing.filter(item => item.tender_id !== verifiedTenderData.tender_id)];
      localStorage.setItem('devnexus_tenders', JSON.stringify(updated));
    }
    setPendingTenderData(null);
  };

  const handleOpenTenderDetailsFromVerification = (tenderId) => {
    setSelectedTenderId(tenderId);
    setActivePage('tender_details');
  };

  switch (activePage) {
    case 'landing':
      return <Landing onLoginSuccess={handleLoginSuccess} />;
    
    case 'dashboard':
      return (
        <Dashboard 
          user={currentUser} 
          onSelectTender={handleSelectTender}
          onOpenProfile={handleOpenProfile}
          onOpenTenderVerification={handleOpenTenderVerification}
          onLogout={handleLogout} 
        />
      );
    
    case 'tender_details':
      return (
        <TenderDetails 
          tenderId={selectedTenderId} 
          onBack={handleGoBackToDashboard}
          onOpenReport={handleOpenReport}
          user={currentUser}
        />
      );
    
    case 'report_generator':
      return (
        <ReportGenerator 
          tenderId={selectedTenderId} 
          onBack={handleGoBackToTender}
          user={currentUser}
        />
      );
    
    case 'profile':
      return (
        <Profile
          user={currentUser}
          onBack={handleBackFromProfile}
          onLogout={handleLogout}
        />
      );
    
    case 'tender_verification':
      return (
        <TenderVerification
          tenderData={pendingTenderData}
          onSave={handleSaveTenderVerification}
          onBack={handleGoBackToDashboard}
          onOpenTenderDetails={handleOpenTenderDetailsFromVerification}
        />
      );
    
    default:
      return <Landing onLoginSuccess={handleLoginSuccess} />;
  }
}
