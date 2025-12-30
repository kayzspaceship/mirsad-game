import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
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
    // Load AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2906011828836821";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/:date" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

function GamePage() {
  const { date: dateParam } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState(dateParam || new Date().toLocaleDateString('en-CA'));
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    loadData();
  }, [date]);

  useEffect(() => {
    // Push AdSense ads
    if (window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch (e) {
        console.log('AdSense error:', e);
      }
    }
  }, [player]);

  const loadData = async () => {
    try {
      const savedPlayer = localStorage.getItem(`player_${date}`);
      if (savedPlayer) {
        setPlayer(JSON.parse(savedPlayer));
      } else {
        const q = query(collection(db, 'dailyPlayers'), where('date', '==', date));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const playerData = snapshot.docs[0].data();
          setPlayer(playerData);
          localStorage.setItem(`player_${date}`, JSON.stringify(playerData));
        }
      }

      const allPlayers = await getDocs(collection(db, 'players'));
      setPlayers(allPlayers.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const played = localStorage.getItem(`mirsad_played_${date}`);
      setHasPlayed(!!played);

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    navigate(`/${newDate}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <div className="date-navigation">
        <button onClick={() => handleDateChange(new Date(new Date(date + 'T00:00:00').getTime() - 86400000).toLocaleDateString('en-CA'))}>← Prev</button>
        <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        <button onClick={() => handleDateChange(new Date(new Date(date + 'T00:00:00').getTime() + 86400000).toLocaleDateString('en-CA'))} disabled={date === new Date().toLocaleDateString('en-CA')}>Next →</button>
      </div>

      {/* AdSense Banner Ad */}
      <div className="ad-container" style={{ textAlign: 'center', margin: '20px 0' }}>
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-2906011828836821"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
      </div>

      {player && <Game player={player} players={players} date={date} isToday={date === new Date().toLocaleDateString('en-CA')} hasPlayed={hasPlayed} />}

      {/* AdSense Sidebar Ad */}
      <div className="ad-container" style={{ textAlign: 'center', margin: '20px 0' }}>
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-2906011828836821"
          data-ad-slot="0987654321"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
      </div>
    </div>
  );
}
