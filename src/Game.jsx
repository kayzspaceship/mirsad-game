import React, { useState, useEffect } from 'react';

const MAX_GUESSES = 8;

const countryEmojis = {
  'Turkey': '🇹🇷', 'Turkiye': '🇹🇷', 'United States': '🇺🇸', 'USA': '🇺🇸',
  'France': '🇫🇷', 'Germany': '🇩🇪', 'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Greece': '🇬🇷',
  'Poland': '🇵🇱', 'Serbia': '🇷🇸', 'Croatia': '🇭🇷', 'Russia': '🇷🇺', 'Israel': '🇮🇱',
};

export default function Game({ player, players, date, isToday, hasPlayed }) {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [recentScores, setRecentScores] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showImage, setShowImage] = useState(false);

  // Load initial state
  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem('mirsad_scores') || '{}');
    
    // BUGÜN ÖYE KAZANMIŞSA açık olsun
    if (isToday && scores[date] && scores[date] < MAX_GUESSES) {
      setShowImage(true);
    } else {
      // Geçmiş günler DAIMA kapalı
      setShowImage(false);
    }

    // Load scores
    const dates = Object.keys(scores).sort().reverse().slice(0, 7);
    const scoreList = dates.map(d => ({ date: d, score: scores[d] }));
    setRecentScores(scoreList);
    
    // Calculate streak
    let currentStreak = 0;
    const allDates = Object.keys(scores).sort().reverse();
    const today = new Date();
    
    for (let i = 0; i < allDates.length; i++) {
      const gameDate = new Date(allDates[i] + 'T00:00:00');
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (gameDate.toLocaleDateString('en-CA') === expectedDate.toLocaleDateString('en-CA') && scores[allDates[i]] < MAX_GUESSES) {
        currentStreak++;
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [date, isToday]);

  // BUGÜN kazanırsa göster
  useEffect(() => {
    if (gameWon && isToday) {
      setShowImage(true);
      const scores = JSON.parse(localStorage.getItem('mirsad_scores') || '{}');
      scores[date] = guesses.length;
      localStorage.setItem('mirsad_scores', JSON.stringify(scores));
      localStorage.setItem(`mirsad_played_${date}`, 'true');
    }
  }, [gameWon, guesses, date, isToday]);

  const makeGuess = (selectedPlayer) => {
    // Bugün oynamışsa veya geçmiş gün ise oynayamasın
    if (isToday && hasPlayed) return;
    if (!isToday) return; // Geçmiş günler oynanamasın
    if (gameWon || gameLost) return;

    const newGuess = {
      name: selectedPlayer.name,
      position: selectedPlayer.position,
      age: selectedPlayer.age,
      height: selectedPlayer.height,
      team: selectedPlayer.team,
      teamAbbr: selectedPlayer.teamAbbr || selectedPlayer.team,
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
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameLost(true);
      localStorage.setItem(`mirsad_played_${date}`, 'true');
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

  const getShareEmoji = () => {
    let result = '🎯 MIRSAD\n\n';
    
    for (let i = 0; i < guesses.length; i++) {
      const guess = guesses[i];
      let greenCount = 0;
      let yellowCount = 0;
      let redCount = 0;

      if (guess.position === player.position) greenCount++;
      else redCount++;

      if (guess.age === player.age) greenCount++;
      else {
        const ageDiff = Math.abs(guess.age - player.age);
        if (ageDiff <= 3) yellowCount++;
        else redCount++;
      }

      if (guess.height === player.height) greenCount++;
      else {
        const heightDiff = Math.abs(guess.height - player.height);
        if (heightDiff <= 3) yellowCount++;
        else redCount++;
      }

      if (guess.team === player.team) greenCount++;
      else redCount++;

      if (guess.nationality === player.nationality) greenCount++;
      else redCount++;

      if (guess.jerseyNumber === player.jerseyNumber) greenCount++;
      else {
        const jerseyDiff = Math.abs(guess.jerseyNumber - player.jerseyNumber);
        if (jerseyDiff <= 1) yellowCount++;
        else redCount++;
      }

      result += '🟩'.repeat(greenCount);
      result += '🟨'.repeat(yellowCount);
      result += '🟥'.repeat(redCount);
      result += '\n';
    }

    result += `\n${guesses.length}/${MAX_GUESSES}\n`;
    result += gameWon ? `✅ I guessed it! 🔥 Streak: ${streak}` : gameLost ? '❌ Game Over!' : '';
    result += '\n\nmirsad.co';
    return result;
  };

  const share = (platform) => {
    const text = encodeURIComponent(getShareEmoji());
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${text}`,
      whatsapp: `https://wa.me/?text=${text}`,
      telegram: `https://t.me/share/url?text=${text}`,
    };
    if (platform === 'copy') {
      navigator.clipboard.writeText(getShareEmoji());
      alert('Copied! 📋');
    } else {
      window.open(urls[platform], '_blank');
    }
  };

  const getArrow = (guessVal, correctVal) => {
    if (guessVal === correctVal) return '';
    return guessVal < correctVal ? '↑' : '↓';
  };

  const getCountryFlag = (country) => {
    return countryEmojis[country] || '🏳️';
  };

  const getCellColor = (isCorrect, isClose = false) => {
    if (colorBlindMode) {
      return isCorrect ? 'bg-blue-500' : isClose ? 'bg-amber-500' : 'bg-orange-500';
    }
    return isCorrect ? 'bg-green-500' : isClose ? 'bg-yellow-400' : 'bg-red-500';
  };

  const canPlay = isToday && !hasPlayed;
  const photoStyle = (gameWon || gameLost || showImage)
    ? { filter: 'brightness(1) saturate(1)', opacity: 1 }
    : { filter: 'brightness(0)', opacity: 1 };

  return (
    <div className="min-h-screen bg-white py-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Score Tracker Left */}
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className="bg-slate-100 border-2 border-slate-900 rounded-r-lg p-3 space-y-3 max-h-80 overflow-y-auto">
            <div className="text-center border-b-2 border-slate-900 pb-2">
              <p className="text-xs font-bold text-slate-600">STREAK</p>
              <p className="text-3xl font-black">🔥 {streak}</p>
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-600 text-center sticky top-0 bg-slate-100">HISTORY</p>
              {recentScores.length > 0 ? (
                recentScores.map((item, idx) => {
                  const itemDate = new Date(item.date + 'T00:00:00');
                  const today = new Date(date + 'T00:00:00');
                  const isTodayScore = itemDate.getTime() === today.getTime();
                  const isWin = item.score < MAX_GUESSES;
                  return (
                    <div key={idx} className="text-center text-xs">
                      <p className="text-slate-500 flex items-center justify-center gap-1">
                        {itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                        {isTodayScore && isWin && <span className="text-lg">🎉</span>}
                        {isTodayScore && !isWin && <span className="text-lg">❌</span>}
                      </p>
                      <p className="text-sm font-black text-slate-900">{item.score}/8</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">No games yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-slate-900 mb-4">Today's Player</h2>
              <p className="text-2xl font-black mb-2">🔥 {streak}</p>
              <button
                onClick={() => setColorBlindMode(!colorBlindMode)}
                className={`px-3 py-2 rounded text-sm font-bold transition ${
                  colorBlindMode ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-900'
                }`}
              >
                🎨 {colorBlindMode ? 'Normal' : 'Color Blind'}
              </button>
            </div>

            <div className="mb-8 flex justify-center">
              <div className="relative w-48 h-64 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-white">
                {player.imageUrl && (
                  <img
                    src={player.imageUrl}
                    alt="Player"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', ...photoStyle, transition: 'all 0.5s ease-in-out' }}
                  />
                )}
              </div>
            </div>

            {isToday && hasPlayed && (
              <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-600 rounded text-center text-yellow-900">
                <p className="font-bold">😊 You already played today!</p>
                <p className="text-sm">Try again tomorrow.</p>
              </div>
            )}

            {!isToday && (
              <div className="mb-6 p-4 bg-blue-100 border-2 border-blue-600 rounded text-center text-blue-900">
                <p className="font-bold">📅 This is a past game</p>
                <p className="text-sm">You can only play today's game.</p>
              </div>
            )}

            {canPlay && !gameWon && !gameLost && (
              <div className="mb-6">
                <input
                  type="text"
                  value={currentGuess}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Type player name..."
                  className="w-full px-4 py-3 rounded-lg bg-white text-slate-900 border-2 border-slate-900 outline-none text-sm"
                />
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white border-2 border-slate-900 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => makeGuess(p)}
                        className="w-full px-4 py-2 text-left hover:bg-slate-100 transition text-slate-900 border-b border-slate-200 last:border-b-0 text-sm"
                      >
                        <div className="font-bold">{p.name}</div>
                        <div className="text-xs text-slate-600">{p.team}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {guesses.length > 0 && (
              <div className="mb-6 rounded-lg border-2 border-slate-900 overflow-hidden">
                <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-2 text-left font-black border-r border-slate-700">Name</th>
                        <th className="p-2 text-center font-black border-r border-slate-700 hidden sm:table-cell">Team</th>
                        <th className="p-2 text-center font-black border-r border-slate-700 sm:hidden">T</th>
                        <th className="p-2 text-center font-black border-r border-slate-700">Pos</th>
                        <th className="p-2 text-center font-black border-r border-slate-700">Ht</th>
                        <th className="p-2 text-center font-black border-r border-slate-700">Age</th>
                        <th className="p-2 text-center font-black border-r border-slate-700">Jsy</th>
                        <th className="p-2 text-center font-black">Ctry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guesses.map((guess, idx) => (
                        <tr key={idx} className={guess.isCorrect ? 'bg-green-100' : 'bg-white border-b border-slate-200'}>
                          <td className="p-2 font-bold text-slate-900 border-r border-slate-200 text-xs sm:text-sm">
                            <div className="line-clamp-2">{guess.name}</div>
                            {guess.isCorrect && <span className="text-green-600 ml-1">✓</span>}
                          </td>
                          <td className={`p-2 font-bold text-white border-r border-slate-200 text-center hidden sm:table-cell text-xs ${getCellColor(guess.team === player.team)}`}>
                            {guess.team}
                          </td>
                          <td className={`p-2 font-bold text-white border-r border-slate-200 text-center sm:hidden text-xs ${getCellColor(guess.team === player.team)}`}>
                            {guess.teamAbbr}
                          </td>
                          <td className={`p-2 font-bold text-white border-r border-slate-200 text-center ${getCellColor(guess.position === player.position)}`}>
                            {guess.position}
                          </td>
                          <td className={`p-2 font-bold text-white border-r border-slate-200 text-center text-xs ${getCellColor(guess.height === player.height, Math.abs(guess.height - player.height) <= 3)}`}>
                            {getArrow(guess.height, player.height)} {guess.height}
                          </td>
                          <td className={`p-2 font-bold text-white border-r border-slate-200 text-center ${getCellColor(guess.age === player.age, Math.abs(guess.age - player.age) <= 3)}`}>
                            {getArrow(guess.age, player.age)} {guess.age}
                          </td>
                          <td className={`p-2 font-bold text-white border-r border-slate-200 text-center text-xs ${getCellColor(guess.jerseyNumber === player.jerseyNumber, Math.abs(guess.jerseyNumber - player.jerseyNumber) <= 1)}`}>
                            {getArrow(guess.jerseyNumber, player.jerseyNumber)}{guess.jerseyNumber}
                          </td>
                          <td className={`p-2 font-bold text-white text-center text-lg ${getCellColor(guess.nationality === player.nationality)}`}>
                            {getCountryFlag(guess.nationality)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(gameWon || gameLost) && (
              <div className={`p-4 rounded-lg mb-6 text-center border-2 text-sm ${gameWon ? 'bg-green-100 border-green-600 text-green-900' : 'bg-red-100 border-red-600 text-red-900'}`}>
                <p className="font-bold mb-1">{gameWon ? `🎉 Correct! ${player.name}` : `😢 Game Over! ${player.name}`}</p>
                {gameWon && <p className="text-xs">You guessed in {guesses.length} tries! 🔥 Streak: {streak}</p>}
                {gameLost && <p className="text-xs">Streak reset 😢</p>}
              </div>
            )}

            {(gameWon || gameLost) && (
              <div className="mb-6 p-4 bg-slate-100 rounded-lg border-2 border-slate-900">
                <p className="text-center font-bold text-slate-900 mb-3 text-sm">Share your result:</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <button onClick={() => share('twitter')} className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded font-bold text-sm">𝕏</button>
                  <button onClick={() => share('facebook')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm">f</button>
                  <button onClick={() => share('whatsapp')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-bold text-sm">💬</button>
                  <button onClick={() => share('copy')} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded font-bold text-sm">📋</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-100 rounded-lg p-2 text-center border-2 border-slate-900">
                <p className="text-slate-600 text-xs font-bold">GUESSES</p>
                <p className="text-xl font-black text-slate-900">{guesses.length}/{MAX_GUESSES}</p>
              </div>
              <div className="bg-slate-100 rounded-lg p-2 text-center border-2 border-slate-900">
                <p className="text-slate-600 text-xs font-bold">LEFT</p>
                <p className="text-xl font-black text-slate-900">{MAX_GUESSES - guesses.length}</p>
              </div>
              <div className="bg-slate-100 rounded-lg p-2 text-center border-2 border-slate-900">
                <p className="text-slate-600 text-xs font-bold">STATUS</p>
                <p className="text-lg font-black text-slate-900">{gameWon ? '✓' : gameLost ? '✗' : '▶'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
