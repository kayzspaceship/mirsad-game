import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

export default function AdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [players, setPlayers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      } catch (error) {
        console.error('Oyuncuları yükleme hatası:', error);
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    const filtered = players.filter(p =>
      p.name.toUpperCase().includes(searchQuery.toUpperCase())
    );
    setFilteredPlayers(filtered);
  }, [searchQuery, players]);

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsLoggedIn(true);
      setPassword('');
    } else {
      alert('Şifre yanlış!');
      setPassword('');
    }
  };

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

  const minDate = '2025-12-29';
  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-CA');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-slate-600">Yükleniyor...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
          <h1 className="text-4xl font-black text-slate-900 mb-2 text-center">🏀 MIRSAD</h1>
          <p className="text-slate-600 text-center mb-6">Admin Paneli</p>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Şifre..."
            className="w-full px-4 py-3 border-2 border-slate-900 rounded-lg mb-4 text-slate-900 font-bold"
            autoFocus
          />
          
          <button
            onClick={handleLogin}
            className="w-full px-4 py-3 bg-slate-900 hover:bg-black text-white rounded-lg font-bold transition"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-slate-900">📅 Admin Paneli</h1>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
          >
            Çıkış
          </button>
        </div>

        <div className="bg-slate-100 p-6 rounded-lg border-2 border-slate-900">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Oyuncu Schedule</h2>

          {/* Tarih Seçimi */}
          <div className="mb-6">
            <label className="block font-bold text-slate-900 mb-2">Tarih Seç</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="w-full px-4 py-3 border-2 border-slate-900 rounded-lg text-slate-900 font-bold"
            />
            <p className="text-xs text-slate-600 mt-2">
              Seçilen Tarih: <span className="font-bold text-slate-900">{selectedDate}</span>
            </p>
          </div>

          {/* Oyuncu Ara */}
          <div className="mb-6">
            <label className="block font-bold text-slate-900 mb-2">Oyuncu Ara</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Adını yazarak ara... (ör: Larkin)"
              className="w-full px-4 py-3 border-2 border-slate-900 rounded-lg text-slate-900"
            />
          </div>

          {/* Oyuncu Seç */}
          <div className="mb-6">
            <label className="block font-bold text-slate-900 mb-2">Oyuncu Seç</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-900 rounded-lg text-slate-900 font-bold"
              size="6"
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
                  <p className="font-black text-green-900 text-lg">{p.name}</p>
                  <p className="text-sm text-green-800">
                    {p.team} • {p.position} • {p.age} yaş • {p.height}cm • {p.nationality}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Kaydet */}
          <button
            onClick={handleSetPlayer}
            className="w-full px-4 py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-lg mb-3 text-lg transition"
          >
            ✅ KAYDET
          </button>
        </div>

        {/* Bilgi */}
        <div className="mt-6 p-4 bg-blue-100 border-2 border-blue-600 rounded">
          <p className="text-sm text-blue-900">
            <span className="font-bold">💡 Bilgi:</span> Seçtiğiniz tarih için oyuncu ayarlandığında, kullanıcılar o tarihi seçerek oyunu oynayabilecek.
          </p>
        </div>
      </div>
    </div>
  );
}
