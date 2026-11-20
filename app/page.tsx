'use client';
import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, QUESTIONS } from '../lib/supabase';
import { Trophy, Volume2, Sparkles, Check, X } from 'lucide-react';

export default function HostPage() {
  const [roomCode, setRoomCode] = useState<string>('');
  const [room, setRoom] = useState<any>({ status: 'lobby' });
  const [players, setPlayers] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [audioStatus, setAudioStatus] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomCode(code);

    supabase
      .from('rooms')
      .insert({ id: code, status: 'lobby' })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          setDbError(error.message);
        } else if (data) {
          setRoom(data);
        }
      });

    const channel = supabase
      .channel(`room-${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${code}` }, (payload) => {
        setRoom(payload.new);
        if ((payload.new as any).status === 'buzzed' && audioRef.current) {
          audioRef.current.pause();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${code}` }, () => {
        fetchPlayers(code);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPlayers = async (code: string) => {
    const { data } = await supabase.from('players').select('*').eq('room_id', code).order('score', { ascending: false });
    if (data) setPlayers(data);
  };

  const startRound = async (idx: number) => {
    setShowAnswer(false);
    setDbError(null);
    setAudioStatus('Caricamento brano...');

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audioRef.current.play().catch(() => {});
    }

    const q = QUESTIONS[idx % QUESTIONS.length];
    let preview: string | null = null;

    try {
      const res = await fetch(`/api/audio?q=${encodeURIComponent(q.query)}`);
      const json = await res.json();
      preview = json.previewUrl || null;
    } catch {
      setAudioStatus('Errore rete audio');
    }

    const nextRoomState = {
      status: 'playing',
      current_round: idx + 1,
      buzzed_player_id: null,
      current_song_query: q.answer,
      current_era: q.era,
    };

    const { error } = await supabase.from('rooms').update(nextRoomState).eq('id', roomCode);
    if (error) {
      setDbError(error.message);
      return;
    }

    setRoom((prev: any) => ({ ...prev, ...nextRoomState }));

    if (preview && audioRef.current) {
      audioRef.current.src = preview;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setAudioStatus('Brano in riproduzione!'))
        .catch(() => setAudioStatus('Premi Play sulla barra qui sotto'));
    } else {
      setAudioStatus('Anteprima non disponibile per questo brano');
    }
  };

  const handleScore = async (correct: boolean) => {
    const buzzer = players.find((p) => p.id === room?.buzzed_player_id);
    if (correct && buzzer) {
      const isCrossGen = buzzer.era !== room.current_era;
      const points = isCrossGen ? 200 : 100;
      await supabase.from('players').update({ score: buzzer.score + points }).eq('id', buzzer.id);
      fetchPlayers(roomCode);
      setShowAnswer(true);
    } else {
      await supabase.from('rooms').update({ status: 'playing', buzzed_player_id: null }).eq('id', roomCode);
      setRoom((prev: any) => ({ ...prev, status: 'playing', buzzed_player_id: null }));
      audioRef.current?.play().catch(() => {});
    }
  };

  const joinUrl = typeof window !== 'undefined' && roomCode ? `${window.location.origin}/play/${roomCode}` : '';
  const buzzedPlayer = players.find((p) => p.id === room?.buzzed_player_id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-emerald-950 text-white p-8 flex flex-col items-center justify-between">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="text-amber-400" /> SFIDA GENERAZIONI <Sparkles className="text-amber-400" />
        </h1>
        <p className="text-red-200 mt-1">Codice Stanza: <span className="font-mono font-bold text-2xl text-amber-300">{roomCode}</span></p>
        {dbError && (
          <p className="mt-2 bg-black/60 text-amber-300 px-4 py-2 rounded-lg text-sm font-mono">
            Avviso: {dbError}
          </p>
        )}
      </header>

      <div className={room?.status === 'lobby' ? 'hidden' : 'w-full max-w-md text-center my-2'}>
        <audio ref={audioRef} controls className="w-full rounded-xl" />
        {audioStatus && <p className="text-xs text-amber-200 mt-1">{audioStatus}</p>}
      </div>

      {room?.status === 'lobby' && (
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl flex flex-col md:flex-row items-center gap-10 border border-white/20">
          <div className="bg-white p-4 rounded-2xl">
            {joinUrl && <QRCodeSVG value={joinUrl} size={200} />}
          </div>
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-2">Inquadra per entrare!</h2>
            <p className="text-sm text-red-100 mb-6">Nessuna app da scaricare. Scegli la tua generazione e preparati a prenotarti.</p>
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
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-red-950 font-black py-4 px-8 rounded-2xl text-xl transition"
            >
              INIZIA LA SFIDA ({players.length} giocatori)
            </button>
          </div>
        </div>
      )}

      {(room?.status === 'playing' || room?.status === 'buzzed') && (
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md p-8 rounded-3xl text-center border border-white/20">
          <span className="bg-amber-400 text-red-950 font-bold px-4 py-1 rounded-full text-sm uppercase">
            Round {room.current_round} • Epoca: Anni {room.current_era}
          </span>

          {room.status === 'playing' && (
            <div className="my-8">
              <Volume2 className="w-16 h-16 mx-auto text-amber-300 animate-pulse" />
              <p className="text-2xl font-bold mt-4">Ascolta e premi il pulsante sul tuo telefono!</p>
            </div>
          )}

          {room.status === 'buzzed' && buzzedPlayer && (
            <div className="my-8 bg-amber-400 text-red-950 p-6 rounded-2xl">
              <p className="text-sm uppercase font-bold">Si è prenotato per primo:</p>
              <p className="text-4xl font-black my-2">{buzzedPlayer.name}</p>
              {buzzedPlayer.era !== room.current_era && (
                <span className="inline-block bg-red-900 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                  BONUS DOPPIO PUNTEGGIO (Fuori dalla sua epoca!)
                </span>
              )}
              {!showAnswer && (
                <div className="flex justify-center gap-4 mt-6">
                  <button onClick={() => handleScore(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                    <Check /> Indovinato!
                  </button>
                  <button onClick={() => handleScore(false)} className="bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                    <X /> Sbagliato
                  </button>
                </div>
              )}
            </div>
          )}

          {showAnswer && (
            <div className="mt-6">
              <p className="text-xl font-bold text-emerald-300 mb-4">Soluzione: {room.current_song_query}</p>
              <button
                onClick={() => { const next = questionIndex + 1; setQuestionIndex(next); startRound(next); }}
                className="bg-white text-red-950 font-black px-8 py-3 rounded-xl text-lg"
              >
                Prossimo Round →
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="w-full max-w-2xl">
        <div className="flex justify-center gap-4 flex-wrap">
          {players.map((p, i) => (
            <div key={p.id} className="bg-black/30 px-4 py-2 rounded-xl flex items-center gap-2">
              {i === 0 && <Trophy className="w-4 h-4 text-amber-400" />}
              <span className="font-bold">{p.name}:</span>
              <span className="text-amber-300 font-mono font-bold">{p.score} pt</span>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
