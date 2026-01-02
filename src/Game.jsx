import React, { useState, useEffect } from 'react';

const MAX_GUESSES = 8;

export default function Game({ player, players, date, isToday, hasPlayed }) {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const savedShowImage = localStorage.getItem(`showImage_${date}`);
    if (savedShowImage === 'true') {
      setShowImage(true);
    }
  }, [date]);

  useEffect(() => {
    localStorage.setItem(`showImage_${date}`, showImage ? 'true' : 'false');
  }, [showImage, date]);

  const makeGuess = (selectedPlayer) => {
    if (isToday && hasPlayed && gameWon === false && gameLost === false) return;
    if (gameWon || gameLost) return;

    const newGuess = {
      name: selectedPlayer.name,
      position: selectedPlayer.position,
      age: selectedPlayer.age,
      height: selectedPlayer.height,
      team: selectedPlayer.team,
      nationality: selectedPlayer.nationality,
      isCorrect: selectedPlayer.id === player.id,
    };

    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');
    setSearchResults([]);

    if (newGuess.isCorrect) {
      setGameWon(true);
      setShowImage(true);
      localStorage.setItem(`mirsad_played_${date}`, 'true');
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameLost(true);
      localStorage.setItem(`mirsad_played_${date}`, 'true');
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

  const photoStyle = (gameWon || gameLost || showImage) ? { filter: 'brightness(1) saturate(1)' } : { filter: 'brightness(0)' };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-4xl font-black text-slate-900 mb-8 text-center">Today's Player</h2>
        
        <div className="mb-8 flex justify-center">
          <img src={player.imageUrl} alt="Player" style={{ width: '200px', height: '280px', objectFit: 'cover', ...photoStyle, borderRadius: '12px', border: '4px solid #1e293b' }} />
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
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-center">Team</th>
                  <th className="p-3 text-center">Pos</th>
                  <th className="p-3 text-center">Height</th>
                  <th className="p-3 text-center">Age</th>
                  <th className="p-3 text-center">Country</th>
                </tr>
              </thead>
              <tbody>
                {guesses.map((guess, idx) => (
                  <tr key={idx} className={guess.isCorrect ? 'bg-green-100' : 'bg-white border-b'}>
                    <td className="p-3 font-bold">{guess.name} {guess.isCorrect && '✓'}</td>
                    <td className={`p-3 text-center font-bold text-white ${guess.team === player.team ? 'bg-green-500' : 'bg-red-500'}`}>{guess.team}</td>
                    <td className={`p-3 text-center font-bold text-white ${guess.position === player.position ? 'bg-green-500' : 'bg-red-500'}`}>{guess.position}</td>
                    <td className={`p-3 text-center font-bold text-white ${guess.height === player.height ? 'bg-green-500' : 'bg-red-500'}`}>{guess.height}</td>
                    <td className={`p-3 text-center font-bold text-white ${guess.age === player.age ? 'bg-green-500' : 'bg-red-500'}`}>{guess.age}</td>
                    <td className={`p-3 text-center font-bold text-white ${guess.nationality === player.nationality ? 'bg-green-500' : 'bg-red-500'}`}>{guess.nationality.substring(0, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(gameWon || gameLost) && (
          <div className={`p-4 rounded mb-6 text-center border-2 ${gameWon ? 'bg-green-100 border-green-600 text-green-900' : 'bg-red-100 border-red-600 text-red-900'}`}>
            <p className="font-bold">{gameWon ? `🎉 Correct! ${player.name}` : `😢 Game Over! ${player.name}`}</p>
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
            <p className="text-xs font-bold">Silhouette</p>
            <p className="text-lg font-black">{showImage ? '100%' : '0%'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
