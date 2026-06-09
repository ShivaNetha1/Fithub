import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Rocket,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ClientAuthRedirect } from "@/components/auth/client-auth-redirect";
import { ScrollAnimations, AnimatedCounter } from "@/components/landing/landing-animations";
import { HeroParticles } from "@/components/landing/hero-particles";
import { LandingNav } from "@/components/landing/landing-nav";
import { createClient } from "@/lib/supabase/server";

/* ─── Server-side auth redirect (preserved from scaffold) ─── */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && !profile.onboarding_completed) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <main className="landing-page">
      <ClientAuthRedirect />
      <ScrollAnimations />
      <LandingNav />

      {/* ───── HERO ───── */}
      <section className="landing-hero" id="hero">
        <div className="landing-hero__bg">
          <div className="landing-hero__gradient" />
          <div className="landing-hero__grid" />
          <div className="landing-hero__orb landing-hero__orb--1" />
          <div className="landing-hero__orb landing-hero__orb--2" />
          <HeroParticles />
        </div>

        <div className="landing-hero__content">
          <div className="landing-hero__badge">
            <span className="landing-hero__badge-dot" />
            Now in Beta. Free for early adopters
          </div>

          <h1>
            Run Your{" "}
            <span className="landing-hero__highlight">Gym Empire</span>
            <br />
            From One Dashboard
          </h1>

          <p className="landing-hero__sub">
            FitHub replaces your manual registers with a secure, modern SaaS workspace.
            Manage members, plans, payments, attendance, and analytics, all from one place.
          </p>

          <div className="landing-hero__ctas">
            <Link href="/auth/signup" className="landing-hero__btn-primary">
              Get Started Free
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a href="#how-it-works" className="landing-hero__btn-secondary">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ───── STATS BAR ───── */}
      <section className="landing-stats" aria-label="Platform statistics">
        <div className="landing-stats__inner">
          <div className="landing-stats__item">
            <div className="landing-stats__value">
              <AnimatedCounter end={500} suffix="+" />
            </div>
            <p className="landing-stats__label">Gyms Managed</p>
          </div>
          <div className="landing-stats__item">
            <div className="landing-stats__value">
              <AnimatedCounter end={50000} suffix="+" />
            </div>
            <p className="landing-stats__label">Members Tracked</p>
          </div>
          <div className="landing-stats__item">
            <div className="landing-stats__value">
              <AnimatedCounter end={2} prefix="₹" suffix="Cr+" />
            </div>
            <p className="landing-stats__label">Payments Processed</p>
          </div>
          <div className="landing-stats__item">
            <div className="landing-stats__value">
              <AnimatedCounter end={99} suffix=".9%" />
            </div>
            <p className="landing-stats__label">Uptime</p>
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section className="landing-features" id="features">
        <div className="landing-features__inner">
          <div data-animate="fade-up">
            <p className="landing-section-label">
              Features
            </p>
            <h2 className="landing-section-title">
              Everything you need to run your gym, nothing you don&apos;t
            </h2>
            <p className="landing-section-subtitle">
              From member sign-ups to revenue analytics, FitHub covers every aspect of
              gym management in one unified dashboard.
            </p>
          </div>

          <div className="landing-features__grid" data-stagger>
            <div className="feature-card" data-animate="fade-up">
              <div className="feature-card__icon">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="feature-card__title">Multi-Gym Dashboard</h3>
              <p className="feature-card__desc">
                Create and manage multiple gym workspaces from a single owner account.
                Switch between locations with one click.
              </p>
            </div>

            <div className="feature-card" data-animate="fade-up">
              <div className="feature-card__icon">
                <Users size={24} />
              </div>
              <h3 className="feature-card__title">Member Management</h3>
              <p className="feature-card__desc">
                Add, search, edit, and track every member&apos;s profile, subscription
                status, renewal dates, and history in one place.
              </p>
            </div>

            <div className="feature-card" data-animate="fade-up">
              <div className="feature-card__icon">
                <Dumbbell size={24} />
              </div>
              <h3 className="feature-card__title">Membership Plans</h3>
              <p className="feature-card__desc">
                Create flexible plans with custom pricing, durations, and currencies.
                Default plans are seeded automatically on gym setup.
              </p>
            </div>

            <div className="feature-card" data-animate="fade-up">
              <div className="feature-card__icon">
                <CreditCard size={24} />
              </div>
              <h3 className="feature-card__title">Payment Tracking</h3>
              <p className="feature-card__desc">
                Record and monitor all member payments. Track monthly revenue, pending
                dues, and payment history with real-time summaries.
              </p>
            </div>

            <div className="feature-card" data-animate="fade-up">
              <div className="feature-card__icon">
                <CalendarCheck size={24} />
              </div>
              <h3 className="feature-card__title">Attendance Tracking</h3>
              <p className="feature-card__desc">
                Daily attendance logging with today&apos;s count on the dashboard.
                Never lose track of who showed up and when.
              </p>
            </div>

            <div className="feature-card" data-animate="fade-up">
              <div className="feature-card__icon">
                <BarChart3 size={24} />
              </div>
              <h3 className="feature-card__title">Analytics &amp; Insights</h3>
              <p className="feature-card__desc">
                Visual charts for revenue trends, member growth, attendance patterns,
                expiry forecasts, and overall business health.
              </p>
            </div>

            <div className="feature-card" data-animate="fade-up">
              <div className="feature-card__icon">
                <Rocket size={24} />
              </div>
              <h3 className="feature-card__title">Quick Onboarding</h3>
              <p className="feature-card__desc">
                Set up your gym in under 2 minutes. Enter your details and your
                workspace with default plans is instantly ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-how__inner">
          <div style={{ textAlign: "center" }} data-animate="fade-up">
            <p className="landing-section-label" style={{ justifyContent: "center" }}>
              <span className="landing-section-label__line" />
              How It Works
            </p>
            <h2
              className="landing-section-title"
              style={{ maxWidth: "500px", margin: "0 auto" }}
            >
              Up and running in three simple steps
            </h2>
          </div>

          <div className="landing-how__steps" data-stagger>
            <div className="how-step" data-animate="fade-up">
              <div className="how-step__number">1</div>
              <h3 className="how-step__title">Create Your Account</h3>
              <p className="how-step__desc">
                Sign up with your email in seconds. No credit card required.
                FitHub is free during the beta period.
              </p>
            </div>

            <div className="how-step" data-animate="fade-up">
              <div className="how-step__number">2</div>
              <h3 className="how-step__title">Set Up Your Gym</h3>
              <p className="how-step__desc">
                Enter your gym name, location, currency, and timezone. We&apos;ll
                create your workspace with default membership plans.
              </p>
            </div>

            <div className="how-step" data-animate="fade-up">
              <div className="how-step__number">3</div>
              <h3 className="how-step__title">Start Managing</h3>
              <p className="how-step__desc">
                Add members, record payments, log attendance, and watch your
                analytics dashboard come alive, instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section className="landing-pricing" id="pricing">
        <div className="landing-pricing__inner">
          <div style={{ textAlign: "center" }} data-animate="fade-up">
            <p className="landing-section-label" style={{ justifyContent: "center" }}>
              <span className="landing-section-label__line" />
              Pricing
            </p>
            <h2
              className="landing-section-title"
              style={{ maxWidth: "500px", margin: "0 auto" }}
            >
              Simple pricing, no surprises
            </h2>
            <p
              className="landing-section-subtitle"
              style={{ margin: "1rem auto 0" }}
            >
              Get full access to every feature while we&apos;re in beta, completely free.
            </p>
          </div>

          <div className="landing-pricing__card" data-animate="scale-in">
            <div className="landing-pricing__badge">Early Adopter</div>
            <p className="landing-pricing__price">Free</p>
            <p className="landing-pricing__period">During beta · No credit card needed</p>

            <ul className="landing-pricing__features">
              {[
                "Unlimited gym workspaces",
                "Full member management",
                "Custom membership plans",
                "Payment tracking & reports",
                "Daily attendance logging",
                "Analytics & revenue charts",
                "Team invites & role access",
                "Email support",
              ].map((feature) => (
                <li key={feature}>
                  <span className="landing-pricing__check">
                    <Check size={14} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/auth/signup" className="landing-pricing__cta">
              Get Started Free
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───── TESTIMONIALS ───── */}
      <section className="landing-testimonials" id="testimonials">
        <div className="landing-testimonials__inner">
          <div style={{ textAlign: "center" }} data-animate="fade-up">
            <p className="landing-section-label" style={{ justifyContent: "center" }}>
              <span className="landing-section-label__line" />
              Testimonials
            </p>
            <h2
              className="landing-section-title"
              style={{ maxWidth: "520px", margin: "0 auto" }}
            >
              Trusted by gym owners who ditched the register
            </h2>
          </div>

          <div className="landing-testimonials__grid" data-stagger>
            <div className="testimonial-card" data-animate="fade-up">
              <div className="testimonial-card__stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="testimonial-card__quote">
                &ldquo;FitHub replaced three different apps I was juggling. Now I manage
                both my gym branches from one dashboard, and the attendance
                tracking alone saved me hours every week.&rdquo;
              </p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">RK</div>
                <div>
                  <p className="testimonial-card__name">Rajesh Kumar</p>
                  <p className="testimonial-card__role">Owner, Iron Pulse Gym · Chennai</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card" data-animate="fade-up">
              <div className="testimonial-card__stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="testimonial-card__quote">
                &ldquo;The onboarding took literally 2 minutes. I added my gym,
                it seeded default plans, and I was adding members the same evening.
                No setup headaches at all.&rdquo;
              </p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">PS</div>
                <div>
                  <p className="testimonial-card__name">Priya Sharma</p>
                  <p className="testimonial-card__role">Owner, FlexZone Fitness · Mumbai</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card" data-animate="fade-up">
              <div className="testimonial-card__stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="testimonial-card__quote">
                &ldquo;The analytics dashboard gives me a clear picture of revenue
                and member growth every month. I finally know exactly where my
                gym business stands financially.&rdquo;
              </p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">AV</div>
                <div>
                  <p className="testimonial-card__name">Arjun Verma</p>
                  <p className="testimonial-card__role">Owner, Peak Performance · Bangalore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── FINAL CTA ───── */}
      <section className="landing-cta-banner">
        <div className="landing-cta-banner__bg" />
        <div className="landing-cta-banner__inner" data-animate="fade-up">
          <h2>
            Ready to modernize your gym?
          </h2>
          <p className="landing-cta-banner__sub">
            Join hundreds of gym owners who switched from manual registers to FitHub.
            Set up in minutes, manage with confidence.
          </p>
          <div className="landing-cta-banner__actions">
            <Link href="/auth/signup" className="landing-hero__btn-primary">
              Create Free Account
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/auth/login" className="landing-hero__btn-secondary">
              Log in to your workspace
            </Link>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <span className="landing-footer__brand-icon">
              <Dumbbell size={18} aria-hidden="true" />
            </span>
            <span className="landing-footer__brand-text">FitHub</span>
          </div>

          <ul className="landing-footer__links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><Link href="/auth/login">Login</Link></li>
            <li><Link href="/auth/signup">Sign Up</Link></li>
          </ul>

          <p className="landing-footer__copy">
            © {new Date().getFullYear()} FitHub. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
