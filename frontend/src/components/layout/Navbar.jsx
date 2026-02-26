import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Database } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
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
          {/* Show Sign In button when logged out */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn--primary btn--sm">Sign In</button>
            </SignInButton>
          </SignedOut>

          {/* Show user avatar + sign-out when logged in */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: { width: '32px', height: '32px' },
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
