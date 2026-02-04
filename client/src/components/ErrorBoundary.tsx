import { Component, type ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(-45deg, #0B101E, #0F172A, #151D33, #0B101E)',
          padding: '24px',
          fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '48px 32px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
          }}>
            <AlertTriangle style={{
              width: '64px',
              height: '64px',
              color: '#EF4444',
              marginBottom: '24px',
              filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.4))',
            }} />
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '12px',
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: '15px',
              color: '#94A3B8',
              marginBottom: '32px',
              lineHeight: 1.6,
            }}>
              An unexpected error occurred. Please try reloading the page.
            </p>
            {this.state.error && (
              <pre style={{
                fontSize: '12px',
                color: '#64748B',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: '120px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                {this.state.error.message}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={this.handleGoHome}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'transparent',
                  color: '#CBD5E1',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '15px',
                  transition: 'all 0.2s',
                }}
              >
                Go Home
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.2s',
                }}
              >
                <RotateCcw style={{ width: '16px', height: '16px' }} />
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
