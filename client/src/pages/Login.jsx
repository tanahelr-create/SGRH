import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/layout/Footer';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN_RH') navigate('/admin/dashboard');
      else if (user.role === 'SUPERADMIN') navigate('/superadmin/comptes');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Panneau gauche — bleu marine/or */}
        <div className="md:w-1/2 bg-navy relative overflow-hidden flex items-center p-10 md:p-16">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 800">
            <defs>
              <linearGradient id="loginGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#02295D" />
                <stop offset="100%" stopColor="#04357A" />
              </linearGradient>
            </defs>
            <rect width="600" height="800" fill="url(#loginGrad)" />
            {[...Array(6)].map((_, i) => (
              <rect
                key={i}
                x={-80 + i * 90}
                y={620 - i * 15}
                width="140"
                height="26"
                rx="13"
                fill="#F2B705"
                opacity={0.12 + i * 0.04}
                transform={`rotate(-20 ${-80 + i * 90} ${620 - i * 15})`}
              />
            ))}
            <circle cx="520" cy="90" r="140" fill="#F2B705" opacity="0.08" />
          </svg>

          <div className="relative z-10 text-white">
            <img
              src="/logo-univ-mahajanga.png"
              alt="Université de Mahajanga"
              className="h-14 mb-6"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <h1 className="text-3xl font-bold mb-4 leading-tight">
              Bienvenue sur<br />l'espace RH
            </h1>
            <p className="text-white/70 text-sm max-w-sm">
              Université de Mahajanga — Plateforme de gestion des ressources humaines.
              Consultez votre dossier, vos congés et vos notifications en un seul endroit.
            </p>
          </div>
        </div>

        {/* Panneau droit — formulaire */}
        <div className="md:w-1/2 bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Connexion</p>
            <h2 className="text-xl font-bold text-navy mb-6">Accéder à mon espace</h2>

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

              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-full pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-navy"
                  />
                  Se souvenir de moi
                </label>
                <Link to="/mot-de-passe-oublie" className="text-navy font-medium hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy text-white rounded-full py-3 font-medium hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>

              {error && <p className="text-sm text-status-rejected text-center">{error}</p>}
            </form>

            <p className="text-xs text-gray-400 text-center mt-6">
              Pas encore de compte ? <Link to="/register" className="text-navy font-medium">Créer mon compte</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}