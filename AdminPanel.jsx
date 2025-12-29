import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

export default function AdminPanel({ players, onLogout }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState(players);

  useEffect(() => {
    const filtered = players.filter(p =>
      p.name.toUpperCase().includes(searchQuery.toUpperCase())
    );
    setFilteredPlayers(filtered);
  }, [searchQuery, players]);

  const handleSetPlayer = async () => {
    if (!selectedPlayer) {
      alert('Lütfen oyuncu seçin!');
      return;
    }

    try {
      await setDoc(doc(db, 'settings', selectedDate), {
        playerId: parseInt(selectedPlayer),
        date: selectedDate
      });
      alert(`✅ ${selectedDate} için ${filteredPlayers.find(p => p.id === parseInt(selectedPlayer))?.name} ayarlandı!`);
      setSelectedPlayer('');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  const minDate = new Date().toLocaleDateString('en-CA');
  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-CA');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-black text-slate-900 mb-6">Admin Paneli</h2>

      <div className="bg-slate-100 p-6 rounded-lg border-2 border-slate-900">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Oyuncu Schedule</h3>

        <div className="mb-4">
          <label className="block font-bold text-slate-900 mb-2">Tarih Seç</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-4 py-2 border-2 border-slate-900 rounded text-slate-900"
          />
        </div>

        <div className="mb-4">
          <label className="block font-bold text-slate-900 mb-2">Oyuncu Ara</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Oyuncu adı..."
            className="w-full px-4 py-2 border-2 border-slate-900 rounded text-slate-900"
          />
        </div>

        <div className="mb-4">
          <label className="block font-bold text-slate-900 mb-2">Oyuncu Seç</label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-900 rounded text-slate-900"
          >
            <option value="">-- Oyuncu Seçiniz --</option>
            {filteredPlayers.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.team}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSetPlayer}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded mb-4"
        >
          Kaydet
        </button>

        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
