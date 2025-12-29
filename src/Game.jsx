import React, { useState } from 'react';

const MAX_GUESSES = 8;

const countryNames = {
  'Turkey': 'Turkey',
  'Turkiye': 'Turkey',
  'United States of America': 'United States',
  'USA': 'United States',
  'France': 'France',
  'Germany': 'Germany',
  'Spain': 'Spain',
  'Italy': 'Italy',
  'Greece': 'Greece',
  'Poland': 'Poland',
  'Serbia': 'Serbia',
  'Croatia': 'Croatia',
  'Russia': 'Russia',
  'Israel': 'Israel',
  'Lithuania': 'Lithuania',
  'Latvia': 'Latvia',
  'Estonia': 'Estonia',
  'Czech Republic': 'Czech Republic',
  'Hungary': 'Hungary',
  'Romania': 'Romania',
  'Bulgaria': 'Bulgaria',
  'Slovenia': 'Slovenia',
  'Montenegro': 'Montenegro',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
  'Macedonia': 'North Macedonia',
  'North Macedonia': 'North Macedonia',
  'Albania': 'Albania',
  'Slovakia': 'Slovakia',
  'Belgium': 'Belgium',
  'Netherlands': 'Netherlands',
  'Portugal': 'Portugal',
  'UK': 'United Kingdom',
  'United Kingdom': 'United Kingdom',
  'England': 'United Kingdom',
  'Canada': 'Canada',
  'Australia': 'Australia',
  'New Zealand': 'New Zealand',
  'Japan': 'Japan',
  'China': 'China',
  'South Korea': 'South Korea',
  'Brazil': 'Brazil',
  'Argentina': 'Argentina',
  'Mexico': 'Mexico',
  'Senegal': 'Senegal',
  'Nigeria': 'Nigeria',
  'Egypt': 'Egypt'
};

export default function Game({ player, players, date, isToday, hasPlayed }) {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [colorBlindMode, setColorBlindMode] = useState(false);

  const makeGuess = (selectedPlayer) => {
    if (gameWon || gameLost) return;

    const newGuess = {
      name: selectedPlayer.name,
      position: selectedPlayer.position,
      age: selectedPlayer.age,
      height: selectedPlayer.height,
      team: selectedPlayer.team,
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
      localStorage.setItem(`mirsad_played_${date}`, 'true');
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
    result += gameWon ? '✅ I guessed it!' : gameLost ? '❌ Game Over!' : '';
    result += '\n\nmirsad.vercel.app';
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

  const getJerseyIndicator = (guessJersey, correctJersey) => {
    if (guessJersey === correctJersey) return '=';
    return guessJersey < correctJersey ? '↑' : '↓';
  };

  const getCountryName = (country) => {
    return countryNames[country] || country;
  };

  const getRowColor = (guess) => {
    if (colorBlindMode) {
      if (guess.position === player.position) return 'bg-blue-200';
      if (guess.age === player.age) return 'bg-blue-200';
      if (guess.height === player.height) return 'bg-blue-200';
      if (guess.team === player.team) return 'bg-blue-200';
      if (guess.nationality === player.nationality) return 'bg-blue-200';
      if (guess.jerseyNumber === player.jerseyNumber) return 'bg-blue-200';
      return 'bg-orange-200';
    }
    return guess.isCorrect ? 'bg-green-100' : 'bg-white border-b border-slate-200';
  };

  const getCellColor = (isCorrect, isClose = false) => {
    if (colorBlindMode) {
      return isCorrect ? 'bg-blue-500' : isClose ? 'bg-amber-500' : 'bg-orange-500';
    }
    return isCorrect ? 'bg-green-500' : isClose ? 'bg-yellow-400' : 'bg-red-500';
  };

  const canPlay = !isToday || !hasPlayed;

  const photoStyle = (gameWon || gameLost) 
    ? {
        filter: 'brightness(1) saturate(1)',
        opacity: 1
      }
    : {
        filter: 'brightness(0)',
        opacity: 1
      };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8 flex justify-between items-center">
          <h2 className="text-4xl font-black text-slate-900 flex-1">Today's Player</h2>
          <button
            onClick={() => setColorBlindMode(!colorBlindMode)}
            className={`px-3 py-2 rounded text-sm font-bold transition ${
              colorBlindMode 
                ? 'bg-amber-500 text-white' 
                : 'bg-slate-200 text-slate-900'
            }`}
          >
            🎨 {colorBlindMode ? 'Normal' : 'Color Blind'}
          </button>
        </div>
        <p className="text-slate-600 text-center mb-8">How many guesses to find the player?</p>

        <div className="mb-8 flex justify-center">
          <div className="relative w-48 h-64 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-white">
            {player.imageUrl && (
              <img
                src={player.imageUrl}
                alt="Player"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  ...photoStyle,
                  transition: 'all 0.5s ease-in-out'
                }}
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
          <div className="mb-6 overflow-x-auto border-2 border-slate-900 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3 text-left font-black border-r border-slate-700">Name</th>
                  <th className="p-3 text-left font-black border-r border-slate-700">Team</th>
                  <th className="p-3 text-left font-black border-r border-slate-700">Position</th>
                  <th className="p-3 text-left font-black border-r border-slate-700">Height</th>
                  <th className="p-3 text-left font-black border-r border-slate-700">Age</th>
                  <th className="p-3 text-left font-black border-r border-slate-700">Jersey</th>
                  <th className="p-3 text-left font-black">Country</th>
                </tr>
              </thead>
              <tbody>
                {guesses.map((guess, idx) => (
                  <tr key={idx} className={getRowColor(guess)}>
                    <td className="p-3 font-bold text-slate-900 border-r border-slate-200">
                      {guess.name}
                      {guess.isCorrect && <span className="text-green-600 ml-2">✓</span>}
                    </td>
                    <td className={`p-3 font-bold text-white border-r border-slate-200 ${getCellColor(guess.team === player.team)}`}>
                      {guess.team}
                    </td>
                    <td className={`p-3 font-bold text-white border-r border-slate-200 ${getCellColor(guess.position === player.position)}`}>
                      {guess.position}
                    </td>
                    <td className={`p-3 font-bold text-white border-r border-slate-200 ${getCellColor(guess.height === player.height, Math.abs(guess.height - player.height) <= 3)}`}>
                      {getJerseyIndicator(guess.height, player.height)} {getJerseyIndicator(guess.height, player.height)} {guess.height}cm
                    </td>
                    <td className={`p-3 font-bold text-white border-r border-slate-200 ${getCellColor(guess.age === player.age, Math.abs(guess.age - player.age) <= 3)}`}>
                      {guess.age}
                    </td>
                    <td className={`p-3 font-bold text-white border-r border-slate-200 ${getCellColor(guess.jerseyNumber === player.jerseyNumber, Math.abs(guess.jerseyNumber - player.jerseyNumber) <= 1)}`}>
                      #{guess.jerseyNumber} {getJerseyIndicator(guess.jerseyNumber, player.jerseyNumber)}
                    </td>
                    <td className={`p-3 font-bold text-white ${getCellColor(guess.nationality === player.nationality)}`}>
                      {getCountryName(guess.nationality)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(gameWon || gameLost) && (
          <div className={`p-4 rounded-lg mb-6 text-center border-2 text-sm ${gameWon ? 'bg-green-100 border-green-600 text-green-900' : 'bg-red-100 border-red-600 text-red-900'}`}>
            <p className="font-bold mb-1">{gameWon ? `🎉 Correct! ${player.name}` : `😢 Game Over! ${player.name}`}</p>
            {gameWon && <p className="text-xs">You guessed in {guesses.length} tries!</p>}
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

        <div className="grid grid-cols-4 gap-2">
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
          <div className="bg-slate-100 rounded-lg p-2 text-center border-2 border-slate-900">
            <p className="text-slate-600 text-xs font-bold">REVEAL</p>
            <p className="text-lg font-black text-slate-900">{gameWon || gameLost ? '100%' : '0%'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
