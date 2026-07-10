import { motion } from 'framer-motion';

export function AuroraBackground() {
  return (
    <div className="aurora-container">
      <motion.div
        className="aurora-blob aurora-blob-1"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="aurora-blob aurora-blob-2"
        animate={{
          x: [0, -80, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="aurora-blob aurora-blob-3"
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
