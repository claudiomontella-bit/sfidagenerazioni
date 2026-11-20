import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { QUESTIONS } from '../../../lib/supabase';

const serverSupabase = createClient(
  'https://supabase.co',
  'sb_publishable_4cALJchVVAOp3FLCVBbIuQ_D6L_DL4Q'
);

async function searchAudioPreview(query: string): Promise<string | null> {
  try {
    const deezerRes = await fetch(`https://deezer.com{encodeURIComponent(query)}&limit=5`);
    const deezerJson = await deezerRes.json();
    const deezerMatch = Array.isArray(deezerJson.data)
      ? deezerJson.data.find((item: any) => typeof item.preview === 'string' && item.preview.startsWith('http'))
      : null;
    if (deezerMatch) return deezerMatch.preview;
  } catch {
    // Passa a iTunes
  }

  try {
    const itunesRes = await fetch(
      `https://apple.com{encodeURIComponent(query)}&media=music&entity=song&limit=5`
    );
    const itunesJson = await itunesRes.json();
    const itunesMatch = Array.isArray(itunesJson.results)
      ? itunesJson.results.find((item: any) => typeof item.previewUrl === 'string' && item.previewUrl.startsWith('http'))
      : null;
    if (itunesMatch) return itunesMatch.previewUrl;
  } catch {
    // Nessun brano trovato
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const code = (body.code || '').toUpperCase();

    if (action === 'create') {
      const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      const { data, error } = await serverSupabase
        .from('rooms')
        .insert({ id: newCode, status: 'lobby' })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ room: data, players: [] });
    }

    if (action === 'state') {
      const { data: room } = await serverSupabase.from('rooms').select('*').eq('id', code).single();
      const { data: players } = await serverSupabase
        .from('players')
        .select('*')
        .eq('room_id', code)
        .order('score', { ascending: false });
      return NextResponse.json({ room: room || null, players: players || [] });
    }

    if (action === 'join') {
      const { data, error } = await serverSupabase
        .from('players')
        .insert({ room_id: code, name: body.name, era: body.era })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ player: data });
    }

    if (action === 'start') {
      const q = body.question || QUESTIONS[0];
      const previewUrl = await searchAudioPreview(q.query);
      const { data, error } = await serverSupabase
        .from('rooms')
        .update({
          status: 'playing',
          current_round: body.round,
          buzzed_player_id: null,
          current_song_query: q.answer,
          current_era: q.era,
        })
        .eq('id', code)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ room: data, previewUrl });
    }

    if (action === 'buzz') {
      const { data } = await serverSupabase
        .from('rooms')
        .update({ status: 'buzzed', buzzed_player_id: body.playerId })
        .eq('id', code)
        .eq('status', 'playing')
        .select()
        .single();
      return NextResponse.json({ room: data || null });
    }

    if (action === 'score') {
      if (body.correct && body.playerId) {
        const { data: player } = await serverSupabase.from('players').select('*').eq('id', body.playerId).single();
        if (player) {
          const points = body.isCrossGen ? 200 : 100;
          await serverSupabase.from('players').update({ score: player.score + points }).eq('id', player.id);
        }
      } else {
        await serverSupabase.from('rooms').update({ status: 'playing', buzzed_player_id: null }).eq('id', code);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'finish') {
      await serverSupabase.from('rooms').update({ status: 'finished' }).eq('id', code);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Azione non valida' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Errore server' }, { status: 500 });
  }
}
