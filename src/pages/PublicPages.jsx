import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Network,
  Quote,
  Rocket,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { collection, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  useLive,
  Empty,
  PageTitle,
  Avatar,
  Status,
} from "../components/Components";
import { humanDate, isValidUrl } from "../lib/helpers";
import { site } from "../lib/site";
const directoryQuery = query(
  collection(db, "alumni_profiles"),
  where("directoryStatus", "==", "listed")
);
const publicEventQuery = query(
  collection(db, "alumni_events"),
  where("status", "==", "published")
);
const jobQuery = query(
  collection(db, "alumni_jobs"),
  where("status", "==", "approved")
);
const newsQuery = query(
  collection(db, "alumni_news"),
  where("status", "==", "published")
);
const features = [
  [
    Users,
    "Discover Alumni",
    "Connect with graduates across branches, cities and industries.",
    "/directory",
  ],
  [
    BriefcaseBusiness,
    "Career Opportunities",
    "Find roles, internships and referrals shared by alumni.",
    "/jobs",
  ],
  [
    CalendarDays,
    "Events & Reunions",
    "Stay connected through events, meets and online sessions.",
    "/events",
  ],
  [
    HeartHandshake,
    "Learn from Mentors",
    "Build meaningful mentoring relationships.",
    "/mentorship",
  ],
  [
    Award,
    "Celebrate Success",
    "Recognize achievements, promotions and innovations.",
    "/directory",
  ],
  [
    Network,
    "Grow Your Community",
    "Take part in alumni discussions and networking.",
    "/community",
  ],
];
export function Home() {
  const { rows: events } = useLive(publicEventQuery, []),
    { rows: alumni } = useLive(directoryQuery, []),
    { rows: news } = useLive(newsQuery, []);
  const upcoming = events
    .filter((e) => new Date(e.date + "T23:59:59") >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <div className="hero-pill">
              <Sparkles size={14} /> The official alumni community
            </div>
            <h1>
              Our campus.
              <br />
              <em>Our connections.</em>
              <br />
              Our future.
            </h1>
            <p>
              Reconnect with classmates, celebrate your journey, find new
              opportunities, and create an impact for the next generation.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-white">
                Join the Alumni Network <ArrowRight size={17} />
              </Link>
              <Link to="/directory" className="btn btn-outline-white">
                Explore Alumni
              </Link>
            </div>
            <div className="hero-trust">
              <div className="avatar-stack">
                <span>AS</span>
                <span>RK</span>
                <span>PM</span>
                <span>NK</span>
              </div>
              <span>One community. Countless possibilities.</span>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="floating-badge f-one">
              <Award size={20} /> Celebrate achievements
            </div>
            <div className="floating-badge f-two">
              <BriefcaseBusiness size={20} /> Discover opportunities
            </div>
            <div className="central-visual">
              <GraduationCap size={80} strokeWidth={1.5} />
              <strong>ALUMNI</strong>
              <span>CONNECTED</span>
            </div>
            <div className="hero-dots" />
          </div>
        </div>
      </section>
      <section className="numbers-strip">
        <div className="wrap numbers-grid">
          <div>
            <strong>{alumni.length}+</strong>
            <span>Visible Alumni Profiles</span>
          </div>
          <div>
            <strong>{events.length}+</strong>
            <span>Published Events</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>Community Driven</span>
          </div>
          <div>
            <strong>∞</strong>
            <span>Possibilities Together</span>
          </div>
        </div>
      </section>
      <section className="section wrap">
        <div className="section-intro">
          <span className="eyebrow">WHY JOIN US</span>
          <h2>A network that grows with you</h2>
          <p>
            Everything you need to stay connected, inspired and ahead in your
            career.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(([Icon, title, desc, path]) => (
            <Link to={path} key={title} className="feature-card">
              <div className="feature-icon">
                <Icon size={25} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span>
                Explore more <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section tone">
        <div className="wrap split-section">
          <div className="illustration-card">
            <div className="ill-circle">
              <Users size={68} />
            </div>
            <div className="ill-floating ill-a">
              <CheckCircle2 size={20} /> Verified profiles
            </div>
            <div className="ill-floating ill-b">
              <MapPin size={20} /> Across the globe
            </div>
          </div>
          <div>
            <span className="eyebrow">STAY CONNECTED</span>
            <h2>Your journey, your people, your community.</h2>
            <p>
              From your first job to your next big milestone, CampusConnect
              keeps the doors of your alma mater open. Connect, mentor, share
              opportunities and participate in meaningful events.
            </p>
            <ul className="checklist">
              <li>
                <CheckCircle2 />
                Create your professional alumni profile
              </li>
              <li>
                <CheckCircle2 />
                Share career milestones and achievements
              </li>
              <li>
                <CheckCircle2 />
                Give back through mentoring and events
              </li>
            </ul>
            <Link to="/register" className="btn btn-primary">
              Become a member <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section wrap">
        <div className="section-bar">
          <div>
            <span className="eyebrow">WHAT'S HAPPENING</span>
            <h2>Upcoming alumni events</h2>
          </div>
          <Link className="text-link" to="/events">
            View all events <ArrowRight size={16} />
          </Link>
        </div>
        <div className="three-cards">
          {upcoming.length ? (
            upcoming.map((e) => <EventPreview key={e.id} event={e} />)
          ) : (
            <div className="span-full">
              <Empty
                title="Events will appear here"
                text="The alumni team will announce reunions, webinars and workshops soon."
                icon={CalendarDays}
              />
            </div>
          )}
        </div>
      </section>
      {news.length > 0 && (
        <section className="section tone">
          <div className="wrap">
            <div className="section-bar">
              <div>
                <span className="eyebrow">ALUMNI BULLETIN</span>
                <h2>Latest news & updates</h2>
              </div>
              <Link className="text-link" to="/news">
                All news <ArrowRight size={16} />
              </Link>
            </div>
            <div className="three-cards">
              {news.slice(0, 3).map((n) => (
                <article className="simple-card" key={n.id}>
                  <span className="eyebrow">{humanDate(n.createdAt)}</span>
                  <h3>
                    <Link to={`/news/${n.id}`}>{n.title}</Link>
                  </h3>
                  <p>
                    {n.body?.slice(0, 240)}
                    {n.body?.length > 240 ? "…" : ""}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="cta-section">
        <div className="wrap cta-inner">
          <div>
            <span className="eyebrow light">YOUR NEXT CHAPTER</span>
            <h2>Once a student. Always part of the family.</h2>
            <p>Join your fellow alumni and keep making memories that matter.</p>
          </div>
          <Link to="/register" className="btn btn-white">
            Register Now <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
function EventPreview({ event }) {
  return (
    <article className="event-card">
      <div className="event-graphic">
        <CalendarDays size={52} />
        <span className="graphic-tag">{event.category || "Campus Event"}</span>
      </div>
      <div className="event-card-body">
        <span className="meta">
          {humanDate(event.date)} · {event.time || "Time TBA"}
        </span>
        <h3>{event.title}</h3>
        <p>
          <MapPin size={14} />
          {event.venue || "Online"}
        </p>
        <Link className="text-link" to="/events">
          Event details <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
export function Directory() {
  const { rows, loading, error } = useLive(directoryQuery, []);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const filtered = useMemo(
    () =>
      rows
        .filter(
          (a) =>
            (dept === "all" || a.department === dept) &&
            [
              a.displayName,
              a.company,
              a.jobTitle,
              a.city,
              a.graduationYear,
              a.department,
            ]
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase())
        )
        .sort((a, b) =>
          (a.displayName || "").localeCompare(b.displayName || "")
        ),
    [rows, search, dept]
  );
  const departments = [
    ...new Set(rows.map((x) => x.department).filter(Boolean)),
  ];
  return (
    <section className="section wrap">
      <PageTitle
        eyebrow="PEOPLE & CONNECTIONS"
        title="Discover our alumni"
        subtitle="Find fellow graduates, discover their career journeys and build meaningful professional connections."
      />
      <div className="filter-card">
        <label className="search-input">
          <Search size={18} />
          <input
            placeholder="Search name, company, batch or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      {error && <div className="notice error">{error}</div>}
      {loading ? (
        <div className="muted">Loading directory...</div>
      ) : filtered.length ? (
        <div className="directory-grid">
          {filtered.map((a) => (
            <article className="person-card" key={a.id}>
              <div className="person-top">
                <Avatar name={a.displayName} size={68} />
                <span className="verified-pill">
                  <CheckCircle2 size={13} /> Verified
                </span>
              </div>
              <h3>{a.displayName}</h3>
              <p className="person-role">
                {a.jobTitle || a.headline || "Alumni Member"}
              </p>
              <p className="muted">{a.company || a.department}</p>
              <div className="person-details">
                <span>
                  <GraduationCap size={14} /> Batch {a.graduationYear || "—"}
                </span>
                <span>
                  <MapPin size={14} />
                  {a.city || "Location not shared"}
                </span>
              </div>
              <Link to={`/directory/${a.id}`} className="btn btn-soft full">
                View Profile <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="No alumni found"
          text="Try another search or check again after profiles have been verified."
          icon={Users}
        />
      )}
    </section>
  );
}
export function AlumniDetail() {
  const { id } = useParams();
  const { rows } = useLive(directoryQuery, []);
  const person = rows.find((a) => a.id === id);
  if (!person)
    return (
      <section className="section wrap">
        <Empty
          title="Profile not available"
          text="This alumni profile is private, unavailable, or not yet verified."
        />
      </section>
    );
  return (
    <section className="section wrap">
      <Link className="text-link" to="/directory">
        ← Back to Directory
      </Link>
      <div className="detail-profile">
        <div className="profile-banner" />
        <div className="profile-detail-body">
          <Avatar name={person.displayName} size={96} />
          <Status value="verified" />
          <h1>{person.displayName}</h1>
          <h3>{person.headline || person.jobTitle || "Alumni Member"}</h3>
          <p>
            {person.company} {person.city && ` · ${person.city}`}
          </p>
          <div className="detail-tags">
            <span>{person.program}</span>
            <span>{person.department}</span>
            <span>Batch {person.graduationYear}</span>
          </div>
          <h2>About</h2>
          <p>{person.about || "This alumnus has not added a biography yet."}</p>
          {person.skills?.length > 0 && (
            <>
              <h2>Skills</h2>
              <div className="chips">
                {person.skills.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </>
          )}
          {person.mentorAvailable && (
            <p className="notice success">
              Open to mentoring students and fellow alumni.
            </p>
          )}
          <div className="action-row">
            {person.linkedin && isValidUrl(person.linkedin) && (
              <a
                className="btn btn-primary"
                href={person.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn Profile <ArrowRight size={16} />
              </a>
            )}
            {person.website && isValidUrl(person.website) && (
              <a
                className="btn btn-soft"
                href={person.website}
                target="_blank"
                rel="noreferrer"
              >
                Website <ArrowRight size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
export function PublicEvents() {
  const { rows, loading, error } = useLive(publicEventQuery, []);
  return (
    <section className="section wrap">
      <PageTitle
        eyebrow="GATHER, LEARN, CELEBRATE"
        title="Events & reunions"
        subtitle="From annual alumni meets to workshops and webinars, there's always a reason to reconnect."
      />
      <div className="three-cards">
        {rows
          .slice()
          .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
          .map((e) => (
            <EventPreview key={e.id} event={e} />
          ))}
      </div>
      {!loading && !rows.length && (
        <Empty title="No events published yet" icon={CalendarDays} />
      )}{" "}
      {error && <div className="notice error">{error}</div>}
      <div className="center-space">
        <Link className="btn btn-primary" to="/app/events">
          Register for an Event <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
export function PublicJobs() {
  const { rows, loading, error } = useLive(jobQuery, []);
  return (
    <section className="section wrap">
      <PageTitle
        eyebrow="CAREERS & OPPORTUNITIES"
        title="Opportunities from our network"
        subtitle="Browse approved jobs and internships shared by the alumni community."
      />
      <div className="two-cards">
        {rows.map((j) => (
          <article className="simple-card" key={j.id}>
            <div className="row between">
              <span className="badge-soft">{j.type || "Job"}</span>
              <span className="muted small">{humanDate(j.createdAt)}</span>
            </div>
            <h3>{j.title}</h3>
            <p>
              <BriefcaseBusiness size={14} /> {j.company}
            </p>
            <p>
              <MapPin size={14} /> {j.location || "Flexible"}
            </p>
            <p>{j.description?.slice(0, 160)}</p>
            <Link className="text-link" to="/app/jobs">
              See details & apply <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </div>
      {!loading && !rows.length && (
        <Empty icon={BriefcaseBusiness} title="Opportunities coming soon" />
      )}
      {error && <div className="notice error">{error}</div>}
    </section>
  );
}
/** Published announcements are publicly readable; drafts are excluded by the Firestore query and rules. */
export function PublicNews() {
  const { rows, loading, error } = useLive(newsQuery, []);
  const [search, setSearch] = useState("");
  const visible = rows
    .filter((item) =>
      [item.title, item.body]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  return (
    <section className="section wrap">
      <PageTitle
        eyebrow="ALUMNI BULLETIN"
        title="News & announcements"
        subtitle="Updates, achievements and important notices from the Alumni Cell."
      />
      <div className="filter-card">
        <label className="search-input">
          <Search size={18} />
          <input
            aria-label="Search news"
            placeholder="Search news and announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {error && <div className="notice error">{error}</div>}
      {loading && <div className="muted">Loading announcements...</div>}
      <div className="two-cards">
        {visible.map((item) => (
          <article className="simple-card" key={item.id}>
            <span className="eyebrow">{humanDate(item.createdAt)}</span>
            <h3>{item.title}</h3>
            <p>
              {item.body?.slice(0, 260)}
              {item.body?.length > 260 ? "…" : ""}
            </p>
            <Link to={`/news/${item.id}`} className="text-link">
              Read announcement <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </div>
      {!loading && !visible.length && (
        <Empty
          title={
            search
              ? "No matching announcements"
              : "No announcements published yet"
          }
          text="Published alumni announcements will appear here."
          icon={BookOpen}
        />
      )}
    </section>
  );
}

export function PublicNewsDetail() {
  const { id } = useParams();
  const { rows, loading, error } = useLive(newsQuery, []);
  const article = rows.find((item) => item.id === id);
  return (
    <section className="section wrap">
      <Link to="/news" className="text-link">
        ← All news & announcements
      </Link>
      {error && <div className="notice error">{error}</div>}
      {loading ? (
        <p className="muted">Loading article...</p>
      ) : article ? (
        <article className="panel" style={{ maxWidth: 850, marginTop: 24 }}>
          <span className="eyebrow">{humanDate(article.createdAt)}</span>
          <h1 style={{ marginTop: 12 }}>{article.title}</h1>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
            {article.body}
          </p>
        </article>
      ) : (
        <Empty
          title="Announcement not available"
          text="It may have been unpublished or removed."
          icon={BookOpen}
        />
      )}
    </section>
  );
}

export function PublicMentorship() {
  return (
    <section className="section wrap">
      <div className="split-section">
        <div>
          <span className="eyebrow">GROW TOGETHER</span>
          <h1 className="display-title">Guidance that makes a difference.</h1>
          <p>
            Connect with experienced alumni mentors for career guidance, higher
            education advice, portfolio reviews and professional development.
          </p>
          <ul className="checklist">
            <li>
              <CheckCircle2 />
              Find mentors across departments and industries
            </li>
            <li>
              <CheckCircle2 />
              Send mentorship requests
            </li>
            <li>
              <CheckCircle2 />
              Manage mentorship conversations and outcomes
            </li>
          </ul>
          <Link className="btn btn-primary" to="/app/mentorship">
            Find a Mentor <ArrowRight size={16} />
          </Link>
        </div>
        <div className="illustration-card purple-ill">
          <HeartHandshake size={110} />
        </div>
      </div>
    </section>
  );
}
export function PublicCommunity() {
  return (
    <section className="section wrap">
      <div className="split-section">
        <div>
          <span className="eyebrow">ALUMNI COMMUNITY</span>
          <h1 className="display-title">Share stories. Spark conversations.</h1>
          <p>
            Discover achievements, industry insights, career updates and
            discussions shared by graduates. Members can write posts and engage
            with approved community content.
          </p>
          <Link className="btn btn-primary" to="/app/community">
            Visit Community <ArrowRight size={16} />
          </Link>
        </div>
        <div className="illustration-card">
          <MessagesIllustration />
        </div>
      </div>
    </section>
  );
}
function MessagesIllustration() {
  return (
    <div className="messages-ill">
      <Quote size={66} />
      <div>
        YOUR STORY
        <br />
        INSPIRES
        <br />
        SOMEONE
      </div>
    </div>
  );
}
export function About() {
  return (
    <section className="section wrap">
      <PageTitle
        eyebrow="ABOUT THE ASSOCIATION"
        title="More than graduates. A lifelong community."
        subtitle={`The ${site.college} alumni network brings together former students, current students and faculty to support one another.`}
      />
      <div className="feature-grid">
        <div className="simple-card">
          <Award />
          <h3>Our Mission</h3>
          <p>
            Help graduates connect, collaborate, mentor future talent and
            celebrate professional achievements.
          </p>
        </div>
        <div className="simple-card">
          <Compass />
          <h3>Our Vision</h3>
          <p>
            A vibrant, inclusive alumni network that creates meaningful
            opportunities for lifelong learning and contribution.
          </p>
        </div>
        <div className="simple-card">
          <Rocket />
          <h3>Our Promise</h3>
          <p>
            A trusted platform for alumni career tracking, events, mentoring and
            college engagement.
          </p>
        </div>
      </div>
      <div className="info-banner">
        <div>
          <h2>Be part of something greater</h2>
          <p>
            Join the community and help build the future of alumni engagement.
          </p>
        </div>
        <Link to="/register" className="btn btn-white">
          Join Today <ArrowRight size={16} />
        </Link>
      </div>
      <p className="muted center-space">
        Contact the Alumni Cell:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
    </section>
  );
}
export { publicEventQuery, jobQuery, directoryQuery, newsQuery };
