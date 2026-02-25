import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AssignmentsPage from './pages/AssignmentsPage';
import AttemptPage from './pages/AttemptPage';
import './styles/main.scss';

const AboutPage = () => (
  <div className="container" style={{ padding: '4rem 0' }}>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>About CipherSQL Studio</h1>
    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6' }}>
      CipherSQL Studio is a premium platform designed for developers and data analysts 
      to master SQL through interactive, real-world scenarios. Our sandbox environment 
      provides instant feedback and AI-powered hints to accelerate your learning journey.
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<AssignmentsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/attempt/:id" element={<AttemptPage />} />
            <Route path="*" element={
              <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>
                <h2>404 - Page Not Found</h2>
                <Link to="/" className="btn btn--primary" style={{ marginTop: '1rem' }}>Back to Assignments</Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
