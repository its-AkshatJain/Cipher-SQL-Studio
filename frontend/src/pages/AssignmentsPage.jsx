import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { BookOpen, ArrowRight, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import styles from './AssignmentsPage.module.scss';
import { AssignmentService, ProgressService } from '../services/api';

// ── Assignment Card ───────────────────────────────────────────────────────────
const AssignmentCard = ({ assignment, solved, attemptCount }) => {
  const difficulty = assignment.difficulty || 'Easy';
  const badgeClass = `badge--${difficulty.toLowerCase()}`;

  return (
    <div className={`${styles.card} ${solved ? styles['card--solved'] : ''}`}>
      <div className={styles.card__header}>
        <div className={`${styles.card__icon} ${solved ? styles['card__icon--solved'] : ''}`}>
          {solved ? <CheckCircle2 size={20} /> : <BookOpen size={20} />}
        </div>
        <span className={`badge ${badgeClass}`}>{difficulty}</span>
      </div>

      {solved && (
        <div className={styles.card__solvedTag}>✓ Solved</div>
      )}

      <h3 className={styles.card__title}>{assignment.title}</h3>
      <p className={styles.card__desc}>{assignment.description}</p>

      <div className={styles.card__footer}>
        <div className={styles.card__meta}>
          <span className={styles.card__metaItem}>
            <Clock size={14} /> {assignment.timeEstimate || '20 min'}
          </span>
          {attemptCount > 0 && (
            <span className={styles.card__metaItem}>
              {attemptCount} attempt{attemptCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Link to={`/attempt/${assignment.id}`} className={`btn btn--sm ${solved ? 'btn--ghost' : 'btn--primary'}`}>
          <span>{solved ? 'Review' : 'Attempt'}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const AssignmentsPage = () => {
  const { userId: clerkUserId } = useAuth();
  const userId = clerkUserId ?? (localStorage.getItem('cipher_session_id') || null);

  const [assignments, setAssignments]   = useState([]);
  const [progressMap, setProgressMap]   = useState({}); // { assignmentId: { isCompleted, attemptCount } }
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [data, progress] = await Promise.all([
          AssignmentService.getAssignments(),
          userId ? ProgressService.getAll(userId) : {},
        ]);
        setAssignments(data);
        setProgressMap(progress);
      } catch (err) {
        setError('Failed to load assignments. Please check if the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [userId]);

  const solvedCount = Object.values(progressMap).filter(p => p.isCompleted).length;

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: '#6366f1' }} />
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>Error</h2>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>{error}</p>
      </div>
    );
  }

  return (
    <main className={styles.assignments}>
      <div className="container">
        <header className={styles.assignments__header}>
          <h1 className={styles.assignments__title}>SQL Assignments</h1>
          <p className={styles.assignments__subtitle}>
            Practice your SQL skills with real-world scenarios and interactive datasets.
          </p>
          {userId && assignments.length > 0 && (
            <div className={styles.progressSummary}>
              <span className={styles.progressSummary__bar}>
                <span
                  className={styles.progressSummary__fill}
                  style={{ width: `${(solvedCount / assignments.length) * 100}%` }}
                />
              </span>
              <span className={styles.progressSummary__text}>
                {solvedCount} / {assignments.length} solved
              </span>
            </div>
          )}
        </header>

        <div className={styles.assignments__grid}>
          {assignments.map((assignment) => {
            const p = progressMap[String(assignment.id)] ?? {};
            return (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                solved={p.isCompleted ?? false}
                attemptCount={p.attemptCount ?? 0}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default AssignmentsPage;
