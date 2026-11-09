import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Uebersicht } from './pages/Uebersicht';
import { Cheatsheet } from './pages/Cheatsheet';
import { Pruefungen } from './pages/Pruefungen';
import { Kompendium } from './pages/Kompendium';
import { Ausbildungsplan } from './pages/Ausbildungsplan';
import { Berichtsheft } from './pages/Berichtsheft';
import { Ueben } from './pages/Ueben';
import { Projekt } from './pages/Projekt';
import { Pruefungstechnik } from './pages/Pruefungstechnik';
import { Hilfe } from './pages/Hilfe';
import { Einstellungen } from './pages/Einstellungen';
import { NichtGefunden } from './pages/NichtGefunden';
import { useThemenfelder } from './api';
import { lies } from './lib/merken';

function CheatsheetStart() {
  const { data } = useThemenfelder();
  if (!data) return null;
  const letztes = lies('letztes-thema');
  const ziel = data.find((f) => f.id === letztes) ?? data[0];
  return ziel ? <Navigate to={`/thema/${ziel.id}`} replace /> : <NichtGefunden />;
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Uebersicht />} />
        <Route path="thema" element={<CheatsheetStart />} />
        <Route path="thema/:slug" element={<Cheatsheet />} />
        <Route path="kompendium" element={<Kompendium />} />
        <Route path="ueben" element={<Ueben />} />
        <Route path="plan" element={<Ausbildungsplan />} />
        <Route path="berichtsheft" element={<Berichtsheft />} />
        <Route path="pruefung" element={<Pruefungen />} />
        <Route path="pruefung/projekt" element={<Projekt />} />
        <Route path="pruefung/technik" element={<Pruefungstechnik />} />
        <Route path="einstellungen" element={<Einstellungen />} />
        <Route path="hilfe" element={<Hilfe />} />
        <Route path="*" element={<NichtGefunden />} />
      </Route>
    </Routes>
  );
}
