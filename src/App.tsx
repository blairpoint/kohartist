import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, User as UserIcon, LogOut, ScanLine, Music, Heart, CreditCard } from 'lucide-react';
import ArtistDashboard from './components/ArtistDashboard';
import FanView from './components/FanView';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import Scanner from './components/Scanner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
        <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Music className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">kohartist</span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/dashboard"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm font-medium"
                  >
                    <UserIcon className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-all font-medium text-sm shadow-lg shadow-indigo-500/20"
                >
                  Artist Login
                </button>
              )}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home user={user} login={login} />} />
            <Route path="/dashboard" element={<ArtistDashboard user={user} />} />
            <Route path="/artist/:artistId" element={<FanView />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/cancel" element={<PaymentCancel />} />
          </Routes>
        </main>

        <footer className="border-t border-zinc-800 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-zinc-500 text-sm">
            <p>&copy; 2026 kohartist. Supporting independent creators.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function Home({ user, login }: { user: User | null; login: () => void }) {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="space-y-24 py-12">
      {showScanner && <Scanner onClose={() => setShowScanner(false)} />}
      
      <section className="text-center space-y-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider"
        >
          <ScanLine className="w-4 h-4" />
          Direct-to-Artist Payments
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tighter leading-tight"
        >
          Support the artists <br />
          <span className="text-indigo-500">you love, directly.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-zinc-400 leading-relaxed"
        >
          Scan a QR code, choose an amount, and pay instantly. No apps to download, no friction. Just pure support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <button
            onClick={() => setShowScanner(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all font-bold text-lg shadow-xl shadow-white/10 flex items-center justify-center gap-2"
          >
            <ScanLine className="w-5 h-5" />
            Scan to Pay
          </button>
          
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all font-bold text-lg shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              Artist Dashboard
              <QrCode className="w-5 h-5" />
            </Link>
          ) : (
            <button
              onClick={login}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition-all font-bold text-lg flex items-center justify-center gap-2"
            >
              Artist Login
              <Music className="w-5 h-5" />
            </button>
          )}
        </motion.div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <QrCode className="w-8 h-8 text-indigo-500" />,
            title: "Artists: Get Your Code",
            desc: "Create a profile and generate a unique QR code for your performances."
          },
          {
            icon: <ScanLine className="w-8 h-8 text-indigo-500" />,
            title: "Fans: Scan & Pay",
            desc: "Fans scan your code with their phone camera and pay via Stripe."
          },
          {
            icon: <Heart className="w-8 h-8 text-indigo-500" />,
            title: "Direct Support",
            desc: "Funds go directly to you, minus standard processing fees."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 transition-colors group"
          >
            <div className="mb-6 p-4 rounded-2xl bg-zinc-950 w-fit group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
