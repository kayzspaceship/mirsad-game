import React, { useState, useEffect } from 'react';

const MAX_GUESSES = 8;

const countryEmojis = {
  'Turkey': '🇹🇷 Turkey',
  'Turkiye': '🇹🇷 Turkey',
  'United States': '🇺🇸 United States',
  'USA': '🇺🸺🇸 United States',
  'France': '🇫🇷 France',
  'Germany': '🇩🇪 Germany',
  'Spain': '🇪🇸 Spain',
  'Italy': '🇮🇹 Italy',
  'Greece': '🇬🇷 Greece',
  'Poland': '🇵🇱 Poland',
  'Serbia': '🇷🇸 Serbia',
  'Croatia': '🇭🇷 Croatia',
  'Russia': '🇷🇺 Russia',
  'Israel': '🇮🇱 Israel',
  'Lithuania': '🇱🇹 Lithuania',
  'Latvia': '🇱🇻 Latvia',
  'Estonia': '🇪🇪 Estonia',
  'Czech Republic': '🇨🇿 Czech Republic',
  'Hungary': '🇭🇺 Hungary',
  'Romania': '🇷🇴 Romania',
  'Bulgaria': '🇧🇬 Bulgaria',
  'Slovenia': '🇸🇮 Slovenia',
  'Montenegro': '🇲🇪 Montenegro',
  'Bosnia and Herzegovina': '🇧🇦 Bosnia',
  'North Macedonia': '🇲🇰 North Macedonia',
  'Albania': '🇦🇱 Albania',
  'Slovakia': '🇸🇰 Slovakia',
  'Belgium': '🇧🇪 Belgium',
  'Netherlands': '🇳🇱 Netherlands',
  'Portugal': '🇵🇹 Portugal',
  'United Kingdom': '🇬🇧 United Kingdom',
  'Canada': '🇨🇦 Canada',
  'Australia': '🇦🇺 Australia',
  'New Zealand': '🇳🇿 New Zealand',
  'Japan': '🇯🇵 Japan',
  'China': '🇨🇳 China',
  'South Korea': '🇰🇷 South Korea',
  'Brazil': '🇧🇷 Brazil',
  'Argentina': '🇦🇷 Argentina',
  'Mexico': '🇲🇽 Mexico',
  'Senegal': '🇸🇳 Senegal',
  'Nigeria': '🇳🇬 Nigeria',
  'Egypt': '🇪🇬 Egypt',
  'United States of America': '🇺🇸 United States'
};

export default function Game({ player, players, date, isToday, hasPlayed }) {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showImage, setShowImage] = useState(false);

  const gameStateKey = `gameState_${date}`;
  const showImageKey = `showImage_${date}`;
  const playedKey = `mirsad_played_${date}`;

  useEffect(() => {
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

    if (savedShowImage === 'true') {
      setShowImage(true);
    } else {
      setShowImage(false);
    }
  }, [date, gameStateKey, showImageKey]);

  useEffect(() => {
    const state = { guesses, gameWon, gameLost };
    localStorage.setItem(gameStateKey, JSON.stringify(state));
  }, [guesses, gameWon, gameLost, gameStateKey]);

  useEffect(() => {
    localStorage.setItem(showImageKey, showImage ? 'true' : 'false');
  }, [showImage, showImageKey]);

  const makeGuess = (selectedPlayer) => {
    if (isToday && hasPlayed) return;
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
      if (isToday) {
        localStorage.setItem(playedKey, 'true');
      }
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameLost(true);
      if (isToday) {
        localStorage.setItem(playedKey, 'true');
      }
    }
  };

  const handleSearch = (value) => {
    if (isToday && hasPlayed) return;
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

  const photoStyle = (gameWon || gameLost || showImage) ? { filter: 'brightness(1) saturate(1)' } : { filter: 'brightness(0)' };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-4xl font-black text-slate-900 mb-8 text-center">Today's Player</h2>
        
        <div className="mb-8 flex justify-center">
          <img src={player.imageUrl} alt="Player" style={{ width: '200px', height: '280px', objectFit: 'cover', ...photoStyle, borderRadius: '12px', border: '4px solid #1e293b', transition: 'all 0.5s' }} />
        </div>

        {!isToday && <div className="mb-6 p-4 bg-slate-200 rounded text-center text-slate-900 font-bold">📅 Past Game - View Only</div>}
        {isToday && hasPlayed && <div className="mb-6 p-4 bg-yellow-100 rounded text-center text-yellow-900 font-bold">😊 Already played today!</div>}

        {(!isToday || !hasPlayed) && !gameWon && !gameLost && (
          <div className="mb-6">
            <input type="text" value={currentGuess} onChange={(e) => handleSearch(e.target.value)} placeholder="Type player name..." className="w-full px-4 py-3 border-2 border-slate-900 rounded text-slate-900" />
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
                  <th className="p-2 text-center hidden sm:table-cell">Team</th>
                  <th className="p-2 text-center sm:hidden">T</th>
                  <th className="p-2 text-center">Pos</th>
                  <th className="p-2 text-center">Ht</th>
                  <th className="p-2 text-center">Age</th>
                  <th className="p-2 text-center">Jsy</th>
                  <th className="p-2 text-center">Ctry</th>
                </tr>
              </thead>
              <tbody>
                {guesses.map((guess, idx) => (
                  <tr key={idx} className={guess.isCorrect ? 'bg-green-100' : 'bg-white border-b'}>
                    <td className="p-2 font-bold text-slate-900">{guess.name} {guess.isCorrect && '✓'}</td>
                    <td className={`p-2 text-center font-bold text-white hidden sm:table-cell ${getCellColor(guess.team === player.team)}`}>{guess.team}</td>
                    <td className={`p-2 text-center font-bold text-white sm:hidden text-xs ${getCellColor(guess.team === player.team)}`}>{guess.teamAbbr}</td>
                    <td className={`p-2 text-center font-bold text-white ${getCellColor(guess.position === player.position)}`}>{guess.position}</td>
                    <td className={`p-2 text-center font-bold text-white text-xs ${getCellColor(guess.height === player.height, Math.abs(guess.height - player.height) <= 3)}`}>{getArrow(guess.height, player.height)} {guess.height}</td>
                    <td className={`p-2 text-center font-bold text-white ${getCellColor(guess.age === player.age, Math.abs(guess.age - player.age) <= 3)}`}>{getArrow(guess.age, player.age)} {guess.age}</td>
                    <td className={`p-2 text-center font-bold text-white text-xs ${getCellColor(guess.jerseyNumber === player.jerseyNumber, Math.abs(guess.jerseyNumber - player.jerseyNumber) <= 1)}`}>{getArrow(guess.jerseyNumber, player.jerseyNumber)} {guess.jerseyNumber}</td>
                    <td className={`p-2 text-center font-bold text-white text-sm ${getCellColor(guess.nationality === player.nationality)}`}>{getCountryFlag(guess.nationality)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(gameWon || gameLost) && (
          <div className={`p-4 rounded mb-6 text-center border-2 font-bold ${gameWon ? 'bg-green-100 border-green-600 text-green-900' : 'bg-red-100 border-red-600 text-red-900'}`}>
            {gameWon ? `🎉 Correct! ${player.name}` : `😢 Game Over! ${player.name}`}
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
            <p className="text-lg font-black">{showImage ? '👁' : '🔒'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
