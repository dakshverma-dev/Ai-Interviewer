'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How it works', href: '#how-it-works' },
];

export default function LandingNav() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled ? 'top-4 left-4 right-4' : 'top-6 left-6 right-6'
      }`}
    >
      <nav
        className="mx-auto transition-all duration-500"
        style={{
          background: isScrolled || isMobileMenuOpen ? 'rgba(255,255,255,0.85)' : 'transparent',
          backdropFilter: isScrolled || isMobileMenuOpen ? 'blur(16px)' : 'none',
          border: isScrolled || isMobileMenuOpen ? '1px solid var(--color-dove)' : '1px solid transparent',
          borderRadius: isScrolled || isMobileMenuOpen ? 'var(--radius-2xl)' : '0',
          maxWidth: isScrolled || isMobileMenuOpen ? '1100px' : '1300px',
        }}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? 'h-14' : 'h-20'
          }`}
        >
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <span className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
              AI Interviewer
            </span>
          </button>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-[var(--color-fog)] hover:text-[var(--color-jet-ink)] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => router.push('/interviewee')} className="btn-ghost text-sm">
              Join an interview
            </button>
            <button onClick={() => router.push('/interviewer')} className="btn-primary text-sm">
              Create an interview
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'var(--color-paper)', top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-display text-5xl"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex gap-4 pt-8" style={{ borderTop: '1px solid var(--color-dove)' }}>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push('/interviewee');
              }}
              className="btn-ghost flex-1 h-14 text-base"
            >
              Join
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push('/interviewer');
              }}
              className="btn-primary flex-1 h-14 text-base"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
