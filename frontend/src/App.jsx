import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AssignmentsPage from './pages/AssignmentsPage';
import AttemptPage from './pages/AttemptPage';
import AboutPage from './pages/AboutPage';
import './styles/main.scss';

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
