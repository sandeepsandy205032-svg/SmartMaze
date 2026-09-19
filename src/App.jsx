import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LandingHero from './components/landing/LandingHero';
import AuthScreen from './components/auth/AuthScreen';
import AuthTransitionOverlay from './components/auth/AuthTransitionOverlay';
import HubLayout from './components/hub/HubLayout';
import LevelSelectScreen from './components/levelselect/LevelSelectScreen';
import ChallengesScreen from './components/challenges/ChallengesScreen';
import CreateScreen from './components/create/CreateScreen';
import ProfileScreen from './components/profile/ProfileScreen';
import GameplayScreen from './gameplay/GameplayScreen';
import ExpeditionLoadingModal from './components/common/ExpeditionLoadingModal';

function MainContainer() {
  const {
    viewState,
    handleLandingEnter,
    currentScreen,
    activeMode,
    setActiveMode,
    returnToLanding,
    isAuthTransitioning,
    userProfile,
  } = useApp();

  // Keyboard shortcut listener for Enter or Space key to trigger transition from Landing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewState === 'landing' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleLandingEnter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState, handleLandingEnter]);

  const isEnteringOrEntered = viewState === 'entering' || viewState === 'entered';

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Landing Hero Scene */}
      {(viewState === 'landing' || viewState === 'entering') && (
        <LandingHero
          onEnter={handleLandingEnter}
          isEntering={isEnteringOrEntered}
        />
      )}

      {/* 2. Authentication View (Login, Create Account, Forgot Password) */}
      {viewState === 'auth' && <AuthScreen />}

      {/* 3. Main Entered Views (Gameplay, Level Select, Challenges, Create, Profile, Hub) */}
      {viewState === 'entered' && (
        currentScreen === 'gameplay' ? (
          <GameplayScreen />
        ) : currentScreen === 'levelSelect' ? (
          <LevelSelectScreen />
        ) : currentScreen === 'challenges' ? (
          <ChallengesScreen />
        ) : currentScreen === 'create' ? (
          <CreateScreen />
        ) : currentScreen === 'profile' ? (
          <ProfileScreen />
        ) : (
          <HubLayout
            activeMode={activeMode}
            onSelectMode={setActiveMode}
            onReset={returnToLanding}
          />
        )
      )}

      {/* 4. Cinematic Auth Entry Transition Overlay */}
      {isAuthTransitioning && (
        <AuthTransitionOverlay username={userProfile.name} />
      )}

      {/* 5. Full-Screen Game Loading & Theme Transition Modal */}
      <ExpeditionLoadingModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContainer />
    </AppProvider>
  );
}

