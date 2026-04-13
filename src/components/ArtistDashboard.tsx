import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { Save, Copy, Check, Download, Share2, ExternalLink } from 'lucide-react';

export default function ArtistDashboard({ user }: { user: User | null }) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'artists', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setBio(data.bio || '');
          setProfileExists(true);
        } else {
          setName(user.displayName || '');
        }
      };
      fetchProfile();
    }
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'artists', user.uid);
      if (profileExists) {
        await updateDoc(docRef, { name, bio });
      } else {
        await setDoc(docRef, {
          uid: user.uid,
          name,
          bio,
          photoUrl: user.photoURL,
          createdAt: new Date().toISOString()
        });
        setProfileExists(true);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const artistUrl = `${window.location.origin}/artist/${user?.uid}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(artistUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Please login to access your dashboard</h2>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Artist Profile</h2>
          <p className="text-zinc-400 text-sm">Set up your public profile for fans to see when they scan your code.</p>
        </div>

        <div className="space-y-6 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Stage Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your artist name"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your fans a bit about yourself..."
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all py-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {saving ? 'Saving...' : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Your QR Code</h2>
          <p className="text-zinc-400 text-sm">Display this on stage or on your merch for instant payments.</p>
        </div>

        <div className="bg-white p-12 rounded-[40px] flex flex-col items-center justify-center shadow-2xl shadow-indigo-500/10">
          <div className="p-4 bg-white rounded-2xl">
            <QRCodeSVG
              value={artistUrl}
              size={256}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/favicon.ico",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          
          <div className="mt-8 text-center space-y-2">
            <p className="text-zinc-900 font-bold text-xl">Scan to Pay {name || 'Artist'}</p>
            <p className="text-zinc-500 text-sm">Powered by kohartist & Stripe</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={copyUrl}
            className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 py-4 rounded-2xl font-medium transition-all"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a
            href={artistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 py-4 rounded-2xl font-medium transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            View Live
          </a>
        </div>
      </motion.div>
    </div>
  );
}
