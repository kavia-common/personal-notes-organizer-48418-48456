import React from 'react';

/**
 * Top navigation bar for the app.
 * Ocean Professional theme with gradient accent.
 */
// PUBLIC_INTERFACE
export default function NavBar() {
  /** Render top nav with app title. */
  return (
    <nav className="nav">
      <div className="nav__brand">
        <div className="nav__logo">📝</div>
        <div className="nav__titles">
          <span className="nav__title">Ocean Notes</span>
          <span className="nav__subtitle">Capture. Organize. Focus.</span>
        </div>
      </div>
      <div className="nav__accent" aria-hidden="true" />
    </nav>
  );
}
