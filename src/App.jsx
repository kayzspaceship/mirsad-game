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
        console.error('Oyuncuları yükleme hatası:', error);
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
        console.error('Hata:', error);
      }
      setLoading(false);
    };

    if (players.length > 0) {
      fetchPlayerForDate();
    }
  }, [selectedDate, players]);

  const today = new Date().toLocaleDateString('en-CA');
  const minDate = '2025-12-29';
  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-CA');

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-3xl font-black">🏀 MIRSAD</h1>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="px-3 py-2 rounded bg-white text-slate-900 font-bold text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-xl text-slate-600">Yükleniyor...</p>
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
          <p className="text-xl text-slate-600">Bu tarih için oyun hazırlanmadı</p>
          <p className="text-slate-500 mt-2">Başka bir tarih seç</p>
        </div>
      )}
    </div>
  );
}
