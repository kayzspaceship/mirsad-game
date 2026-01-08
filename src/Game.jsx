import React, { useState, useEffect } from 'react';

const MAX_GUESSES = 8;

const countryEmojis = {
  'Turkey': '🇹🇷', 'USA': '🇺🇸', 'France': '🇫🇷', 'Germany': '🇩🇪', 'Spain': '🇪🇸',
  'Italy': '🇮🇹', 'Greece': '🇬🇷', 'Poland': '🇵🇱', 'Serbia': '🇷🇸', 'Croatia': '🇭🇷',
  'Russia': '🇷🇺', 'Israel': '🇮🇱', 'Lithuania': '🇱🇹', 'Latvia': '🇱🇻', 'Estonia': '🇪🇪',
  'Czech Republic': '🇨🇿', 'Hungary': '🇭🇺', 'Romania': '🇷🇴', 'Bulgaria': '🇧🇬',
  'Slovenia': '🇸🇮', 'Montenegro': '🇲🇪', 'Bosnia and Herzegovina': '🇧🇦',
  'North Macedonia': '🇲🇰', 'Albania': '🇦🇱', 'Slovakia': '🇸🇰', 'Belgium': '🇧🇪',
  'Netherlands': '🇳🇱', 'Portugal': '🇵🇹', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦',
  'Australia': '🇦🇺', 'New Zealand': '🇳🇿', 'Japan': '🇯🇵', 'China': '🇨🇳',
  'South Korea': '🇰🇷', 'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'Mexico': '🇲🇽',
  'Senegal': '🇸🇳', 'Nigeria': '🇳🇬', 'Egypt': '🇪🇬', 'Turkiye': '🇹🇷',
  'United States': '🇺🇸', 'United States of America': '🇺🇸'
};

export default function Game({ player, players, date }) {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showImage, setShowImage] = useState(false);
  const [streak, setStreak] = useState(0);
  const [recentScores, setRecentScores] = useState([]);
  const [lastDate, setLastDate] = useState(date);

  useEffect(() => {
    if (lastDate !== date) {
      setLastDate(date);
      const gameStateKey = 'gameState_' + date;
      const showImageKey = 'showImage_' + date;

      const savedGameState = localStorage.getItem(gameStateKey);
      const savedShowImage = localStorage.getItem(showImageKey);

      if (savedGameState) {
        const state = JSON.parse(savedGameState);
        setGuesses(state.guesses || []);
        setGameWon(state.gameWon || false);
        setGameLost(state.gameLost || false);
      } else {
        setGuesses([]);
        setGameWon(false);
        setGameLost(false);
      }

      setShowImage(savedShowImage === 'true');
      setCurrentGuess('');
      setSearchResults([]);
    }

    const gameStateKey = 'gameState_' + date;
    const showImageKey = 'showImage_' + date;

    const savedGameState = localStorage.getItem(gameStateKey);
    const savedShowImage = localStorage.getItem(showImageKey);

    if (savedGameState) {
      const state = JSON.parse(savedGameState);
      setGuesses(state.guesses || []);
      setGameWon(state.gameWon || false);
      setGameLost(state.gameLost || false);
    } else {
      setGuesses([]);
      setGameWon(false);
      setGameLost(false);
    }

    setShowImage(savedShowImage === 'true');

    const scores = JSON.parse(localStorage.getItem('mirsad_scores') || '{}');
    const dates = Object.keys(scores).sort().reverse();
    setRecentScores(dates.map(d => ({ date: d, score: scores[d] })));
    
    let currentStreak = 0;
    const allDates = Object.keys(scores).sort().reverse();
    const todayDate = new Date();
    
    for (let i = 0; i < allDates.length; i++) {
      const gameDate = new Date(allDates[i] + 'T00:00:00');
      const expectedDate = new Date(todayDate);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (gameDate.toLocaleDateString('en-CA') === expectedDate.toLocaleDateString('en-CA') && scores[allDates[i]] < MAX_GUESSES) {
        currentStreak++;
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [date, lastDate]);

  useEffect(() => {
    const gameStateKey = 'gameState_' + date;
    const state = { guesses, gameWon, gameLost };
    localStorage.setItem(gameStateKey, JSON.stringify(state));
  }, [guesses, gameWon, gameLost, date]);

  useEffect(() => {
    const showImageKey = 'showImage_' + date;
    localStorage.setItem(showImageKey, showImage ? 'true' : 'false');
  }, [showImage, date]);

  const makeGuess = (selectedPlayer) => {
    if (gameWon || gameLost) return;

    const newGuess = {
      name: selectedPlayer.name,
      position: selectedPlayer.position,
      age: selectedPlayer.age,
      height: selectedPlayer.height,
      team: selectedPlayer.team,
      teamAbbr: selectedPlayer.teamAbbr || selectedPlayer.team.substring(0, 1),
      nationality: selectedPlayer.nationality,
      jerseyNumber: selectedPlayer.jerseyNumber || 0,
      isCorrect: selectedPlayer.id === player.id,
    };

    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');
    setSearchResults([]);

    if (newGuess.isCorrect) {
      setGameWon(true);
      setShowImage(true);
      const scores = JSON.parse(localStorage.getItem('mirsad_scores') || '{}');
      scores[date] = newGuesses.length;
      localStorage.setItem('mirsad_scores', JSON.stringify(scores));
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameLost(true);
    }
  };

  const handleSearch = (value) => {
    setCurrentGuess(value);
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
    const filtered = players.filter(
      (p) => p.name.toUpperCase().includes(value.toUpperCase()) && !guesses.some((g) => g.name === p.name)
    );
    setSearchResults(filtered.slice(0, 8));
  };

  const getArrow = (guessVal, correctVal) => guessVal === correctVal ? '' : guessVal < correctVal ? '↑' : '↓';
  const getCountryFlag = (country) => countryEmojis[country] || '🏳️';
  const getCellColor = (isCorrect, isClose = false) => (isCorrect ? 'bg-green-500' : isClose ? 'bg-yellow-400' : 'bg-red-500');

  const photoStyle = (gameWon || gameLost) ? { filter: 'brightness(1) saturate(1)' } : { filter: 'brightness(0)' };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className="bg-slate-100 border-2 border-slate-900 rounded-r-lg p-3 space-y-3 max-h-96 overflow-y-auto">
            <div className="text-center border-b-2 border-slate-900 pb-2">
              <p className="text-xs font-bold text-slate-600">STREAK</p>
              <p className="text-3xl font-black">🔥 {streak}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 text-center">HISTORY</p>
              {recentScores.length > 0 ? recentScores.map((item, idx) => {
                const isWin = item.score < MAX_GUESSES;
                return (
                  <div key={idx} className="text-center text-xs">
                    <p className="text-slate-500 flex items-center justify-center gap-1">
                      {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {isWin ? <span className="text-lg">🎉</span> : <span className="text-lg">❌</span>}
                    </p>
                    <p className="text-sm font-black text-slate-900">{item.score}/8</p>
                  </div>
                );
              }) : <p className="text-xs text-slate-400 text-center py-2">No games yet</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="max-w-2xl w-full">
            <h2 className="text-4xl font-black text-slate-900 mb-8 text-center">Today's Player 🔥 {streak}</h2>
            
            <div className="mb-8 flex justify-center">
              <img src={player.imageUrl} alt="Player" style={{ width: '200px', height: '280px', objectFit: 'cover', ...photoStyle, borderRadius: '12px', border: '4px solid #1e293b', transition: 'all 0.5s' }} />
            </div>

            {!gameWon && !gameLost && (
              <div className="mb-6">
                <input type="text" disabled={gameWon || gameLost} value={currentGuess} onChange={(e) => handleSearch(e.target.value)} placeholder="Type player name..." className="w-full px-4 py-3 border-2 border-slate-900 rounded text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed" />
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white border-2 border-slate-900 rounded max-h-60 overflow-y-auto">
                    {searchResults.map((p) => (
                      <button key={p.id} onClick={() => makeGuess(p)} className="w-full px-4 py-2 text-left hover:bg-slate-100 border-b border-slate-200 text-slate-900">
                        <div className="font-bold">{p.name}</div>
                        <div className="text-xs text-slate-600">{p.team}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {guesses.length > 0 && (
              <div className="mb-6 overflow-x-auto border-2 border-slate-900 rounded">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-center hidden md:table-cell">Team</th>
                      <th className="p-2 text-center md:hidden">Tm</th>
                      <th className="p-2 text-center">Pos</th>
                      <th className="p-2 text-center">Ht</th>
                      <th className="p-2 text-center">Age</th>
                      <th className="p-2 text-center">No</th>
                      <th className="p-2 text-center">Ctry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guesses.map((guess, idx) => (
                      <tr key={idx} className={guess.isCorrect ? 'bg-green-100' : 'bg-white border-b'}>
                        <td className="p-2 font-bold text-slate-900">{guess.name} {guess.isCorrect && '✓'}</td>
                        <td className={`p-2 text-center font-bold text-white hidden md:table-cell ${getCellColor(guess.team === player.team)}`}>{guess.team}</td>
                        <td className={`p-2 text-center font-bold text-white md:hidden text-xs ${getCellColor(guess.team === player.team)}`}>{guess.teamAbbr}</td>
                        <td className={`p-2 text-center font-bold text-white ${getCellColor(guess.position === player.position)}`}>{guess.position}</td>
                        <td className={`p-2 text-center font-bold text-white text-xs ${getCellColor(guess.height === player.height, Math.abs(guess.height - player.height) <= 3)}`}>{getArrow(guess.height, player.height)} {guess.height}</td>
                        <td className={`p-2 text-center font-bold text-white ${getCellColor(guess.age === player.age, Math.abs(guess.age - player.age) <= 3)}`}>{getArrow(guess.age, player.age)} {guess.age}</td>
                        <td className={`p-2 text-center font-bold text-white text-xs ${getCellColor(guess.jerseyNumber === player.jerseyNumber, Math.abs(guess.jerseyNumber - player.jerseyNumber) <= 1)}`}>{getArrow(guess.jerseyNumber, player.jerseyNumber)} {guess.jerseyNumber}</td>
                        <td className={`p-2 text-center font-bold text-white text-lg ${getCellColor(guess.nationality === player.nationality)}`}>{getCountryFlag(guess.nationality)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(gameWon || gameLost) && (
              <div className={`p-4 rounded mb-6 text-center border-2 font-bold ${gameWon ? 'bg-green-100 border-green-600 text-green-900' : 'bg-red-100 border-red-600 text-red-900'}`}>
                {gameWon ? '🎉 Correct! ' + player.name : '😢 Game Over! ' + player.name}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-100 rounded p-2 text-center border-2 border-slate-900">
                <p className="text-xs font-bold">Guesses</p>
                <p className="text-xl font-black">{guesses.length}/8</p>
              </div>
              <div className="bg-slate-100 rounded p-2 text-center border-2 border-slate-900">
                <p className="text-xs font-bold">Left</p>
                <p className="text-xl font-black">{8 - guesses.length}</p>
              </div>
              <div className="bg-slate-100 rounded p-2 text-center border-2 border-slate-900">
                <p className="text-xs font-bold">Status</p>
                <p className="text-lg font-black">{gameWon ? '✓' : gameLost ? '✗' : '▶'}</p>
              </div>
              <div className="bg-slate-100 rounded p-2 text-center border-2 border-slate-900">
                <p className="text-xs font-bold">Image</p>
                <p className="text-lg font-black">{gameWon ? '👁' : '🔒'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
