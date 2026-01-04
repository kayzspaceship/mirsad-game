import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './App.css';
import Game from './Game';

const firebaseConfig = {
  apiKey: "AIzaSyDmLoWcAl0pS3jYar2rZxSdrjKPIZNemNQ",
  authDomain: "mirsad-abe91.firebaseapp.com",
  projectId: "mirsad-abe91",
  storageBucket: "mirsad-abe91.firebasestorage.app",
  messagingSenderId: "725337354740",
  appId: "1:725337354740:web:aee7c1c2a9ac455e3f49a1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2906011828836821";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:date" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-CA');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center py-8">
      <div className="max-w-2xl w-full mx-auto px-4 text-center">
        <h1 className="text-6xl font-black text-white mb-4">🏀 MIRSAD</h1>
        <p className="text-xl text-slate-300 mb-8">Euroleague Player Guessing Game</p>
        <p className="text-slate-400 mb-12 text-lg">Guess the player in 8 tries!</p>
        
        <button
          onClick={() => navigate(`/${today}`)}
          className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-xl rounded-lg transition mb-8"
        >
          START TODAY'S GAME 🚀
        </button>

        <div className="bg-slate-700 border-2 border-slate-600 rounded-lg p-6 mt-8">
          <h2 className="text-white font-black text-lg mb-4">How to Play:</h2>
          <ul className="text-slate-300 space-y-2 text-left">
            <li>✓ You have 8 guesses</li>
            <li>✓ Green = Correct value</li>
            <li>✓ Yellow = Close (±3 age/height, ±1 jersey)</li>
            <li>✓ Red = Wrong</li>
            <li>✓ Arrows show direction (↑ higher, ↓ lower)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function GamePage() {
  const { date: dateParam } = useParams();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-CA');
  const [date, setDate] = useState(dateParam || today);
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (dateParam && dateParam !== date) {
      setDate(dateParam);
      checkHasPlayed(dateParam);
    }
  }, [dateParam, date]);

  const checkHasPlayed = (checkDate) => {
    const played = !!localStorage.getItem(`mirsad_played_${checkDate}`);
    setHasPlayed(played);
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let playerData = null;
      
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', date));
        if (settingsDoc.exists()) {
          const playerId = settingsDoc.data().playerId;
          const playerDoc = await getDoc(doc(db, 'players', String(playerId)));
          if (playerDoc.exists()) {
            playerData = {
              id: parseInt(playerDoc.id),
              ...playerDoc.data()
            };
          }
        }
      } catch (error) {
        console.error('Settings error:', error);
      }

      setPlayer(playerData || null);

      const allPlayers = await getDocs(collection(db, 'players'));
      setPlayers(allPlayers.docs.map(doc => ({ 
        id: parseInt(doc.id),
        ...doc.data() 
      })));

      checkHasPlayed(date);

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    navigate(`/${newDate}`);
  };

  const handlePrevDate = () => {
    const prevDate = new Date(new Date(date + 'T00:00:00').getTime() - 86400000);
    const prevDateStr = prevDate.toLocaleDateString('en-CA');
    handleDateChange(prevDateStr);
  };

  const handleNextDate = () => {
    const nextDate = new Date(new Date(date + 'T00:00:00').getTime() + 86400000);
    const nextDateStr = nextDate.toLocaleDateString('en-CA');
    if (nextDateStr <= today) {
      handleDateChange(nextDateStr);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <div className="date-navigation flex items-center justify-between px-4 py-3">
        <button onClick={handlePrevDate} className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 font-bold">← Prev</button>
        
        <div className="flex-1 flex flex-col items-center">
          <span className="text-lg font-bold text-slate-900">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <button onClick={handleHome} className="mt-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded font-bold text-sm">🏠 HOME</button>
        </div>
        
        <button onClick={handleNextDate} disabled={date >= today} className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 font-bold disabled:opacity-50">Next →</button>
      </div>
      {player && <Game player={player} players={players} date={date} isToday={date === today} hasPlayed={hasPlayed} onGameComplete={() => checkHasPlayed(date)} />}
      {!player && (
        <div className="text-center py-20">
          <p className="text-2xl text-slate-600 font-bold mb-2">📅</p>
          <p className="text-xl text-slate-600">This date game is not ready yet</p>
          <p className="text-slate-500 mt-2">Choose another date</p>
        </div>
      )}
    </div>
  );
}
