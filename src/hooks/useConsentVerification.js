// hooks/useConsentVerification.js
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export const useConsentVerification = () => {
  const [hasConsented, setHasConsented] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyConsent = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setHasConsented(false);
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const consentDoc = await getDoc(doc(db, 'userConsents', user.uid));
        
        if (consentDoc.exists()) {
          setHasConsented(true);
        } else {
          setHasConsented(false);
        }
      } catch (error) {
        console.error('Consent verification failed:', error);
        setHasConsented(false);
      }
      
      setLoading(false);
    };

    verifyConsent();
  }, []);

  return { hasConsented, loading };
};