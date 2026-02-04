import { motion } from 'framer-motion';

export function MobileFallback() {
  return (
    <div className="absolute inset-0 bg-[#08111F] overflow-hidden">
      {/* Ambient gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[60vh] bg-gradient-radial from-[#3B82F6]/15 via-[#08111F] to-transparent rounded-full blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />

      {/* Robot hands as images — use existing assets */}
      <motion.img
        src="/assets/images/left_robot_hand.png"
        alt="Left robot hand"
        className="absolute bottom-0 left-0 w-[45%] max-w-[400px] object-contain opacity-60"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.6 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <motion.img
        src="/assets/images/right_robot_hand.png"
        alt="Right robot hand"
        className="absolute bottom-0 right-0 w-[45%] max-w-[400px] object-contain opacity-60"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.6 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      />

      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
        <div className="w-full h-full bg-[#3B82F6]/10 rounded-full blur-[60px] animate-pulse" />
      </div>
    </div>
  );
}
