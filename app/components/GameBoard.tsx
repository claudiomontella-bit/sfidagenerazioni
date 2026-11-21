'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function GameBoard({
  roomCode, room, players, currentCategory, audioStatus,
  showAnswer, dbError, audioRef, joinUrl, onStartRound,
  onSkip, onScore, onFinish
}: any) {
  const [peekAnswer, setPeekAnswer] = useState(false);

  useEffect(() => {
    setPeekAnswer(false);
  }, [room?.current_round, room?.status]);

  const buzzedPlayer = players.find((p: any) => p.id === room?.buzzed_player_id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-emerald-950 text-white p-8 flex flex-col items-center justify-between">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold">SFIDA GENERAZIONI</h1>
        <p className="text-red-200 mt-1">
          Codice Stanza: <span className="font-mono font-bold text-2xl text-amber-300">{roomCode || '...'}</span>
        </p>
        {dbError && <p className="mt-2 bg-black/60 text-amber-300 px-4 py-2 rounded-lg text-sm">{dbError}</p>}
      </header>

      <div className={room?.status === 'playing' || room?.status === 'buzzed' ? 'w-full max-w-md text-center my-2' : 'hidden'}>
        <audio ref={audioRef} controls className="w-full rounded-xl" />
        {audioStatus && <p className="text-xs text-amber-200 mt-1">{audioStatus}</p>}
      </div>

      {room?.status === 'lobby' && (
        <div className="bg-white/10 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-10 border border-white/20">
          <div className="bg-white p-4 rounded-2xl">
            {joinUrl && <QRCodeSVG value={joinUrl} size={200} />}
          </div>
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-2">Inquadra per entrare!</h2>
            <p className="text-sm text-red-100 mb-6">Scegli la tua generazione e preparati a prenotarti.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {players.map((p: any) => (
                <span key={p.id} className="bg-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {p.name} ({p.era})
                </span>
              ))}
            </div>
            <button onClick={onStartRound} disabled={players.length === 0} className="w-full bg-amber-400 disabled:opacity-40 text-red-950 font-black py-4 px-8 rounded-2xl text-xl">
              INIZIA LA SFIDA ({players.length} giocatori)
            </button>
          </div>
        </div>
      )}

      {(room?.status === 'playing' || room?.status === 'buzzed') && (
        <div className="w-full max-w-2xl bg-white/10 p-8 rounded-3xl text-center border border-white/20">
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="bg-amber-400 text-red-950 font-bold px-4 py-1 rounded-full text-sm uppercase">
              Round {room.current_round} - Epoca: Anni {room.current_era}
            </span>
            {currentCategory && (
              <span className="bg-emerald-600 text-white font-bold px-4 py-1 rounded-full text-sm uppercase">
                {currentCategory}
              </span>
            )}
          </div>

          {room.status === 'playing' && (
            <div className="my-8">
              <p className="text-2xl font-bold mt-4">Ascolta e premi il pulsante sul tuo telefono!</p>
              <div className="flex justify-center gap-3 mt-6 flex-wrap">
                <button onClick={() => setPeekAnswer(!peekAnswer)} className="bg-black/40 text-amber-200 px-4 py-2 rounded-xl text-sm">
                  {peekAnswer ? 'Nascondi Titolo' : 'Svela Titolo (Arbitro)'}
                </button>
                <button onClick={onSkip} className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm">
                  Salta Brano
                </button>
              </div>
              {peekAnswer && (
                <p className="mt-4 bg-black/60 text-amber-300 font-bold px-4 py-2 rounded-xl inline-block">
                  {room.current_song_query}
                </p>
              )}
            </div>
          )}

          {room.status === 'buzzed' && buzzedPlayer && (
            <div className="my-8 bg-amber-400 text-red-950 p-6 rounded-2xl">
              <p className="text-sm uppercase font-bold">Si e prenotato per primo:</p>
              <p className="text-4xl font-black my-2">{buzzedPlayer.name}</p>
              {buzzedPlayer.era !== room.current_era && (
                <span className="inline-block bg-red-900 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                  BONUS DOPPIO PUNTEGGIO
                </span>
              )}
              {!showAnswer && (
                <div className="mt-6">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => onScore(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold">Indovinato!</button>
                    <button onClick={() => onScore(false)} className="bg-red-700 text-white px-6 py-3 rounded-xl font-bold">Sbagliato</button>
                  </div>
                  <div className="mt-4">
                    <button onClick={() => setPeekAnswer(!peekAnswer)} className="bg-red-950/20 text-red-950 px-4 py-1.5 rounded-lg text-xs font-bold underline">
                      {peekAnswer ? 'Nascondi soluzione' : 'Svela soluzione per l arbitro'}
                    </button>
                    {peekAnswer && (
                      <p className="mt-2 bg-red-950 text-amber-300 font-bold px-4 py-2 rounded-xl text-sm">
                        {room.current_song_query}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {showAnswer && (
            <div className="mt-6">
              <p className="text-xl font-bold text-emerald-300 mb-4">Soluzione: {room.current_song_query}</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button onClick={onSkip} className="bg-white text-red-950 font-black px-8 py-3 rounded-xl text-lg">Prossimo Round</button>
                <button onClick={onFinish} className="bg-amber-400 text-red-950 font-bold px-6 py-3 rounded-xl text-lg">Podio Finale</button>
              </div>
            </div>
          )}
        </div>
      )}

      {room?.status === 'finished' && (
        <div className="w-full max-w-xl bg-white/10 p-8 rounded-3xl text-center border border-amber-400/50">
          <h2 className="text-3xl font-black mb-6">CLASSIFICA FINALE</h2>
          <div className="space-y-3 mb-8">
            {players.map((p: any, i: number) => (
              <div key={p.id} className={i === 0 ? 'p-4 rounded-2xl flex justify-between items-center bg-amber-400 text-red-950 font-black text-xl' : 'p-4 rounded-2xl flex justify-between items-center bg-black/30 font-bold'}>
                <span>{i + 1}. {p.name} ({p.era})</span>
                <span>{p.score} pt</span>
              </div>
            ))}
          </div>
          <button onClick={() => window.location.reload()} className="bg-white text-red-950 font-black px-8 py-3 rounded-xl text-lg">Nuova Partita</button>
        </div>
      )}

      <footer className="w-full max-w-2xl flex justify-center gap-4 flex-wrap">
        {players.map((p: any) => (
          <div key={p.id} className="bg-black/30 px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="font-bold">{p.name}:</span>
            <span className="text-amber-300 font-mono font-bold">{p.score} pt</span>
          </div>
        ))}
      </footer>
    </main>
  );
}
