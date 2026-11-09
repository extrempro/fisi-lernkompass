import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useEinstellungen } from '../api';
import { useTheme } from '../lib/theme';
import { Nav } from './Nav';
import { Banner } from './Banner';
import { Footer } from './Footer';
import { NachOben } from './NachOben';
import { Companion } from '../companion/Companion';
import { DruckProvider } from '../bericht/Druck';

export function Layout() {
  const { data: einstellungen } = useEinstellungen();
  const dunkel = useTheme(einstellungen?.theme);
  const { pathname, hash } = useLocation();

  // Neue Seite beginnt oben – sonst bliebe die Scrollposition der vorigen Seite stehen.
  // Mit Sprungziel (#…) scrollt die Seite selbst dorthin.
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <DruckProvider>
    <div className="min-h-screen bg-bg text-ink">
      <Nav dunkel={dunkel} />
      <div className="mx-auto flex max-w-page flex-col gap-6 px-4 pb-12 pt-8 sm:px-6">
        <Banner />
        <main className="flex flex-col gap-6">
          <Outlet />
        </main>
        <Footer />
      </div>
      <NachOben />
      <Companion />
    </div>
    </DruckProvider>
  );
}
