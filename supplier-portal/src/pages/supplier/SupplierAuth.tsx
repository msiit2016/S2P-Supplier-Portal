import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { usePortal } from '../../context/PortalContext.js';
import { ApiClient } from '../../api/client.js';
import { createBlankSupplierProfile } from './SupplierMultiProfile.js';
import { VerisourceLogo } from '../../components/common/VerisourceLogo.js';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  RefreshCw,
  TrendingUp,
  Zap,
  FileCheck,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface SupplierAuthProps {
  initialTab?: 'LOGIN' | 'SIGNUP';
}

type AuthMethod = 'EMAIL_OTP' | 'PASSWORD' | 'MOBILE_SMS';

export const SupplierAuth: React.FC<SupplierAuthProps> = ({ initialTab = 'LOGIN' }) => {
  const { switchUser } = useAuth();
  const { navigate } = usePortal();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP'>(initialTab);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('EMAIL_OTP');

  // Login inputs (pre-filled with valid corporate email for fast test access)
  const [emailInput, setEmailInput] = useState('elena@acmeindustrial.com');
  const [phoneCountry, setPhoneCountry] = useState('+1');
  const [phoneInput, setPhoneInput] = useState('(512) 555-0199');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(45);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sign up inputs
  const [companyName, setCompanyName] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCountry, setSignupCountry] = useState('United States');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  // Derived full contact name
  const signupContactName = [signupFirstName, signupLastName].filter(Boolean).join(' ');

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Canvas ref for 3D constellation sphere
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync activeTab with initialTab prop
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any = null;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, otpTimer]);

  // 3D Constellation Sphere Animation (Canvas 2D pure math, 60fps)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 540);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 640);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const numPoints = 420;
    const radius = Math.min(width, height) * 0.42;
    const points: { x: number; y: number; z: number; baseAlpha: number }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      points.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        baseAlpha: 0.25 + Math.random() * 0.5
      });
    }

    let rotY = 0;
    let rotX = 0.25;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotY += 0.0032;
      rotX = 0.2 + Math.sin(rotY * 0.5) * 0.08;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const cx = width * 0.48;
      const cy = height * 0.52;
      const fov = 420;

      const projected = points.map((p) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        const scale = fov / (fov + z2 + radius * 0.2);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        return { px, py, scale, z: z2, baseAlpha: p.baseAlpha };
      });

      projected.sort((a, b) => a.z - b.z);

      // Subtle constellation filaments
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i += 6) {
        const p1 = projected[i];
        if (p1.z < -radius * 0.2) continue;
        for (let j = i + 1; j < Math.min(i + 14, projected.length); j++) {
          const p2 = projected[j];
          const distSq = (p1.px - p2.px) ** 2 + (p1.py - p2.py) ** 2;
          if (distSq < 1600) {
            const alpha = (1 - distSq / 1600) * 0.16 * ((p1.z + radius) / (2 * radius));
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw points
      for (const p of projected) {
        const isFront = p.z > 0;
        const dotRadius = Math.max(0.6, (isFront ? 2.2 : 1.2) * p.scale);
        const alpha = Math.min(1, Math.max(0.08, ((p.z + radius) / (2 * radius)) * p.baseAlpha * (isFront ? 1.3 : 0.4)));

        ctx.beginPath();
        ctx.arc(p.px, p.py, dotRadius, 0, Math.PI * 2);

        if (isFront && p.z > radius * 0.5) {
          ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
          ctx.shadowBlur = 4;
        } else if (isFront) {
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // OTP Handlers
  const handleSendVerificationCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setOtpTimer(45);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }, 500);
  };

  const handleSendMobileCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneInput || phoneInput.length < 7) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setOtpTimer(45);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }, 500);
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
  };

  // Verify OTP -> Lands on Dashboard
  const handleVerifyOtpAndLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setLoading(false);
      switchUser(emailInput);
      navigate('/dashboard');
    }, 600);
  };

  // Password Login -> Lands on Dashboard
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setErrorMsg('Please enter your work email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setLoading(false);
      switchUser(emailInput);
      navigate('/dashboard');
    }, 500);
  };

  // Sign Up Handler -> Lands on Public Profile Page in active EDIT mode with clean blank profile
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !signupEmail) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (signupPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Initialize clean blank supplier profile with captured credentials
      const cleanProfile = createBlankSupplierProfile(
        companyName,
        signupContactName || 'Authorized Officer',
        signupEmail,
        signupCountry
      );

      // 2. Persist to localStorage so SupplierMultiProfile loads it immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('verisource_master_profile', JSON.stringify(cleanProfile));
        localStorage.setItem('is_new_registration', 'true');
      }

      const res = await ApiClient.registerSupplier({
        legalName: companyName,
        businessEmail: signupEmail,
        contactName: signupContactName || 'Authorized Officer',
        country: signupCountry,
        password: signupPassword || 'Verisource2026!'
      });

      if (res?.error) {
        setErrorMsg(res.error);
        setLoading(false);
      } else {
        setSuccessMsg('Account created successfully! Initializing your public profile in edit mode...');
        setTimeout(() => {
          switchUser(signupEmail, companyName, signupContactName);
          navigate('/public-profile', { isNewRegistration: true, editMode: true });
        }, 700);
      }
    } catch (err: any) {
      // Offline fallback: provision profile and navigate to public profile in edit mode
      const cleanProfile = createBlankSupplierProfile(
        companyName,
        signupContactName || 'Authorized Officer',
        signupEmail,
        signupCountry
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('verisource_master_profile', JSON.stringify(cleanProfile));
        localStorage.setItem('is_new_registration', 'true');
      }
      switchUser(signupEmail, companyName, signupContactName);
      navigate('/public-profile', { isNewRegistration: true, editMode: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] flex flex-col lg:flex-row font-sans text-slate-100 select-none overflow-x-hidden">
      {/* =========================================================================
          LEFT HERO PANEL: Clean Bold Headline, 3D Constellation Globe & Social Proof
          (No duplicate logo, no "Supplier OS", purely inspiring value proposition)
         ========================================================================= */}
      <div className="lg:w-1/2 relative bg-gradient-to-br from-[#060a12] via-[#091024] to-[#040810] flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-hidden">
        {/* Ambient atmospheric gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Hero Headline & Subhead */}
        <div className="relative z-20 max-w-xl pt-2 sm:pt-4">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white leading-[1.12]">
            Chosen by Over <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">120,000+</span> Suppliers Worldwide
          </h1>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Join the family of verified enterprise partners driving multi-buyer growth, instant 3-way invoice match, and frictionless automated compliance.
          </p>
        </div>

        {/* 3D Rotating Constellation Canvas with Testimonial Chips */}
        <div className="relative my-6 sm:my-8 h-80 sm:h-96 lg:h-[400px] flex items-center justify-center z-10">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Testimonial Chip 1 (Top-Right) */}
          <div className="absolute top-4 right-2 sm:right-6 max-w-[270px] bg-slate-900/85 backdrop-blur-md border border-slate-700/70 p-3 rounded-2xl shadow-2xl shadow-black/60 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="Ryo K."
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/60 shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white tracking-tight">$1.2M Business Gained</span>
                <p className="text-[11px] text-slate-400 truncate">Ryo K. · Tokyo • Precision Robotics</p>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-emerald-400/90 font-medium flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-800/40">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Closed 4 Tier-1 RFPs in 60 days</span>
            </div>
          </div>

          {/* Testimonial Chip 2 (Bottom-Left) */}
          <div className="absolute bottom-6 left-2 sm:left-4 max-w-[280px] bg-slate-900/85 backdrop-blur-md border border-slate-700/70 p-3 rounded-2xl shadow-2xl shadow-black/60 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                  alt="Jack H."
                  className="w-10 h-10 rounded-full object-cover border-2 border-sky-500/60 shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-sky-400 rounded-full border border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white tracking-tight">Won 3 Auctions This Month</div>
                <p className="text-[11px] text-slate-400 truncate">Jack H. · Sydney • Global Logistics</p>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-sky-400/90 font-medium flex items-center gap-1 bg-sky-950/40 px-2 py-0.5 rounded-lg border border-sky-800/40">
              <Zap className="w-3 h-3 text-sky-400" />
              <span>Counter-signed PO-2026 in 4 minutes</span>
            </div>
          </div>

          {/* Testimonial Chip 3 (Bottom-Right) */}
          <div className="hidden sm:flex absolute -bottom-1 right-8 max-w-[280px] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-2xl shadow-black/60 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
                  alt="Elena R."
                  className="w-10 h-10 rounded-full object-cover border-2 border-teal-500/60 shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white tracking-tight">100% 3-Way Match & Liquidity</div>
                <p className="text-[11px] text-slate-400 truncate">Elena R. · Austin • Acme Industrial</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Network Metrics Bar (Renamed to 0-Day Faster Onboarding) */}
        <div className="relative z-20 pt-6 border-t border-slate-800/80">
          <div className="grid grid-cols-3 gap-4 text-left">
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-white font-mono">$4.8B+</div>
              <div className="text-[11px] text-slate-400 mt-0.5">PO & Invoice Volume</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">0-Day</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Faster Onboarding</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-sky-400 font-mono">100%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">3-Way Match SLA</div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT AUTH PANEL: Single Verisource Logo, High-Converting Login/Signup UI
         ========================================================================= */}
      <div className="lg:w-1/2 bg-white text-slate-900 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto min-h-screen">
        {/* Top Header Bar: The Single Verisource Brand Logo + Tab Switcher */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          {/* Verisource Brand Logo */}
          <VerisourceLogo size="md" theme="light" showTagline={true} taglineText="Autonomous Supplier Network" />

          {/* Header Switch Action */}
          <div className="text-xs text-slate-500">
            {activeTab === 'LOGIN' ? (
              <span>
                New supplier?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('SIGNUP');
                    setErrorMsg('');
                    setOtpSent(false);
                  }}
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span>
                Existing partner?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('LOGIN');
                    setErrorMsg('');
                    setOtpSent(false);
                  }}
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Central Form Container */}
        <div className="py-6 sm:py-8 max-w-md w-full mx-auto space-y-6">
          {/* Segmented Sign In vs Create Account Tab */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('LOGIN');
                setErrorMsg('');
                setOtpSent(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'LOGIN'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Supplier Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('SIGNUP');
                setErrorMsg('');
                setOtpSent(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'SIGNUP'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* =========================================================
              VIEW 1: SUPPLIER SIGN IN (Email OTP / Password / Mobile)
             ========================================================= */}
          {activeTab === 'LOGIN' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Supplier Login</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access active purchase orders, invoices, RFPs, and connected enterprise buyers.
                </p>
              </div>

              {/* METHOD 1: EMAIL OTP (Passwordless Verification Code) */}
              {authMethod === 'EMAIL_OTP' && (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendVerificationCode} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Work Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            required
                            placeholder="name@company.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Clean Alternative Sign-In Options */}
                      <div className="pt-2">
                        <div className="relative flex py-1 items-center">
                          <div className="flex-grow border-t border-slate-200" />
                          <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                            or continue with
                          </span>
                          <div className="flex-grow border-t border-slate-200" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMethod('PASSWORD');
                              setErrorMsg('');
                            }}
                            className="py-2.5 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                            <span>Password</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMethod('MOBILE_SMS');
                              setErrorMsg('');
                            }}
                            className="py-2.5 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>Mobile SMS</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* 6-DIGIT OTP VERIFICATION BOXES */
                    <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Change email</span>
                        </button>
                        <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          Code Sent
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-0.5">
                        <div>We sent a 6-digit verification code to</div>
                        <div className="font-bold text-slate-900 font-mono text-sm">{emailInput}</div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-slate-700">Enter verification code</label>
                          <button
                            type="button"
                            onClick={handleAutoFillOtp}
                            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span>Auto-fill Demo Code (123456)</span>
                          </button>
                        </div>

                        <div className="flex justify-between gap-2" onPaste={handlePasteOtp}>
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                otpInputRefs.current[idx] = el;
                              }}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-12 h-12 text-center text-xl font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Verify Code & Access Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span>Didn't receive code?</span>
                        {otpTimer > 0 ? (
                          <span className="font-mono text-slate-400">Resend in {otpTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendVerificationCode()}
                            className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* METHOD 2: PASSWORD SIGN IN */}
              {authMethod === 'PASSWORD' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="elena@acmeindustrial.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => alert('Demo Access: Enter any password to authenticate.')}
                        className="text-[11px] text-emerald-600 hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In with Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('EMAIL_OTP');
                        setErrorMsg('');
                      }}
                      className="text-xs text-slate-500 hover:text-emerald-700 font-semibold cursor-pointer"
                    >
                      ← Back to passwordless email verification
                    </button>
                  </div>
                </form>
              )}

              {/* METHOD 3: MOBILE SMS */}
              {authMethod === 'MOBILE_SMS' && (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendMobileCode} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Mobile Number
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={phoneCountry}
                            onChange={(e) => setPhoneCountry(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+81">🇯🇵 +81</option>
                            <option value="+49">🇩🇪 +49</option>
                            <option value="+61">🇦🇺 +61</option>
                          </select>
                          <div className="relative flex-1">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <input
                              type="tel"
                              required
                              placeholder="(555) 019-2834"
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Send SMS Verification Code</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMethod('EMAIL_OTP');
                            setErrorMsg('');
                          }}
                          className="text-xs text-slate-500 hover:text-emerald-700 font-semibold cursor-pointer"
                        >
                          ← Back to corporate email verification
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Mobile OTP Entry */
                    <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Change number</span>
                        </button>
                        <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          SMS Sent
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-0.5">
                        <div>SMS code sent to</div>
                        <div className="font-bold text-slate-900 font-mono text-sm">
                          {phoneCountry} {phoneInput}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-slate-700">Enter 6-digit SMS code</label>
                          <button
                            type="button"
                            onClick={handleAutoFillOtp}
                            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span>Auto-fill Demo Code (123456)</span>
                          </button>
                        </div>
                        <div className="flex justify-between gap-2" onPaste={handlePasteOtp}>
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                otpInputRefs.current[idx] = el;
                              }}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-12 h-12 text-center text-xl font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Verify SMS & Access Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 2: CREATE SUPPLIER ACCOUNT (Signs up -> Lands on /public-profile)
              Clean, professional enterprise form without DUNS, invite code, or master banner
             ========================================================= */}
          {activeTab === 'SIGNUP' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create Supplier Account</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Register your organization to collaborate and transact with enterprise buyers.
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4 text-xs">
                {/* Legal Company Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Legal Company Name *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Industrial Systems LLC"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Alex"
                        value={signupFirstName}
                        onChange={(e) => setSignupFirstName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Morgan"
                        value={signupLastName}
                        onChange={(e) => setSignupLastName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Email */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="alex@apexsystems.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Country / HQ */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country of Registration *</label>
                  <select
                    value={signupCountry}
                    onChange={(e) => setSignupCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  >
                    <option value="United States">🇺🇸 United States</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="Japan">🇯🇵 Japan</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="Singapore">🇸🇬 Singapore</option>
                  </select>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 8 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showSignupConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition ${
                          signupConfirmPassword && signupPassword !== signupConfirmPassword
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-slate-300 focus:ring-emerald-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showSignupConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                      <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Passwords do not match
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-600 cursor-pointer">
                    I agree to the{' '}
                    <a href="#terms" className="text-emerald-700 font-semibold hover:underline">
                      Verisource Network Terms
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" className="text-emerald-700 font-semibold hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                {/* Sign Up Submit -> Navigates to Public Profile */}
                <button
                  type="submit"
                  disabled={loading || !termsAccepted || (!!signupConfirmPassword && signupPassword !== signupConfirmPassword)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Enterprise Trust Badges & Clean Footer */}
        <div className="pt-6 border-t border-slate-100 text-slate-500 text-[11px] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-slate-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>SOC 2 Type II Certified</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <FileCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>ISO 27001 Certified</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 pt-1">
            <div className="flex items-center space-x-4">
              <a href="#terms" className="hover:text-slate-600 transition">Legal Terms</a>
              <a href="#privacy" className="hover:text-slate-600 transition">Privacy Policy</a>
              <a href="#cookies" className="hover:text-slate-600 transition">Cookie Policy</a>
              <a href="#contact" className="hover:text-slate-600 transition">Contact</a>
            </div>
            <div>© 2026 Verisource Technologies Inc. All rights reserved.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
