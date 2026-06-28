import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { OperationalStatus } from "./OperationalStatus";
import { RadarIcon, RunsIcon, SavedIcon, SourcesIcon } from "./icons";

const NAV = [
  { to: "/", end: true, key: "nav.radar", Icon: RadarIcon },
  { to: "/saved", end: false, key: "nav.saved", Icon: SavedIcon },
  { to: "/sources", end: false, key: "nav.sources", Icon: SourcesIcon },
  { to: "/runs", end: false, key: "nav.runs", Icon: RunsIcon }
] as const;

export function Layout() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header" data-scrolled={scrolled}>
        <div className="header-inner">
          <NavLink to="/" className="brand" aria-label={t("app.name")}>
            <Logo size={30} title={t("app.name")} />
            <span className="brand-text">
              <span className="brand-name">{t("app.name")}</span>
              <span className="brand-tagline">{t("app.tagline")}</span>
            </span>
          </NavLink>
          <nav className="main-nav" aria-label={t("app.name")}>
            {NAV.map(({ to, end, key, Icon }) => (
              <NavLink key={to} to={to} end={end} className="nav-link">
                <Icon className="nav-icon" />
                <span>{t(key)}</span>
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <OperationalStatus />
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
