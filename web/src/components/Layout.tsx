import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Radar", end: true },
  { to: "/saved", label: "Saved News", end: false },
  { to: "/sources", label: "Sources", end: false },
  { to: "/runs", label: "Crawler Runs", end: false }
];

export const Layout = () => (
  <div className="layout">
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">FF</span>
        <div>
          <strong>FeedForge</strong>
          <small>Open Source Radar</small>
        </div>
      </div>
      <nav className="sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer">
        <span>Deterministic. Local-first.</span>
        <span>No LLMs.</span>
      </div>
    </aside>
    <main className="content">
      <Outlet />
    </main>
  </div>
);
