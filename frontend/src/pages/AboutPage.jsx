import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Zap, Brain, Code2, Shield, ArrowRight, Github } from 'lucide-react';
import styles from './AboutPage.module.scss';

// ── Feature cards data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Database size={22} />,
    title: 'Real PostgreSQL Sandbox',
    desc: 'Write and execute real SQL queries against a live PostgreSQL database — not a simulation. Every assignment has its own isolated schema so your experiments never affect others.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Instant Feedback',
    desc: 'See query results in milliseconds. The execution engine validates your output against the expected result and tells you exactly what\'s right or wrong.',
  },
  {
    icon: <Brain size={22} />,
    title: 'AI-Powered Hints',
    desc: 'Stuck? Get an intelligent, context-aware hint from Gemini AI. It guides you toward the solution without giving it away — true learning, not cheating.',
  },
  {
    icon: <Code2 size={22} />,
    title: 'Monaco Editor',
    desc: 'The same editor that powers VS Code. Syntax highlighting, keyboard shortcuts, and a comfortable coding experience right in your browser.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Safe & Sandboxed',
    desc: 'All queries run inside a transaction that is automatically rolled back. You can\'t break the data for other students — experiment freely.',
  },
];

const STACK = [
  { label: 'Frontend',  value: 'React + Vite'    },
  { label: 'Styling',   value: 'Vanilla SCSS'     },
  { label: 'Editor',    value: 'Monaco Editor'    },
  { label: 'Backend',   value: 'Node.js + Express'},
  { label: 'Sandbox DB',value: 'PostgreSQL (Neon)'},
  { label: 'Atlas DB',  value: 'MongoDB Atlas'    },
  { label: 'AI Hints',  value: 'Gemini 2.0 Flash' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const AboutPage = () => (
  <div className={styles.page}>

    {/* ── Hero ── */}
    <section className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroBadge}>
        <span className={styles.heroBadge__dot} />
        SQL Learning Platform
      </div>
      <h1 className={styles.heroTitle}>
        Master SQL through
        <span className={styles.heroTitle__accent}> Real Practice</span>
      </h1>
      <p className={styles.heroSub}>
        CipherSQL Studio is a browser-based sandbox where you write and execute real SQL queries
        against pre-configured assignments — with instant feedback and AI-powered guidance.
      </p>
      <Link to="/" className={`btn btn--primary ${styles.heroCta}`}>
        Start Practising <ArrowRight size={16} />
      </Link>
    </section>

    {/* ── Features ── */}
    <section className={styles.section}>
      <h2 className={styles.section__title}>What's inside</h2>
      <div className={styles.featureGrid}>
        {FEATURES.map(f => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureCard__icon}>{f.icon}</div>
            <h3 className={styles.featureCard__title}>{f.title}</h3>
            <p className={styles.featureCard__desc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── Tech stack ── */}
    <section className={styles.section}>
      <h2 className={styles.section__title}>Tech Stack</h2>
      <div className={styles.stackGrid}>
        {STACK.map(s => (
          <div key={s.label} className={styles.stackRow}>
            <span className={styles.stackRow__label}>{s.label}</span>
            <span className={styles.stackRow__value}>{s.value}</span>
          </div>
        ))}
      </div>
    </section>

    {/* ── Data flow ── */}
    <section className={styles.section}>
      <h2 className={styles.section__title}>How it works</h2>
      <div className={styles.flow}>
        {[
          'Select Assignment  →  Fetch from MongoDB',
          'Load Sample Data  →  Query PostgreSQL Schema',
          'Write SQL Query  →  Submit to Express API',
          'Execute  →  PostgreSQL Returns Results',
          'Optional: Request Hint  →  Gemini generates guidance',
          'Save Progress  →  Store in MongoDB (sessionId)',
        ].map((step, i) => (
          <div key={i} className={styles.flowStep}>
            <span className={styles.flowStep__num}>{i + 1}</span>
            <span className={styles.flowStep__text}>{step}</span>
          </div>
        ))}
      </div>
    </section>

    {/* ── Footer ── */}
    <footer className={styles.footer}>
      <span>Built with ❤️ for the CipherSQL Studio Assignment</span>
    </footer>
  </div>
);

export default AboutPage;
