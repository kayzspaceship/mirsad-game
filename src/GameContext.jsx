import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameStates, setGameStates] = useState({});

  const getGameState = (date) => {
    return gameStates[date] || { guesses: [], gameWon: false, gameLost: false, showImage: false };
  };

  const setGameState = (date, state) => {
    setGameStates(prev => ({ ...prev, [date]: state }));
    localStorage.setItem('gameState_' + date, JSON.stringify(state));
  };

  const resetGameState = (date) => {
    const newState = { guesses: [], gameWon: false, gameLost: false, showImage: false };
    setGameState(date, newState);
    return newState;
  };

  return (
    <GameContext.Provider value={{ gameStates, getGameState, setGameState, resetGameState }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}
