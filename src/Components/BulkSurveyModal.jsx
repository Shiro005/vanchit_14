import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiSave, FiCheck, FiPlus } from 'react-icons/fi';
import { db } from '../Firebase/config';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import TranslatedText from './TranslatedText';
import { dbLocal } from '../libs/localdb';

const allCastes = [
  // ✅ General Category
  'Brahmin',
  'Maheshwari',
  'Chitpavan Brahmin',
  'Deshastha Brahmin',
  'Karhade Brahmin',
  'Shenvi Brahmin',
  'Daivadnya Brahmin',
  'Gaud Saraswat Brahmin',
  'Maratha',
  'Kshatriya Maratha',
  '96 Kuli Maratha',
  'Kunbi Maratha',
  'Rajput',
  'Gujar',
  'Jain',
  'Digambar Jain',
  'Shwetambar Jain',
  'Lingayat',
  'Arya Vaishya',
  'Vaishya Vani',
  'Kayastha',
  'Parsi',
  'Sikh',
  'Christian (Upper Caste)',

  // ✅ OBC (Other Backward Classes)
  'Kunbi Patil',
  'Deshmukh',
  'Deshpande',
  'Kuruba',
  'Teli',
  'Lohar',
  'Sutar',
  'Kumbhar',
  'Nai (Nhavi)',
  'Dhangar',
  'Gavli',
  'Gurav',
  'Koli',
  'Bhoi',
  'Vanjari',
  'Mali',
  'Sonar',
  'Tamboli',
  'Koshti',
  'Lingayat (OBC)',
  'Dhangar (Gadariya)',
  'Golla',
  'Gopal',
  'Kaikadi',
  'Khatik',
  'Kumbhar (Kumbhar)',
  'Kurmi',
  'Lad',
  'Lohana',
  'Mochi',
  'Nadar',
  'Nai (Nai)',
  'Nalband',
  'Napit',
  'Nat',
  'Patil',
  'Panchal',
  'Patwa',
  'Ramoshi',
  'Sali',
  'Sansi',
  'Satnami',
  'Shimpi',
  'Sunari',
  'Sutar',
  'Teli (Teli)',
  'Thathera',
  'Tirgar',
  'Vadar',
  'Vanjari (Vanjari)',
  'Vishwakarma',
  'Yadav',
  'Zende',

  // ✅ VJNT (Vimukta Jati and Nomadic Tribes)
  'Banjara',
  'Bharadi',
  'Bhil',
  'Charan',
  'Dhangar (VJNT)',
  'Gondhali',
  'Gosavi',
  'Kanjarbhat',
  'Kolhati',
  'Maan',
  'Madari',
  'Mang Garudi',
  'Masjid Patel',
  'Nandiwale',
  'Pardhi',
  'Phase Pardhi',
  'Qureshi',
  'Ramoshi (VJNT)',
  'Sikligar',
  'Vaidu',
  'Vanjari (VJNT)',
  'Vimukta Jati',

  // ✅ SC (Scheduled Castes)
  'Mahar',
  'Buddhist (Neo-Buddhist)',
  'Chambhar',
  'Mang',
  'Dhor',
  'Khatik (SC)',
  'Madiga',
  'Chamar',
  'Mala',
  'Valmiki',
  'Dhobi',
  'Balmiki',
  'Mehtar',
  'Mahyavanshi',
  'Kori',
  'Kotwal',
  'Mochi (SC)',
  'Pasi',
  'Sansi (SC)',
  'Satnami (SC)',
  'Adi Dravida',
  'Adi Karnataka',
  'Beda',
  'Bhai',
  'Chalvadi',
  'Chenna Dasar',
  'Dakkal',
  'Dandasi',
  'Dewar',
  'Dom',
  'Ganda',
  'Godagali',
  'Godari',
  'Holeya',
  'Kadaiyan',
  'Kakkalan',
  'Kalladi',
  'Kanakkan',
  'Kodalo',
  'Korama',
  'Kudumbi',
  'Kuravan',
  'Madiga',
  'Maila',
  'Mala',
  'Mannan',
  'Mavilan',
  'Moger',
  'Mukri',
  'Nadar (SC)',
  'Pallan',
  'Palluvan',
  'Panan',
  'Paraiyan',
  'Paravan',
  'Pulayan',
  'Puthirai Vannan',
  'Raneyar',
  'Samagara',
  'Samban',
  'Sambavar',
  'Thandan',
  'Valluvan',
  'Vannan',
  'Vettuvan',

  // ✅ ST (Scheduled Tribes)
  'Bhils',
  'Gonds',
  'Warli',
  'Kokna',
  'Thakar',
  'Katkari',
  'Madia',
  'Pardhan',
  'Kolam',
  'Korku',
  'Baiga',
  'Rathwa',
  'Andh',
  'Barda',
  'Bavacha',
  'Bhilala',
  'Chodhara',
  'Dhanka',
  'Dubla',
  'Gamit',
  'Gond (ST)',
  'Kathodi',
  'Kokni',
  'Koli Dhor',
  'Koli Mahadev',
  'Koli Malhar',
  'Kunbi (ST)',
  'Naikda',
  'Pardhi (ST)',
  'Pawara',
  'Rathawa',
  'Siddi',
  'Varli',
  'Vasava',
  'Vitolia',

  // ✅ Muslim Castes (Special Backward Classes)
  'Muslim',

  // ✅ Christian Castes
  'Christian',

  // ✅ Buddhist (Special Category)
  'Buddhist',

  // ✅ Other Special Categories
  'Jat',
  'Jat Sikh',
  'Khatri Sikh',
  'Ramgarhia',
  'Baniya',
  'Aggarwal',
  'Gupta',
  'Modi',
  'Patel',
  'Reddy',
  'Naidu',
  'Nair',
  'Ezhava',
  'Viswakarma',

  // ✅ Other
  'Other',
  'Not Specified',
  'Prefer not to say'
];

const BulkSurveyModal = ({ open, onClose, surname, voters = [], onSaved }) => {
  const [casteSearch, setCasteSearch] = useState('');
  const [selectedCaste, setSelectedCaste] = useState('');
  const [customCaste, setCustomCaste] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [supportStatus, setSupportStatus] = useState('medium');
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [listHeight, setListHeight] = useState(192); // Default height
  const listContainerRef = useRef(null);

  // Update list height based on available space
  useEffect(() => {
    if (listContainerRef.current && open) {
      const updateHeight = () => {
        const modalHeight = window.innerHeight * 0.9; // 90vh
        const otherElementsHeight = 400; // Approximate height of other elements
        const availableHeight = modalHeight - otherElementsHeight;
        const maxHeight = Math.max(192, Math.min(384, availableHeight)); // Between 12rem and 24rem
        setListHeight(maxHeight);
      };

      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [open]);

  // Filter castes based on search with better matching
  const filteredCastes = useMemo(() => {
    if (!casteSearch.trim()) return allCastes.slice(); // Show all castes when search is empty

    const searchTerm = casteSearch.toLowerCase().trim();
    const searchWords = searchTerm.split(/\s+/);

    return allCastes.filter(caste => {
      const casteLower = caste.toLowerCase();

      // Check if all search words are present in the caste name
      return searchWords.every(word => casteLower.includes(word));
    });
  }, [casteSearch]);

  // Highlight search term in results
  const highlightMatch = (caste) => {
    if (!casteSearch.trim()) return caste;

    const searchTerm = casteSearch.toLowerCase();
    const startIndex = caste.toLowerCase().indexOf(searchTerm);

    if (startIndex === -1) return caste;

    const endIndex = startIndex + searchTerm.length;
    return (
      <>
        {caste.substring(0, startIndex)}
        <span className="bg-yellow-100 font-semibold text-orange-700">
          {caste.substring(startIndex, endIndex)}
        </span>
        {caste.substring(endIndex)}
      </>
    );
  };

  // Handle caste selection
  const handleCasteSelect = (caste) => {
    if (caste === 'Other') {
      setShowCustomInput(true);
      setSelectedCaste('Other');
      setCasteSearch(''); // Clear search when selecting Other
    } else {
      setSelectedCaste(caste);
      setShowCustomInput(false);
      setCasteSearch(''); // Clear search after selection for better UX
    }
  };

  // Add custom caste
  const handleAddCustomCaste = () => {
    if (customCaste.trim()) {
      setSelectedCaste(customCaste.trim());
      setShowCustomInput(false);
    }
  };

  // Get final caste value
  const getFinalCaste = () => {
    if (selectedCaste === 'Other' && customCaste.trim()) {
      return customCaste.trim();
    }
    return selectedCaste;
  };

  // Clear search
  const clearSearch = () => {
    setCasteSearch('');
  };

  // Save to Firestore
  const handleSave = async () => {
    const finalCaste = getFinalCaste();
    if (!finalCaste) {
      alert('Please select or enter a caste');
      return;
    }

    setBusy(true);

    try {
      const batch = writeBatch(db);
      const surveyDocs = [];
      const dynamicDocs = [];

      // Process voters
      for (let i = 0; i < voters.length; i++) {
        const voter = voters[i];
        const voterId = String(voter.voterId || voter.id || '').trim().toUpperCase();

        if (!voterId) continue;

        // Prepare survey data
        const surveyData = {
          voterId,
          name: voter.name || '',
          voterNameEng: voter.voterNameEng || '',
          surname: surname || '',
          caste: finalCaste,
          supportStatus,
          phone: voter.phone || '',
          whatsapp: voter.whatsapp || '',
          issues: '',
          remarks: '',
          updatedAt: serverTimestamp(),
          batchUpdated: true,
          batchTimestamp: Date.now()
        };

        // Add to survey batch
        const surveyRef = doc(db, 'voter_surveys', voterId);
        batch.set(surveyRef, surveyData, { merge: true });
        surveyDocs.push({ ...surveyData, id: voterId });

        // Prepare dynamic data
        const dynamicRef = doc(db, 'voters_dynamic', voterId);
        const dynamicData = {
          voterId,
          supportStatus,
          updatedAt: serverTimestamp()
        };
        batch.set(dynamicRef, dynamicData, { merge: true });
        dynamicDocs.push(dynamicData);
      }

      await batch.commit();

      // Update local IndexedDB
      try {
        if (surveyDocs.length > 0) {
          await dbLocal.voter_surveys.bulkPut(surveyDocs);
        }
        if (dynamicDocs.length > 0) {
          await dbLocal.voters_dynamic.bulkPut(dynamicDocs);
        }
      } catch (e) {
        console.log('Local DB update skipped:', e);
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onSaved) onSaved();
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Bulk survey save failed:', err);
      alert('Failed to save bulk survey. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  // Clean surname display
  const cleanSurname = surname ? surname.replace(/[,"]/g, '') : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-xl max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                <TranslatedText>Bulk Update</TranslatedText>
              </h2>
              <p className="text-white/90 text-xs mt-1">
                <TranslatedText>Total: {voters.length} | {cleanSurname}</TranslatedText>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <FiX className="text-white text-lg" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="px-4 py-2 bg-green-100 border-b border-green-200">
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <FiCheck className="text-green-600" />
              <TranslatedText>Saved successfully!</TranslatedText>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">

          {/* 1. Caste Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <TranslatedText>1. Select Caste</TranslatedText>
            </label>

            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={casteSearch}
                onChange={(e) => setCasteSearch(e.target.value)}
                placeholder="Search caste... (Type to filter {allCastes.length} castes)"
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none"
              />
              {casteSearch && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <FiX className="text-sm" />
                </button>
              )}
            </div>

            {/* Search Results Info */}
            {casteSearch.trim() && (
              <div className="text-xs text-gray-500">
                <TranslatedText>Showing {filteredCastes.length} of {allCastes.length} castes</TranslatedText>
              </div>
            )}

            {/* Custom Caste Input */}
            {showCustomInput && (
              <div className="space-y-2 animate-fadeIn">
                <div className="relative">
                  <input
                    type="text"
                    value={customCaste}
                    onChange={(e) => setCustomCaste(e.target.value)}
                    placeholder="Enter custom caste..."
                    className="w-full pl-4 pr-10 py-2 text-sm border border-orange-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomCaste();
                    }}
                  />
                  <button
                    onClick={handleAddCustomCaste}
                    disabled={!customCaste.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-orange-600 hover:text-orange-700 disabled:text-gray-400"
                    aria-label="Add custom caste"
                  >
                    <FiPlus className="text-sm" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setSelectedCaste('');
                    setCustomCaste('');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <FiX className="text-xs" />
                  <TranslatedText>Cancel custom caste</TranslatedText>
                </button>
              </div>
            )}

            {/* Caste List */}
            {!showCustomInput && (
              <div
                ref={listContainerRef}
                className="border border-gray-200 rounded-lg overflow-hidden"
                style={{ maxHeight: `${listHeight}px` }}
              >
                <div className="overflow-y-auto" style={{ maxHeight: `${listHeight}px` }}>
                  {filteredCastes.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      <div className="mb-2">No caste found for "{casteSearch}"</div>
                      <button
                        onClick={clearSearch}
                        className="text-orange-600 hover:text-orange-700 text-xs font-medium"
                      >
                        Clear search to see all {allCastes.length} castes
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredCastes.map((caste, index) => (
                        <button
                          key={`${caste}-${index}`}
                          onClick={() => handleCasteSelect(caste)}
                          className={`w-full text-left px-3 py-2.5 text-sm transition-all hover:bg-gray-50 ${selectedCaste === caste
                            ? 'bg-orange-50 text-orange-700 border-l-4 border-l-orange-500'
                            : 'text-gray-700'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{highlightMatch(caste)}</span>
                            {selectedCaste === caste && (
                              <FiCheck className="text-orange-500 text-base" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Caste Display */}
            {selectedCaste && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-orange-600 font-medium">
                      <TranslatedText>Selected Caste:</TranslatedText>
                    </div>
                    <div className="text-sm font-semibold text-orange-700 mt-1">
                      {selectedCaste === 'Other' ? 'Custom: ' + (customCaste.trim() || 'Not entered yet') : selectedCaste}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCaste('');
                      setCustomCaste('');
                      setShowCustomInput(false);
                    }}
                    className="p-1 text-orange-500 hover:text-orange-700"
                    aria-label="Clear selection"
                  >
                    <FiX className="text-sm" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Support Status */}
          <div className="space-y-2 pt-2">
            <label className="block text-sm font-medium text-gray-700">
              <TranslatedText>2. Support Level</TranslatedText>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'Low', color: 'bg-red-100 text-red-700 border-red-300' },
                { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                { id: 'high', label: 'High', color: 'bg-green-100 text-green-700 border-green-300' }
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => setSupportStatus(status.id)}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${supportStatus === status.id
                    ? `${status.color} border-2 shadow-sm`
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                >
                  <TranslatedText>{status.label}</TranslatedText>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              <TranslatedText>Apply to all {voters.length} voters</TranslatedText>
            </p>
          </div>

        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              disabled={busy}
            >
              <TranslatedText>Cancel</TranslatedText>
            </button>
            <button
              onClick={handleSave}
              disabled={busy || !getFinalCaste()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <TranslatedText>Saving...</TranslatedText>
                </>
              ) : (
                <>
                  <FiSave className="text-sm" />
                  <TranslatedText>Save ({voters.length} voters)</TranslatedText>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkSurveyModal;