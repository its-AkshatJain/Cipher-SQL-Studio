import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play, Lightbulb, Database, Table, HelpCircle,
  Loader2, AlertCircle, ArrowLeft, CheckCircle2, RotateCcw,
} from 'lucide-react';
import { AssignmentService, QueryService, ProgressService } from '../services/api';
import styles from './AttemptPage.module.scss';

// ── Helpers ───────────────────────────────────────────────────────────────────
const DEBOUNCE_MS = 1500; // save to MongoDB 1.5s after user stops typing

const useDebounce = (fn, delay) => {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
};

// ── Main Component ────────────────────────────────────────────────────────────
const AttemptPage = () => {
  const { id } = useParams();

  const [assignment, setAssignment]   = useState(null);
  const [query, setQuery]             = useState('-- Write your SQL query here\n');
  const [results, setResults]         = useState(null);
  const [hint, setHint]               = useState('');
  const [loading, setLoading]         = useState(true);
  const [executing, setExecuting]     = useState(false);
  const [isSolved, setIsSolved]       = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [queryError, setQueryError]   = useState(null);
  const [fetchError, setFetchError]   = useState(null);
  const [saveStatus, setSaveStatus]   = useState(''); // 'saving' | 'saved' | ''

  // ── Save progress to MongoDB (debounced) ────────────────────────────────────
  const persistProgress = useCallback(async (q, solved) => {
    setSaveStatus('saving');
    await ProgressService.save(id, { sqlQuery: q, isCompleted: solved });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 2000);
  }, [id]);

  const debouncedSave = useDebounce(persistProgress, DEBOUNCE_MS);

  // ── Fetch assignment + load saved progress ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    (async () => {
      try {
        const [data, progress] = await Promise.all([
          AssignmentService.getAssignmentById(id),
          ProgressService.load(id),
        ]);

        if (cancelled) return;

        setAssignment(data);
        setIsSolved(progress?.isCompleted ?? false);
        setAttemptCount(progress?.attemptCount ?? 0);

        if (progress?.sqlQuery) {
          setQuery(progress.sqlQuery);
        } else if (data?.question) {
          const firstTable = data.sampleTables?.[0]?.tableName ?? '';
          setQuery(`-- ${data.title}\n-- ${data.question}\n\nSELECT * FROM ${firstTable}`);
        }
      } catch (err) {
        if (!cancelled) setFetchError('Failed to load assignment.');
        console.error('[AttemptPage] fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  // ── Execute SQL ─────────────────────────────────────────────────────────────
  const handleExecute = async () => {
    setExecuting(true);
    setQueryError(null);
    try {
      const data = await QueryService.execute(query);
      setResults(data);
      setAttemptCount(c => c + 1);

      // Simple answer check against expectedOutput
      const solved = checkAnswer(data, assignment?.expectedOutput);
      setIsSolved(solved);

      // Persist to MongoDB immediately on execute
      await persistProgress(query, solved);
    } catch (err) {
      setQueryError(err.response?.data?.message || err.message || 'Query execution failed.');
      setResults(null);
    } finally {
      setExecuting(false);
    }
  };

  // ── Reset editor ────────────────────────────────────────────────────────────
  const handleReset = async () => {
    const firstTable = assignment?.sampleTables?.[0]?.tableName ?? '';
    const starter = `-- ${assignment?.title ?? ''}\n-- ${assignment?.question ?? ''}\n\nSELECT * FROM ${firstTable}`;
    setQuery(starter);
    setResults(null);
    setHint('');
    setQueryError(null);
    setIsSolved(false);
    await ProgressService.save(id, { sqlQuery: starter, isCompleted: false });
  };

  // ── Get AI Hint ─────────────────────────────────────────────────────────────
  const handleGetHint = async () => {
    if (!assignment) return;
    setHint('Generating hint...');
    try {
      const hintText = await QueryService.getHint(
        assignment.question,
        assignment.sampleTables,
        query,
      );
      setHint(hintText);
    } catch {
      setHint('Could not generate hint at this time.');
    }
  };

  // ── Answer Checking ─────────────────────────────────────────────────────────
  const checkAnswer = (queryResult, expected) => {
    if (!expected || !queryResult?.rows?.length) return false;

    const rows = queryResult.rows;
    const { type, value } = expected;

    try {
      if (type === 'count') {
        return rows[0]?.count === value || queryResult.rowCount === value;
      }
      if (type === 'single_value') {
        const first = Object.values(rows[0] ?? {})[0];
        return String(first) === String(value);
      }
      if (type === 'table') {
        if (rows.length !== value.length) return false;
        // Check that every expected row exists in results (order-independent)
        return value.every(expectedRow =>
          rows.some(row =>
            Object.keys(expectedRow).every(
              k => String(row[k]) === String(expectedRow[k])
            )
          )
        );
      }
    } catch { return false; }
    return false;
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.center}>
        <Loader2 size={40} className={styles.spin} style={{ color: '#6366f1' }} />
        <p style={{ color: '#94a3b8' }}>Loading assignment...</p>
      </div>
    );
  }

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

  // ── Render ──────────────────────────────────────────────────────────────────
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

        {attemptCount > 0 && (
          <p className={styles.attemptCount}>{attemptCount} attempt{attemptCount !== 1 ? 's' : ''}</p>
        )}

        <p className={styles.description}>{assignment.description}</p>

        <div className={styles.questionBox}>
          <div className={styles.questionBox__label}>Task</div>
          <p className={styles.questionBox__text}>{assignment.question}</p>
        </div>

        {/* Sample Tables with actual row data */}
        {assignment.sampleTables?.length > 0 && (
          <div>
            <div className={styles.schemaTitle}>
              <Database size={14} /> Sample Data
            </div>
            {assignment.sampleTables.map((tbl) => (
              <div key={tbl.tableName} className={styles.schemaTable}>
                <div className={styles.schemaTable__name}>{tbl.tableName}</div>

                {/* Column headers */}
                <div className={styles.sampleDataWrap}>
                  <table className={styles.sampleTable}>
                    <thead>
                      <tr>
                        {tbl.columns.map(col => (
                          <th key={col.columnName}>
                            <span>{col.columnName}</span>
                            <span className={styles.sampleTable__type}>{col.dataType}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tbl.rows.map((row, i) => (
                        <tr key={i}>
                          {tbl.columns.map(col => (
                            <td key={col.columnName}>
                              {row[col.columnName] !== null && row[col.columnName] !== undefined
                                ? String(row[col.columnName])
                                : <span className={styles.nullValue}>NULL</span>
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ── Main Panel ── */}
      <div className={styles.main}>

        {/* Solved banner */}
        {isSolved && (
          <div className={styles.solvedBanner}>
            <CheckCircle2 size={18} />
            <strong>Correct! Assignment Solved 🎉</strong>
          </div>
        )}

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
              onClick={handleReset}
              disabled={executing}
              title="Reset editor to starter template"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
          <div className={styles.toolbarRight}>
            {saveStatus === 'saving' && <span className={styles.saveStatus}>Saving...</span>}
            {saveStatus === 'saved'  && <span className={`${styles.saveStatus} ${styles['saveStatus--ok']}`}>Saved ✓</span>}
            <button
              className="btn btn--ghost btn--sm"
              onClick={handleGetHint}
              disabled={executing}
            >
              <Lightbulb size={14} /> Get Hint
            </button>
          </div>
        </div>

        {/* Hint banner */}
        {hint && hint !== 'Generating hint...' && (
          <div className={styles.hintBanner}>
            <HelpCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{hint}</span>
          </div>
        )}
        {hint === 'Generating hint...' && (
          <div className={styles.hintBanner}>
            <Loader2 size={14} className={styles.spin} /> Generating hint...
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
              debouncedSave(v, isSolved); // autosave to MongoDB
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
                    {results.fields?.map(field => <th key={field}>{field}</th>)}
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
