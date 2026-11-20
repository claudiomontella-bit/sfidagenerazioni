'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function PlayerController() {
  const { code } = useParams<{ code: string }>();
  const [name, setName] = useState('');
  const [era, setEra] = useState('90-00');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    supabase.from('rooms').select('*').eq('id', code).single().then(({ data }) => setRoom(data));

    const channel = supabase
      .channel(`player-room-${code}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${code}` }, (payload) => {
        setRoom(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [code]);

  const joinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { data } = await supabase
      .from('players')
      .insert({ room_id: code, name: name.trim(), era })
      .select()
      .single();
    if (data) setPlayerId(data.id);
  };

  const buzz = async () => {
    if (room?.status !== 'playing' || !playerId) return;
    await supabase
      .from('rooms')
      .update({ status: 'buzzed', buzzed_player_id: playerId })
      .eq('id', code)
      .eq('status', 'playing');
  };

  if (!playerId) {
    return (
      <div className="min-h-screen bg-red-950 text-white p-6 flex flex-col justify-center">
        <h1 className="text-2xl font-black text-center mb-6">Entra nella Stanza {code}</h1>
        <form onSubmit={joinGame} className="space-y-4 max-w-sm mx-auto w-full">
          <input
            type="text"
            placeholder="Il tuo nome (es. Zio Marco)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-xl text-black font-bold text-lg"
            required
          />
          <div>
            <label className="block text-sm mb-2 text-red-200">La tua generazione di riferimento:</label>
            <select
              value={era}
              onChange={(e) => setEra(e.target.value)}
              className="w-full p-4 rounded-xl text-black font-bold text-lg"
            >
              <option value="50-60">Anni 50 - 60 (Classici)</option>
              <option value="70-80">Anni 70 - 80 (Cult e Disco)</option>
              <option value="90-00">Anni 90 - 2000 (Nostalgia)</option>
              <option value="GenZ">Gen Z / Moderni</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-amber-400 text-red-950 font-black py-4 rounded-xl text-xl">
            ENTRA IN PARTITA
          </button>
        </form>
      </div>
    );
  }

  const isMyBuzz = room?.buzzed_player_id === playerId;

  return (
    <div className="min-h-screen bg-red-950 text-white p-6 flex flex-col items-center justify-center text-center">
      <p className="text-amber-300 font-bold mb-8 text-lg">Giocatore: {name}</p>

      {room?.status === 'lobby' && (
        <p className="text-xl animate-pulse">In attesa che inizi la partita...</p>
      )}

      {room?.status === 'playing' && (
        <button
          onClick={buzz}
          className="w-64 h-64 rounded-full bg-red-600 active:bg-red-500 border-8 border-amber-400 shadow-2xl flex items-center justify-center text-3xl font-black uppercase tracking-wider active:scale-95 transition"
        >
          PRENOTA!
        </button>
      )}

      {room?.status === 'buzzed' && (
        <div className={`p-8 rounded-3xl ${isMyBuzz ? 'bg-emerald-600' : 'bg-white/10'}`}>
          <p className="text-2xl font-black">
            {isMyBuzz ? 'TOCCA A TE! RISPONDI AD ALTA VOCE!' : 'Qualcuno ha prenotato prima di te!'}
          </p>
        </div>
      )}
    </div>
  );
}
