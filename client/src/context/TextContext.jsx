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

  const registerKey = useCallback((key, defaultValue, category) => {
    if (registeredKeys.current.has(key)) return;
    if (texts[key] !== undefined) return;
    registeredKeys.current.add(key);
    ensureDefaultText(key, defaultValue, category);
  }, [texts]);

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

export function useText(key, defaultValue, category = 'Général') {
  const { texts, loaded, registerKey } = useTextContext();

  useEffect(() => {
    if (!loaded) return;
    registerKey(key, defaultValue, category);
  }, [key, loaded, registerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return texts[key] !== undefined ? texts[key] : defaultValue;
}