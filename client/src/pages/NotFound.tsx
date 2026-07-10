import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="auth-container" style={{ flexDirection: 'column', gap: '32px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          textAlign: 'center',
          maxWidth: '480px',
          width: '100%',
        }}
      >
        {/* Large 404 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: 'clamp(80px, 15vw, 150px)',
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #3B82F6, #60A5FA, #93C5FD)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            filter: 'drop-shadow(0 0 40px rgba(59, 130, 246, 0.3))',
          }}
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px',
          }}
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: '16px',
            color: '#94A3B8',
            marginBottom: '40px',
            lineHeight: 1.6,
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          <br />
          Let's get you back to the game.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '15px',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            <Home style={{ width: '18px', height: '18px' }} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'transparent',
              color: '#CBD5E1',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            Go Back
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
