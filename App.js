import React, { useState, useEffect } from 'react';

const API_URL = 'https://твой-бэкенд-на-railway.app'; 

function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [passive, setPassive] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [view, setView] = useState('game');

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    const webUserData = tg.initDataUnsafe?.user || { id: 'test_user', username: 'Guest' };

    fetch(`${API_URL}/api/user`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ tgId: webUserData.id.toString(), username: webUserData.username })
    })
    .then(r => r.json())
    .then(data => {
      setUser(data);
      setBalance(data.balance);
      setPassive(data.passiveIncome);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBalance(prev => prev + (passive / 10));
    }, 100);
    return () => clearInterval(timer);
  }, [passive]);

  const handleLevelUp = () => {
    const cost = Math.floor(100 * Math.pow(1.6, passive + 1));
    if (balance >= cost) {
      const newBalance = balance - cost;
      const newPassive = passive + 1;
      setBalance(newBalance);
      setPassive(newPassive);
      fetch(`${API_URL}/api/save`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ tgId: user.tgId, balance: newBalance, passiveIncome: newPassive })
      });
    }
  };

  const handleClick = (e) => {
    setBalance(prev => prev + 1);
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
  };

  if (!user) return <div className="text-white text-center mt-20">Загрузка...</div>;

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-6 text-white bg-[#0a0a0a]">
      {view === 'game' ? (
        <>
          <div className="flex justify-between w-full items-center">
            <div className="bg-[#1a1a1a] border border-yellow-600/30 p-2 px-4 rounded-full">
              ⭐ {user.username}
            </div>
            <button onClick={() => {
              fetch(`${API_URL}/api/leaderboard`).then(r => r.json()).then(setLeaderboard);
              setView('leader');
            }} className="bg-yellow-600 px-6 py-2 rounded-full font-bold">🏆 ТОП</button>
          </div>

          <div className="text-center">
            <h1 className="text-5xl font-black text-yellow-500">{Math.floor(balance).toLocaleString()}</h1>
            <p className="text-yellow-700">+{passive} в сек</p>
          </div>

          <button onClick={handleClick} className="relative w-72 h-72 rounded-full border-[6px] border-yellow-500 overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.3)] active:scale-95 transition-all">
            <img src="/hero.png" alt="Click" className="w-full h-full object-cover" />
          </button>

          <div className="w-full max-w-sm bg-[#151515] p-5 rounded-3xl border border-yellow-900/30">
            <button onClick={handleLevelUp} className="w-full bg-green-700 p-4 rounded-2xl flex justify-between items-center">
              <span>Прокачать доход</span>
              <span className="font-bold">💰 {Math.floor(100 * Math.pow(1.6, passive + 1))}</span>
            </button>
          </div>
        </>
      ) : (
        <div className="w-full max-w-md">
          <button onClick={() => setView('game')} className="mb-6 text-yellow-500">← Назад</button>
          <h2 className="text-2xl font-bold mb-4 text-center">Таблица лидеров</h2>
          <div className="space-y-2">
            {leaderboard.map((u, i) => (
              <div key={i} className="flex justify-between p-4 bg-[#1a1a1a] rounded-xl border border-white/5">
                <span>{i+1}. @{u.username}</span>
                <span className="text-yellow-400 font-bold">{Math.floor(u.balance)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;