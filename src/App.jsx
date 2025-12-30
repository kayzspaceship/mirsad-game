// ... (başındaki kodları kopyala, ama şu kısımları değiştir):

useEffect(() => {
  const loadGame = async () => {
    try {
      // Önceki oyuncuyu localStorage'dan kontrol et
      const savedPlayer = localStorage.getItem(`player_${date}`);
      if (savedPlayer) {
        setPlayer(JSON.parse(savedPlayer));
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'dailyPlayers'), where('date', '==', date));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const playerData = snapshot.docs[0].data();
        setPlayer(playerData);
        // localStorage'a kaydet
        localStorage.setItem(`player_${date}`, JSON.stringify(playerData));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  loadGame();
}, [date]);

// Refresh sonrası bildiğim oyuncu saklı kalsın
useEffect(() => {
  if (gameWon && guesses.length > 0) {
    localStorage.setItem(`player_${date}`, JSON.stringify(player));
  }
}, [gameWon, guesses, date, player]);
