import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InventoryModule } from './components/InventoryModule';
import { ProductionModule } from './components/ProductionModule';
import { PayrollModule } from './components/PayrollModule';
import { DTRModule } from './components/DTRModule';
import { SalesModule } from './components/SalesModule';
import { AnalyticsModule } from './components/AnalyticsModule';
import { Header } from './components/Header';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './context/AuthContext';
import { Ship, Loader2, Eye, EyeOff, LogIn } from 'lucide-react';

type ViewId = 'dashboard' | 'inventory' | 'production' | 'payroll' | 'dtr' | 'sales' | 'analytics';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        backgroundImage: "url('/login-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#020617',
      }}>
        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(2,6,23,0.82) 0%, rgba(15,23,42,0.78) 50%, rgba(2,6,23,0.85) 100%)',
          backdropFilter: 'blur(2px)',
          pointerEvents: 'none',
        }} />

        {/* Ambient glow - top left */}
        <div style={{
          position: 'absolute', top: '-15%', left: '-8%',
          width: '45%', height: '45%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />
        {/* Ambient glow - bottom right */}
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-8%',
          width: '40%', height: '40%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 460, width: '100%', position: 'relative', zIndex: 10 }}>
          {/* Logo & Title */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: 20, borderRadius: 16,
              background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 30px rgba(56,189,248,0.15), 0 0 60px rgba(6,182,212,0.08)',
              marginBottom: 24,
            }}>
              <Ship style={{ width: 48, height: 48, color: '#22d3ee' }} />
            </div>
            <h1 style={{
              fontSize: 'clamp(22px, 4vw, 32px)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #a5f3fc 40%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: 8,
            }}>
              Boat Manufacturing<br />Inventory Management System
            </h1>
            <p style={{
              color: 'rgba(165,243,252,0.5)',
              fontSize: 14, fontWeight: 300,
              letterSpacing: '0.05em',
            }}>
              Seabridge Executive Command Center
            </p>
          </div>

          {/* Login Card */}
          <div style={{
            padding: '36px 32px',
            borderRadius: 24,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset',
          }}>
            <h2 style={{
              color: '#fff', fontWeight: 700, fontSize: 22,
              marginBottom: 4,
            }}>Sign In</h2>
            <p style={{
              color: 'rgba(148,163,184,0.8)', fontSize: 14, fontWeight: 300,
              marginBottom: 28,
            }}>Enter your credentials to access the system</p>

            <form onSubmit={handleLogin}>
              {/* Username */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block', color: 'rgba(203,213,225,0.8)',
                  fontSize: 13, fontWeight: 500, marginBottom: 8,
                  letterSpacing: '0.03em',
                }}>USERNAME</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="e.g. juan.reyes"
                  autoComplete="username"
                  autoFocus
                  style={{
                    width: '100%', height: 48, borderRadius: 12,
                    padding: '0 16px',
                    background: 'rgba(15,23,42,0.6)',
                    border: error ? '1px solid #ef444488' : '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: 15,
                    outline: 'none',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#22d3ee55'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,211,238,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#ef444488' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 8 }}>
                <label style={{
                  display: 'block', color: 'rgba(203,213,225,0.8)',
                  fontSize: 13, fontWeight: 500, marginBottom: 8,
                  letterSpacing: '0.03em',
                }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      width: '100%', height: 48, borderRadius: 12,
                      padding: '0 48px 0 16px',
                      background: 'rgba(15,23,42,0.6)',
                      border: error ? '1px solid #ef444488' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.3s, box-shadow 0.3s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#22d3ee55'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,211,238,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#ef444488' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(148,163,184,0.6)', padding: 4,
                    }}
                  >
                    {showPassword ?
                      <EyeOff style={{ width: 18, height: 18 }} /> :
                      <Eye style={{ width: 18, height: 18 }} />
                    }
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <p style={{
                  color: '#f87171', fontSize: 13, fontWeight: 400,
                  marginBottom: 16, marginTop: 8,
                }}>{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', height: 50, borderRadius: 12,
                  background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                  color: '#fff',
                  border: '1px solid rgba(34,211,238,0.3)',
                  fontWeight: 600, fontSize: 15,
                  letterSpacing: '0.05em',
                  cursor: isLoading ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.3s',
                  marginTop: 24,
                  boxShadow: '0 4px 20px rgba(8,145,178,0.3)',
                }}
                onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.background = 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(6,182,212,0.4)'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(8,145,178,0.3)'; }}
              >
                {isLoading ? (
                  <><Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} /> Signing in...</>
                ) : (
                  <><LogIn style={{ width: 20, height: 20 }} /> SIGN IN</>
                )}
              </button>
            </form>
          </div>

          <div style={{
            marginTop: 32, textAlign: 'center',
            color: 'rgba(100,116,139,0.4)',
            fontSize: 12, fontWeight: 300,
          }}>
            © 2026 Seabridge Boats Manufacturing. All rights reserved.
          </div>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          input::placeholder { color: rgba(148,163,184,0.4); }
        `}</style>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <InventoryModule />;
      case 'production': return <ProductionModule userRole={user.role} />;
      case 'payroll': return <PayrollModule />;
      case 'dtr': return <DTRModule />;
      case 'sales': return <SalesModule />;
      case 'analytics': return <AnalyticsModule />;
      default: return <Dashboard />;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Command Center Overview';
      case 'inventory': return 'Inventory & Procurement';
      case 'production': return 'Production Control & QC';
      case 'payroll': return 'Payroll & Financial Hub';
      case 'dtr': return 'Attendance & Time Logs';
      case 'sales': return 'Sales Pipeline & CRM';
      case 'analytics': return 'Executive Reports';
      default: return 'Seabridge Boats Manufacturing';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <div className="flex-1 flex flex-col h-full bg-slate-50/30">
        <Header 
          title={getViewTitle()} 
          onNavigate={(view) => setCurrentView(view)} 
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
