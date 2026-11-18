import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { degreePrograms, departments } from "../lib/site";
import {
  ArrowRight,
  Bell,
  Briefcase,
  CalendarDays,
  ChevronDown,
  Compass,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  MailCheck,
  Menu,
  MessagesSquare,
  Network,
  Shield,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { site } from "../lib/site";
import { firebaseError, initials } from "../lib/helpers";
export function Brand({ light = false }) {
  return (
    <Link className={`brand ${light ? "brand-light" : ""}`} to="/">
      <span className="brand-mark">
        <GraduationCap size={24} />
      </span>
      <span>
        <strong>{site.name}</strong>
        <small>ALUMNI NETWORK</small>
      </span>
    </Link>
  );
}
const publicLinks = [
  ["/", "Home"],
  ["/directory", "Directory"],
  ["/events", "Events"],
  ["/jobs", "Careers"],
  ["/news", "News"],
  ["/mentorship", "Mentorship"],
  ["/community", "Community"],
  ["/about", "About"],
];
export function PublicLayout() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useEffect(() => setMenu(false), [location.pathname]);
  return (
    <>
      <div className="topline">
        <div className="wrap topline-inner">
          <span>
            <Sparkles size={13} /> Building lifelong alumni connections
          </span>
          <span>{site.college}</span>
        </div>
      </div>
      <header className="site-header">
        <div className="wrap header-inner">
          <Brand />
          <button
            aria-label="Open menu"
            className="icon-button mobile-menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <nav className={`main-nav ${menu ? "open" : ""}`}>
            {publicLinks.map(([href, label]) => (
              <NavLink key={href} end={href === "/"} to={href}>
                {label}
              </NavLink>
            ))}
            <Link className="btn btn-small btn-primary" to="/login">
              Alumni Login <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <Brand light />
            <p>
              Bridging campus memories and professional futures. A home for
              every graduate.
            </p>
          </div>
          <div>
            <strong>Explore</strong>
            <Link to="/directory">Alumni Directory</Link>
            <Link to="/events">Events & Reunions</Link>
            <Link to="/jobs">Career Opportunities</Link>
            <Link to="/news">News & Updates</Link>
          </div>
          <div>
            <strong>Connect</strong>
            <Link to="/mentorship">Mentorship</Link>
            <Link to="/community">Community</Link>
            <Link to="/register">Join Alumni Network</Link>
          </div>
          <div>
            <strong>Contact</strong>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <span>{site.location}</span>
          </div>
        </div>
        <div className="wrap foot-bottom">
          © {new Date().getFullYear()} {site.college}. All rights reserved. ·
          Built for the alumni community.
        </div>
      </footer>
    </>
  );
}
const menuAlumni = [
  [LayoutDashboard, "/app", "Overview"],
  [UserRound, "/app/profile", "My Profile"],
  [Briefcase, "/app/career", "Career & Education"],
  [CalendarDays, "/app/events", "My Events"],
  [Briefcase, "/app/jobs", "Opportunities"],
  [HeartHandshake, "/app/mentorship", "Mentorship"],
  [MessagesSquare, "/app/community", "Community"],
  [MailCheck, "/app/verify-email", "Verify Email"],
];
const menuAdmin = [
  [LayoutDashboard, "/admin", "Admin Overview"],
  [Users, "/admin/alumni", "Alumni Verification"],
  [CalendarDays, "/admin/events", "Manage Events"],
  [Briefcase, "/admin/jobs", "Manage Jobs"],
  [MessagesSquare, "/admin/community", "Moderate Posts"],
  [Compass, "/admin/news", "News & Notices"],
  [Network, "/admin/reports", "Reports & Analytics"],
];
export function PortalLayout({ admin = false }) {
  const { profile, logout, isStaff, emailVerified } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  const menu = admin ? menuAdmin : menuAlumni;
  return (
    <div className="portal-shell">
      <aside className={`sidebar ${open ? "show" : ""}`}>
        <Brand light />
        <div className="sidebar-label">
          {admin ? "ADMINISTRATION" : "MY WORKSPACE"}
        </div>
        <nav className="sidebar-links">
          {menu.map(([Icon, href, label]) => (
            <NavLink
              key={href}
              end={href === (admin ? "/admin" : "/app")}
              to={href}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {isStaff && (
            <Link to={admin ? "/app" : "/admin"}>
              <Shield size={18} />
              {admin ? "Alumni View" : "Admin Panel"}
            </Link>
          )}
          <Link to="/">
            <Compass size={18} />
            Public Website
          </Link>
          <button
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
      <div className="portal-work">
        <header className="portal-header">
          <button
            className="icon-button sidebar-toggle"
            aria-label="Toggle sidebar"
            onClick={() => setOpen(!open)}
          >
            <Menu />
          </button>
          <div className="portal-header-title">
            {admin ? "Administration Workspace" : "Alumni Workspace"}
          </div>
          <div className="portal-header-right">
            <span className="status-dot" />
            {profile?.status === "verified"
              ? "Verified account"
              : "Pending verification"}
            <span className="avatar">{initials(profile?.name)}</span>
          </div>
        </header>
        <div className="portal-content">
          {!admin &&
            !emailVerified &&
            location.pathname !== "/app/verify-email" && (
              <div className="verify-top-bar">
                <span>
                  <strong>Email not verified.</strong> All tabs are available.
                  Enter the six-digit email code to enable member actions.
                </span>
                <Link
                  className="btn btn-primary btn-small"
                  to="/app/verify-email"
                >
                  Verify Email <ArrowRight size={15} />
                </Link>
              </div>
            )}
          <Outlet />
        </div>
      </div>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
export function Protected({ children, staff = false, verified = false }) {
  const { user, profile, loading, error, isStaff } = useAuth();
  if (loading) return <FullScreen text="Checking your account..." />;
  if (error)
    return (
      <div className="account-error section wrap">
        <h1>Account could not be confirmed</h1>
        <Alert type="error">{error}</Alert>
        <p>
          Account information could not be loaded from the server. Please retry
          after checking your connection and Firestore rules.
        </p>
        <div className="action-row">
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <Link className="btn btn-outline" to="/">
            Public Website
          </Link>
        </div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <MissingAccount />;
  if (staff && !isStaff) return <Navigate to="/app" replace />;
  return children;
}
export function MissingAccount() {
  const { logout, user, completeRegistration } = useAuth();
  const [form, setForm] = useState({
      name: user?.displayName || "",
      role: "alumni",
      rollNumber: "",
      program: "B.Tech",
      department: "Computer Science",
      graduationYear: "",
    }),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await completeRegistration(form);
      setMessage(
        "Your registration was saved on the server. The college will review it; verify the email address using the code in the dashboard."
      );
    } catch (err) {
      setMessage(firebaseError(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-full">
      <div className="auth-panel register-panel">
        <Brand />
        <h2>Complete your alumni registration</h2>
        <p>
          You're signed in as <strong>{user?.email}</strong>, but this account
          has no confirmed alumni record yet. Submit your academic details for
          college verification. Email verification is not needed.
        </p>
        {message && <Alert>{message}</Alert>}
        <form onSubmit={submit}>
          <div className="form-grid">
            <label>
              Full Name
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                minLength={2}
                maxLength={120}
              />
            </label>
            <label>
              Account Type
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
              >
                <option value="alumni">Alumnus / Alumna</option>
                <option value="student">Current Student</option>
              </select>
            </label>
            <label>
              Roll / Registration Number
              <input
                value={form.rollNumber}
                onChange={(e) => update("rollNumber", e.target.value)}
                required
                maxLength={35}
              />
            </label>
            <label>
              Program
              <select
                value={form.program}
                onChange={(e) => update("program", e.target.value)}
              >
                {degreePrograms.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label>
              Department
              <select
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label>
              Passing Year
              <input
                type="number"
                required
                min="1950"
                max="2100"
                value={form.graduationYear}
                onChange={(e) => update("graduationYear", e.target.value)}
              />
            </label>
          </div>
          <button className="btn btn-primary full" disabled={busy}>
            {busy
              ? "Submitting and confirming..."
              : "Submit for College Verification"}
          </button>
        </form>
        <button
          className="btn btn-outline"
          style={{ marginTop: 14 }}
          onClick={logout}
        >
          Logout
        </button>
      </div>
      <div className="auth-side">
        <GraduationCap size={72} />
        <h2>
          One account.
          <br />
          One connected community.
        </h2>
      </div>
    </div>
  );
}
export function FullScreen({ text = "Loading..." }) {
  return (
    <div className="loading-screen">
      <span className="spinner" />
      {text}
    </div>
  );
}
export function PageTitle({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}
export function Empty({
  title = "Nothing here yet",
  text = "Check back later for updates.",
  icon: Icon = Compass,
}) {
  return (
    <div className="empty">
      <Icon size={36} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function Alert({ type = "info", children }) {
  return <div className={`notice ${type}`}>{children}</div>;
}
export function Status({ value }) {
  return (
    <span className={`tag tag-${value || "pending"}`}>
      {String(value || "pending").replaceAll("_", " ")}
    </span>
  );
}
export function Avatar({ name, size = 42 }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: Math.max(12, size / 3) }}
    >
      {initials(name)}
    </div>
  );
}
export function StatsCard({ icon: Icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}
export function useLive(queryValue, dependencies = []) {
  const [rows, setRows] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    if (!queryValue) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const stop = import("../lib/data").then(({ subscribe }) =>
      subscribe(
        queryValue,
        (data) => {
          setRows(data);
          setError("");
          setLoading(false);
        },
        (e) => {
          setError(firebaseError(e));
          setLoading(false);
        }
      )
    );
    let cancelled = false,
      unsub = null;
    stop.then((fn) => {
      if (cancelled) fn();
      else unsub = fn;
    });
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, dependencies);
  return { rows, loading, error };
}

export function MemberActionNotice() {
  const { profile, emailVerified } = useAuth();
  if (profile?.status === "rejected")
    return (
      <Alert type="error">
        Your account was rejected by the college. Contact the alumni
        coordinator.
      </Alert>
    );
  if (emailVerified) return null;
  return (
    <Alert type="warning">
      <strong>Email verification required for member actions.</strong> You may
      browse every tab now, but posting, registering or saving data requires
      your six-digit code.{" "}
      <Link className="text-link" to="/app/verify-email">
        Verify email now →
      </Link>{" "}
      Please also check your Spam/Junk folder.
    </Alert>
  );
}
