import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';

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
      const selectedPlayerData = players.find(p => p.id === parseInt(selectedPlayer));
      await setDoc(doc(db, 'settings', selectedDate), {
        playerId: parseInt(selectedPlayer),
        date: selectedDate,
        playerName: selectedPlayerData.name
      });
      alert(`✅ ${selectedDate} için ${selectedPlayerData.name} ayarlandı!`);
      setSelectedPlayer('');
      setSearchQuery('');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  const minDate = new Date().toLocaleDateString('en-CA');
  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-CA');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-black text-slate-900 mb-6">📅 Admin Paneli</h2>

      <div className="bg-slate-100 p-6 rounded-lg border-2 border-slate-900">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Oyuncu Schedule</h3>

        {/* Tarih Seçimi */}
        <div className="mb-6">
          <label className="block font-bold text-slate-900 mb-2">Tarih Seç</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-4 py-3 border-2 border-slate-900 rounded text-slate-900 font-bold"
          />
          <p className="text-xs text-slate-600 mt-1">Seçilen Tarih: <span className="font-bold">{selectedDate}</span></p>
        </div>

        {/* Oyuncu Ara */}
        <div className="mb-6">
          <label className="block font-bold text-slate-900 mb-2">Oyuncu Ara</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Adını yazarak ara... (ör: Larkin)"
            className="w-full px-4 py-3 border-2 border-slate-900 rounded text-slate-900"
          />
        </div>

        {/* Oyuncu Seçimi */}
        <div className="mb-6">
          <label className="block font-bold text-slate-900 mb-2">Oyuncu Seç</label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-900 rounded text-slate-900 font-bold"
            size="5"
          >
            {selectedPlayer === '' && <option value="">-- Oyuncu Seçiniz --</option>}
            {filteredPlayers.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.team}) - {p.position}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-600 mt-1">
            {filteredPlayers.length} oyuncu bulundu
          </p>
        </div>

        {/* Seçilen Oyuncu Özeti */}
        {selectedPlayer && (
          <div className="mb-6 p-4 bg-green-100 border-2 border-green-600 rounded">
            {filteredPlayers.filter(p => p.id === parseInt(selectedPlayer)).map(p => (
              <div key={p.id}>
                <p className="font-bold text-green-900">{p.name}</p>
                <p className="text-sm text-green-800">
                  {p.team} • {p.position} • {p.age} yaş • {p.height}cm • {p.nationality}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Kaydet Butonu */}
        <button
          onClick={handleSetPlayer}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded mb-3 text-lg"
        >
          ✅ KAYDET
        </button>

        {/* Çıkış Butonu */}
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
        >
          🚪 Çıkış Yap
        </button>
      </div>

      {/* Bilgi */}
      <div className="mt-6 p-4 bg-blue-100 border-2 border-blue-600 rounded">
        <p className="text-sm text-blue-900">
          <span className="font-bold">💡 İpucu:</span> Seçtiğiniz tarih için oyuncu ayarlandığında, kullanıcılar o günün oyununu oynayabilecek. Her kullanıcı günde sadece 1 kez oyun oynayabilir.
        </p>
      </div>
    </div>
  );
}
