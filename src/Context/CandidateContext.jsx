import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const CandidateContext = createContext();

// Custom hook to use the candidate context
export const useCandidate = () => {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error('useCandidate must be used within a CandidateProvider');
  }
  return context;
};

// Provider component
export const CandidateProvider = ({ children }) => {
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default candidate information
  const defaultCandidateInfo = {
    mainFrontImage: '',
    mainWhatsappBrandingImage: '',
    logoImageCircle: "https://tse4.mm.bing.net/th/id/OIP.xpj0JrJxmvic_XjnnaJxiAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3",
    TagLine: "अकोला महापालिका निवडणूक 2026",
    ReSellerName: "Powered By JanNetaa",
    name: 'Akola Election 2026 Guidelines',
    party: "Akola Election 2026 Guidelines",
    electionSymbol: "",
    slogan: 'अकोला महापालिका निवडणूक 2026 साठी आपले स्वागत आहे!',
    contact: "",
    area: "अकोला महापालिका निवडणूक 2026",
    messageWhatsapp: "Akola Election 2026\n",
    messagePrinting: "Akola Election 2026"
  };

  //  mainFrontImage: '',
  //   mainWhatsappBrandingImage: '',
  //   logoImageCircle: "https://tse4.mm.bing.net/th/id/OIP.xpj0JrJxmvic_XjnnaJxiAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3",
  //   TagLine: "वंचित बहुजन आघाडी",
  //   ReSellerName: "Powered By JanNetaa",
  //   name: 'प्रभाग क्रमांक 14',
  //   party: "वंचित बहुजन आघाडी",
  //   electionSymbol: "गॅस सिलेंडर",
  //   slogan: 'अकोला महापालिका निवडणूक 2026 साठी आपले स्वागत आहे!',
  //   contact: "",
  //   area: "अकोला महापालिका निवडणूक 2026",
  //   messageWhatsapp: "वंचित बहुजन आघाडी पक्षाचे अधिकृत उमेदवार यांना वंचित बहुजन आघाडी पक्षाच्या(गॅस सिलेंडर) चिन्हावर  मतदान करून प्रचंड बहुमतांनी विजयी करा.\n*आपले उमेदवार:*\n(अ) सौ उज्वलाताई प्रवीण पातोडे\n(ब) सौ जयश्रीताई महेंद्र बहादूरकर\n(क) श्री पराग रामकृष्ण गवई\n(ड) शेख शमशु कमर शेख साबीर\n",
  //   messagePrinting: "वंचित बहुजन आघाडी प्रभाग क्रमांक 14 चे अधिकृत उमेदवार<br>(अ) सौ उज्वलाताई प्रवीण पातोडे<br>(ब) सौ जयश्रीताई महेंद्र बहादूरकर<br>(क) श्री पराग रामकृष्ण गवई<br>(ड) शेख शमशु कमर शेख साबीर <br>यांना <b>गॅस सिलेंडर</b> या निशाणी समोरील बटन दाबून प्रचंड बहुमतांनी विजयी करा"

  // Load candidate info from localStorage on mount
  useEffect(() => {
    const loadCandidateInfo = () => {
      try {
        const savedCandidateInfo = localStorage.getItem('candidateInfo');
        if (savedCandidateInfo) {
          setCandidateInfo(JSON.parse(savedCandidateInfo));
        } else {
          setCandidateInfo(defaultCandidateInfo);
        }
      } catch (error) {
        console.error('Error loading candidate info:', error);
        setCandidateInfo(defaultCandidateInfo);
      } finally {
        setLoading(false);
      }
    };

    loadCandidateInfo();
  }, []);

  // Save to localStorage whenever candidateInfo changes
  useEffect(() => {
    if (candidateInfo) {
      localStorage.setItem('candidateInfo', JSON.stringify(candidateInfo));
    }
  }, [candidateInfo]);

  const updateCandidateInfo = (newInfo) => {
    setCandidateInfo(prev => ({ ...prev, ...newInfo }));
  };

  const resetCandidateInfo = () => {
    setCandidateInfo(defaultCandidateInfo);
    localStorage.setItem('candidateInfo', JSON.stringify(defaultCandidateInfo));
  };

  // Don't render children until candidateInfo is loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading candidate information...</p>
        </div>
      </div>
    );
  }

  const value = {
    candidateInfo,
    updateCandidateInfo,
    resetCandidateInfo
  };

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
};