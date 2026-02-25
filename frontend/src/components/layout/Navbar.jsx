import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Database, Layout } from 'lucide-react';
import styles from './Navbar.module.scss';

const Navbar = () => {
  return (
    <header className={styles.navbar}>
      <div className={`container ${styles.navbar__container}`}>
        <Link to="/" className={styles.navbar__logo}>
          <Database size={24} />
          <span>CipherSQL Studio</span>
        </Link>

        <nav className={styles.navbar__nav}>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `${styles.navbar__link} ${isActive ? styles['navbar__link--active'] : ''}`
            }
          >
            Assignments
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => 
              `${styles.navbar__link} ${isActive ? styles['navbar__link--active'] : ''}`
            }
          >
            About
          </NavLink>
        </nav>

        <div className={styles.navbar__actions}>
          <button className="btn btn--ghost">
            <Layout size={18} />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
