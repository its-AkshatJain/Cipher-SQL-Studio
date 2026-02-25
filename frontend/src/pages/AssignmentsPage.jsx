import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Clock, Loader2 } from 'lucide-react';
import styles from './AssignmentsPage.module.scss';
import { AssignmentService } from '../services/api';

const AssignmentCard = ({ assignment }) => {
  const difficulty = assignment.difficulty || 'Easy';
  const badgeClass = `badge--${difficulty.toLowerCase()}`;

  return (
    <div className={styles.card}>
      <div className={styles.card__header}>
        <div className={styles.card__icon}>
          <BookOpen size={20} />
        </div>
        <span className={`badge ${badgeClass}`}>{difficulty}</span>
      </div>
      
      <h3 className={styles.card__title}>{assignment.title}</h3>
      <p className={styles.card__desc}>{assignment.description}</p>
      
      <div className={styles.card__footer}>
        <div className={styles.card__meta}>
          <span className={styles.card__metaItem}>
            <Clock size={14} /> {assignment.timeEstimate || '20 min'}
          </span>
        </div>
        <Link to={`/attempt/${assignment.id}`} className="btn btn--primary btn--sm">
          <span>Attempt</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await AssignmentService.getAssignments();
        setAssignments(data);
      } catch (err) {
        setError('Failed to load assignments. Please check if the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

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
        </header>

        <div className={styles.assignments__grid}>
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default AssignmentsPage;
