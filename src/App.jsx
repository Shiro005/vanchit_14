import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import useAutoTranslate from './hooks/useAutoTranslate';
import Dashboard from './Components/Dashboard';
import Upload from './Components/Upload';
import Home from './Pages/Home';
import { ChevronDown, Globe, Menu, X, User, LogOut } from 'lucide-react';
import TranslatedText from './Components/TranslatedText';
import BoothManagement from './Components/BoothManagement';
import FilterPage from './Components/FilterPage';
import FullVoterDetails from './Components/FullVoterDetails';
import Team from './Components/Team';
import Contactus from './Components/Contactus';
import Setting from './Components/Setting';
import BulkSurvey from './Pages/BulkSurvey';
import { VoterProvider } from './Context/VoterContext';
import usePendingSync from './hooks/usePendingSync';
import { syncPendingWrites } from './services/pendingSync';
import { CandidateProvider, useCandidate } from './Context/CandidateContext';
import Login from './Pages/Login';
import ConsentForm from './Pages/ConsentForm';
import WhatsAppShare from './Components/WhatsAppShare';
import Reports from './Components/Reports';
import ElectoralFlyerService from './Components/ElectoralFlyerService';
import { GrUpdate } from 'react-icons/gr';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Clear Site Data Function
const clearSiteData = async () => {
  try {
    console.log('🧹 Starting to clear all site data...');

    // 1. Clear IndexedDB
    if (window.indexedDB) {
      const databases = await window.indexedDB.databases();
      for (const database of databases) {
        if (database.name) {
          window.indexedDB.deleteDatabase(database.name);
          console.log(`🗑️ Deleted IndexedDB: ${database.name}`);
        }
      }
    }

    // 2. Clear localStorage
    localStorage.clear();
    console.log('🗑️ Cleared localStorage');

    // 3. Clear sessionStorage
    sessionStorage.clear();
    console.log('🗑️ Cleared sessionStorage');

    // 4. Clear cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
    }
    console.log('🗑️ Cleared cookies');

    // 5. Clear service worker cache (if any)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('🗑️ Cleared service worker caches');
    }

    // 6. Clear application cache (if any)
    if (window.applicationCache) {
      window.applicationCache.clear();
    }

    console.log('✅ All site data cleared successfully!');

    // Show success message and reload
    setTimeout(() => {
      alert('All site data has been cleared successfully! The app will now reload.');
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error('❌ Error clearing site data:', error);
    alert('Error clearing site data: ' + error.message);
  }
};

// Clear Data Button Component
const ClearDataButton = ({ mobile = false }) => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear ALL site data? This will delete all voter data, surveys, and settings. This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearSiteData();
    } catch (error) {
      console.error('Error clearing data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  if (mobile) {
    return (
      <button
        onClick={handleClearData}
        disabled={isClearing}
        className="w-full flex items-center gap-3 text-md px-4 py-3 rounded-xl text-base bg-green-500 font-medium text-white hover:bg-green-50 hover:text-green-700 transition-all duration-200 disabled:opacity-50"
      >
        <GrUpdate className="w-5 h-5" />
        <span><TranslatedText>Update App</TranslatedText></span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClearData}
      disabled={isClearing}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 hover:border-green-300 bg-white hover:bg-green-50 text-green-600 hover:text-green-700 transition-all duration-200 shadow-sm disabled:opacity-50"
      title="Clear all site data and reload"
    >
      {isClearing ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <GrUpdate className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">{isClearing ? 'Updating...' : 'Update App'}</span>
    </button>
  );
};


// Navigation Component
const Navigation = ({ currentLanguage, languages, changeLanguage, translating, mobileMenuOpen, setMobileMenuOpen, onLogout }) => {
  const location = useLocation();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { candidateInfo } = useCandidate();

  const navigation = [
    { name: 'Home', path: '/home' },
    { name: 'Search', path: '/search' },
    { name: 'Booth', path: '/booths' },
    { name: 'Lists', path: '/lists' },
    { name: 'slip', path: '/slip' },
    { name: 'Reports', path: '/reports' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    onLogout();
  };

  return (
    <nav className="bg-gradient-to-l from-orange-500 to-orange-600 border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a
              href="/home"
              className="flex items-center gap-3 group"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                window.location.href = '/home';
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white">
                  <img
                    src={candidateInfo?.logoImageCircle || '/logo.png'}
                    alt="Logo"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white group-hover:text-gray-100 transition-colors">
                  <TranslatedText>{candidateInfo?.name || 'Election App'}</TranslatedText>
                </span>
                <span className="text-xs text-gray-50 group-hover:text-gray-100 transition-colors">
                  <TranslatedText>{candidateInfo?.TagLine || 'Election Management'}</TranslatedText>
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.path)
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-gray-50 hover:text-white hover:bg-white/10'
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = item.path;
                }}
              >
                <TranslatedText>{item.name}</TranslatedText>
              </a>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="hidden md:flex items-center gap-3">
            <ClearDataButton />

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20 transition-all duration-200"
              >
                <Globe className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {languages.find(lang => lang.code === currentLanguage)?.flag}
                </span>
                <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${languageOpen ? 'rotate-180' : ''}`} />
              </button>
              {languageOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                      Select Language
                    </div>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setLanguageOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${currentLanguage === lang.code
                          ? 'bg-orange-50 text-orange-700'
                          : 'hover:bg-gray-50'
                          }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20 transition-all"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">Admin</div>
                  <div className="text-xs text-gray-200">User</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-white transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg"
                    >
                      <LogOut className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive(item.path)
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <TranslatedText>{item.name}</TranslatedText>
              </Link>
            ))}

            {/* Mobile Clear Data Button */}
            <div className="pt-2">
              <ClearDataButton mobile={true} />
            </div>

            {/* Mobile Language Selector */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-500 px-4 py-2 uppercase tracking-wide">
                <TranslatedText>Language</TranslatedText>
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentLanguage === lang.code
                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                    : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium"><TranslatedText>{lang.name}</TranslatedText></span>
                  {currentLanguage === lang.code && (
                    <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Mobile User Info & Logout */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    Admin User
                  </div>
                  <div className="text-xs text-gray-500">Jannetaa123</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span><TranslatedText>Sign Out</TranslatedText></span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Protected Route with Consent Check
const ProtectedRoute = ({ children, isAuthenticated, hasConsented }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasConsented) {
    return <Navigate to="/consent" replace />;
  }

  return children;
};

// Consent Route
const ConsentRoute = ({ children, isAuthenticated, hasConsented }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (hasConsented) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">Loading Election Management System...</p>
    </div>
  </div>
);

function App() {
  // Initialize language
  useEffect(() => {
    try {
      const saved = localStorage.getItem('preferredLanguage');
      if (!saved) {
        localStorage.setItem('preferredLanguage', 'mr');
        document.documentElement.lang = 'mr';
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }, []);

  const { currentLanguage, languages, changeLanguage, translating } = useAutoTranslate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // Consent state
  const [hasConsented, setHasConsented] = useState(() => {
    try {
      const consentData = localStorage.getItem('userConsent');
      if (!consentData) return false;

      const parsed = JSON.parse(consentData);
      // Check if consent is expired (30 days)
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem('userConsent');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });

  const [checkingConsent, setCheckingConsent] = useState(true);
  const [appInitialized, setAppInitialized] = useState(false);

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    // Consent check will run automatically via useEffect
  };



  // Handle logout
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }

    setIsAuthenticated(false);
    setHasConsented(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userConsent');

    // Redirect to login
    window.location.href = '/login';
  };

  // Handle consent completion
  const handleConsentComplete = () => {
    setHasConsented(true);
    // Refresh to apply navigation
    setTimeout(() => {
      window.location.href = '/home';
    }, 100);
  };

  // In your App.jsx, update the useEffect for auth checking
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');

        // Check for consent
        try {
          const db = getFirestore();
          const consentDoc = await getDoc(doc(db, 'userConsents', user.uid));

          if (consentDoc.exists()) {
            setHasConsented(true);
            localStorage.setItem('userConsent', JSON.stringify(consentDoc.data()));
          } else {
            setHasConsented(false);
          }
        } catch (error) {
          console.error('Error checking consent:', error);
          // Check localStorage as fallback
          const localConsent = localStorage.getItem('userConsent');
          setHasConsented(!!localConsent);
        }
      } else {
        setIsAuthenticated(false);
        setHasConsented(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userConsent');
      }

      setCheckingConsent(false);
    });

    return () => unsubscribe();
  }, []);

  // Check consent on auth state change
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');

        try {
          // Check Firestore for consent
          const db = getFirestore();
          const consentDoc = await getDoc(doc(db, 'userConsents', user.uid));

          if (consentDoc.exists()) {
            setHasConsented(true);
            // Update localStorage with Firestore data
            localStorage.setItem('userConsent', JSON.stringify({
              ...consentDoc.data(),
              localStorageTimestamp: Date.now()
            }));
          } else {
            setHasConsented(false);
          }
        } catch (error) {
          console.error('Error checking consent:', error);
          // Fallback to localStorage
          const localConsent = localStorage.getItem('userConsent');
          setHasConsented(!!localConsent);
        }
      } else {
        setIsAuthenticated(false);
        setHasConsented(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userConsent');
      }

      setCheckingConsent(false);
      setAppInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Sync pending writes
  useEffect(() => {
    syncPendingWrites();
    const interval = setInterval(syncPendingWrites, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  usePendingSync({ intervalMs: 30000 });

  // Show loading while checking consent
  if (!appInitialized || (isAuthenticated && checkingConsent)) {
    return <LoadingScreen />;
  }

  return (
    <CandidateProvider>
      <VoterProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            {/* Only show navigation when authenticated AND consented */}
            {isAuthenticated && hasConsented && (
              <Navigation
                currentLanguage={currentLanguage}
                languages={languages}
                changeLanguage={changeLanguage}
                translating={translating}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                onLogout={handleLogout}
              />
            )}

            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    isAuthenticated && hasConsented ? (
                      <Navigate to="/home" replace />
                    ) : isAuthenticated && !hasConsented ? (
                      <Navigate to="/consent" replace />
                    ) : (
                      <Login onLogin={handleLogin} />
                    )
                  }
                />

                {/* Consent Route */}
                <Route
                  path="/consent"
                  element={
                    <ConsentRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <ConsentForm onConsentComplete={handleConsentComplete} />
                    </ConsentRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <Upload />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/search"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/home"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <Home />
                    </ProtectedRoute>
                  }
                />

                {/* All other protected routes */}
                <Route
                  path="/booths"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <BoothManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/slip"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <ElectoralFlyerService />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/lists"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <FilterPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/voter/:voterId"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <FullVoterDetails />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/contact"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <Contactus />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/team"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <Team />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/bulk-survey"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <BulkSurvey />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/demo"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <WhatsAppShare />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <Setting />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute
                      isAuthenticated={isAuthenticated}
                      hasConsented={hasConsented}
                    >
                      <Reports />
                    </ProtectedRoute>
                  }
                />

                {/* Default Route */}
                <Route
                  path="/"
                  element={
                    <Navigate to={
                      isAuthenticated && hasConsented
                        ? "/home"
                        : isAuthenticated && !hasConsented
                          ? "/consent"
                          : "/login"
                    } replace />
                  }
                />

                {/* Fallback Route */}
                <Route
                  path="*"
                  element={
                    <Navigate to="/" replace />
                  }
                />
              </Routes>
            </main>

            {/* Footer only for authenticated and consented users */}
            {/* {isAuthenticated && hasConsented && (
              <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-auto">
                <div className="backdrop-blur-sm bg-white/90 border border-white/30 shadow-lg rounded-full px-6 py-3 flex items-center justify-center">
                  <CandidateFooter />
                </div>
              </footer>
            )} */}
          </div>
        </Router>
      </VoterProvider>
    </CandidateProvider>
  );
}

// Candidate Footer Component
const CandidateFooter = () => {
  const { candidateInfo } = useCandidate();
  return (
    <div className="text-sm text-gray-700 font-semibold">
      {candidateInfo?.ReSellerName || 'Election Management System'}
    </div>
  );
};

export default App;