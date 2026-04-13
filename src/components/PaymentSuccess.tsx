import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Music, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight">Payment Successful!</h1>
        <p className="text-zinc-400 leading-relaxed">
          Thank you for supporting independent music. Your payment has been processed and the artist has been notified.
        </p>
      </div>

      <div className="pt-8 space-y-4">
        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold text-lg transition-all"
        >
          Back to Home
          <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
          <Music className="w-4 h-4" />
          Keep the music playing
        </p>
      </div>
    </div>
  );
}
