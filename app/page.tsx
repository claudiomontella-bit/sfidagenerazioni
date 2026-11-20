'use client';
import { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from '../lib/supabase';

export default function HostPage() {
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState<any>({ status: 'lobby' });
  const [players, setPlayers] = useState<any[]>([]);
  const [deck, setDeck] = useState<any[]>(QUESTIONS);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState('');
  const [audioStatus, setAudioStatus] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [dbError, setDbError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastStatusRef = useRef('lobby');

  const callApi = async (payload: any) => {
    const res = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  useEffect(() => {
    setDeck([...QUESTIONS].sort(() => Math.random() - 0.5));
    callApi({ action: 'create' }).then((res) => {
      if (res.error) setDbError(res.error);
      if (res.room) {
        setRoomCode(res.room.id);
        setRoom(res.room);
      }
    });
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    const timer = setInterval(async () => {
      const res = await callApi({ action: 'state', code: roomCode });
      if (res.room) {
        if (res.room.status === 'buzzed' && lastStatusRef.current !== 'buzzed' && audioRef.current) {
          audioRef.current.pause();
        }
        lastStatusRef.current = res.room.status;
        setRoom(res.room);
      }
      if (Array.isArray(res.players)) setPlayers(res.players);
    }, 1500);
    return () => clearInterval(timer);
  }, [roomCode]);

  const startRound = async (idx: number) => {
    setShowAnswer(false);
    setDbError('');
    setAudioStatus('Caricamento brano...');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audioRef.current.play().catch(() => {});
    }
    const activeDeck = deck.length > 0 ? deck : QUESTIONS;
    const q = activeDeck[idx % activeDeck.length];
    setCurrentCategory(q.category || 'Musica');

    const res = await callApi({ action: 'start', code: roomCode, round: idx + 1, question: q });
    if (res.error) {
      setDbError(res.error);
      return;
    }
    if (res.room) {
      lastStatusRef.current = 'playing';
      setRoom(res.room);
    }
    if (res.previewUrl && audioRef.current) {
      audioRef.current.src = res.previewUrl;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setAudioStatus('Brano in riproduzione!'))
        .catch(() => setAudioStatus('Premi Play sulla barra qui sotto'));
    } else {
      setAudioStatus('Anteprima non disponibile: premi Salta Brano');
    }
  };

  const handleScore = async (correct: boolean) => {
    const buzzer = players.find((p) => p.id === room?.buzzed_player_id);
    if (correct && buzzer) {
      const isCrossGen = buzzer.era !== room.current_era;
      await callApi({ action: 'score', code: roomCode, correct: true, playerId: buzzer.id, isCrossGen });
      setShowAnswer(true);
    } else {
      await callApi({ action: 'score', code: roomCode, correct: false });
      lastStatusRef.current = 'playing';
      setRoom((prev: any) => ({ ...prev, status: 'playing', buzzed_player_id: null }));
      audioRef.current?.play().catch(() => {});
    }
  };

  const finishGame = async () => {
    if (audioRef.current) audioRef.current.pause();
    await callApi({ action: 'finish', code: roomCode });
    lastStatusRef.current = 'finished';
    setRoom((prev: any) => ({ ...prev, status: 'finished' }));
  };

  const joinUrl = typeof window !== 'undefined' && roomCode ? `${window.location.origin}/play/${roomCode}` : '';
  const qrSrc = joinUrl ? `https://qrserver.com{encodeURIComponent(joinUrl)}` : '';
  const buzzedPlayer = players.find((p) => p.id === room?.buzzed_player_id);

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
            {qrSrc && <img src={qrSrc} alt="QR Code" width={200} height={200} />}
          </div>
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-2">Inquadra per entrare!</h2>
            <p className="text-sm text-red-100 mb-6">Scegli la tua generazione e preparati a prenotarti.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {players.map((p) => (
                <span key={p.id} className="bg-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {p.name} ({p.era})
                </span>
              ))}
            </div>
            <button
              onClick={() => startRound(0)}
              disabled={players.length === 0}
              className="w-full bg-amber-400 disabled:opacity-40 text-red-950 font-black py-4 px-8 rounded-2xl text-xl"
            >
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
              <button
                onClick={() => { const next = questionIndex + 1; setQuestionIndex(next); startRound(next); }}
                className="mt-6 bg-white/20 text-white px-4 py-2 rounded-xl text-sm"
              >
                Salta Brano
              </button>
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
                <div className="flex justify-center gap-4 mt-6">
                  <button onClick={() => handleScore(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold">
                    Indovinato!
                  </button>
                  <button onClick={() => handleScore(false)} className="bg-red-700 text-white px-6 py-3 rounded-xl font-bold">
                    Sbagliato
                  </button>
                </div>
              )}
            </div>
          )}

          {showAnswer && (
            <div className="mt-6">
              <p className="text-xl font-bold text-emerald-300 mb-4">Soluzione: {room.current_song_query}</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={() => { const next = questionIndex + 1; setQuestionIndex(next); startRound(next); }}
                  className="bg-white text-red-950 font-black px-8 py-3 rounded-xl text-lg"
                >
                  Prossimo Round
                </button>
                <button
                  onClick={finishGame}
                  className="bg-amber-400 text-red-950 font-bold px-6 py-3 rounded-xl text-lg"
                >
                  Podio Finale
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {room?.status === 'finished' && (
        <div className="w-full max-w-xl bg-white/10 p-8 rounded-3xl text-center border border-amber-400/50">
          <h2 className="text-3xl font-black mb-6">CLASSIFICA FINALE</h2>
          <div className="space-y-3 mb-8">
            {players.map((p, i) => (
              <div key={p.id} className={`p-4 rounded-2xl flex justify-between items-center ${i === 0 ? 'bg-amber-400 text-red-950 font-black text-xl' : 'bg-black/30 font-bold'}`}>
                <span>{i + 1}. {p.name} ({p.era})</span>
                <span>{p.score} pt</span>
              </div>
