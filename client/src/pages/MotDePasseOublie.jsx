import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { requestPasswordReset } from '../services/passwordResetApi';
import Footer from '../components/layout/Footer';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await requestPasswordReset(email);
      setStatus('success');
      setMessage(res.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <h1 className="text-lg font-bold text-navy mb-1">Mot de passe oublié</h1>
          <p className="text-xs text-gray-400 mb-6">
            Entrez votre email, un lien de réinitialisation vous sera envoyé.
          </p>

          {status !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-navy text-white rounded-full py-3 font-medium hover:opacity-90 disabled:opacity-50"
              >
                {status === 'loading' ? 'Envoi...' : 'Envoyer le lien'}
              </button>
              {status === 'error' && <p className="text-sm text-status-rejected">{message}</p>}
            </form>
          )}

          {status === 'success' && (
            <p className="text-sm text-status-approved">{message}</p>
          )}

          <p className="text-xs text-gray-400 text-center mt-6">
            <Link to="/login" className="text-navy font-medium">Retour à la connexion</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}