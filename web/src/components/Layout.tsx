import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Radar", end: true },
  { to: "/saved", label: "Saved News", end: false },
  { to: "/sources", label: "Sources", end: false },
  { to: "/runs", label: "Crawler Runs", end: false }
];

export const Layout = () => (
  <div className="layout">
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__logo">FF</span>
        <div className="topbar__title">
          <strong>FeedForge</strong>
          <small>Open Source Radar</small>
        </div>
      </div>
      <nav className="topbar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? "topbar__link topbar__link--active" : "topbar__link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="topbar__meta">
        <span>Deterministic. Local-first.</span>
        <span>No LLMs.</span>
      </div>
    </header>
    <main className="content">
      <Outlet />
    </main>
  </div>
);
