import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Lightbulb, Database, Table, HelpCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { AssignmentService, QueryService } from '../services/api';
import styles from './AttemptPage.module.scss';

// ─── Main Component ───────────────────────────────────────────────────────────
const AttemptPage = () => {
  const { id } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [query, setQuery] = useState('-- Write your SQL query here\n');
  const [results, setResults] = useState(null);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [queryError, setQueryError] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // ── Fetch assignment ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    const fetch = async () => {
      try {
        const data = await AssignmentService.getAssignmentById(id);
        if (!cancelled) {
          setAssignment(data);
          // Restore saved query from localStorage, or set a helpful starter
          const saved = localStorage.getItem(`cipher_query_${id}`);
          if (saved) {
            setQuery(saved);
          } else if (data?.title && data?.question) {
            setQuery(`-- ${data.title}\n-- ${data.question}\n\nSELECT * FROM `);
          }
        }
      } catch (err) {
        if (!cancelled) setFetchError('Failed to load assignment.');
        console.error('[AttemptPage] fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [id]);

  // ── Execute SQL ────────────────────────────────────────────────────────────
  const handleExecute = async () => {
    setExecuting(true);
    setQueryError(null);
    try {
      const data = await QueryService.execute(query);
      setResults(data);
    } catch (err) {
      setQueryError(err.response?.data?.message || 'Query execution failed.');
      setResults(null);
    } finally {
      setExecuting(false);
    }
  };

  // ── Clear saved query ──────────────────────────────────────────────────────
  const handleClear = () => {
    localStorage.removeItem(`cipher_query_${id}`);
    const starter = assignment?.title
      ? `-- ${assignment.title}\n-- ${assignment.question}\n\nSELECT * FROM `
      : '-- Write your SQL query here\n';
    setQuery(starter);
    setResults(null);
    setHint('');
    setQueryError(null);
  };

  // ── Get AI Hint ────────────────────────────────────────────────────────────
  const handleGetHint = async () => {
    if (!assignment) return;
    setHint('Generating hint...');
    try {
      const hintText = await QueryService.getHint(assignment.question, assignment.schema, query);
      setHint(hintText);
    } catch {
      setHint('Could not generate hint at this time.');
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.center}>
        <Loader2 size={40} className={styles.spin} style={{ color: '#6366f1' }} />
        <p style={{ color: '#94a3b8' }}>Loading assignment...</p>
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (fetchError || !assignment) {
    return (
      <div className={styles.center}>
        <AlertCircle size={40} style={{ color: '#ef4444' }} />
        <h2 style={{ color: '#ef4444' }}>{fetchError || 'Assignment not found'}</h2>
        <Link to="/" className={styles.centerLink}>← Back to assignments</Link>
      </div>
    );
  }

  const difficulty = assignment.difficulty || 'Easy';

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={14} /> Back to Assignments
        </Link>

        <div className={styles.titleRow}>
          <h2 className={styles.assignmentTitle}>{assignment.title}</h2>
          <span className={`${styles.badge} ${styles[`badge--${difficulty.toLowerCase()}`]}`}>
            {difficulty}
          </span>
        </div>

        <p className={styles.description}>{assignment.description}</p>

        <div className={styles.questionBox}>
          <div className={styles.questionBox__label}>Task</div>
          <p className={styles.questionBox__text}>{assignment.question}</p>
        </div>

        {assignment.schema && (
          <div>
            <div className={styles.schemaTitle}>
              <Database size={14} /> Database Schema
            </div>
            {Object.entries(assignment.schema).map(([tableName, columns]) => (
              <div key={tableName} className={styles.schemaTable}>
                <div className={styles.schemaTable__name}>{tableName}</div>
                {Array.isArray(columns) && columns.map((col, i) => (
                  <div key={i} className={styles.schemaTable__row}>
                    <span>{col.name}</span>
                    <span className={styles.schemaTable__type}>{col.type}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ── Main Panel ── */}
      <div className={styles.main}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button
              className="btn btn--secondary btn--sm"
              onClick={handleExecute}
              disabled={executing}
            >
              {executing ? <Loader2 size={14} className={styles.spin} /> : <Play size={14} />}
              {executing ? 'Running...' : 'Run Query'}
            </button>
            <button
              className="btn btn--ghost btn--sm"
              onClick={handleClear}
              disabled={executing}
              title="Clear editor and remove saved query"
            >
              Clear
            </button>
          </div>
          <button
            className="btn btn--ghost btn--sm"
            onClick={handleGetHint}
            disabled={executing}
          >
            <Lightbulb size={14} /> Get AI Hint
          </button>
        </div>

        {/* Hint banner */}
        {hint && (
          <div className={styles.hintBanner}>
            <HelpCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{hint}</span>
          </div>
        )}

        {/* Error banner */}
        {queryError && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{queryError}</span>
          </div>
        )}

        {/* Monaco Editor */}
        <div className={styles.editorWrap}>
          <Editor
            height="100%"
            defaultLanguage="sql"
            theme="vs-dark"
            value={query}
            onChange={(val) => {
              const v = val ?? '';
              setQuery(v);
              // Autosave to localStorage on every change
              localStorage.setItem(`cipher_query_${id}`, v);
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16 },
              automaticLayout: true,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Results Panel */}
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <Table size={14} /> Result Set
            {results && (
              <span className={styles.resultsRowCount}>
                {results.rows?.length ?? 0} row{(results.rows?.length ?? 0) !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {!results ? (
            <div className={styles.resultsEmpty}>
              {executing ? 'Executing query...' : 'Hit "Run Query" to see results here.'}
            </div>
          ) : results.rows?.length === 0 ? (
            <div className={styles.resultsEmpty}>No rows returned.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    {results.fields?.map((field) => (
                      <th key={field}>{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.rows.map((row, i) => (
                    <tr key={i}>
                      {results.fields?.map((field, j) => (
                        <td key={j}>
                          {row[field] !== null && row[field] !== undefined
                            ? String(row[field])
                            : <span className={styles.nullValue}>NULL</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttemptPage;
