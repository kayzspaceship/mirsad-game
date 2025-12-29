import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Game from './Game';

export default function App() {
  const [players, setPlayers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playedDates, setPlayedDates] = useState({});

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2906011828836821';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersCollection = collection(db, 'players');
        const playersSnapshot = await getDocs(playersCollection);
        const playersList = playersSnapshot.docs.map(doc => ({
          id: parseInt(doc.id),
          ...doc.data()
        }));
        setPlayers(playersList.sort((a, b) => a.id - b.id));
      } catch (error) {
        console.error('Error loading players:', error);
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchPlayerForDate = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', selectedDate));
        
        if (settingsDoc.exists()) {
          const playerId = settingsDoc.data().playerId;
          const playerDoc = await getDoc(doc(db, 'players', String(playerId)));
          if (playerDoc.exists()) {
            setPlayer({
              id: parseInt(playerDoc.id),
              ...playerDoc.data()
            });
          }
        } else {
          setPlayer(null);
        }

        const played = localStorage.getItem(`mirsad_played_${selectedDate}`);
        setPlayedDates(prev => ({
          ...prev,
          [selectedDate]: !!played
        }));
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
    };

    if (players.length > 0) {
      fetchPlayerForDate();
    }
  }, [selectedDate, players]);

  const today = new Date().toLocaleDateString('en-CA');
  const minDate = '2025-12-29';

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const newDateStr = newDate.toLocaleDateString('en-CA');
    
    if (newDateStr <= today) {
      setSelectedDate(newDateStr);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <button
            onClick={() => changeDate(-1)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold text-lg transition"
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-black mb-2">🏀 MIRSAD</h1>
            <p className="text-slate-300 text-sm">{formatDate(selectedDate)}</p>
          </div>
          <button
            onClick={() => changeDate(1)}
            disabled={selectedDate >= today}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-xl text-slate-600">Loading...</p>
        </div>
      ) : player && players.length > 0 ? (
        <Game 
          player={player} 
          players={players} 
          date={selectedDate}
          isToday={selectedDate === today}
          hasPlayed={playedDates[selectedDate] || false}
        />
      ) : (
        <div className="text-center py-20">
          <p className="text-2xl text-slate-600 font-bold mb-2">📅</p>
          <p className="text-xl text-slate-600">No game scheduled for this date</p>
          <p className="text-slate-500 mt-2">Select another date</p>
        </div>
      )}
    </div>
  );
}
