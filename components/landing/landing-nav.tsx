"use client";

import { useState, useEffect, useCallback } from "react";
import { Dumbbell, X } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll(); // check initial state
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <>
      <nav
        className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}
        aria-label="Main navigation"
      >
        <div className="landing-nav__inner">
          {/* Logo */}
          <Link href="/" className="landing-nav__logo" aria-label="FitHub home">
            <span className="landing-nav__logo-icon">
              <Dumbbell size={20} aria-hidden="true" />
            </span>
            FitHub
          </Link>

          {/* Desktop links */}
          <ul className="landing-nav__links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="landing-nav__actions">
            <ThemeToggle />
            <Link href="/auth/login" className="landing-nav__login">
              Log in
            </Link>
            <Link href="/auth/signup" className="landing-nav__cta">
              Start Free
            </Link>

            {/* Hamburger (mobile only) */}
            <button
              className="landing-nav__hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`mobile-drawer ${drawerOpen ? "mobile-drawer--open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <div className="mobile-drawer__overlay" onClick={closeDrawer} />
        <div className="mobile-drawer__panel">
          <button
            className="mobile-drawer__close"
            onClick={closeDrawer}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>

          <ul className="mobile-drawer__links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={closeDrawer}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mobile-drawer__actions">
            <div className="flex justify-center mb-2">
              <ThemeToggle />
            </div>
            <Link
              href="/auth/login"
              className="landing-nav__login"
              style={{ textAlign: "center", width: "100%" }}
              onClick={closeDrawer}
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="landing-nav__cta"
              style={{ width: "100%", textAlign: "center" }}
              onClick={closeDrawer}
            >
              Start Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
