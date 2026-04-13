import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, CreditCard, Music, ArrowLeft, Loader2, Twitter, Facebook, Share2, Check } from 'lucide-react';

export default function FanView() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('5');
  const [customAmount, setCustomAmount] = useState('');
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  const shareText = artist ? `Check out ${artist.name} on kohartist! Support their music directly.` : 'Check out this artist on kohartist!';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchArtist = async () => {
      if (!artistId) return;
      
      // Demo mode
      if (artistId === 'demo') {
        setArtist({
          name: 'Demo Artist',
          bio: 'This is a demo profile to show you how fans see your page.',
          photoUrl: 'https://picsum.photos/seed/artist/200'
        });
        setLoading(false);
        return;
      }

      const docRef = doc(db, 'artists', artistId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setArtist(docSnap.data());
      }
      setLoading(false);
    };
    fetchArtist();
  }, [artistId]);

  const handlePayment = async () => {
    const finalAmount = amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) return;

    setPaying(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId,
          artistName: artist.name,
          amount: finalAmount
        }),
      });

      const session = await response.json();
      if (session.id) {
        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${session.id}`;
      } else {
        throw new Error(session.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed to initialize. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-zinc-400">Loading artist profile...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-20 space-y-6">
        <h2 className="text-3xl font-bold">Artist not found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-12 py-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <section className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mx-auto w-32 h-32"
        >
          <img
            src={artist.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6366f1&color=fff`}
            alt={artist.name}
            className="w-full h-full rounded-[40px] object-cover shadow-2xl shadow-indigo-500/20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-2xl shadow-lg">
            <Music className="w-5 h-5 text-white" />
          </div>
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">{artist.name}</h1>
          <p className="text-zinc-400 leading-relaxed px-4">{artist.bio}</p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
            title="Share on Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
            title="Share on Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <button
            onClick={copyLink}
            className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
            title="Copy Profile Link"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>
      </section>

      <section className="bg-zinc-900 p-8 rounded-[40px] border border-zinc-800 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">Show your support</h3>
          <p className="text-zinc-400 text-sm">Choose an amount to tip {artist.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['5', '10', '20'].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className={`py-4 rounded-2xl font-bold text-xl transition-all border-2 ${
                amount === val
                  ? 'bg-indigo-600 border-indigo-400 scale-105'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              ${val}
            </button>
          ))}
          <button
            onClick={() => setAmount('custom')}
            className={`col-span-3 py-4 rounded-2xl font-bold text-lg transition-all border-2 ${
              amount === 'custom'
                ? 'bg-indigo-600 border-indigo-400'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            Custom Amount
          </button>
        </div>

        <AnimatePresence>
          {amount === 'custom' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xl">$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-4 focus:outline-none focus:border-indigo-500 transition-colors text-xl font-bold"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handlePayment}
          disabled={paying || (amount === 'custom' && !customAmount)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
        >
          {paying ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <CreditCard className="w-6 h-6" />
              Pay with Stripe
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs uppercase tracking-widest font-bold">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          100% Secure Payment
        </div>
      </section>
    </div>
  );
}
