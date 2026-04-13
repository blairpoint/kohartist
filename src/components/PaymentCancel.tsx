import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto"
      >
        <XCircle className="w-12 h-12 text-rose-500" />
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight">Payment Cancelled</h1>
        <p className="text-zinc-400 leading-relaxed">
          The payment process was cancelled. No charges were made to your account.
        </p>
      </div>

      <div className="pt-8">
        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl font-bold text-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
