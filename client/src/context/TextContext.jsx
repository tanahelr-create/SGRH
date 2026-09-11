import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getAllTexts, ensureDefaultText } from '../services/siteTextsApi';

const TextContext = createContext(null);

export function TextProvider({ children }) {
  const [texts, setTexts] = useState({});
  const [loaded, setLoaded] = useState(false);
  const registeredKeys = useRef(new Set());

  async function reload() {
    const data = await getAllTexts();
    setTexts(data.texts || {});
    setLoaded(true);
  }

  useEffect(() => { reload(); }, []);

  // Appelé par useText() : si la clé n'existe pas encore en base, on l'enregistre avec sa valeur par défaut.
  const registerKey = useCallback((key, defaultValue, category) => {
    if (registeredKeys.current.has(key)) return;
    if (texts[key] !== undefined) return; // déjà connue
    if (!loaded) return; // attend le premier chargement pour ne pas enregistrer en double
    registeredKeys.current.add(key);
    ensureDefaultText(key, defaultValue, category);
  }, [texts, loaded]);

  return (
    <TextContext.Provider value={{ texts, loaded, registerKey, reload }}>
      {children}
    </TextContext.Provider>
  );
}

export function useTextContext() {
  const ctx = useContext(TextContext);
  if (!ctx) throw new Error('useTextContext doit être utilisé dans TextProvider');
  return ctx;
}

// Le hook principal à utiliser dans chaque composant :
// const title = useText('login.titre', 'Bienvenue sur l'espace RH', 'Login');
export function useText(key, defaultValue, category = 'Général') {
  const { texts, registerKey } = useTextContext();
  useEffect(() => {
    registerKey(key, defaultValue, category);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return texts[key] !== undefined ? texts[key] : defaultValue;
}