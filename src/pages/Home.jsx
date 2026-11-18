/**
 * CampusConnect — animated premium homepage
 * Drop-in replacement for src/pages/Home.jsx.
 * Everything in ONE file: React components, Firestore queries and scoped CSS.
 * Typography comes entirely from the existing global styles.css:
 * DM Sans for body and Plus Jakarta Sans for headings.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where } from "firebase/firestore";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness,
  CalendarDays, CheckCircle2,
  GraduationCap, HeartHandshake, MapPin, MessageCircleMore,
  Network, Sparkles, Users,
} from "lucide-react";
import { db } from "../lib/firebase";
import { useLive } from "../components/Components";
import { humanDate } from "../lib/helpers";

/* Read-only public data: no new collections or Firestore rules are required. */
const alumniQuery = query(collection(db, "alumni_profiles"), where("directoryStatus", "==", "listed"));
const eventsQuery = query(collection(db, "alumni_events"), where("status", "==", "published"));
const newsQuery = query(collection(db, "alumni_news"), where("status", "==", "published"));
const jobsQuery = query(collection(db, "alumni_jobs"), where("status", "==", "approved"));

const benefits = [
  { number: "01", icon: Users, title: "Find your circle", body: "Reconnect with classmates and discover alumni across batches, cities and industries.", link: "/directory", action: "Explore the directory", theme: "people" },
  { number: "02", icon: BriefcaseBusiness, title: "Move your career forward", body: "Discover jobs, internships and referrals shared through your alumni community.", link: "/jobs", action: "Explore opportunities", theme: "career" },
  { number: "03", icon: HeartHandshake, title: "A little guidance. A big impact.", body: "Learn from experienced graduates or inspire someone just starting their journey.", link: "/mentorship", action: "Explore mentorship", theme: "mentor" },
  { number: "04", icon: CalendarDays, title: "Make more memories", body: "Find reunions, meetups, workshops and conversations worth showing up for.", link: "/events", action: "See upcoming events", theme: "events" },
  { number: "05", icon: MessageCircleMore, title: "Keep the conversation going", body: "Share achievements, ideas and updates with the people who understand your journey.", link: "/community", action: "Meet the community", theme: "community" },
];

function useScrollReveal(dependencies) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const nodes = document.querySelectorAll(".ccx-home [data-reveal]");
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("ccx-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("ccx-visible");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, dependencies);
}

function AnimatedNumber({ value, suffix = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === "undefined") return;
    if (!window.IntersectionObserver) { setVisible(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setVisible(true); observer.disconnect(); }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(value); return; }
    let frame;
    const started = performance.now();
    const duration = 950;
    const tick = (now) => {
      const t = Math.min((now - started) / duration, 1);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, visible]);
  return <span ref={ref}>{shown.toLocaleString("en-IN")}{suffix}</span>;
}

function SectionHeading({ label, title, text, action, to }) {
  return (
    <div className="ccx-section-heading" data-reveal>
      <div className="ccx-section-heading-copy">
        <span className="ccx-eyebrow"><span className="ccx-eyebrow-dot" /> {label}</span>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action && <Link to={to} className="ccx-text-action">{action}<ArrowUpRight size={18} /></Link>}
    </div>
  );
}

function HeroIllustration() {
  const boardRef = useRef(null);
  function move(event) {
    if (!boardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = boardRef.current.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    boardRef.current.style.setProperty("--mx", `${(x * 10).toFixed(2)}px`);
    boardRef.current.style.setProperty("--my", `${(y * 10).toFixed(2)}px`);
  }
  function reset() {
    boardRef.current?.style.setProperty("--mx", "0px");
    boardRef.current?.style.setProperty("--my", "0px");
  }
  return (
    <div className="ccx-visual" ref={boardRef} onPointerMove={move} onPointerLeave={reset} aria-label="Animated illustration of an interconnected alumni community" role="img">
      <div className="ccx-visual-grid" />
      <div className="ccx-visual-caption"><span className="ccx-live-light" /> THE CAMPUSCONNECT NETWORK <span>● ONLINE</span></div>
      <div className="ccx-orbit ccx-orbit-one" /><div className="ccx-orbit ccx-orbit-two" /><div className="ccx-orbit ccx-orbit-three" />
      <div className="ccx-orbit-dot ccx-dot-a" /><div className="ccx-orbit-dot ccx-dot-b" /><div className="ccx-orbit-dot ccx-dot-c" />
      <div className="ccx-visual-center">
        <div className="ccx-center-icon"><GraduationCap size={42} strokeWidth={1.6}/></div>
        <strong>ONE CAMPUS.<br/>ENDLESS CONNECTIONS.</strong>
        <span>STORIES IN MOTION</span>
      </div>
      <div className="ccx-people-tag ccx-people-one"><span className="ccx-mini-avatar ccx-avatar-orange"><GraduationCap size={18}/></span><span><b>Alumni network</b><small>Find your people</small></span><ArrowUpRight size={16}/></div>
      <div className="ccx-people-tag ccx-people-two"><span className="ccx-mini-avatar ccx-avatar-mint"><BriefcaseBusiness size={18}/></span><span><b>Career growth</b><small>Opportunities together</small></span><ArrowUpRight size={16}/></div>
      <div className="ccx-people-tag ccx-people-three"><span className="ccx-mini-avatar ccx-avatar-blue"><HeartHandshake size={18}/></span><span><b>Give back</b><small>Mentor the next chapter</small></span><ArrowUpRight size={16}/></div>
      <div className="ccx-visual-bottom"><span>BEYOND THE CLASSROOM</span><span>↗ EVERYWHERE</span></div>
      <span className="ccx-sparkle ccx-sparkle-a">✦</span><span className="ccx-sparkle ccx-sparkle-b">✳</span>
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <Link to={feature.link} className={`ccx-feature ccx-feature-${feature.theme}`} data-reveal style={{ "--reveal-delay": `${(index % 3) * 90}ms` }}>
      <div className="ccx-feature-top"><span>{feature.number} / DISCOVER</span><span className="ccx-feature-arrow"><ArrowUpRight size={20}/></span></div>
      <div className="ccx-feature-content">
        <div className="ccx-feature-icon"><Icon size={30} strokeWidth={1.7}/></div>
        <h3>{feature.title}</h3><p>{feature.body}</p>
        <span className="ccx-feature-link">{feature.action}<ArrowRight size={16}/></span>
      </div>
      <div className="ccx-feature-decor" aria-hidden="true"><Icon size={160} strokeWidth={0.65}/></div>
    </Link>
  );
}

function AlumniCard({ person, index }) {
  const name = person.displayName || "Alumni member";
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <Link to={`/directory/${person.id}`} className="ccx-alumni-card" data-reveal style={{ "--reveal-delay": `${index * 80}ms` }}>
      <div className="ccx-alumni-card-top"><span className="ccx-listed-label"><CheckCircle2 size={13}/> Listed alumnus</span><ArrowUpRight size={18}/></div>
      <div className={`ccx-alumni-avatar ccx-alumni-avatar-${index % 4}`}><span>{initials}</span></div>
      <h3>{name}</h3>
      <p className="ccx-alumni-role">{person.jobTitle || person.headline || "Alumni member"}</p>
      <p className="ccx-alumni-work">{person.company || person.department || "CampusConnect Network"}</p>
      <div className="ccx-alumni-foot"><span><GraduationCap size={15}/> {person.graduationYear ? `Batch ${person.graduationYear}` : "Alumni"}</span><span><MapPin size={15}/> {person.city || "Connect"}</span></div>
    </Link>
  );
}

function EventCard({ event, index }) {
  const day = event.date ? new Date(`${event.date}T12:00:00`) : null;
  const validDate = day && !Number.isNaN(day.getTime());
  return (
    <article className="ccx-event-card" data-reveal style={{ "--reveal-delay": `${index * 90}ms` }}>
      <div className={`ccx-event-art ccx-event-art-${index % 3}`}>
        <div className="ccx-event-ring"/><CalendarDays size={76} strokeWidth={1.2}/>
        <span className="ccx-event-category">{event.category || "ALUMNI EVENT"}</span>
        <span className="ccx-event-date-box"><b>{validDate ? day.toLocaleDateString("en-IN", { day: "2-digit" }) : "--"}</b><small>{validDate ? day.toLocaleDateString("en-IN", { month: "short" }).toUpperCase() : "TBA"}</small></span>
      </div>
      <div className="ccx-event-info"><span className="ccx-event-meta">{humanDate(event.date)} <span>·</span> {event.time || "Time to be announced"}</span><h3>{event.title || "Alumni event"}</h3><p><MapPin size={15}/>{event.venue || "Online"}</p><Link to="/events" className="ccx-event-link">Discover event <ArrowUpRight size={17}/></Link></div>
    </article>
  );
}

function MiniEmpty({ icon: Icon, title, description, to, linkText }) {
  return <div className="ccx-empty" data-reveal><div className="ccx-empty-icon"><Icon size={30}/></div><h3>{title}</h3><p>{description}</p>{to && <Link to={to} className="ccx-inline-link">{linkText}<ArrowUpRight size={17}/></Link>}</div>;
}

export function Home() {
  const { rows: alumni, loading: alumniLoading, error: alumniError } = useLive(alumniQuery, []);
  const { rows: events, loading: eventsLoading, error: eventsError } = useLive(eventsQuery, []);
  const { rows: news, loading: newsLoading, error: newsError } = useLive(newsQuery, []);
  const { rows: jobs, loading: jobsLoading, error: jobsError } = useLive(jobsQuery, []);
  const upcoming = useMemo(() => events.filter((e) => e.date && new Date(`${e.date}T23:59:59`).getTime() >= Date.now()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3), [events]);
  const featured = useMemo(() => [...alumni].sort((a, b) => (a.displayName || "").localeCompare(b.displayName || "")).slice(0, 4), [alumni]);
  const latestNews = useMemo(() => [...news].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 2), [news]);
  const latestJobs = useMemo(() => [...jobs].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 2), [jobs]);
  useScrollReveal([alumniLoading, eventsLoading, newsLoading, jobsLoading]);

  return (
    <div className="ccx-home">
      <style>{homepageCss}</style>
      <section className="ccx-hero">
        <div className="ccx-hero-glow" aria-hidden="true"/>
        <div className="wrap ccx-hero-layout">
          <div className="ccx-hero-copy">
            <div className="ccx-hero-label"><span className="ccx-label-star"><Sparkles size={15}/></span> YOUR CAMPUS. YOUR PEOPLE. FOREVER.</div>
            <h1>Your story<br/>started here.<br/><span className="ccx-title-mark">It never ends. <span className="ccx-title-swish" aria-hidden="true"/></span></h1>
            <p className="ccx-hero-description">The moments we shared became memories. The people we met became our network. Now, every next chapter has a place to begin.</p>
            <div className="ccx-hero-actions"><Link to="/register" className="ccx-primary-cta">Join the alumni network <span><ArrowUpRight size={19}/></span></Link><Link to="/directory" className="ccx-secondary-cta">Explore our community <ArrowRight size={18}/></Link></div>
            <div className="ccx-hero-trust"><div className="ccx-overlap-avatars" aria-hidden="true"><span><GraduationCap size={17}/></span><span><BriefcaseBusiness size={17}/></span><span><HeartHandshake size={17}/></span></div><p><strong>A lifetime of connections</strong><br/>A community that grows with you.</p></div>
          </div>
          <HeroIllustration />
        </div>
        <div className="ccx-hero-scrolldown"><span>EXPLORE THE NETWORK</span><ArrowDown size={16}/></div>
      </section>

      <section className="ccx-metrics" aria-label="Live public portal statistics">
        <div className="wrap ccx-metrics-inner">
          <div className="ccx-metric"><span>OUR GROWING NETWORK</span><strong>{alumniLoading ? "—" : <AnimatedNumber value={alumni.length}/>}</strong><small>Listed alumni profiles</small></div>
          <div className="ccx-metric"><span>STAY INSPIRED</span><strong>{eventsLoading ? "—" : <AnimatedNumber value={events.length}/>}</strong><small>Published events</small></div>
          <div className="ccx-metric"><span>YOUR NEXT MOVE</span><strong>{jobsLoading ? "—" : <AnimatedNumber value={jobs.length}/>}</strong><small>Approved career opportunities</small></div>
          <div className="ccx-metric ccx-metric-message"><span>MORE THAN A DIRECTORY</span><strong>One network.<br/><em>Many journeys.</em></strong><small>Let's build the future together <ArrowUpRight size={15}/></small></div>
        </div>
      </section>

      <div className="ccx-ticker" aria-label="Connect, grow, inspire"><div className="ccx-ticker-track" aria-hidden="true">{[0, 1].map((copy) => <span key={copy}>CONNECT <span>✳</span> GROW <span>✳</span> INSPIRE <span>✳</span> CELEBRATE <span>✳</span> GIVE BACK <span>✳</span> STAY CONNECTED <span>✳</span>&nbsp;</span>)}</div></div>

      <section className="ccx-section ccx-why"><div className="wrap">
        <SectionHeading label="THE POWER OF BELONGING" title={<>Everything you need.<br/><span>One lifelong network.</span></>} text="Whether you're finding familiar faces, new opportunities or a way to give back, it all begins here."/>
        <div className="ccx-benefit-grid">{benefits.map((feature, i) => <FeatureCard feature={feature} index={i} key={feature.number}/>)}</div>
      </div></section>

      <section className="ccx-story"><div className="wrap ccx-story-grid">
        <div className="ccx-story-visual" data-reveal><div className="ccx-story-grid-pattern"/><div className="ccx-story-large-symbol"><Network size={118} strokeWidth={1}/></div><div className="ccx-story-overlay"><span className="ccx-story-mini-heading">GROWING TOGETHER, ALWAYS</span><strong>Where familiar roots<br/>meet new horizons.</strong><div className="ccx-story-pills"><span><CheckCircle2 size={14}/> Find peers</span><span><CheckCircle2 size={14}/> Share progress</span><span><CheckCircle2 size={14}/> Give back</span></div></div><span className="ccx-story-decor-dot">✳</span></div>
        <div className="ccx-story-copy" data-reveal><span className="ccx-eyebrow"><span className="ccx-eyebrow-dot"/> MORE THAN GRADUATION</span><h2>The campus may be behind us. <em>The connection stays ahead.</em></h2><p>From first jobs and promotions to new ventures and the next generation of students—your journey matters here.</p><div className="ccx-story-steps"><div><span>01</span><p><strong>Build your profile</strong><small>Let classmates know what you're doing today.</small></p></div><div><span>02</span><p><strong>Find your opportunities</strong><small>Connect through careers, events and mentorship.</small></p></div><div><span>03</span><p><strong>Make a difference</strong><small>Share your experience and help someone move forward.</small></p></div></div><Link className="ccx-story-button" to="/register">Start your next chapter <ArrowUpRight size={18}/></Link></div>
      </div></section>

      <section className="ccx-section ccx-showcase"><div className="wrap">
        <SectionHeading label="THE PEOPLE BEHIND THE NETWORK" title={<>Real people.<br/><span>Remarkable journeys.</span></>} text="Get to know graduates who make our alumni community what it is." to="/directory" action="Meet all alumni"/>
        {alumniError && <p className="ccx-data-error" role="alert">Alumni profiles could not be loaded: {alumniError}</p>}
        {alumniLoading ? <div className="ccx-skeleton-row"><div/><div/><div/><div/></div> : featured.length ? <div className="ccx-alumni-grid">{featured.map((person, index) => <AlumniCard key={person.id} person={person} index={index}/>)}</div> : <MiniEmpty icon={Users} title="Your alumni community is taking shape" description="Listed profiles will appear here as the college publishes them." to="/register" linkText="Be part of it"/>}
      </div></section>

      <section className="ccx-section ccx-events"><div className="wrap">
        <SectionHeading label="REUNITE • LEARN • CELEBRATE" title={<>Good connections deserve<br/><span>great moments.</span></>} text="Upcoming reunions, meetups and shared experiences from your alumni network." to="/events" action="All events"/>
        {eventsError && <p className="ccx-data-error" role="alert">Events could not be loaded: {eventsError}</p>}
        {eventsLoading ? <div className="ccx-skeleton-row ccx-skeleton-events"><div/><div/><div/></div> : upcoming.length ? <div className="ccx-events-grid">{upcoming.map((event, index) => <EventCard key={event.id} event={event} index={index}/>)}</div> : <MiniEmpty icon={CalendarDays} title="Something exciting is on the way" description="Upcoming reunions, alumni talks and workshops will be listed here once announced." to="/events" linkText="Browse all events"/>}
      </div></section>

      <section className="ccx-section ccx-latest"><div className="wrap">
        <SectionHeading label="STAY IN THE LOOP" title={<>Fresh opportunities.<br/><span>New conversations.</span></>} text="The latest opportunities and updates from around the alumni network."/>
        <div className="ccx-latest-grid">
          <div className="ccx-latest-col" data-reveal><div className="ccx-latest-heading"><span className="ccx-latest-icon"><BriefcaseBusiness size={21}/></span><h3>Career openings</h3><Link to="/jobs" aria-label="See all career opportunities"><ArrowUpRight size={20}/></Link></div>
            {jobsError && <p className="ccx-data-error" role="alert">Jobs could not be loaded: {jobsError}</p>}
            {jobsLoading ? <p className="ccx-loading">Loading opportunities…</p> : latestJobs.length ? latestJobs.map((job) => <Link to="/jobs" className="ccx-latest-item" key={job.id}><span><b>{job.title || "Career opportunity"}</b><small>{job.company || "Alumni opportunity"} {job.location ? ` · ${job.location}` : ""}</small></span><ArrowUpRight size={17}/></Link>) : <p className="ccx-latest-placeholder">New career opportunities will appear here when approved.</p>}
            <Link to="/jobs" className="ccx-latest-footer">Explore careers <ArrowRight size={16}/></Link>
          </div>
          <div className="ccx-latest-col" data-reveal><div className="ccx-latest-heading"><span className="ccx-latest-icon ccx-latest-icon-news"><BookOpen size={21}/></span><h3>Campus & alumni news</h3><Link to="/news" aria-label="See all news"><ArrowUpRight size={20}/></Link></div>
            {newsError && <p className="ccx-data-error" role="alert">News could not be loaded: {newsError}</p>}
            {newsLoading ? <p className="ccx-loading">Loading news…</p> : latestNews.length ? latestNews.map((item) => <Link to={`/news/${item.id}`} className="ccx-latest-item" key={item.id}><span><b>{item.title || "Latest announcement"}</b><small>{humanDate(item.createdAt)}</small></span><ArrowUpRight size={17}/></Link>) : <p className="ccx-latest-placeholder">Published college announcements and alumni news will appear here.</p>}
            <Link to="/news" className="ccx-latest-footer">Read the bulletin <ArrowRight size={16}/></Link>
          </div>
        </div>
      </div></section>

      <section className="ccx-join"><div className="wrap ccx-join-inner" data-reveal><div className="ccx-join-visual"><span className="ccx-join-orbit ccx-join-orbit-a"/><span className="ccx-join-orbit ccx-join-orbit-b"/><GraduationCap size={110} strokeWidth={1.1}/></div><div className="ccx-join-content"><span className="ccx-join-eyebrow"><Sparkles size={15}/> THIS IS YOUR COMMUNITY</span><h2>Once part of the story.<br/><em>Always part of the family.</em></h2><p>Whatever you've become, wherever life has taken you—there's a place for you here.</p><div className="ccx-join-actions"><Link to="/register" className="ccx-join-primary">Become a member <ArrowUpRight size={18}/></Link><Link to="/about" className="ccx-join-secondary">Our story <ArrowRight size={17}/></Link></div></div><div className="ccx-join-decor">✳</div></div></section>
    </div>
  );
}

const homepageCss = `
/* Scoped to the home page: existing global fonts are preserved. */
.ccx-home { --ccx-navy:#102d53; --ccx-ink:#173354; --ccx-muted:#60738b; --ccx-blue:#225eb6; --ccx-cyan:#7ed5e7; --ccx-line:#e5ecf4; color:var(--ccx-ink); overflow:clip; }
.ccx-home * { box-sizing:border-box; }
.ccx-home h1,.ccx-home h2,.ccx-home h3 { letter-spacing:-.047em; }
.ccx-home a { text-decoration:none; }
.ccx-home button,.ccx-home a { -webkit-tap-highlight-color:transparent; }
.ccx-home :focus-visible { outline:3px solid #56bcef; outline-offset:4px; }
.ccx-home [data-reveal] { opacity:0; transform:translateY(35px); transition:opacity .72s ease,transform .72s cubic-bezier(.2,.85,.2,1); transition-delay:var(--reveal-delay,0ms); }
.ccx-home [data-reveal].ccx-visible { opacity:1; transform:translateY(0); }
.ccx-hero { background:linear-gradient(122deg,#0b2c58 0%,#10427e 58%,#0e6784 100%); color:white; position:relative; overflow:hidden; isolation:isolate; }
.ccx-hero:before { content:''; position:absolute; inset:0; background-image:radial-gradient(#ffffff31 1px,transparent 1px); background-size:26px 26px; opacity:.12; mask-image:linear-gradient(100deg,transparent 5%,#000 100%); z-index:-1; }
.ccx-hero-glow { position:absolute; right:-12%; top:-35%; width:70%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,#1ab7c732 0%,#71c8ff13 40%,transparent 70%); pointer-events:none; animation:ccx-glow 9s ease-in-out infinite alternate; }
.ccx-hero-layout { display:grid; grid-template-columns:minmax(0,1.02fr) minmax(0,1fr); gap:clamp(30px,5vw,85px); min-height:630px; padding-top:67px; padding-bottom:70px; align-items:center; position:relative; z-index:1; }
.ccx-hero-copy { padding:17px 0 28px; }
.ccx-hero-label { display:inline-flex; align-items:center; gap:10px; font-size:10px; font-weight:800; letter-spacing:.16em; color:#bcddf3; }
.ccx-label-star { display:grid; place-items:center; width:29px; height:29px; background:#ffffff18; border:1px solid #ffffff42; border-radius:9px; color:#98ecf0; }
.ccx-hero h1 { margin:24px 0 24px; color:#fff; font-size:clamp(46px,4.8vw,72px); line-height:1.16; font-weight:800; max-width:720px; }
.ccx-title-mark { color:#9ae9de; position:relative; white-space:nowrap; }
.ccx-title-swish { position:absolute; left:0; right:0; bottom:-9px; height:13px; border:solid #65cfdc; border-width:0 0 3px 0; border-radius:50%; transform:rotate(-2deg); opacity:.7; }
.ccx-hero-description { font-size:15px; line-height:1.9; max-width:495px; color:#c7ddf4; margin:0; }
.ccx-hero-actions { display:flex; align-items:center; flex-wrap:wrap; gap:19px; margin:34px 0 44px; }
.ccx-primary-cta { display:inline-flex; justify-content:space-between; align-items:center; gap:20px; padding:8px 8px 8px 23px; min-height:57px; background:#fff; color:#163c73; font-size:13px; font-weight:800; border-radius:10px; box-shadow:0 12px 35px #041e3d50; transition:transform .22s,box-shadow .22s; }
.ccx-primary-cta span { display:grid; place-items:center; width:41px; height:41px; background:#1f5ab0; color:#fff; border-radius:7px; }
.ccx-primary-cta:hover { transform:translateY(-3px); box-shadow:0 18px 45px #041e3d65; }
.ccx-secondary-cta { display:inline-flex; align-items:center; gap:11px; color:#e1ecfb; font-size:13px; font-weight:800; transition:color .2s; }
.ccx-secondary-cta:hover { color:#83f6e8; }
.ccx-hero-trust { display:flex; gap:15px; align-items:center; }
.ccx-hero-trust p { margin:0; font-size:12px; color:#a6c0db; line-height:1.6; }
.ccx-hero-trust strong { color:#f3fbff; }
.ccx-overlap-avatars { display:flex; padding-left:8px; }
.ccx-overlap-avatars span { width:39px; height:39px; display:grid; place-items:center; border-radius:50%; border:3px solid #174879; color:#0b457b; background:#e7e1ff; margin-left:-9px; }
.ccx-overlap-avatars span:nth-child(2) { background:#ffe2bc; }
.ccx-overlap-avatars span:nth-child(3) { background:#b9f0e6; }
.ccx-visual { --mx:0px; --my:0px; width:100%; max-width:536px; min-height:496px; position:relative; margin:auto; background:linear-gradient(140deg,#0d345e,#1c5a86 70%,#137e8e); border:1px solid #ffffff38; border-radius:26px; overflow:hidden; box-shadow:0 28px 75px #03163378,inset 0 1px 0 #ffffff33; transform:translate3d(var(--mx),var(--my),0); transition:transform .3s ease; }
.ccx-visual:before { content:''; position:absolute; width:330px; height:330px; border-radius:50%; background:#45c6f624; filter:blur(40px); top:10%; left:16%; }
.ccx-visual-grid { position:absolute; inset:0; background-image:linear-gradient(#ffffff0d 1px,transparent 1px),linear-gradient(90deg,#ffffff0d 1px,transparent 1px); background-size:36px 36px; mask-image:radial-gradient(circle at center,#000,transparent 78%); }
.ccx-visual-caption { display:flex; justify-content:space-between; align-items:center; gap:5px; position:absolute; left:27px; top:28px; right:27px; color:#c7eaf6; font-size:9px; font-weight:800; letter-spacing:.14em; z-index:3; }
.ccx-visual-caption>span:last-child { color:#93decf; }
.ccx-live-light { display:inline-block; background:#83f5cd; border-radius:50%; width:7px; height:7px; box-shadow:0 0 0 5px #83f5cd21; }
.ccx-orbit { position:absolute; border:1px dashed #ddfaff4f; border-radius:50%; left:50%; top:53%; transform:translate(-50%,-50%); animation:ccx-spin 40s linear infinite; }
.ccx-orbit-one { width:255px; height:255px; }
.ccx-orbit-two { width:365px; height:365px; animation-direction:reverse; border-color:#ddfaff2c; }
.ccx-orbit-three { width:460px; height:460px; animation-duration:57s; border-color:#ddfaff18; }
.ccx-orbit-dot { position:absolute; width:9px; height:9px; background:#89e9e8; border-radius:50%; box-shadow:0 0 0 7px #89e9e81b,0 0 23px #89e9e8; animation:ccx-pulse 4s ease-in-out infinite; }
.ccx-dot-a { top:24%; right:26%; }.ccx-dot-b { bottom:24%; left:14%; animation-delay:1s; }.ccx-dot-c { top:46%; left:14%; animation-delay:2s; }
.ccx-visual-center { position:absolute; left:50%; top:51%; width:239px; height:239px; transform:translate(-50%,-50%); background:linear-gradient(160deg,#d8ecff2b,#b2d7ff0b); border:1px solid #c8eeff76; backdrop-filter:blur(14px); box-shadow:0 0 0 16px #ffffff09,0 0 60px #5acaff25; border-radius:50%; display:flex; justify-content:center; align-items:center; flex-direction:column; text-align:center; padding:30px; z-index:1; animation:ccx-core-breathe 5s ease-in-out infinite; }
.ccx-center-icon { width:64px; height:64px; display:grid; place-items:center; border-radius:21px; background:#d6f4ff21; color:#b9f4f3; margin-bottom:14px; }
.ccx-visual-center strong { font-size:17px; line-height:1.45; color:#fff; letter-spacing:-.02em; }
.ccx-visual-center>span { font-size:9px; font-weight:800; letter-spacing:.19em; margin-top:11px; color:#a3dfec; }
.ccx-people-tag { position:absolute; display:flex; align-items:center; gap:10px; background:#fff; box-shadow:0 14px 38px #041c3870; border:1px solid #f1f7ff; border-radius:14px; padding:11px 12px; min-width:208px; max-width:220px; z-index:3; animation:ccx-float 6s ease-in-out infinite; }
.ccx-people-tag>span:nth-child(2) { flex:1; display:flex; flex-direction:column; min-width:0; }
.ccx-people-tag b { color:#24445f; font-size:11px; white-space:nowrap; }
.ccx-people-tag small { color:#8396aa; font-size:9px; margin-top:4px; white-space:nowrap; }
.ccx-people-tag>svg { color:#3069b5; }
.ccx-people-one { left:13px; top:102px; }.ccx-people-two { right:12px; top:231px; animation-delay:-2s; }.ccx-people-three { left:16px; bottom:60px; animation-delay:-4s; }
.ccx-mini-avatar { width:37px; height:37px; flex-shrink:0; border-radius:11px; display:grid; place-items:center; }.ccx-avatar-orange { background:#ffefd8; color:#cb7928; }.ccx-avatar-mint { background:#d9f8ed; color:#159c7a; }.ccx-avatar-blue { background:#e1edff; color:#3471bc; }
.ccx-visual-bottom { position:absolute; bottom:20px; left:25px; right:25px; display:flex; justify-content:space-between; font-size:9px; letter-spacing:.14em; font-weight:800; color:#a0c7d9; }
.ccx-sparkle { position:absolute; color:#9ee5e7; animation:ccx-spark 5s ease-in-out infinite; }.ccx-sparkle-a { top:21%; right:12%; font-size:29px; }.ccx-sparkle-b { bottom:22%; left:13%; font-size:21px; animation-delay:2s; }
.ccx-hero-scrolldown { position:absolute; bottom:18px; right:calc((100% - min(1160px,100% - 48px))/2); color:#bbd6ea; font-size:9px; letter-spacing:.17em; font-weight:800; display:flex; gap:12px; align-items:center; }
.ccx-hero-scrolldown svg { animation:ccx-bounce 2.5s ease-in-out infinite; }
.ccx-metrics { background:#fff; position:relative; border-bottom:1px solid var(--ccx-line); }
.ccx-metrics-inner { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)) minmax(0,1.35fr); padding-top:30px; padding-bottom:30px; }
.ccx-metric { display:flex; flex-direction:column; gap:7px; padding:9px 25px; border-right:1px solid #e5edf6; }
.ccx-metric:first-child { padding-left:0; }.ccx-metric:last-child { border-right:0; }.ccx-metric>span { color:#2c75aa; letter-spacing:.1em; font-size:9px; font-weight:800; }
.ccx-metric>strong { font-family:"Plus Jakarta Sans",sans-serif; font-size:40px; line-height:1.2; color:#173967; letter-spacing:-.065em; }
.ccx-metric>small { font-size:11px; color:#778b9f; }.ccx-metric-message { padding-left:40px; }
.ccx-metric-message>strong { font-size:20px; letter-spacing:-.04em; }.ccx-metric-message>strong em { font-style:normal; color:#208f9b; }.ccx-metric-message small { display:flex; align-items:center; gap:5px; }
.ccx-ticker { overflow:hidden; height:48px; background:#e8f6f7; display:flex; align-items:center; border-bottom:1px solid #d5ecef; }
.ccx-ticker-track { display:flex; width:max-content; white-space:nowrap; animation:ccx-marquee 40s linear infinite; color:#286e82; font-size:10px; font-weight:800; letter-spacing:.21em; }
.ccx-ticker-track>span { padding-right:0; }.ccx-ticker-track span span { color:#39b4a8; font-size:17px; vertical-align:-1px; padding:0 27px; }
.ccx-section { padding:100px 0; }.ccx-eyebrow { display:inline-flex; align-items:center; gap:10px; font-size:10px; letter-spacing:.16em; font-weight:900; color:#187c97; }.ccx-eyebrow-dot { width:7px; height:7px; background:#32c1aa; border-radius:50%; box-shadow:0 0 0 5px #39c5b31f; }
.ccx-section-heading { display:flex; align-items:end; justify-content:space-between; gap:25px; margin-bottom:41px; }
.ccx-section-heading h2 { font-size:clamp(30px,3.4vw,47px); line-height:1.17; font-weight:800; margin:15px 0 13px; color:#183450; }
.ccx-section-heading h2 span { color:#2787a4; }.ccx-section-heading p { max-width:550px; color:#6b7e94; line-height:1.8; font-size:14px; margin:0; }
.ccx-text-action { display:inline-flex; gap:11px; align-items:center; flex-shrink:0; font-size:12px; font-weight:800; color:#205c9e; border-bottom:1px solid #a5c5e6; padding:10px 0; transition:gap .2s,color .2s; }.ccx-text-action:hover { gap:16px; color:#0e8d9e; }
.ccx-why { background:#fbfcff; }
.ccx-benefit-grid { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:17px; }
.ccx-feature { grid-column:span 2; min-height:286px; border:1px solid #e3eaf2; border-radius:19px; background:#fff; position:relative; padding:25px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 9px 28px #274d8510; transition:transform .25s,box-shadow .25s,border-color .25s; }
.ccx-feature:hover { transform:translateY(-7px) !important; border-color:#b6d8eb; box-shadow:0 20px 42px #274d8523; }
.ccx-feature:nth-child(4),.ccx-feature:nth-child(5) { grid-column:span 3; min-height:252px; }
.ccx-feature-top { display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2; font-size:9px; letter-spacing:.12em; font-weight:800; color:#7990aa; }
.ccx-feature-arrow { display:grid; place-items:center; width:34px; height:34px; background:#f0f5fc; color:#1d5eaa; border-radius:10px; transition:transform .25s; }.ccx-feature:hover .ccx-feature-arrow { transform:translate(3px,-3px); }
.ccx-feature-content { position:relative; z-index:2; margin-top:auto; }
.ccx-feature-icon { color:#1c78bb; margin:27px 0 14px; }
.ccx-feature h3 { font-size:21px; margin:0 0 8px; line-height:1.3; color:#173957; }
.ccx-feature p { font-size:12px; line-height:1.7; max-width:285px; margin:0 0 16px; color:#667d93; }
.ccx-feature-link { display:inline-flex; align-items:center; gap:8px; color:#1f64a9; font-size:11px; font-weight:800; }.ccx-feature-decor { position:absolute; right:-20px; bottom:-33px; color:#b5d3fa2d; transform:rotate(-12deg); transition:transform .3s; }.ccx-feature:hover .ccx-feature-decor { transform:rotate(0deg) scale(1.06); }
.ccx-feature-people { background:linear-gradient(150deg,#eaf5ff,#fff 72%); }.ccx-feature-career { background:linear-gradient(150deg,#e8f8f5,#fff 72%); }.ccx-feature-mentor { background:linear-gradient(150deg,#f2ecff,#fff 72%); }.ccx-feature-events { background:linear-gradient(150deg,#fff3e9,#fff 72%); }.ccx-feature-community { background:linear-gradient(150deg,#eaf5ff,#fff 72%); }
.ccx-feature-career .ccx-feature-icon,.ccx-feature-career .ccx-feature-link { color:#158a77; }.ccx-feature-mentor .ccx-feature-icon { color:#8a68c9; }.ccx-feature-events .ccx-feature-icon { color:#c97840; }
.ccx-story { background:#f0f6fd; padding:102px 0; }.ccx-story-grid { display:grid; grid-template-columns:1fr 1fr; align-items:center; gap:clamp(38px,7vw,95px); }
.ccx-story-visual { min-height:485px; border-radius:25px; overflow:hidden; background:linear-gradient(145deg,#0c3468,#286da9 60%,#1a8f9b); position:relative; color:#eaf8ff; box-shadow:0 24px 60px #24558329; }
.ccx-story-grid-pattern { position:absolute; inset:0; background-image:radial-gradient(#ffffff34 1px,transparent 1px); background-size:19px 19px; mask-image:linear-gradient(to bottom,#000,transparent); }
.ccx-story-large-symbol { position:absolute; top:47px; left:50%; transform:translateX(-50%); display:grid; place-items:center; width:250px; height:250px; border-radius:50%; background:#d3f8ff12; border:1px solid #e5ffff58; box-shadow:0 0 0 20px #f5ffff08,0 0 0 49px #f5ffff08; animation:ccx-float 6s ease-in-out infinite; }
.ccx-story-overlay { position:absolute; bottom:33px; left:33px; right:33px; padding:23px; backdrop-filter:blur(12px); background:#092e569a; border:1px solid #ffffff36; border-radius:14px; }.ccx-story-mini-heading { color:#90eee4; font-size:9px; font-weight:800; letter-spacing:.14em; }.ccx-story-overlay strong { display:block; font-size:25px; line-height:1.35; margin:10px 0 18px; letter-spacing:-.04em; }.ccx-story-pills { display:flex; gap:8px; flex-wrap:wrap; }.ccx-story-pills span { display:inline-flex; gap:5px; align-items:center; border-radius:40px; padding:7px 8px; background:#ffffff1f; font-size:10px; }
.ccx-story-decor-dot { position:absolute; color:#8beade; font-size:40px; right:32px; top:40px; }
.ccx-story-copy h2 { font-size:clamp(30px,3.2vw,46px); line-height:1.21; margin:17px 0; }.ccx-story-copy h2 em { color:#238ba3; font-style:normal; }.ccx-story-copy>p { max-width:490px; color:#677f97; line-height:1.85; font-size:14px; }
.ccx-story-steps { margin:26px 0 31px; }.ccx-story-steps>div { display:flex; align-items:flex-start; gap:17px; border-bottom:1px solid #dbe6f0; padding:16px 0; }.ccx-story-steps>div>span { display:grid; place-items:center; width:36px; height:36px; flex-shrink:0; background:white; border:1px solid #d6e7f5; border-radius:10px; color:#207bb2; font-weight:800; font-size:11px; }.ccx-story-steps p { display:flex; flex-direction:column; gap:4px; margin:0; }.ccx-story-steps strong { font-size:13px; color:#233e5b; }.ccx-story-steps small { font-size:12px; color:#778da1; }
.ccx-story-button { display:inline-flex; align-items:center; gap:14px; background:#1e5ca7; border-radius:9px; padding:14px 21px; color:#fff; font-size:12px; font-weight:800; transition:background .2s,transform .2s; }.ccx-story-button:hover { background:#1685a3; transform:translateY(-3px); }
.ccx-showcase { background:#fff; }.ccx-alumni-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:17px; }
.ccx-alumni-card { display:flex; flex-direction:column; min-width:0; padding:21px; border:1px solid #e1eaf4; border-radius:17px; background:#fff; transition:box-shadow .25s,border-color .25s,transform .25s; }.ccx-alumni-card:hover { box-shadow:0 15px 32px #1e56871d; border-color:#b4d6ed; transform:translateY(-5px) !important; }
.ccx-alumni-card-top { display:flex; justify-content:space-between; align-items:center; color:#2876a9; }.ccx-listed-label { display:inline-flex; align-items:center; gap:5px; background:#e9f8f0; color:#19895d; padding:6px 9px; font-size:10px; font-weight:800; border-radius:20px; }
.ccx-alumni-avatar { display:grid; place-items:center; width:93px; height:93px; margin:30px auto 20px; border-radius:50%; background:linear-gradient(125deg,#d9e8ff,#9dd0ef); color:#1a598e; font-size:25px; font-weight:800; box-shadow:0 0 0 10px #eef6ff; }.ccx-alumni-avatar-1 { background:linear-gradient(125deg,#d4f8e5,#8fcaba); box-shadow:0 0 0 10px #edfaf3; color:#126f6b; }.ccx-alumni-avatar-2 { background:linear-gradient(125deg,#fce5d4,#e6bdb3); box-shadow:0 0 0 10px #fff5ed; color:#9c5c43; }.ccx-alumni-avatar-3 { background:linear-gradient(125deg,#eee1ff,#c8bce8); box-shadow:0 0 0 10px #f7f2ff; color:#7357a6; }
.ccx-alumni-card h3 { font-size:17px; text-align:center; margin:5px 0; overflow-wrap:anywhere; }.ccx-alumni-role { font-size:12px; color:#266ba8; font-weight:800; text-align:center; margin:4px 0; }.ccx-alumni-work { text-align:center; margin:3px 0 23px; font-size:11px; color:#8294a5; flex:1; }.ccx-alumni-foot { padding-top:17px; border-top:1px solid #e6edf5; display:flex; gap:7px; flex-wrap:wrap; justify-content:space-between; }.ccx-alumni-foot span { display:flex; gap:5px; align-items:center; font-size:10px; color:#69829b; }
.ccx-events { background:#f4f8fd; }.ccx-events-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; }.ccx-event-card { border-radius:18px; overflow:hidden; border:1px solid #e2eaf3; background:#fff; transition:transform .25s,box-shadow .25s; }.ccx-event-card:hover { transform:translateY(-5px) !important; box-shadow:0 15px 32px #1e568720; }
.ccx-event-art { height:185px; background:linear-gradient(125deg,#123c78,#2789b5); position:relative; display:grid; place-items:center; color:#e7f8ff; overflow:hidden; }.ccx-event-art-1 { background:linear-gradient(125deg,#1d768e,#23ada4); }.ccx-event-art-2 { background:linear-gradient(125deg,#354c8f,#967ac1); }.ccx-event-art>svg { z-index:1; transition:transform .35s; }.ccx-event-card:hover .ccx-event-art>svg { transform:scale(1.12) rotate(-5deg); }
.ccx-event-ring { position:absolute; width:270px; height:270px; border-radius:50%; border:1px solid #ffffff4d; box-shadow:0 0 0 27px #ffffff16,0 0 0 65px #ffffff0d; }.ccx-event-category { position:absolute; top:17px; left:17px; border-radius:30px; padding:6px 10px; color:#fff; border:1px solid #ffffff63; background:#ffffff18; font-size:9px; font-weight:800; letter-spacing:.09em; }.ccx-event-date-box { position:absolute; right:17px; bottom:15px; display:flex; align-items:center; flex-direction:column; background:white; padding:7px 13px; min-width:58px; border-radius:9px; color:#1d5b9e; }.ccx-event-date-box b { font-size:20px; line-height:1.1; }.ccx-event-date-box small { font-size:9px; font-weight:900; }
.ccx-event-info { padding:23px; }.ccx-event-meta { color:#28859e; font-size:10px; font-weight:800; }.ccx-event-meta span { color:#91a4b7; margin:0 4px; }.ccx-event-info h3 { font-size:18px; line-height:1.4; margin:13px 0; min-height:50px; }.ccx-event-info p { display:flex; align-items:center; gap:7px; font-size:12px; color:#8395a6; margin-bottom:20px; }.ccx-event-link { display:inline-flex; align-items:center; gap:9px; color:#1e65ae; font-weight:800; font-size:12px; }
.ccx-latest { background:#fff; }.ccx-latest-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; }.ccx-latest-col { border:1px solid #e1e9f3; border-radius:19px; padding:28px; background:#fff; }.ccx-latest-heading { display:flex; align-items:center; gap:12px; padding-bottom:22px; border-bottom:1px solid #e8eef5; }.ccx-latest-icon { background:#e8f5ff; color:#2472ae; border-radius:11px; width:43px; height:43px; display:grid; place-items:center; }.ccx-latest-icon-news { background:#e8faf1; color:#168e78; }.ccx-latest-heading h3 { font-size:17px; flex:1; margin:0; }.ccx-latest-heading>a { color:#2573ab; }
.ccx-latest-item { display:flex; align-items:center; justify-content:space-between; padding:17px 0; gap:15px; border-bottom:1px solid #ecf0f5; color:#266ca5; }.ccx-latest-item:hover b { color:#1383a7; }.ccx-latest-item span { display:flex; flex-direction:column; gap:6px; min-width:0; }.ccx-latest-item b { color:#274360; font-size:13px; transition:color .2s; }.ccx-latest-item small { font-size:11px; color:#8a9cad; }.ccx-latest-item>svg { flex-shrink:0; }.ccx-latest-footer { display:inline-flex; align-items:center; gap:8px; color:#2066a6; font-size:12px; font-weight:800; margin-top:20px; }.ccx-latest-placeholder,.ccx-loading { font-size:13px; padding:23px 0; min-height:113px; color:#8298ac; }
.ccx-join { padding:0 0 98px; background:#fff; }.ccx-join-inner { position:relative; min-height:380px; overflow:hidden; border-radius:25px; background:linear-gradient(120deg,#12396f,#15588d 60%,#198b95); color:#fff; display:grid; grid-template-columns:240px 1fr; align-items:center; gap:30px; padding:52px clamp(35px,7vw,105px); box-shadow:0 20px 50px #1352871f; }.ccx-join-inner:before { content:''; position:absolute; inset:0; background-image:radial-gradient(#ffffff22 1px,transparent 1px); background-size:21px 21px; opacity:.3; pointer-events:none; }.ccx-join-visual { width:195px; height:195px; position:relative; border-radius:50%; border:1px solid #bbf7ff76; box-shadow:0 0 0 24px #ffffff0c,0 0 0 50px #ffffff07; display:grid; place-items:center; color:#c5f7f2; }.ccx-join-orbit { position:absolute; left:50%; top:50%; border:1px dashed #ffffff5c; border-radius:50%; animation:ccx-spin 38s linear infinite; }.ccx-join-orbit-a { width:250px; height:250px; }.ccx-join-orbit-b { width:302px; height:302px; animation-direction:reverse; border-color:#ffffff25; }.ccx-join-content { position:relative; z-index:1; }.ccx-join-eyebrow { display:inline-flex; gap:8px; align-items:center; font-size:10px; letter-spacing:.15em; font-weight:900; color:#acf1e3; }.ccx-join h2 { color:#fff; font-size:clamp(29px,3.2vw,43px); line-height:1.25; margin:16px 0 12px; }.ccx-join h2 em { color:#a4f0e2; font-style:normal; }.ccx-join p { color:#d2e6f4; font-size:14px; max-width:485px; line-height:1.8; }.ccx-join-actions { display:flex; gap:20px; align-items:center; flex-wrap:wrap; margin-top:25px; }.ccx-join-primary { background:#fff; border-radius:9px; color:#174b85; padding:15px 22px; display:inline-flex; gap:15px; align-items:center; font-weight:800; font-size:12px; transition:transform .2s; }.ccx-join-primary:hover { transform:translateY(-3px); }.ccx-join-secondary { display:inline-flex; align-items:center; gap:9px; color:#fff; font-size:12px; font-weight:800; }.ccx-join-decor { position:absolute; right:37px; top:25px; color:#b5f4ee; font-size:56px; animation:ccx-spark 7s ease-in-out infinite; }
.ccx-empty { grid-column:1/-1; border:1px dashed #cbdbea; padding:49px 20px; border-radius:17px; background:#f8fbff; text-align:center; }.ccx-empty-icon { width:68px; height:68px; margin:auto; background:#e7f2fd; display:grid; place-items:center; border-radius:20px; color:#2678b6; }.ccx-empty h3 { font-size:18px; margin:17px 0 6px; }.ccx-empty p { max-width:470px; margin:0 auto 16px; color:#758da2; font-size:13px; }.ccx-inline-link { display:inline-flex; align-items:center; gap:8px; font-size:12px; font-weight:800; color:#216bac; }
.ccx-data-error { font-size:12px; color:#ae414f; background:#fff0f2; padding:12px 16px; border:1px solid #f0ccd1; border-radius:9px; margin-bottom:20px; }
.ccx-skeleton-row { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }.ccx-skeleton-row div { min-height:285px; border-radius:17px; background:linear-gradient(95deg,#edf2f7,#f8fafc,#edf2f7); background-size:200% 100%; animation:ccx-shimmer 1.6s linear infinite; }.ccx-skeleton-events { grid-template-columns:repeat(3,1fr); }
@keyframes ccx-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
@keyframes ccx-glow { 0% { transform:translate(-20px,-10px) scale(.95); } 100% { transform:translate(18px,20px) scale(1.06); } }
@keyframes ccx-spin { to { transform:translate(-50%,-50%) rotate(360deg); } }
@keyframes ccx-pulse { 0%,100% { opacity:.5; transform:scale(.8); } 50% { opacity:1; transform:scale(1.35); } }
@keyframes ccx-core-breathe { 0%,100% { box-shadow:0 0 0 16px #ffffff09,0 0 60px #5acaff25; } 50% { box-shadow:0 0 0 23px #ffffff09,0 0 80px #5acaff40; } }
@keyframes ccx-spark { 0%,100% { transform:rotate(0deg); opacity:.65; } 50% { transform:rotate(45deg); opacity:1; } }
@keyframes ccx-bounce { 0%,100% { transform:translateY(-3px); } 50% { transform:translateY(4px); } }
@keyframes ccx-marquee { to { transform:translateX(-50%); } }
@keyframes ccx-shimmer { to { background-position-x:-200%; } }
@media (max-width:1100px) { .ccx-hero-layout { gap:28px; }.ccx-hero h1 { font-size:clamp(41px,4.7vw,58px); }.ccx-people-tag { transform:scale(.89); }.ccx-people-one { left:-10px; }.ccx-people-two { right:-10px; }.ccx-feature h3 { font-size:18px; }.ccx-alumni-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:900px) { .ccx-hero-layout { grid-template-columns:1fr; padding-top:64px; }.ccx-hero-copy { max-width:700px; }.ccx-visual { max-width:600px; min-height:470px; }.ccx-hero-scrolldown { display:none; }.ccx-metrics-inner { grid-template-columns:repeat(2,1fr); gap:0; }.ccx-metric { border-bottom:1px solid #edf2f7; padding:18px 20px; }.ccx-metric:nth-child(2) { border-right:0; }.ccx-metric:nth-child(3),.ccx-metric:nth-child(4) { border-bottom:0; }.ccx-metric-message { padding-left:20px; }.ccx-benefit-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }.ccx-feature,.ccx-feature:nth-child(4),.ccx-feature:nth-child(5) { grid-column:auto; }.ccx-feature:last-child { grid-column:1/-1; }.ccx-story-grid { grid-template-columns:1fr; }.ccx-story-visual { min-height:400px; }.ccx-story-copy { max-width:630px; }.ccx-events-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }.ccx-join-inner { grid-template-columns:165px 1fr; padding:48px; }.ccx-join-visual { width:145px; height:145px; }.ccx-join-visual svg { width:75px; }.ccx-join-orbit-a { width:195px; height:195px; }.ccx-join-orbit-b { width:240px; height:240px; } }
@media (max-width:640px) { .ccx-section { padding:68px 0; }.ccx-hero-layout { padding-top:49px; padding-bottom:52px; gap:25px; }.ccx-hero h1 { font-size:clamp(37px,9vw,54px); }.ccx-hero-label { font-size:9px; letter-spacing:.1em; }.ccx-hero-description { font-size:13px; }.ccx-hero-actions { gap:16px; margin:27px 0 31px; }.ccx-primary-cta { width:100%; }.ccx-hero-trust { margin-top:10px; }.ccx-visual { min-height:365px; border-radius:18px; }.ccx-visual-caption { font-size:8px; top:20px; left:17px; right:17px; }.ccx-visual-caption>span:last-child { display:none; }.ccx-visual-center { width:190px; height:190px; }.ccx-visual-center strong { font-size:13px; }.ccx-center-icon { width:50px; height:50px; margin-bottom:9px; }.ccx-center-icon svg { width:31px; }.ccx-orbit-one { width:210px; height:210px; }.ccx-orbit-two { width:292px; height:292px; }.ccx-orbit-three { width:390px; height:390px; }.ccx-people-tag { min-width:142px; max-width:152px; padding:8px; gap:6px; border-radius:9px; scale:.82; }.ccx-people-tag b { font-size:9px; }.ccx-people-tag small { font-size:7px; }.ccx-mini-avatar { width:27px; height:27px; border-radius:8px; }.ccx-mini-avatar svg { width:14px; }.ccx-people-tag>svg { display:none; }.ccx-people-one { left:-14px; top:72px; }.ccx-people-two { right:-13px; top:178px; }.ccx-people-three { left:-13px; bottom:34px; }.ccx-visual-bottom { font-size:7px; bottom:14px; }.ccx-metrics-inner { padding-top:12px; padding-bottom:12px; }.ccx-metric { padding:14px 10px; }.ccx-metric:first-child { padding-left:10px; }.ccx-metric>strong { font-size:32px; }.ccx-metric>span { font-size:8px; }.ccx-metric-message>strong { font-size:17px; }.ccx-ticker { height:38px; }.ccx-section-heading { display:block; margin-bottom:29px; }.ccx-section-heading h2 { font-size:clamp(28px,7.7vw,39px); }.ccx-section-heading p { font-size:13px; }.ccx-text-action { margin-top:15px; }.ccx-benefit-grid { grid-template-columns:1fr; gap:13px; }.ccx-feature,.ccx-feature:nth-child(4),.ccx-feature:nth-child(5),.ccx-feature:last-child { grid-column:1; min-height:225px; }.ccx-feature-icon { margin:16px 0 11px; }.ccx-story { padding:68px 0; }.ccx-story-visual { min-height:360px; }.ccx-story-large-symbol { top:38px; width:160px; height:160px; }.ccx-story-large-symbol svg { width:80px; }.ccx-story-overlay { bottom:18px; left:16px; right:16px; padding:16px; }.ccx-story-overlay strong { font-size:20px; }.ccx-story-copy h2 { font-size:31px; }.ccx-alumni-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:11px; }.ccx-alumni-card { padding:13px; }.ccx-listed-label { font-size:8px; padding:5px; }.ccx-alumni-avatar { width:67px; height:67px; font-size:20px; margin:24px auto 15px; }.ccx-alumni-card h3 { font-size:14px; }.ccx-alumni-role,.ccx-alumni-work { font-size:10px; }.ccx-alumni-foot { flex-direction:column; }.ccx-events-grid,.ccx-latest-grid { grid-template-columns:1fr; }.ccx-join { padding-bottom:65px; }.ccx-join-inner { display:block; padding:35px 26px; min-height:auto; border-radius:17px; }.ccx-join-visual { display:none; }.ccx-join h2 { font-size:29px; }.ccx-skeleton-row { grid-template-columns:repeat(2,1fr); }.ccx-skeleton-events { grid-template-columns:1fr; } }
@media (max-width:375px) { .ccx-hero h1 { font-size:36px; }.ccx-alumni-grid { grid-template-columns:1fr; }.ccx-visual-center { width:172px; height:172px; }.ccx-people-three { bottom:25px; }.ccx-visual { min-height:350px; } }
@media (prefers-reduced-motion:reduce) { .ccx-home *, .ccx-home *:before,.ccx-home *:after { animation:none !important; scroll-behavior:auto !important; transition:none !important; }.ccx-home [data-reveal] { opacity:1 !important; transform:none !important; }.ccx-visual { transform:none !important; } }
`;

export default Home;
