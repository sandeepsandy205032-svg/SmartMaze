import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AmbientVideoBackground from '../common/AmbientVideoBackground';
import PrimaryButton from '../common/PrimaryButton';
import GhostButton from '../common/GhostButton';
import './auth.css';

/**
 * AuthScreen — SmartMaze Frontend Authentication Component (M12)
 * Features Sage + Sand architectural styling, full viewport atmospheric environment,
 * login, create account, forgot password placeholder, and accessible client-side validation.
 */
export default function AuthScreen() {
  const {
    authScreen,
    setAuthScreen,
    loginUser,
    registerUser,
    returnToLanding,
  } = useApp();

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);

  // Forgot Password Form State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginSubmitting(true);

    try {
      const res = await loginUser(loginIdentifier, loginPassword);
      setIsLoginSubmitting(false);
      if (!res || !res.success) {
        setLoginError(res?.error || 'Invalid credentials.');
      }
    } catch (err) {
      setIsLoginSubmitting(false);
      setLoginError('Unable to connect to SmartMaze server.');
    }
  };

  // Handle Register Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setIsRegSubmitting(true);

    try {
      const res = await registerUser(regUsername, regEmail, regPassword, regConfirmPassword);
      setIsRegSubmitting(false);
      if (!res || !res.success) {
        setRegError(res?.error || 'Registration failed.');
      }
    } catch (err) {
      setIsRegSubmitting(false);
      setRegError('Unable to connect to SmartMaze server.');
    }
  };

  // Handle Forgot Password Submission
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }
    setForgotSubmitted(true);
  };

  return (
    <div className="smartmaze-auth-root">
      {/* 1. Atmospheric Video Backdrop */}
      <AmbientVideoBackground
        videoSrc="/assets/media/smartmaze-landing (3).mp4"
        overlayStrength={0.4}
        blurAmount="6px"
        playbackRate={0.65}
        showCanvasOverlay={true}
        canvasMode="neutral"
      />

      {/* 2. Top Header Navigation */}
      <header className="smartmaze-auth-topbar">
        <div className="smartmaze-auth-brand">
          <span className="smartmaze-auth-brand-icon">◇</span>
          <span>SMARTMAZE</span>
        </div>

        <div className="smartmaze-auth-top-actions">
          <GhostButton onClick={returnToLanding} leadingIcon={<span>‹</span>}>
            RETURN TO ENTRANCE
          </GhostButton>
        </div>
      </header>

      {/* 3. Main Form Stage */}
      <main className="smartmaze-auth-viewport">
        {/* LOGIN FORM VIEW */}
        {authScreen === 'login' && (
          <div className="smartmaze-auth-card">
            <div className="smartmaze-auth-card-header">
              <span className="smartmaze-auth-tag">EXPEDITION ACCESS</span>
              <h1 className="smartmaze-auth-title">WELCOME BACK</h1>
              <p className="smartmaze-auth-subtitle">Continue your journey through the maze.</p>
            </div>

            {loginError && (
              <div className="smartmaze-auth-alert" role="alert">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="smartmaze-auth-form" noValidate>
              <div className="smartmaze-auth-field-group">
                <label className="smartmaze-auth-label" htmlFor="login-identifier">
                  USERNAME OR EMAIL
                </label>
                <div className="smartmaze-auth-input-wrapper">
                  <input
                    id="login-identifier"
                    type="text"
                    className="smartmaze-auth-input"
                    placeholder="e.g. Pathfinder or explorer@smartmaze.io"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="smartmaze-auth-field-group">
                <label className="smartmaze-auth-label" htmlFor="login-password">
                  PASSWORD
                </label>
                <div className="smartmaze-auth-input-wrapper">
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    className="smartmaze-auth-input smartmaze-auth-input--has-toggle"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="smartmaze-auth-pwd-toggle"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <PrimaryButton
                type="submit"
                disabled={isLoginSubmitting}
                className="smartmaze-auth-submit-btn"
                trailingIcon={<span>→</span>}
              >
                {isLoginSubmitting ? 'VERIFYING...' : 'ENTER SMARTMAZE'}
              </PrimaryButton>
            </form>

            <div className="smartmaze-auth-secondary-actions">
              <button
                type="button"
                className="smartmaze-auth-link-btn"
                onClick={() => setAuthScreen('forgot_password')}
              >
                Forgot password?
              </button>

              <div className="smartmaze-auth-divider">OR</div>

              <div className="smartmaze-auth-switch-prompt">
                <span>New to SmartMaze?</span>
                <button
                  type="button"
                  className="smartmaze-auth-switch-link"
                  onClick={() => setAuthScreen('register')}
                >
                  CREATE ACCOUNT →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE ACCOUNT VIEW */}
        {authScreen === 'register' && (
          <div className="smartmaze-auth-card">
            <div className="smartmaze-auth-card-header">
              <span className="smartmaze-auth-tag">NEW EXPEDITION</span>
              <h1 className="smartmaze-auth-title">CREATE YOUR PROFILE</h1>
              <p className="smartmaze-auth-subtitle">Begin your journey through the maze.</p>
            </div>

            {regError && (
              <div className="smartmaze-auth-alert" role="alert">
                <span>⚠️</span>
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="smartmaze-auth-form" noValidate>
              <div className="smartmaze-auth-field-group">
                <label className="smartmaze-auth-label" htmlFor="reg-username">
                  USERNAME
                </label>
                <div className="smartmaze-auth-input-wrapper">
                  <input
                    id="reg-username"
                    type="text"
                    className="smartmaze-auth-input"
                    placeholder="Choose your pathfinder handle"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="smartmaze-auth-field-group">
                <label className="smartmaze-auth-label" htmlFor="reg-email">
                  EMAIL ADDRESS
                </label>
                <div className="smartmaze-auth-input-wrapper">
                  <input
                    id="reg-email"
                    type="email"
                    className="smartmaze-auth-input"
                    placeholder="yourname@domain.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="smartmaze-auth-field-group">
                <label className="smartmaze-auth-label" htmlFor="reg-password">
                  PASSWORD
                </label>
                <div className="smartmaze-auth-input-wrapper">
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    className="smartmaze-auth-input smartmaze-auth-input--has-toggle"
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="smartmaze-auth-pwd-toggle"
                    onClick={() => setShowRegPassword((prev) => !prev)}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div className="smartmaze-auth-field-group">
                <label className="smartmaze-auth-label" htmlFor="reg-confirm-password">
                  CONFIRM PASSWORD
                </label>
                <div className="smartmaze-auth-input-wrapper">
                  <input
                    id="reg-confirm-password"
                    type={showRegPassword ? 'text' : 'password'}
                    className="smartmaze-auth-input"
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <PrimaryButton
                type="submit"
                disabled={isRegSubmitting}
                className="smartmaze-auth-submit-btn"
                trailingIcon={<span>→</span>}
              >
                {isRegSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </PrimaryButton>
            </form>

            <div className="smartmaze-auth-secondary-actions">
              <div className="smartmaze-auth-switch-prompt">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="smartmaze-auth-switch-link"
                  onClick={() => setAuthScreen('login')}
                >
                  SIGN IN →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {authScreen === 'forgot_password' && (
          <div className="smartmaze-auth-card">
            <div className="smartmaze-auth-card-header">
              <span className="smartmaze-auth-tag">ACCOUNT RECOVERY</span>
              <h1 className="smartmaze-auth-title">FORGOT PASSWORD</h1>
              <p className="smartmaze-auth-subtitle">Enter your email address to recover your account.</p>
            </div>

            {forgotError && (
              <div className="smartmaze-auth-alert" role="alert">
                <span>⚠️</span>
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSubmitted ? (
              <div className="smartmaze-auth-alert smartmaze-auth-alert-info">
                <span>ℹ</span>
                <span>
                  Password recovery will be available when SmartMaze accounts are connected to the server.
                </span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="smartmaze-auth-form" noValidate>
                <div className="smartmaze-auth-field-group">
                  <label className="smartmaze-auth-label" htmlFor="forgot-email">
                    REGISTERED EMAIL ADDRESS
                  </label>
                  <div className="smartmaze-auth-input-wrapper">
                    <input
                      id="forgot-email"
                      type="email"
                      className="smartmaze-auth-input"
                      placeholder="yourname@domain.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <PrimaryButton
                  type="submit"
                  className="smartmaze-auth-submit-btn"
                  trailingIcon={<span>→</span>}
                >
                  REQUEST RESET
                </PrimaryButton>
              </form>
            )}

            <div className="smartmaze-auth-secondary-actions">
              <button
                type="button"
                className="smartmaze-auth-link-btn"
                onClick={() => {
                  setForgotSubmitted(false);
                  setAuthScreen('login');
                }}
              >
                ← BACK TO LOGIN
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
