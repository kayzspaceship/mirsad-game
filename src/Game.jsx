// ... (önceki kodu kopyala) ama recentScores.map kısmında:

{recentScores.length > 0 ? (
  recentScores.map((item, idx) => {
    const itemDate = new Date(item.date + 'T00:00:00');
    const today = new Date(date + 'T00:00:00');
    const isTodayScore = itemDate.getTime() === today.getTime();
    const isWin = item.score < MAX_GUESSES; // ← SADECE BUNU DEĞİŞTİR: item.score <='dan < yap
    return (
      <div key={idx} className="text-center text-xs">
        <p className="text-slate-500 flex items-center justify-center gap-1">
          {itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
          {isTodayScore && isWin && <span className="text-lg">🎉</span>}
        </p>
        <p className="text-sm font-black text-slate-900">{item.score}/8</p>
      </div>
    );
  })
) : (
  <p className="text-xs text-slate-400 text-center py-2">No games yet</p>
)}
