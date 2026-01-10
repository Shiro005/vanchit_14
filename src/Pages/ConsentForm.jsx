import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { CheckCircle, AlertCircle, Shield, Globe } from 'lucide-react';
import { useCandidate } from '../Context/CandidateContext';

const ConsentForm = ({ onConsentComplete }) => {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { candidateInfo } = useCandidate();

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        setError('');

        try {
            const auth = getAuth();
            const provider = new GoogleAuthProvider();

            // Add scopes
            provider.addScope('profile');
            provider.addScope('email');

            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log('✅ Google login successful:', user.email);

            // After successful login, automatically agree to consent
            await handleSubmit(user);

        } catch (error) {
            console.error('❌ Google login failed:', error);
            setError(error.message || 'Google login failed. Please try again.');
            setIsLoggingIn(false);
        }
    };

    const handleSubmit = async (user = null) => {
        if (!agreed) {
            setError('Please agree to the terms and conditions to proceed.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            let currentUser = user;

            // If user not provided, get from auth
            if (!currentUser) {
                const auth = getAuth();
                currentUser = auth.currentUser;
            }

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const db = getFirestore();

            const consentData = {
                userId: currentUser.uid,
                userInfo: {
                    email: currentUser.email,
                    displayName: currentUser.displayName || '',
                    photoURL: currentUser.photoURL || ''
                },
                agreed: true,
                timestamp: new Date().toISOString(),
                consentVersion: '1.0',
                jurisdiction: 'India',
                ipAddress: await getIPAddress(),
                userAgent: navigator.userAgent
            };

            // Save consent to Firestore
            await setDoc(doc(db, 'userConsents', currentUser.uid), consentData, { merge: true });

            // Save to localStorage
            localStorage.setItem('userConsent', JSON.stringify(consentData));
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('hasGivenConsent', 'true');

            console.log('✅ Consent saved for:', currentUser.email);

            // Notify parent and redirect
            onConsentComplete();

        } catch (error) {
            console.error('❌ Error saving consent:', error);
            setError(error.message || 'Failed to save consent');
        } finally {
            setIsSubmitting(false);
            setIsLoggingIn(false);
        }
    };

    const getIPAddress = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'Unknown';
        }
    };

    const handleDecline = () => {
        if (window.confirm('Are you sure you want to decline? You cannot use the application without agreeing to the terms.')) {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                    {/* Header */}
                    <div className="bg-white px-6 py-1 text-center border-b border-gray-100">
                        <div className="flex flex-col items-center justify-center gap-3 mb-3">
                            <div className="w-20 h-20 bg-white p-1 rounded-full flex items-center justify-center">
                                <img src={candidateInfo?.logoImageCircle} alt="Logo" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-xl font-bold text-gray-900">JanNetaa</h1>
                                <p className="text-xs text-gray-500">Election Management System</p>
                            </div>
                        </div>

                        <div className="mb-1 p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <p className="text-sm font-medium text-gray-700">Approval Information</p>
                            <p className="text-xs text-gray-500 mt-1">Election Management System</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-1 px-4">
                        {/* Warning */}
                        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-amber-800 font-medium">
                                        Important App Notice
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1">

                                        This app handles sensitive voter data. By agreeing, you confirm you are an authorized election official.

                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Terms Box */}
                        {/* <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                            <h3 className="font-semibold text-gray-800 mb-3">
                                <TranslatedText>Terms & Conditions</TranslatedText>
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-600">
                                        <TranslatedText>
                                            I am an authorized election official using this app for legitimate election management purposes only.
                                        </TranslatedText>
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Globe className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-600">
                                        <TranslatedText>
                                            I will handle voter data responsibly and in compliance with Indian election laws.
                                        </TranslatedText>
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-600">
                                        <TranslatedText>
                                            I understand that my consent will be recorded for legal compliance purposes.
                                        </TranslatedText>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    <TranslatedText>
                                        <strong>Jurisdiction:</strong> Courts in India
                                        <br />
                                        <strong>Governing Laws:</strong> Representation of the People Act, 1951 & IT Act, 2000
                                    </TranslatedText>
                                </p>
                            </div>
                        </div> */}

                        <div className="h-40 px-3 mb-4 overflow-scroll text-xs text-gray-700 space-y-3">

                            <p className="font-semibold">1. INTRODUCTION</p>
                            <p>
                                This User Consent, Data Usage, Disclaimer & Legal Indemnity Agreement
                                ("Agreement") is a legally binding contract between the User and the
                                Software Developer / Technology Provider ("Developer"), the creator of
                                the JanNetaa Election Management System ("Software").
                            </p>
                            <p>
                                By accessing, logging into, installing, or using this Software, the User
                                confirms that they have read, understood, and voluntarily agreed to all
                                terms mentioned herein.
                            </p>

                            <p className="font-semibold">2. ROLE & LIMITATION OF THE DEVELOPER</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>The Developer is ONLY a technology and software service provider.</li>
                                <li>The Developer does NOT provide, sell, collect, verify, or supply any voter or election data.</li>
                                <li>The Developer does NOT participate in political campaigns, elections, or voter influence.</li>
                                <li>The Developer has NO control over how data is entered, processed, or used by the User.</li>
                                <li>The Software is provided strictly on an "AS IS" and "AS AVAILABLE" basis.</li>
                            </ul>
                            <p className="font-medium">
                                All data, actions, decisions, outcomes, and consequences are the sole and complete responsibility of the User.
                            </p>

                            <p className="font-semibold">3. DATA OWNERSHIP & USER RESPONSIBILITY</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>All data entered into the Software belongs exclusively to the User.</li>
                                <li>The User confirms they have lawful authority to collect, store, and process such data.</li>
                                <li>No data used in the Software is stolen, illegally purchased, scraped, or obtained via coercion.</li>
                                <li>The Developer does not access or control User data except for technical support if explicitly authorized.</li>
                            </ul>

                            <p className="font-semibold">4. LEGAL & REGULATORY COMPLIANCE</p>
                            <p>
                                The User agrees to comply with all applicable Indian laws, including but not limited to:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Digital Personal Data Protection Act, 2023</li>
                                <li>Information Technology Act, 2000</li>
                                <li>Indian Penal Code (IPC)</li>
                                <li>Representation of the People Act, 1951</li>
                                <li>Election Commission of India (ECI) Rules & Guidelines</li>
                                <li>All applicable Maharashtra State election laws</li>
                            </ul>
                            <p>
                                Any violation shall be solely attributable to the User.
                            </p>

                            <p className="font-semibold">5. STRICTLY PROHIBITED USE</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Fake voter creation or manipulation of voter records</li>
                                <li>Illegal vote influence, bribery, threats, or coercion</li>
                                <li>Religious, caste-based, hate, or unlawful campaigning</li>
                                <li>Unauthorized data sharing, selling, or leakage</li>
                                <li>Cybercrime, hacking, or digital fraud</li>
                                <li>Spam messaging violating TRAI or telecom regulations</li>
                            </ul>

                            <p className="font-semibold">6. FRAUD, MISUSE & CRIMINAL LIABILITY</p>
                            <p>
                                The User fully understands that any fraudulent, illegal, or unethical use
                                of the Software is done entirely at their own risk.
                            </p>
                            <p>
                                The Developer shall NOT be held responsible or made party to any FIR,
                                police investigation, court proceeding, political dispute, or legal action
                                arising from User actions.
                            </p>

                            <p className="font-semibold">7. INDEMNITY & LEGAL SAFEGUARD</p>
                            <p>
                                The User agrees to indemnify, defend, and hold harmless the Developer from
                                any claims, losses, damages, penalties, legal notices, FIRs, court cases,
                                election disputes, or regulatory actions arising due to User misconduct.
                            </p>

                            <p className="font-semibold">8. NO GUARANTEE OR ASSURANCE</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>No guarantee of election success or voter conversion</li>
                                <li>No political advice or campaign strategy is provided</li>
                                <li>The Software is strictly a data management and operational tool</li>
                            </ul>

                            <p className="font-semibold">9. SYSTEM LOGS & LEGAL DISCLOSURE</p>
                            <p>
                                System logs and activity records may be maintained for security, auditing,
                                and legal compliance. Such logs may be shared with authorities only when
                                legally mandated.
                            </p>

                            <p className="font-semibold">10. DATA SECURITY DISCLAIMER</p>
                            <p>
                                While the Developer follows reasonable security practices, no digital
                                system is completely secure. The Developer is not responsible for losses
                                arising from User negligence, password sharing, device theft, or third-party attacks.
                            </p>

                            <p className="font-semibold">11. TERMINATION OF ACCESS</p>
                            <p>
                                The Developer reserves the right to suspend or terminate access without
                                prior notice if misuse, legal risk, or policy violation is detected.
                            </p>

                            <p className="font-semibold">12. LIMITATION OF LIABILITY</p>
                            <p>
                                Under no circumstances shall the Developer be liable for political loss,
                                election defeat, reputation damage, or legal penalties imposed on the User.
                                Maximum liability, if any, shall not exceed the amount paid for the Software.
                            </p>

                            <p className="font-semibold">13. GOVERNING LAW & JURISDICTION</p>
                            <p>
                                This Agreement shall be governed by Indian law. Jurisdiction shall lie
                                exclusively with courts in Maharashtra, India.
                            </p>

                            <p className="font-semibold">14. FINAL USER DECLARATION</p>
                            <p>
                                The User confirms that this consent is given voluntarily, with full
                                understanding, and accepts complete legal responsibility for all actions
                                performed using the Software.
                            </p>

                        </div>


                        {/* Agreement Checkbox */}
                        <div className="mb-6">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${agreed
                                        ? 'bg-orange-600 border-orange-600'
                                        : 'bg-white border-gray-300'
                                        }`}>
                                        {agreed && <CheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <span className="text-gray-700 font-medium text-sm">
                                    I agree to all terms and conditions
                                </span>
                            </label>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700 text-center">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleDecline}
                                disabled={isSubmitting || isLoggingIn}
                                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Decline & Exit
                            </button>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={!agreed || isSubmitting || isLoggingIn}
                                className={`w-full py-3 px-4 font-semibold rounded-lg transition-all flex items-center justify-center gap-3 ${agreed && !isLoggingIn
                                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md hover:shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isLoggingIn ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Connecting to Google...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        <span>Agree & Continue with Google</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">

                                By continuing, you agree to our Terms of Service and Privacy Policy

                            </p>
                            <p className="text-xs text-gray-400 text-center mt-2">
                                Version 3.5 • India 🇮🇳
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsentForm;