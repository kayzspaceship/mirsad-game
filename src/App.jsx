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
        <Route path="/" element={<GamePage />} />
        <Route path="/:date" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
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
      const played = !!localStorage.getItem(`mirsad_played_${dateParam}`);
      setHasPlayed(played);
    }
  }, [dateParam]);

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

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    const played = !!localStorage.getItem(`mirsad_played_${newDate}`);
    setHasPlayed(played);
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <div className="date-navigation">
        <button onClick={handlePrevDate}>← Prev</button>
        <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        <button onClick={handleNextDate} disabled={date >= today}>Next →</button>
      </div>
      {player && <Game player={player} players={players} date={date} isToday={date === today} hasPlayed={hasPlayed} />}
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
