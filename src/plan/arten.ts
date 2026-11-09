import { BookOpen, ListTodo, School, StickyNote, type LucideIcon } from 'lucide-react';
import type { PlanArt } from '../types';

/** Arten von Plan-Einträgen mit Symbol und Farbe (Klassen aus den Design-Tokens). */
export const ART: Record<PlanArt, { label: string; icon: LucideIcon; stil: string; hilfe: string }> = {
  schule: { label: 'Schulblock', icon: School, stil: 'bg-schule-soft text-schule', hilfe: 'Berufsschule, gern über mehrere Wochen' },
  thema: { label: 'Themenfeld', icon: BookOpen, stil: 'bg-accent-soft text-accent', hilfe: 'Lernthema mit aktuellem Lernstand' },
  aufgabe: { label: 'Aufgabe', icon: ListTodo, stil: 'bg-warn text-warn-ink', hilfe: 'Zum Abhaken, z. B. Berichtsheft' },
  notiz: { label: 'Notiz', icon: StickyNote, stil: 'bg-chip text-muted', hilfe: 'Eigener Text, z. B. Urlaub' },
};

export const ART_REIHE: PlanArt[] = ['schule', 'thema', 'aufgabe', 'notiz'];
