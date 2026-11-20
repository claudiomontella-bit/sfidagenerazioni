'use client';
import { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from '../lib/supabase';
import GameBoard from './components/GameBoard';

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
      if (res.room) { setRoomCode(res.room.id); setRoom(res.room); }
    });
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    const timer = setInterval(async () => {
      const res = await callApi({ action: 'state', code: roomCode });
      if (res.room) {
        if (res.room.status === 'buzzed' && lastStatusRef.current !== 'buzzed' && audioRef.current) audioRef.current.pause();
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
    const q = (deck.length > 0 ? deck : QUESTIONS)[idx % QUESTIONS.length];
    setCurrentCategory(q.category || 'Musica');
    const res = await callApi({ action: 'start', code: roomCode, round: idx + 1, question: q });
    if (res.error) { setDbError(res.error); return; }
    if (res.room) { lastStatusRef.current = 'playing'; setRoom(res.room); }
    if (res.previewUrl && audioRef.current) {
      audioRef.current.src = res.previewUrl;
      audioRef.current.load();
      audioRef.current.play().then(() => setAudioStatus('Brano in riproduzione!')).catch(() => setAudioStatus('Premi Play sulla barra qui sotto'));
    } else {
      setAudioStatus('Anteprima non disponibile: premi Salta Brano');
    }
  };

  const handleScore = async (correct: boolean) => {
    const buzzer = players.find((p) => p.id === room?.buzzed_player_id);
    if (correct && buzzer) {
      await callApi({ action: 'score', code: roomCode, correct: true, playerId: buzzer.id, isCrossGen: buzzer.era !== room.current_era });
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

  const joinUrl = typeof window !== 'undefined' && roomCode ? window.location.origin + '/play/' + roomCode : '';

  return (
    <GameBoard
      roomCode={roomCode} room={room} players={players} currentCategory={currentCategory}
      audioStatus={audioStatus} showAnswer={showAnswer} dbError={dbError} audioRef={audioRef}
      joinUrl={joinUrl} onStartRound={() => startRound(0)}
      onSkip={() => { const next = questionIndex + 1; setQuestionIndex(next); startRound(next); }}
      onScore={handleScore} onFinish={finishGame}
    />
  );
}
