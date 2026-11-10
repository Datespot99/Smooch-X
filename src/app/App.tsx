import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, Users, X, Star, Mic, Upload, CheckCircle, Loader2,
  MessageCircle, ArrowRight, Sparkles, Flame, Copy,
  ExternalLink, Phone, MapPin, Shield, Zap,
  Heart, Camera, UserCheck, Tv2, BellRing,
  Lock, Headphones, ChevronDown, Clock,
  CreditCard, Send, Sun, Moon,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';
import chatAvatar   from '../imports/photo_1_2026-09-07_13-39-47.jpg';
import adminPhoto   from '../imports/photo_2_2026-09-07_13-39-48.jpg';

const ASSET_BASE = import.meta.env.BASE_URL;

const B1        = '#F30202';
const B2        = '#C40000';
const ACCENT    = '#F30202';
const HERO_SOLID = '#C40000';

// Separate desktop and mobile prices; UPI requests use the matching amount.
const PRICING = {
  desktop: { amount: '2999', original: '5000' },
  mobile:  { amount: '2999', original: '5000' },
} as const;
type PricingDevice = keyof typeof PRICING;
const formatPrice = (value: string) => `₹${Number(value).toLocaleString('en-IN')}`;

// ─── Theme system ─────────────────────────────────────────────────────────────
const DARK_THEME = {
  PAGE_BG:  '#090909',
  DARK:     '#FFF8F8',
  MUTED:    '#C4ADAD',
  CARD_BG:  '#150F0F',
  BORDER:   'rgba(243,2,2,0.18)',
  QUOTE:    '#F9DADA',
  DOT_BG:   '#090909',
};
const LIGHT_THEME = {
  PAGE_BG:  '#FFFFFF',
  DARK:     '#220F0F',
  MUTED:    '#765959',
  CARD_BG:  '#FFFFFF',
  BORDER:   'rgba(196,0,0,0.17)',
  QUOTE:    '#543034',
  DOT_BG:   '#FFFFFF',
};
type TTheme = typeof DARK_THEME & { isDark: boolean };
const ThemeCtx = React.createContext<{ theme: TTheme; toggle: () => void }>({
  theme: { ...DARK_THEME, isDark: true }, toggle: () => {},
});
const useT = (): TTheme => React.useContext(ThemeCtx).theme;
// Solid-fill SVG dots: no gradients
const dotGridStyle = (T: TTheme): React.CSSProperties => ({
  backgroundColor: T.DOT_BG,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1.1' fill='%23${T.isDark ? 'FFFFFF' : 'F30202'}' fill-opacity='${T.isDark ? '0.16' : '0.25'}'/%3E%3C/svg%3E")`,
  backgroundSize: '24px 24px',
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isNight = () => { const h = new Date().getHours(); return h < 6 || h >= 20; };
  const [isDark, setIsDark] = useState(() => {
    const s = localStorage.getItem('sx_theme');
    return s ? s === 'dark' : isNight();
  });
  const toggle = () => setIsDark(p => {
    localStorage.setItem('sx_theme', !p ? 'dark' : 'light');
    return !p;
  });
  const theme = { ...(isDark ? DARK_THEME : LIGHT_THEME), isDark };
  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

function ThemeToggle() {
  const { theme, toggle } = React.useContext(ThemeCtx);
  return (
    <motion.button
      onClick={toggle} whileTap={{ scale: 0.9 }}
      className="fixed top-3 right-3 z-50 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
      style={{ background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(243,2,2,0.06)', border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(243,2,2,0.2)'}` }}>
      {theme.isDark
        ? <Sun className="w-4 h-4" style={{ color: '#F30202' }} />
        : <Moon className="w-4 h-4" style={{ color: '#F30202' }} />}
    </motion.button>
  );
}

const PAGE_BG = DARK_THEME.PAGE_BG;
const DARK    = DARK_THEME.DARK;
const MUTED   = DARK_THEME.MUTED;
const CARD_BG = DARK_THEME.CARD_BG;
const DOT_BG  = DARK_THEME.DOT_BG;

const FEAT: { icon: React.ElementType; title: string; desc: string; badge?: string; c1: string; c2: string }[] = [
  { icon: UserCheck,     title: 'VIP Women Profiles',         desc: 'Explore VIP women profiles in Smooch X',            c1: '#F30202', c2: '#C40000', badge: 'VIP' },
  { icon: Lock,          title: 'Free Private Pass',          desc: 'Private pass included at no extra charge',          c1: '#EB2727', c2: '#D31414', badge: 'FREE' },
  { icon: Flame,         title: 'Free In-Group Exclusive Content', desc: 'Exclusive content inside the group at no extra charge', c1: '#DC1010', c2: '#FF4C4C', badge: 'FREE' },
  { icon: Sparkles,      title: 'Premium Services',           desc: 'Access to Smooch X premium services',               c1: '#A80000', c2: '#D31B1B' },
  { icon: MessageCircle, title: 'WhatsApp Access',            desc: 'WhatsApp access with Smooch X membership',          c1: '#C40000', c2: '#F30202' },
  { icon: Clock,         title: 'Higher Group Hours',         desc: 'More group access time than Datespot',                c1: '#D31414', c2: '#F30202', badge: 'MORE TIME' },
];

const IMAGES = ['/2.jpg', '/6.jpg', '/3.jpg', '/4.jpg', '/11.jpeg', '/9.jpeg', '/10.jpeg', '/8.jpeg'];
const VIDEOS   = ['https://player.vimeo.com/video/1182421154', 'https://player.vimeo.com/video/1182421156'];
const QUESTIONS = ['Who can upgrade?', 'What benefits do I get?', 'How much is the upgrade?', 'What are higher group hours?', 'How do I upgrade?'];
// ─── Glassmorphic blob ────────────────────────────────────────────────────────
function GlassBlob({ size, top, left, right, bottom, rotate = 0, rx = '62% 38% 70% 30% / 45% 55% 45% 55%' }: {
  size: number; top?: string | number; left?: string | number;
  right?: string | number; bottom?: string | number; rotate?: number; rx?: string;
}) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size, top, left, right, bottom,
      background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
      border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: rx,
      transform: `rotate(${rotate}deg)`, pointerEvents: 'none',
    }} />
  );
}

// ─── Group Preview Slider ─────────────────────────────────────────────────────
function GroupPreviewSlider({ images, mobile = false }: { images: string[]; mobile?: boolean }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const T = useT();

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setCurrent(prev => (prev + 1) % images.length);
    }, 2800);
    return () => clearInterval(id);
  }, [images.length]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const nav = (i: number) => { setDirection(i > current ? 1 : -1); setCurrent(i); };

  if (mobile) {
    return (
      <section className="py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-extrabold text-xl" style={{ color: T.DARK, letterSpacing: '-0.03em' }}>Group Preview</h2>
            <p className="text-xs font-semibold mt-0.5" style={{ color: T.MUTED }}>Swipe for screenshots </p>
          </div>
          <span className="text-[10px] font-bold px-3 py-1.5 rounded-full text-white" style={{ background: HERO_SOLID, color: '#FFFFFF' }}>
            {current + 1} / {images.length}
          </span>
        </div>
        <div className="flex justify-center">
          <div className="relative" style={{ width: 'min(58vw, 210px)' }}>
            {/* Glow halo */}
            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30 scale-95" style={{ background: HERO_SOLID }} />
            <div
              className="relative overflow-hidden rounded-3xl shadow-2xl"
              style={{ aspectRatio: '9/16', border: '2.5px solid rgba(243,2,2,0.2)' }}
            >
              <AnimatePresence custom={direction} mode="popLayout">
                <motion.img
                  key={current} src={images[current]} alt={`Preview ${current + 1}`}
                  custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              {/* Bottom gradient overlay */}
              {/* Dot indicators */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10">
                {images.map((_, i) => (
                  <button key={i} onClick={() => nav(i)} className="rounded-full transition-all duration-300"
                    style={{ width: i === current ? 18 : 5, height: 5, background: i === current ? 'white' : 'rgba(255,255,255,0.45)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-bold uppercase tracking-widest" style={{ background: `${B1}12`, color: B1 }}>
            <Sparkles className="w-3 h-3" /> Real Content
          </div>
          <h2 className="text-5xl mb-3 font-bold" style={{ color: T.DARK, letterSpacing: '-0.03em' }}>Group Preview</h2>
          <p className="text-lg font-medium" style={{ color: T.MUTED }}>See exactly what you're joining</p>
        </div>
        <div className="flex justify-center">
          <div className="relative" style={{ width: 300 }}>
            <div className="absolute inset-0 rounded-[2.5rem] blur-3xl opacity-25 scale-90" style={{ background: HERO_SOLID }} />
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl" style={{ aspectRatio: '9/16', border: '3px solid rgba(243,2,2,0.18)' }}>
              <AnimatePresence custom={direction} mode="popLayout">
                <motion.img
                  key={current} src={images[current]} alt={`Preview ${current + 1}`}
                  custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-1.5 z-10">
                {images.map((_, i) => (
                  <button key={i} onClick={() => nav(i)} className="rounded-full transition-all duration-300"
                    style={{ width: i === current ? 22 : 6, height: 6, background: i === current ? 'white' : 'rgba(255,255,255,0.45)' }} />
                ))}
              </div>
              <div className="absolute top-4 right-4 z-10">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
                  {current + 1} / {images.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Premium membership-number gate ───────────────────────────────────────────
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyZ4CDmSSpm80A-xyX-2f3p97vtAX_t6ny7bbUZiJPF9-apBF5DUmOAc3CjXCJ-6teo5A/exec';

function LeadModal({ onClose, onComplete, gate = false }: { onClose?: () => void; onComplete: () => void; gate?: boolean }) {
  const T = useT();
  const [membershipNumber, setMembershipNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const number = membershipNumber.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9_-]{0,39}$/.test(number)) {
      setError('Enter your Datespot membership number using letters, numbers or hyphens.');
      return;
    }
    setLoading(true);
    try {
      // The opaque lead request does not confirm membership status.
      await fetch(`${SHEET_URL}?${new URLSearchParams({ membershipNumber: number })}`, { mode: 'no-cors' });
      localStorage.setItem('sx_membership_number', number);
      localStorage.setItem('sx_membership_entered', '1');
      onComplete();
    } catch {
      setError('Could not continue. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ ...dotGridStyle(T), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {!gate && <div className="absolute inset-0" onClick={onClose} />}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        transition={{ duration: .25 }}
        role="dialog" aria-modal="true" aria-label="Enter your Datespot membership number"
        className="relative z-10 w-full max-w-[440px] rounded-[24px] overflow-hidden"
        style={{ background: T.CARD_BG, border: `1px solid ${T.BORDER}`, boxShadow: T.isDark ? '0 24px 64px rgba(0,0,0,.55)' : '0 24px 64px rgba(0,0,0,.10)' }}>
        <div className="h-1" style={{ background: B1 }} />
        {!gate && <button type="button" onClick={onClose} aria-label="Close" className="absolute top-5 right-5 p-1.5 rounded-lg">
          <X className="w-4 h-4" style={{ color: T.MUTED }} />
        </button>}
        <div className="px-6 py-9 sm:px-9 sm:py-11">
          <div className="flex justify-center items-center gap-3 mb-8">
            <img src={`${ASSET_BASE}smooch-x-logo.svg`} alt="" className="w-11 h-11 rounded-xl object-cover" />
            <span className="font-black text-xl tracking-tight" style={{ color: T.DARK }}>Smooch X</span>
          </div>
          <div className="text-center mb-7">
            <span className="inline-block rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest mb-4"
              style={{ color: T.isDark ? '#FF9999' : B2, background: T.isDark ? '#421818' : '#FFF0F0' }}>
              Exclusive Datespot Member Upgrade
            </span>
            <h1 className="text-2xl sm:text-[28px] leading-tight font-black tracking-tight mb-3" style={{ color: T.DARK }}>
              Unlock your Smooch X upgrade
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: T.MUTED }}>
              Enter your Datespot membership number to continue to the premium upgrade.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="sx-membership-number" className="block text-xs font-bold mb-2" style={{ color: T.DARK }}>
                Datespot Membership Number
              </label>
              <input id="sx-membership-number" type="text" autoComplete="off" autoCapitalize="characters"
                spellCheck={false} required maxLength={40}
                placeholder="Enter your membership number" value={membershipNumber}
                onChange={e => setMembershipNumber(e.target.value)}
                className="w-full rounded-xl px-4 py-3.5 outline-none text-sm font-semibold focus-visible:ring-2"
                style={{ background: T.isDark ? '#100909' : '#FFF8F8', color: T.DARK, border: `1px solid ${membershipNumber ? B1 : T.BORDER}`, caretColor: B1 }} />
              <p className="text-[11px] mt-2" style={{ color: T.MUTED }}>Use the number provided with your Datespot membership.</p>
            </div>
            {error && <p role="alert" className="text-xs font-semibold rounded-lg px-3 py-2"
              style={{ color: T.isDark ? '#FF9999' : '#A80000', background: T.isDark ? '#421818' : '#FFF0F0' }}>{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl py-3.5 font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: HERO_SOLID, color: '#FFFFFF' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue to Smooch X <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-center text-[11px] leading-relaxed" style={{ color: T.MUTED }}>
              Membership and payment are reviewed before Smooch X access is granted.
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow({ onJoin }: { onJoin: () => void }) {
  const [idx, setIdx] = useState(0);
  const items = [
    { value: '100+', label: 'Members', icon: Users, c1: B1, c2: B2 },
    { value: 'Daily', label: 'Active', icon: Zap, c1: '#DC1010', c2: '#FF4C4C' },
    { value: '100%', label: 'Verified', icon: Shield, c1: '#B51212', c2: '#F04444' },
    { value: '18+', label: 'Content', icon: Flame, c1: '#A80000', c2: '#D31B1B' },
  ];
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % items.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    null
  );
}

// ─── Animated Stats ───────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setVal(Math.round(t * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { val, ref };
}

function StatsSection() {
  const T = useT();
  const s1 = useCountUp(548); const s2 = useCountUp(467); const s3 = useCountUp(1000); const s4 = useCountUp(95);
  const stats = [
    { ref: s1.ref, val: s1.val, suffix: '+', label: 'Members', c1: B1, c2: '#D3192D' },
    { ref: s2.ref, val: s2.val, suffix: '',  label: 'Online Today', c1: '#DC1010', c2: '#FF4C4C' },
    { ref: s3.ref, val: s3.val, suffix: '+', label: 'Successful Joins', c1: '#C41616', c2: '#D52842' },
    { ref: s4.ref, val: s4.val, suffix: '%', label: 'Positive Reviews', c1: '#F30202', c2: '#FF9999' },
  ];
  return (
    <section className="py-2">
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s, i) => (
          null
        ))}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks({ onJoin }: { onJoin: () => void }) {
  const T = useT();
  const steps = [
    { icon: CreditCard, label: 'Pay Entry Fee', desc: `One-time ${formatPrice(PRICING.mobile.amount)} payment via UPI`, c1: B1, c2: '#D3192D' },
    { icon: Send,       label: 'Join Smooch X', desc: 'Receive the Telegram group link instantly', c1: '#DC1010', c2: '#FF4C4C' },
    { icon: Heart,      label: 'Start Dating',  desc: 'Chat, call & meet verified women', c1: '#C41616', c2: '#D31B1B' },
  ];
  return (
    <section className="py-5">
      <div className="mb-4">
        <h2 className="font-extrabold text-xl" style={{ color: T.DARK, letterSpacing: '-0.03em' }}>How It Works</h2>
        <p className="text-xs font-semibold mt-0.5" style={{ color: T.MUTED }}>3 simple steps</p>
      </div>
      <div className="relative">
        <div className="absolute left-[22px] top-6 bottom-6 w-[2px] opacity-20 rounded-full" style={{ background: HERO_SOLID }} />
        <div className="flex flex-col gap-3">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 rounded-2xl px-4 py-3.5 relative"
                style={{ background: T.CARD_BG, border: `1px solid ${T.BORDER}`, boxShadow: T.isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${st.c1}` }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm" style={{ color: T.DARK }}>{st.label}</div>
                  <div className="text-[11px] font-medium mt-0.5" style={{ color: T.MUTED }}>{st.desc}</div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${st.c1}18`, color: st.c1 }}>
                  Step {i + 1}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Why Trust ────────────────────────────────────────────────────────────────
function WhyTrust() {
  const T = useT();
  const cards = [
    { icon: UserCheck,  title: 'Manual Profile Verification', desc: 'Every member is verified by admin before getting access.', c1: B1, c2: '#D3192D' },
    { icon: Users,      title: 'Active Bangalore Community',  desc: 'An active community for people in Bangalore.', c1: '#DC1010', c2: '#FF4C4C' },
    { icon: Shield,     title: 'No Fake Profiles Policy',     desc: 'Instant removal of any fake or spam profiles.', c1: '#B51212', c2: '#F04444' },
    { icon: Headphones, title: 'Direct Admin Support',        desc: 'Get help from Subhash directly, fast response guaranteed.', c1: '#C41616', c2: '#D31B1B' },
  ];
  return (
    null
  );
}

// ─── Meet the Admin ───────────────────────────────────────────────────────────
function MeetAdmin() {
  const T = useT();
  const badges = ['5+ Years Community Experience', 'Personally Verified Members', 'Fast Support'];
  return (
    null
  );
}

// ─── Smooch X upgrade comparison ─────────────────────────────────────────────
function GroupComparison({ onJoin }: { onJoin: () => void }) {
  const T = useT();
  const rows = [
    { feature: 'Women profiles', smooch: 'VIP Women Profiles', datespot: 'Limited Women', datespotLimited: true },
    { feature: 'Private pass', smooch: 'Free Private Pass', datespot: 'Paid Private Pass', datespotLimited: true },
    { feature: 'Exclusive content', smooch: 'Free In-Group Content', datespot: 'Paid Exclusive Content', datespotLimited: true },
    { feature: 'Premium services', smooch: 'Included', datespot: 'Not included', datespotLimited: true },
    { feature: 'WhatsApp access', smooch: 'Included', datespot: 'Not included', datespotLimited: true },
    { feature: 'Group hours', smooch: 'Higher Group Hours', datespot: 'Limited Group Hours', datespotLimited: true },
  ];
  const borderTop = `1px solid ${T.BORDER}`;
  const premiumBg = T.isDark ? 'rgba(243,2,2,0.11)' : '#FFF1F1';
  return (
    <section className="py-2" aria-labelledby="group-comparison-heading">
      <div className="mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-3"
          style={{ color: T.isDark ? '#FF9999' : B2, background: premiumBg, border: `1px solid ${T.BORDER}` }}>
          <Sparkles className="w-3.5 h-3.5" /> The Datespot upgrade
        </span>
        <h2 id="group-comparison-heading" className="font-black text-xl md:text-4xl tracking-tight leading-tight" style={{ color: T.DARK }}>
          Datespot is the start. <span style={{ color: T.isDark ? '#FF7373' : B2 }}>Smooch X is the upgrade.</span>
        </h2>
        <p className="text-xs md:text-base font-medium mt-2" style={{ color: T.MUTED }}>
          See what you unlock when you move from Datespot to Smooch X.
        </p>
      </div>
      <div className="rounded-2xl md:rounded-3xl overflow-hidden" style={{ background: T.CARD_BG, border: `1px solid ${T.BORDER}` }}>
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col style={{ width: '32%' }} />
            <col style={{ width: '36%' }} />
            <col style={{ width: '32%' }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="px-1.5 sm:px-4 py-2.5 md:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide" style={{ color: T.MUTED }}>
                Benefits
              </th>
              <th scope="col" className="px-1.5 sm:px-4 py-2.5 md:py-4 text-center" style={{ background: T.isDark ? '#421818' : '#FFE2E2' }}>
                <span className="block text-sm sm:text-lg font-black" style={{ color: T.isDark ? '#FF9999' : B2 }}>Smooch X</span>
                <span className="block text-[9px] sm:text-xs font-extrabold uppercase tracking-wide mt-1" style={{ color: T.isDark ? '#FF9999' : B2 }}>Upgrade</span>
              </th>
              <th scope="col" className="px-1.5 sm:px-4 py-2.5 md:py-4 text-center">
                <span className="block text-sm sm:text-lg font-black" style={{ color: T.DARK }}>Datespot</span>
                <span className="block text-[9px] sm:text-xs font-semibold mt-1" style={{ color: T.MUTED }}>Basic group</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.feature}>
                <th scope="row" className="px-1.5 sm:px-4 py-2.5 md:py-4 text-[10px] sm:text-sm font-bold leading-snug" style={{ borderTop, color: T.DARK }}>
                  {row.feature}
                </th>
                <td className="px-1.5 sm:px-4 py-2.5 md:py-4 text-center" style={{ borderTop, background: premiumBg }}>
                  <span className="inline-flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-extrabold leading-snug" style={{ color: T.DARK }}>
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: T.isDark ? '#FF9999' : B2 }} />
                    {row.smooch}
                  </span>
                </td>
                <td className="px-1.5 sm:px-4 py-2.5 md:py-4 text-center" style={{ borderTop }}>
                  <span className="text-[10px] sm:text-sm font-medium leading-snug" style={{ color: T.MUTED }}>
                    {row.datespot}
                  </span>
                </td>
              </tr>
            ))}
            <tr>
              <th scope="row" className="px-1.5 sm:px-4 py-2.5 md:py-4 text-[10px] sm:text-sm font-extrabold" style={{ borderTop, color: T.DARK }}>Upgrade price</th>
              <td className="px-1.5 sm:px-4 py-2.5 md:py-4 text-center" style={{ borderTop, background: premiumBg }}>
                <span className="block text-[10px] sm:text-xs line-through" style={{ color: T.MUTED }}>{formatPrice(PRICING.mobile.original)}</span>
                <span className="block text-lg sm:text-2xl font-black" style={{ color: T.isDark ? '#FF9999' : B2 }}>{formatPrice(PRICING.mobile.amount)}</span>
                <span className="block text-[9px] sm:text-xs font-semibold" style={{ color: T.MUTED }}>Launch offer</span>
              </td>
              <td className="px-1.5 sm:px-4 py-2.5 md:py-4 text-center" style={{ borderTop }}>
                <span className="text-[10px] sm:text-xs font-semibold" style={{ color: T.MUTED }}>Standard Datespot membership</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="p-3 sm:p-5 text-center" style={{ borderTop }}>
          <p className="text-xs sm:text-sm font-bold mb-3" style={{ color: T.DARK }}>
            Already a Datespot member? Unlock more with Smooch X.
          </p>
          <button type="button" onClick={onJoin} className="w-full rounded-xl py-3.5 px-3 text-sm sm:text-base font-black text-white flex items-center justify-center gap-2 transition-transform active:scale-[.98]" style={{ background: B1 }}>
            Upgrade to Smooch X <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Upgrade FAQs ─────────────────────────────────────────────────────────────
const UPGRADE_FAQS = [
  { q: 'Who can upgrade to Smooch X?', a: 'Smooch X is an optional premium upgrade for Datespot members. Enter your Datespot membership number to start. The team must confirm your membership status.' },
  { q: 'What do I unlock by upgrading?', a: 'VIP women profiles, a free private pass, free in-group exclusive content, premium services, WhatsApp access and higher group hours.' },
  { q: 'How is Smooch X different from Datespot?', a: 'Datespot offers limited women profiles and group hours, with separate charges for private passes and exclusive content. Smooch X adds VIP profiles, higher group hours and more included benefits.' },
  { q: 'Are private passes and exclusive content free?', a: 'Yes. The listed private pass and in-group exclusive content are included with Smooch X membership without separate charges. The upgrade itself is paid.' },
  { q: 'How much does the upgrade cost?', a: `The launch offer is ${formatPrice(PRICING.mobile.amount)}, reduced from ${formatPrice(PRICING.mobile.original)}.` },
  { q: 'How do I upgrade?', a: 'Enter your Datespot membership number, continue to UPI payment and submit your payment screenshot. The team confirms payment and membership before granting Smooch X access.' },
  { q: 'What are higher group hours?', a: 'Smooch X offers more group access hours than Datespot. Ask the admin for the current schedule.' },
  { q: 'Does Smooch X include WhatsApp access?', a: 'Yes, WhatsApp access is an additional Smooch X benefit.' },
];

function FAQ() {
  const T = useT();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-4">
      <h2 className="text-xl font-extrabold mb-1" style={{ color: T.DARK }}>Upgrade FAQs</h2>
      <p className="text-xs font-medium mb-4" style={{ color: T.MUTED }}>Everything to know before moving from Datespot to Smooch X</p>
      <div className="space-y-2">
        {UPGRADE_FAQS.map((item, i) => (
          <div key={item.q} className="rounded-xl overflow-hidden" style={{ background: T.CARD_BG, border: `1px solid ${T.BORDER}` }}>
            <button type="button" onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i} aria-controls={`mobile-upgrade-faq-${i}`}
              className="w-full flex items-center justify-between gap-3 px-3 py-3 text-left">
              <span className="text-xs font-bold" style={{ color: T.DARK }}>{item.q}</span>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} style={{ color: B1 }} />
            </button>
            {open === i && <p id={`mobile-upgrade-faq-${i}`} className="px-4 pb-4 text-xs leading-relaxed" style={{ color: T.MUTED }}>{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Sticky CTA ───────────────────────────────────────────────────────────────
function StickyCTA({ onJoin }: { onJoin: () => void }) {
  const T = useT();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-2"
          style={{ background: T.isDark ? '#000000' : '#FFFFFF' }}>
          <motion.button
            onClick={onJoin}
            whileTap={{ scale: 0.97 }}
            className="relative w-full max-w-md mx-auto block rounded-2xl overflow-hidden"
            style={{ background: HERO_SOLID, boxShadow: `0 6px 28px ${B1}60` }}>
            {/* Shimmer sweep */}
            <motion.div className="absolute inset-0 pointer-events-none"
              animate={{ x: ['-100%', '160%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
              style={{ background: 'rgba(255,255,255,0.14)', width: '60%' }} />
            <div className="relative flex items-center justify-center gap-3 py-3.5 px-6">
              <span className="font-black text-sm tracking-tight" style={{ color: '#FFFFFF' }}>Upgrade to Smooch X</span>
              <span className="text-[11px] line-through font-semibold" style={{ color: '#800D1B' }}>{formatPrice(PRICING.mobile.original)}</span>
              <span className="font-black text-sm" style={{ color: '#FFFFFF' }}>{formatPrice(PRICING.mobile.amount)}</span>
              <ArrowRight className="w-4 h-4" style={{ color: '#FFFFFF' }} />
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function MobileApp() {
  const T = useT();
  const [showPayment, setShowPayment] = useState(false);
  const [showLead,    setShowLead]    = useState(false);
  const [showChat,    setShowChat]    = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'demo'>('full');
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleJoin = (type: 'full' | 'demo') => {
    setPaymentType(type);
    if (localStorage.getItem('sx_membership_entered') === '1') {
      setShowPayment(true);
    } else {
      setShowLead(true);
    }
  };

  return (
    <div ref={constraintsRef} className="min-h-screen w-full relative overflow-x-hidden"
      style={{ ...dotGridStyle(T), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <ThemeToggle />

      {/* Urgency Banner */}

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4">
        <header className="pt-8 pb-2">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-[9px] font-extrabold uppercase tracking-wider" style={{ color: T.isDark ? '#FF9999' : B2, background: T.isDark ? '#421818' : '#FFF0F0' }}>
            <Sparkles className="w-3 h-3" /> Exclusive upgrade for Datespot members
          </div>
          <h1 className="text-[clamp(26px,7vw,32px)] leading-[1.12] font-black tracking-tight mb-2" style={{ color: T.DARK }}>
            Upgrade to <span style={{ color: B1 }}>Smooch X</span>
          </h1>
          <p className="text-[13px] leading-[1.55] font-semibold" style={{ color: T.DARK }}>
            Meet Smooch X: VIP women profiles, free private pass, exclusive content, premium services and WhatsApp access.
          </p>
        </header>

        {/* Stats */}
        <StatsSection />

        {/* Gallery */}
        <GroupPreviewSlider images={IMAGES} mobile />

        {/* Final CTA */}
        <section className="pt-2 pb-5">
          <div className="rounded-3xl overflow-hidden" style={{ background: T.CARD_BG, border: '1px solid rgba(243,2,2,0.22)', boxShadow: `0 0 40px ${B1}15` }}>
            <div className="h-[3px]" style={{ background: HERO_SOLID }} />
            <div className="px-4 py-4 flex flex-col items-center text-center gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: T.isDark ? B1 : B2, background: T.isDark ? 'rgba(243,2,2,.12)' : '#FFF0F0', border: '1px solid rgba(243,2,2,.32)' }}><Sparkles className="w-3 h-3" /> Launch Offer</div>


              {/* Price */}
              <div className="flex items-baseline gap-2 justify-center">
                <span className="text-sm line-through font-semibold" style={{ color: T.MUTED }}>{formatPrice(PRICING.mobile.original)}</span>
                <span className="font-black text-3xl leading-none" style={{ color: T.isDark ? B1 : B2 }}>{formatPrice(PRICING.mobile.amount)}</span>
              </div>

              {/* CTA Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleJoin('full')}
                className="w-full rounded-xl font-black flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ background: HERO_SOLID, color: '#FFFFFF', boxShadow: `0 6px 24px ${B1}50`, padding: '12px 16px' }}>
                <motion.div className="absolute inset-0"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                  style={{ background: 'rgba(255,255,255,0.12)' }} />
                <span className="text-sm tracking-tight relative z-10">Upgrade to Smooch X</span>
                <ArrowRight className="w-4 h-4 relative z-10" />
              </motion.button>

            </div>
          </div>
        </section>

        {/* See the value of upgrading before the feature list */}
        <GroupComparison onJoin={() => handleJoin('full')} />

        {/* What You Unlock */}
        <section className="py-3">
          <div className="mb-3">
            <h2 className="font-extrabold text-xl" style={{ color: T.DARK, letterSpacing: '-0.03em' }}>What You Unlock</h2>
            <p className="text-xs font-semibold mt-0.5" style={{ color: T.MUTED }}>Premium benefits beyond Datespot</p>
          </div>
          <div className="flex flex-col gap-2">
            {FEAT.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 relative"
                  style={{ background: T.CARD_BG, border: `1px solid ${f.c1}22`, boxShadow: T.isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.05)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${f.c1}` }}>
                    <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[13px]" style={{ color: T.DARK }}>{f.title}</div>
                    <div className="text-[11px] font-medium mt-0.5" style={{ color: T.MUTED }}>{f.desc}</div>
                  </div>
                  {f.badge && (
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: `${f.c1}22`, color: f.c1, border: `1px solid ${f.c1}40` }}>
                      {f.badge}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Why Trust */}
        <WhyTrust />

        {/* Meet Admin */}
        <MeetAdmin />

        {/* FAQ */}
        <FAQ />


      </div>

      {/* Sticky CTA */}
      <StickyCTA onJoin={() => handleJoin('full')} />

      <AnimatePresence>
        {showLead    && <LeadModal onClose={() => setShowLead(false)} onComplete={() => { setShowLead(false); setShowPayment(true); }} />}
        {showPayment && <PaymentModal onClose={() => setShowPayment(false)} paymentType={paymentType} device="mobile" />}
        {showChat    && <ChatOverlay onClose={() => setShowChat(false)} onOpenPayment={() => handleJoin('full')} />}
      </AnimatePresence>

      <Toaster position="top-center" toastOptions={{
        style: { background: T.CARD_BG, color: T.DARK, borderRadius: '14px', fontSize: '13px', fontWeight: '700', border: `1px solid ${B1}4D`, boxShadow: `0 8px 24px ${B1}40` },
      }} />
    </div>
  );
}

export default function App() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [entered, setEntered] = useState(() => localStorage.getItem('sx_membership_entered') === '1');
  if (!entered) {
    return (
      <ThemeProvider>
        <div className="min-h-screen w-full relative" style={{ background: '#090909' }}>
          <LeadModal gate onComplete={() => setEntered(true)} />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {isMobile
        ? <MobileApp />
        : <DesktopWrapper />}
    </ThemeProvider>
  );
}

function DesktopWrapper() {
  const [showPayment, setShowPayment] = useState(false);
  const [showLead,    setShowLead]    = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'demo'>('full');
  const handleJoin = (type: 'full' | 'demo') => {
    setPaymentType(type);
    if (localStorage.getItem('sx_membership_entered') === '1') {
      setShowPayment(true);
    } else {
      setShowLead(true);
    }
  };
  return (
    <>
      <DesktopVersion onOpenPayment={handleJoin} showPayment={showPayment} onClosePayment={() => setShowPayment(false)} paymentType={paymentType} />
      <AnimatePresence>
        {showLead && <LeadModal onClose={() => setShowLead(false)} onComplete={() => { setShowLead(false); setShowPayment(true); }} />}
      </AnimatePresence>
    </>
  );
}


/* Desktop-only hero. The mobile screen is rendered by MobileApp and is not affected. */
function DesktopHero() {
  const T = useT();
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewPaused, setPreviewPaused] = useState(false);

  useEffect(() => {
    // Respect reduced-motion preferences while keeping manual navigation available.
    if (previewPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(
      () => setPreviewIndex(index => (index + 1) % IMAGES.length),
      3200,
    );
    return () => window.clearInterval(timer);
  }, [previewPaused]);

  const changePreview = (offset: number) =>
    setPreviewIndex(index => (index + offset + IMAGES.length) % IMAGES.length);

  return (
    <section className="max-w-7xl mx-auto px-8 lg:px-12 pt-12 lg:pt-16 pb-5">
      <div className="grid grid-cols-2 gap-6 lg:gap-12 xl:gap-16 items-center">
        <div className="min-w-0">
          <div className="inline-flex items-center rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-widest mb-7"
            style={{ color: B1, background: T.isDark ? 'rgba(243,2,2,.13)' : '#FFFFFF', border: '1px solid rgba(243,2,2,.22)' }}>
            <Sparkles className="w-3.5 h-3.5 mr-2" /> Exclusive upgrade for Datespot members
          </div>
          <h1 className="font-black leading-[1.1] mb-3"
            style={{ color: T.DARK, fontSize: 'clamp(36px,4.1vw,60px)', letterSpacing: '-0.05em' }}>
            Upgrade to <span style={{ color: B1 }}>Smooch X</span>
          </h1>
          <p className="text-xl lg:text-2xl font-bold mb-5" style={{ color: T.DARK }}>
            Unlock the premium dating group experience.
          </p>
          <p className="text-base lg:text-lg leading-relaxed max-w-lg mb-8" style={{ color: T.MUTED }}>
            Get VIP women profiles, a free private pass, free in-group exclusive content, premium services and WhatsApp access.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
            {[
              { label: 'VIP women profiles', icon: UserCheck },
              { label: 'Free private pass', icon: Lock },
              { label: 'WhatsApp access', icon: MessageCircle },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2.5 text-xs lg:text-sm font-bold"
                  style={{ color: T.DARK }}>
                  <span className="w-9 h-9 rounded-xl inline-flex items-center justify-center"
                    style={{ background: T.isDark ? 'rgba(243,2,2,.22)' : '#FFF0F0' }}>
                    <Icon className="w-4 h-4" style={{ color: B1 }} />
                  </span>
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Borderless preview is part of the hero, not a second card. */}
        <div className="relative min-w-0"
          onMouseEnter={() => setPreviewPaused(true)}
          onMouseLeave={() => setPreviewPaused(false)}
          onFocus={() => setPreviewPaused(true)}
          onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPreviewPaused(false); }}>
          <div className="relative z-10 flex items-start justify-between gap-3 px-1 lg:px-3">
            <div>
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5" style={{ color: B1 }} />
                <h2 className="font-extrabold text-lg lg:text-xl" style={{ color: T.DARK }}>Group Preview</h2>
              </div>
              <p className="text-xs lg:text-sm font-medium pl-8 mt-1" style={{ color: T.MUTED }}>
                See what's inside the group
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-extrabold text-xs tabular-nums mr-1" style={{ color: B1 }}>
                {previewIndex + 1} / {IMAGES.length}
              </span>
              <button type="button" onClick={() => changePreview(-1)} aria-label="Previous group preview"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                style={{ color: B1, background: T.CARD_BG, border: '1px solid rgba(243,2,2,.26)' }}>
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              <button type="button" onClick={() => changePreview(1)} aria-label="Next group preview"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
                style={{ background: B1 }}>
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>

          <div className="relative w-full h-[clamp(245px,28vw,355px)] mt-2" aria-label="Rotating group photo previews">
            <div aria-hidden="true" className="pointer-events-none absolute rounded-full"
              style={{ width: '79%', height: '78%', left: '11%', top: '11%',
                background: T.isDark ? 'rgba(243,2,2,.11)' : 'rgba(243,2,2,.055)' }} />
            {IMAGES.map((src, i) => {
              const half = Math.floor(IMAGES.length / 2);
              const offset = ((i - previewIndex + IMAGES.length + half) % IMAGES.length) - half;
              const distance = Math.abs(offset);
              const visible = distance <= 2;
              return (
                <button type="button" key={src} onClick={() => setPreviewIndex(i)}
                  aria-label={`View group preview ${i + 1}`}
                  aria-current={offset === 0 ? 'true' : undefined}
                  aria-hidden={!visible} tabIndex={visible ? 0 : -1}
                  className="absolute top-1/2 overflow-hidden rounded-[17px] lg:rounded-[22px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                  style={{
                    left: `${50 + offset * 16}%`,
                    width: 'clamp(108px,11.8vw,178px)',
                    aspectRatio: '0.66',
                    transform: `translate(-50%,-50%) translateY(${distance * 5}px) rotate(${offset * 5}deg) scale(${1 - distance * .085})`,
                    transition: 'left .55s cubic-bezier(.22,1,.36,1),transform .55s cubic-bezier(.22,1,.36,1),opacity .35s ease',
                    opacity: visible ? (distance === 2 ? .9 : 1) : 0,
                    zIndex: visible ? 10 - distance : 0,
                    pointerEvents: visible ? 'auto' : 'none',
                    background: '#211114',
                    border: offset === 0 ? `2px solid ${B1}` : '2px solid rgba(255,255,255,.8)',
                    boxShadow: offset === 0
                      ? '0 14px 30px rgba(243,2,2,.22)'
                      : '0 8px 22px rgba(10,40,24,.13)',
                  }}>
                  <img src={src} alt={`Group preview ${i + 1}`}
                    className="block w-full h-full object-cover" loading={distance < 2 ? 'eager' : 'lazy'} />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 mt-1">
            {IMAGES.map((_, i) => (
              <button key={i} type="button" onClick={() => setPreviewIndex(i)}
                aria-label={`Show group preview ${i + 1}`}
                aria-current={i === previewIndex ? 'true' : undefined}
                className="rounded-full transition-all duration-300"
                style={{ width: i === previewIndex ? 18 : 7, height: 7,
                  background: i === previewIndex ? B1 : (T.isDark ? '#9E6670' : '#FFC7CD') }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Desktop-only FAQ, deliberately separate from the mobile FAQ component. */
function DesktopFAQ() {
  const T = useT();
  const [open, setOpen] = useState<number | null>(0);
  const items = UPGRADE_FAQS;
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold mb-2" style={{ color: T.DARK, letterSpacing: '-0.03em' }}>Upgrade FAQs</h2>
        <p className="text-base font-medium" style={{ color: T.MUTED }}>Your Datespot-to-Smooch X upgrade, explained</p>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.q} className="rounded-2xl overflow-hidden"
            style={{ background: T.CARD_BG, border: '1px solid ' + (open === i ? B1 + '66' : T.BORDER) }}>
            <button type="button" className="w-full flex items-center justify-between gap-6 px-6 py-5 text-left"
              aria-expanded={open === i} aria-controls={'desktop-faq-answer-' + i}
              onClick={() => setOpen(prev => prev === i ? null : i)}>
              <span className="font-bold text-base" style={{ color: T.DARK }}>{item.q}</span>
              <ChevronDown className={'w-5 h-5 shrink-0 transition-transform ' + (open === i ? 'rotate-180' : '')}
                style={{ color: B1 }} />
            </button>
            {open === i && (
              <div id={'desktop-faq-answer-' + i} className="px-6 pb-5 -mt-1 text-sm leading-relaxed"
                style={{ color: T.MUTED }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Desktop Version ──────────────────────────────────────────────────────────
function DesktopVersion({ onOpenPayment, showPayment, onClosePayment, paymentType }: {
  onOpenPayment: (type: 'full' | 'demo') => void;
  showPayment: boolean; onClosePayment: () => void; paymentType: 'full' | 'demo';
}) {
  const T = useT();

  return (
    <div className="min-h-screen w-full relative" style={{ ...dotGridStyle(T), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <ThemeToggle />
      <DesktopHero />

      {/* Desktop-only launch offer CTA. */}
      <section className="relative max-w-7xl mx-auto px-8 pt-10 pb-16 text-center isolate">
        <div aria-hidden="true" className="pointer-events-none absolute -z-10 rounded-[50%]"
          style={{ width: '92%', height: 230, left: '4%', top: 115,
            background: T.isDark ? 'rgba(243,2,2,.075)' : 'rgba(243,2,2,.045)' }} />
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-5 text-xs font-extrabold uppercase tracking-widest" style={{ color: T.isDark ? B1 : B2, background: T.isDark ? 'rgba(243,2,2,.12)' : '#FFF0F0', border: '1px solid rgba(243,2,2,.28)' }}><Sparkles className="w-4 h-4" /> Launch Offer</div>
        <h2 className="font-black text-4xl mb-2" style={{ color: T.DARK, letterSpacing: '-0.04em' }}>Ready to Upgrade?</h2>
        <div className="flex items-baseline gap-3 justify-center mb-5">
          <span className="text-lg line-through font-semibold" style={{ color: T.MUTED }}>{formatPrice(PRICING.desktop.original)}</span>
          <span className="font-black text-5xl leading-none" style={{ color: T.isDark ? B1 : B2 }}>{formatPrice(PRICING.desktop.amount)}</span>
        </div>
        <button type="button" onClick={() => onOpenPayment('full')}
          className="w-full max-w-[360px] rounded-2xl font-extrabold text-base inline-flex items-center justify-center gap-3 px-10 py-4 transition-transform hover:scale-[1.02] active:scale-[.98]"
          style={{ background: B1, color: '#FFFFFF', boxShadow: '0 8px 22px rgba(243,2,2,.18)' }}>
          Upgrade to Smooch X <ArrowRight className="w-5 h-5" />
        </button>
      </section>

      {/* Premium upgrade comparison */}
      <section className="max-w-4xl mx-auto px-8 pb-12">
        <GroupComparison onJoin={() => onOpenPayment('full')} />
      </section>

      {/* What You Unlock — row list */}
      <section className="max-w-5xl mx-auto px-8 pb-12">
        <div className="text-center mb-10">
          <h2 className="font-extrabold text-4xl mb-2" style={{ color: T.DARK, letterSpacing: '-0.04em' }}>What You Unlock</h2>
          <p className="text-lg font-medium" style={{ color: T.MUTED }}>The extra benefits of upgrading from Datespot</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {FEAT.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 rounded-2xl px-5 py-4"
                style={{ background: T.CARD_BG, border: `1px solid ${f.c1}22`, boxShadow: T.isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${f.c1}` }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm" style={{ color: T.DARK }}>{f.title}</div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: T.MUTED }}>{f.desc}</div>
                </div>
                {f.badge && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: `${f.c1}22`, color: f.c1, border: `1px solid ${f.c1}40` }}>
                    {f.badge}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Admin + Why Trust side by side */}
      <section className="max-w-5xl mx-auto px-8 pb-12 grid grid-cols-2 gap-8">
        <MeetAdmin />
        <WhyTrust />
      </section>


      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-8 pb-12">
        <DesktopFAQ />
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-8 text-center" style={{ borderTop: `1px solid rgba(243,2,2,0.2)` }}>
        <p className="text-sm font-semibold" style={{ color: T.MUTED }}>
          © 2026 Smooch X Bangalore · One-time payment · Lifetime access · No hidden fees
        </p>
      </footer>

      <AnimatePresence>
        {showPayment && <PaymentModal onClose={onClosePayment} paymentType={paymentType} device="desktop" />}
      </AnimatePresence>
      <Toaster position="top-center" toastOptions={{
        style: { background: T.CARD_BG, color: T.DARK, borderRadius: '14px', fontSize: '14px', fontWeight: '700', border: `1px solid ${B1}30`, boxShadow: `0 8px 24px ${B1}40` },
      }} />
    </div>
  );
}

// ─── Chat Overlay ─────────────────────────────────────────────────────────────
type Message = { id: string; sender: 'bot' | 'user'; type: 'text' | 'audio' | 'button'; content: string; time: string; audioSrc?: string; };

function ChatOverlay({ onClose, onOpenPayment }: { onClose: () => void; onOpenPayment: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1', sender: 'bot', type: 'text',
    content: "Hi! I'm Komal. Ask me about upgrading from Datespot to Smooch X.",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleAsk = (q: string, index: number) => {
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', type: 'text', content: q, time: t }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const answers = [
        'Smooch X is an upgrade for existing Datespot members. Enter your Datespot membership number to begin.',
        'Unlock VIP women profiles, a free private pass, free in-group exclusive content, premium services, WhatsApp access and higher group hours.',
        `The launch offer is ${formatPrice(PRICING.mobile.amount)} (originally ${formatPrice(PRICING.mobile.original)}).`,
        'Smooch X offers higher group hours than Datespot. Ask the admin for the current schedule.',
        'Enter your membership number, pay using UPI and submit a screenshot. The team confirms payment and membership before sharing access.',
      ];
      const msgs: Message[] = [{ id: (Date.now() + 1).toString(), sender: 'bot', type: 'text', content: answers[index] ?? answers[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
      if (q === 'How do I upgrade?') msgs.push({ id: (Date.now() + 2).toString(), sender: 'bot', type: 'button', content: 'Upgrade now',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      setMessages(prev => [...prev, ...msgs]);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md mx-auto h-[82vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: CARD_BG }}>
        <div className="p-3.5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(243,2,2,0.15)', background: PAGE_BG }}>
          <div className="relative">
            <img src={chatAvatar} alt="Komal" className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: B1 }} />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm" style={{ color: DARK }}>Komal</div>
            <div className="text-[10px] font-semibold" style={{ color: B1 }}>Admin · Online now</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: 'rgba(243,2,2,0.07)' }}>
            <X className="w-4 h-4" style={{ color: MUTED }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ background: PAGE_BG }}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.sender === 'bot' && msg.type !== 'button' && (
                <img src={chatAvatar} alt="Komal" className="w-6 h-6 rounded-full object-cover shrink-0 mt-1" />
              )}
              <div className={`max-w-[78%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.type === 'button' ? (
                  <button onClick={() => { toast.success('Opening payment...'); onClose(); setTimeout(() => onOpenPayment(), 300); }}
                    className="px-5 py-2.5 rounded-2xl text-white font-bold text-xs active:scale-95 transition-transform shadow-md"
                    style={{ background: HERO_SOLID }}>
                    Upgrade for {formatPrice(PRICING.mobile.amount)}
                  </button>
                ) : (
                  <div className="px-3.5 py-2.5 text-xs shadow-sm"
                    style={msg.sender === 'user'
                      ? { background: HERO_SOLID, color: 'white', borderRadius: '18px 18px 4px 18px' }
                      : { background: '#150F0F', color: DARK, border: '1px solid rgba(243,2,2,0.2)', borderRadius: '18px 18px 18px 4px' }}>
                    {msg.type === 'text' ? <p>{msg.content}</p> : <VoiceMessageBubble audioSrc={msg.audioSrc} isUser={msg.sender === 'user'} />}
                    <div className="text-[8px] mt-1 opacity-40">{msg.time}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <img src={chatAvatar} alt="Komal" className="w-6 h-6 rounded-full object-cover shrink-0" />
              <div className="px-3.5 py-2.5 rounded-2xl flex gap-0.5 shadow-sm" style={{ background: '#150F0F', border: '1px solid rgba(243,2,2,0.2)' }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: B1 }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4" style={{ background: CARD_BG, borderTop: '1px solid rgba(243,2,2,0.15)' }}>
          <p className="text-[9px] font-bold mb-2.5 text-center uppercase tracking-widest" style={{ color: MUTED }}>Tap to ask</p>
          <div className="space-y-1.5">
            {QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => handleAsk(q, i)}
                className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition-all active:scale-[0.98]"
                style={{ background: '#150F0F', border: '1.5px solid rgba(243,2,2,0.2)', color: DARK }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Voice Message Bubble ─────────────────────────────────────────────────────
function VoiceMessageBubble({ audioSrc, isUser }: { audioSrc?: string; isUser?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd  = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onMeta); audio.removeEventListener('ended', onEnd); };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); } else { audio.play(); toast.success('Playing...'); }
    setIsPlaying(!isPlaying);
  };

  const fmt = (t: number) => (!t || isNaN(t)) ? '0:00' : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const waveColor = isUser ? 'rgba(255,255,255,0.9)' : B1;
  const waveFade  = isUser ? 'rgba(255,255,255,0.3)' : `${B1}30`;

  return (
    <div className="flex items-center gap-2 min-w-[155px]">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      <button onClick={toggle} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform shrink-0"
        style={{ background: isUser ? 'rgba(255,255,255,0.25)' : `${B1}18` }}>
        {isPlaying
          ? <Pause className="w-3.5 h-3.5 fill-current" style={{ color: isUser ? 'white' : B1 }} />
          : <Play  className="w-3.5 h-3.5 fill-current ml-0.5" style={{ color: isUser ? 'white' : B1 }} />}
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-0.5 h-4">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-0.5 rounded-full transition-all"
              style={{ height: `${Math.max(20, i % 3 === 0 ? 55 : i % 2 === 0 ? 80 : 35)}%`, background: (i / 16) * 100 <= progress ? waveColor : waveFade }} />
          ))}
        </div>
        <span className="text-[8px] font-mono mt-0.5 block opacity-50">{fmt(isPlaying ? currentTime : duration)}</span>
      </div>
      <Mic className="w-3 h-3 opacity-35 shrink-0" style={{ color: isUser ? 'white' : B1 }} />
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
type UploadState = 'idle' | 'submitting' | 'submitted';

function PaymentModal({ onClose, paymentType, device }: { onClose: () => void; paymentType: 'full' | 'demo'; device: PricingDevice }) {
  const UPI_ID        = 'BHARATPE2R0S0C1D6V46619@unitype';
  const { amount: AMOUNT, original: ORIGINAL_AMT } = PRICING[device];
  const upiUrl        = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('Smooch X')}&am=${AMOUNT}&cu=INR`;

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [tab, setTab] = useState<'qr' | 'upi'>('qr');
  // A compact one-minute countdown, without implying the payment price expires.
  const [secondsLeft, setSecondsLeft] = useState(60);
  useEffect(() => {
    if (uploadState !== 'idle' || secondsLeft === 0) return;
    const id = window.setTimeout(() => setSecondsLeft(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft, uploadState]);
  const countdown = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  const compressImage = (file: File): Promise<string> =>
    new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 900;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.75).split(',')[1]);
      };
      img.src = url;
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState('submitting');
    try {
      const base64 = await compressImage(file);
      const membershipNumber = localStorage.getItem('sx_membership_number') ?? '';
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'screenshot', membershipNumber, mimeType: 'image/jpeg', fileName: `payment_${Date.now()}.jpg`, image: base64 }),
      });
      // The opaque response does not prove the screenshot was received or the payment verified.
      setUploadState('submitted');
      toast.success('Screenshot sent for review');
    } catch {
      setUploadState('idle');
      toast.error('Upload failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={uploadState === 'idle' ? onClose : undefined} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl shadow-2xl bg-white">
        {uploadState === 'idle' && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full z-20 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
          <img src={`${ASSET_BASE}smooch-x-logo.svg`} alt="Smooch X logo"
            className="w-10 h-10 rounded-xl shrink-0 object-cover" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-none text-gray-900">Upgrade to Smooch X</div>
            <div className="text-[10px] mt-0.5 font-medium text-gray-400">Launch offer · Lifetime Telegram access</div>
          </div>
          <div className="text-right shrink-0 mr-7">
            {ORIGINAL_AMT && <div className="text-[11px] line-through text-gray-400">{formatPrice(ORIGINAL_AMT)}</div>}
            <div className="font-extrabold text-2xl leading-none" style={{ color: B2 }}>{formatPrice(AMOUNT)}</div>
          </div>
        </div>

        <div className="px-4 pb-4">
          {uploadState === 'idle' && (
            <>
              {/* UPI payment details; countdown does not affect the launch offer. */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: '#FFF0F0', border: '1px solid #F7C7C7' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <CreditCard className="w-3.5 h-3.5 shrink-0" style={{ color: B1 }} />
                  <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: "#000000" }}>Secure UPI Payment</p>
                </div>
                <span aria-label={`Countdown ${countdown}`} role="timer"
                  className="text-[12px] font-extrabold tabular-nums rounded-md px-2 py-1 shrink-0"
                  style={{ background: '#FFFFFF', border: '1px solid #F7C7C7', color: '#705454' }}>{countdown}</span>
              </div>
              <div className="flex rounded-xl p-1 mb-3" style={{ background: '#FFF2F2' }}>
                {(['qr', 'upi'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                    style={tab === t ? { background: B1, color: '#FFFFFF' } : { background: 'transparent', color: '#866666' }}>
                    {t === 'qr' ? 'Scan QR' : 'UPI ID'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === 'qr' ? (
                  <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="rounded-2xl p-3 mb-2 flex items-center justify-center" style={{ background: '#FFF8F8' }}>
                      <QRCodeSVG value={upiUrl} size={148} level="H" />
                    </div>
                    <p className="text-center text-[10px] mb-2 font-medium" style={{ color: "#705454" }}>Scan with any UPI app</p>
                  </motion.div>
                ) : (
                  <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3">
                    <div className="rounded-2xl p-4 mb-2" style={{ background: '#FFF8F8' }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#705454" }}>UPI ID</p>
                      <p className="font-mono text-sm font-bold break-all mb-4 text-gray-800">{UPI_ID}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(UPI_ID); toast.success('Copied!'); }}
                          className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                          style={{ border: `1.5px solid ${B1}`, color: B1, background: 'white' }}>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                        <a href={upiUrl}
                          className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                          style={{ background: HERO_SOLID }}
                          onClick={() => toast.success('Opening UPI app...')}>
                          <ExternalLink className="w-3.5 h-3.5" /> Pay
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* UPI apps accepted: reference image */}
              <div className="rounded-lg px-2 py-1 mb-2 max-w-[220px] mx-auto" style={{ background: '#FFFFFF', border: '1px solid #F5DDE0' }}>
                <img
                  src={`${ASSET_BASE}upi-apps-accepted.webp`}
                  alt="UPI, Paytm, Google Pay and PhonePe accepted"
                  className="block w-full h-auto max-h-[90px] object-contain mx-auto rounded-md"
                  loading="lazy"
                />
              </div>

              <div className="pt-3 mt-1" style={{ borderTop: `1px solid ${B1}12` }}>
                <p className="text-center text-[10px] mb-2 font-medium" style={{ color: "#705454" }}>Submit your payment screenshot for admin review</p>
                <input type="file" id="ss-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                <label htmlFor="ss-upload"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm cursor-pointer active:scale-95 transition-transform"
                  style={{ background: B1, color: '#FFFFFF' }}>
                  <Upload className="w-4 h-4" /> Upload Screenshot
                </label>
              </div>
            </>
          )}

          {uploadState === 'submitting' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${B1}12` }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: B1 }} />
              </div>
              <p className="font-bold text-base mb-1 text-gray-900">Submitting Screenshot</p>
              <p className="text-xs font-medium text-gray-400">Please wait while your screenshot is sent...</p>
            </motion.div>
          )}

          {uploadState === 'submitted' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-center py-8">
              <div className="w-18 h-18 mx-auto rounded-2xl flex items-center justify-center mb-5 shadow-xl" style={{ background: HERO_SOLID, width: 72, height: 72 }}>
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <p className="font-bold text-xl mb-1 text-gray-900">Screenshot Submitted</p>
              <p className="text-sm font-medium" style={{ color: B1 }}>Your membership and payment require admin confirmation before Smooch X access is shared.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
