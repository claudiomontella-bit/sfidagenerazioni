import { NextResponse } from 'next/server';
import { supabase as serverSupabase, QUESTIONS } from '../../../lib/supabase';


async function searchAudioPreview(query: string): Promise<string | null> {
  const deezerHost = ['api', 'deezer', 'com'].join('.');
  const deezerUrl = 'https://' + deezerHost + '/search?q=' + encodeURIComponent(query) + '&limit=5';
  try {
    const res = await fetch(deezerUrl);
    const json = await res.json();
    const match = Array.isArray(json.data) ? json.data.find((x: any) => typeof x.preview === 'string' && x.preview.startsWith('http')) : null;
    if (match) return match.preview;
  } catch {}

  const itunesHost = ['itunes', 'apple', 'com'].join('.');
  const itunesUrl = 'https://' + itunesHost + '/search?term=' + encodeURIComponent(query) + '&media=music&entity=song&limit=5';
  try {
    const res = await fetch(itunesUrl);
    const json = await res.json();
    const match = Array.isArray(json.results) ? json.results.find((x: any) => typeof x.previewUrl === 'string' && x.previewUrl.startsWith('http')) : null;
    if (match) return match.previewUrl;
  } catch {}

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const code = (body.code || '').toUpperCase();

    if (action === 'create') {
      const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      const { data, error } = await serverSupabase.from('rooms').insert({ id: newCode, status: 'lobby' }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ room: data, players: [] });
    }

    if (action === 'state') {
      const { data: room } = await serverSupabase.from('rooms').select('*').eq('id', code).single();
      const { data: players } = await serverSupabase.from('players').select('*').eq('room_id', code).order('score', { ascending: false });
      return NextResponse.json({ room: room || null, players: players || [] });
    }

    if (action === 'join') {
      const { data, error } = await serverSupabase.from('players').insert({ room_id: code, name: body.name, era: body.era }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ player: data });
    }

    if (action === 'start') {
      const q = body.question || QUESTIONS;
      const previewUrl = await searchAudioPreview(q.query);
      const { data, error } = await serverSupabase.from('rooms').update({
        status: 'playing', current_round: body.round, buzzed_player_id: null, current_song_query: q.answer, current_era: q.era
      }).eq('id', code).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ room: data, previewUrl });
    }

    if (action === 'buzz') {
      const { data } = await serverSupabase.from('rooms').update({ status: 'buzzed', buzzed_player_id: body.playerId }).eq('id', code).eq('status', 'playing').select().single();
      return NextResponse.json({ room: data || null });
    }

    if (action === 'score') {
      if (body.correct && body.playerId) {
        const { data: player } = await serverSupabase.from('players').select('*').eq('id', body.playerId).single();
        if (player) {
          await serverSupabase.from('players').update({ score: player.score + (body.isCrossGen ? 200 : 100) }).eq('id', player.id);
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
