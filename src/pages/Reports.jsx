import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Download,
  GraduationCap,
  Users,
} from "lucide-react";
import { PageTitle, StatsCard, Alert, useLive } from "../components/Components";
import { collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { csvDownload } from "../lib/helpers";
const colorList = [
  "#2364bd",
  "#10a3a1",
  "#ffb454",
  "#8569d3",
  "#f17674",
  "#56a7df",
  "#8dbb68",
];
const count = (arr, key) =>
  Object.entries(
    arr.reduce((acc, item) => {
      const x = item[key] || "Not specified";
      acc[x] = (acc[x] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
export function Reports() {
  const { rows: users, error } = useLive(collection(db, "alumni_users"), []),
    { rows: profiles } = useLive(collection(db, "alumni_profiles"), []),
    { rows: career } = useLive(collection(db, "alumni_career_history"), []),
    { rows: education } = useLive(
      collection(db, "alumni_education_history"),
      []
    ),
    { rows: events } = useLive(collection(db, "alumni_events"), []),
    { rows: regs } = useLive(collection(db, "alumni_event_registrations"), []),
    { rows: applications } = useLive(
      collection(db, "alumni_job_applications"),
      []
    );
  const alumni = users.filter((u) => u.role === "alumni");
  const verified = alumni.filter((u) => u.status === "verified");
  const departments = count(verified, "department");
  const batches = count(verified, "graduationYear").sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const roles = count(users, "role");
  const verifiedIds = new Set(verified.map((x) => x.id));
  const verifiedProfiles = profiles.filter((p) => verifiedIds.has(p.ownerId));
  const outcomes = count(verifiedProfiles, "careerStatus");
  const currentJobs = verifiedProfiles.filter((p) => p.company?.trim()).length;
  const location = count(
    verifiedProfiles.filter((p) => p.city),
    "city"
  );
  const latestCareer = useMemo(() => {
    const currentIds = new Set(
      career.filter((c) => !c.endDate).map((c) => c.ownerId)
    );
    return currentIds.size;
  }, [career]);
  function download() {
    csvDownload(
      alumni.map((u) => {
        const p = profiles.find((x) => x.ownerId === u.id) || {};
        return {
          name: u.name,
          email: u.email,
          rollNumber: u.rollNumber,
          program: u.program,
          department: u.department,
          graduationYear: u.graduationYear,
          status: u.status,
          company: p.company || "",
          jobTitle: p.jobTitle || "",
          careerStatus: p.careerStatus || "",
          city: p.city || "",
          careerEntries: career.filter((c) => c.ownerId === u.id).length,
          higherEducationEntries: education.filter((e) => e.ownerId === u.id)
            .length,
        };
      }),
      "alumni-outcomes.csv"
    );
  }
  return (
    <>
      <PageTitle
        eyebrow="INSTITUTIONAL REPORTING"
        title="Reports & Analytics"
        subtitle="Track verified alumni, self-reported career outcomes, registration activity and institutional engagement."
        action={
          <button onClick={download} className="btn btn-primary btn-small">
            <Download size={16} />
            Export Alumni CSV
          </button>
        }
      />
      {error && <Alert type="error">{error}</Alert>}
      <div className="stats-grid">
        <StatsCard
          icon={Users}
          label="Alumni Accounts"
          value={alumni.length}
          note={`${verified.length} verified`}
        />
        <StatsCard
          icon={BriefcaseBusiness}
          label="Profiles Reporting Company"
          value={currentJobs}
          note="Self-reported"
        />
        <StatsCard
          icon={GraduationCap}
          label="Higher Education Entries"
          value={education.length}
          note="Self-reported entries"
        />
        <StatsCard
          icon={CalendarDays}
          label="Event Registrations"
          value={regs.length}
          note={`${events.length} events created`}
        />
      </div>
      <div className="dashboard-two">
        <section className="panel">
          <h2>Verified Alumni by Department</h2>
          <div className="chart-box">
            {departments.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departments.slice(0, 10)}
                  layout="vertical"
                  margin={{ left: 30, right: 15 }}
                >
                  <CartesianGrid strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={118}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Alumni"
                    fill="#2364bd"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="muted">No verified alumni records.</p>
            )}
          </div>
        </section>
        <section className="panel">
          <h2>Verified Alumni by Batch</h2>
          <div className="chart-box">
            {batches.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={batches}>
                  <defs>
                    <linearGradient id="batchFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#2663bd"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="#2663bd"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area
                    dataKey="value"
                    type="monotone"
                    name="Alumni"
                    stroke="#2663bd"
                    strokeWidth={3}
                    fill="url(#batchFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="muted">No batch data yet.</p>
            )}
          </div>
        </section>
        <section className="panel">
          <h2>Self-Reported Career Status</h2>
          <div className="chart-box">
            {outcomes.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {outcomes.map((r, i) => (
                      <Cell
                        fill={colorList[i % colorList.length]}
                        key={r.name}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="muted">No career statuses reported.</p>
            )}
          </div>
        </section>
        <section className="panel">
          <h2>Account Roles</h2>
          <div className="chart-box">
            {roles.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roles}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {roles.map((r, i) => (
                      <Cell
                        fill={colorList[i % colorList.length]}
                        key={r.name}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No data</p>
            )}
          </div>
        </section>
        <section className="panel">
          <h2>Top Alumni Cities</h2>
          <div className="chart-box">
            {location.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={location.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10a3a1" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="muted">Alumni have not shared locations.</p>
            )}
          </div>
        </section>
      </div>
      <section className="panel">
        <h2>Engagement & Outcome Summary</h2>
        <div className="detail-list">
          <div>
            <span>Alumni who published professional company information</span>
            <strong>{currentJobs}</strong>
          </div>
          <div>
            <span>Users with at least one open-ended career-history entry</span>
            <strong>{latestCareer}</strong>
          </div>
          <div>
            <span>Higher education records shared</span>
            <strong>{education.length}</strong>
          </div>
          <div>
            <span>Event registrations</span>
            <strong>{regs.length}</strong>
          </div>
          <div>
            <span>Recorded job applications</span>
            <strong>{applications.length}</strong>
          </div>
        </div>
      </section>
      <Alert type="warning">
        Employment and education data are self-reported, not independently
        authenticated. These are platform counts, not official placement rates.
        For formal accreditation reporting, verify sources, define cohort
        denominators and track response rates.
      </Alert>
    </>
  );
}
