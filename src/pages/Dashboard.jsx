import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  HeartHandshake,
  ArrowRight,
  UserRound,
  Users,
  ShieldAlert,
  BookOpen,
} from "lucide-react";
import { collection, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../auth/AuthContext";
import {
  PageTitle,
  StatsCard,
  useLive,
  Empty,
  Alert,
  Status,
} from "../components/Components";
import { humanDate } from "../lib/helpers";
export function Dashboard() {
  const { user, profile, isStaff, emailVerified } = useAuth();
  const { rows: events } = useLive(
    query(
      collection(db, "alumni_event_registrations"),
      where("userId", "==", user.uid)
    ),
    [user.uid]
  );
  const { rows: apps } = useLive(
    query(
      collection(db, "alumni_job_applications"),
      where("userId", "==", user.uid)
    ),
    [user.uid]
  );
  const { rows: requests } = useLive(
    query(
      collection(db, "alumni_mentorship_requests"),
      where("menteeId", "==", user.uid)
    ),
    [user.uid]
  );
  const verified = profile?.status === "verified" || isStaff;
  return (
    <>
      <PageTitle
        eyebrow="MY DASHBOARD"
        title={`Hello, ${profile?.name?.split(" ")[0] || "Member"}!`}
        subtitle="Here's what is happening in your alumni community."
        action={<Status value={profile?.status} />}
      />
      {!verified && (
        <Alert type="warning">
          <strong>College verification is pending.</strong> Your dashboard tabs
          are available now. College approval is separate from email OTP
          verification.
        </Alert>
      )}
      {!emailVerified && (
        <Alert type="warning">
          <strong>Verify your email to enable member actions.</strong> We will
          send a six-digit code to your registered email.{" "}
          <Link to="/app/verify-email" className="text-link">
            Send / enter code <ArrowRight size={16} />
          </Link>{" "}
          If you do not receive it, check Spam/Junk.
        </Alert>
      )}
      {profile?.status === "rejected" && (
        <Alert type="error">
          Your verification was not approved. Contact the Alumni Cell for
          clarification.
        </Alert>
      )}
      <div className="stats-grid">
        <StatsCard
          icon={CalendarDays}
          label="My Event Registrations"
          value={events.length}
          note="Events you're attending"
        />
        <StatsCard
          icon={BriefcaseBusiness}
          label="Job Applications"
          value={apps.length}
          note="Applications submitted"
        />
        <StatsCard
          icon={HeartHandshake}
          label="Mentor Requests"
          value={requests.length}
          note="Guidance requests"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Account Status"
          value={verified ? "Verified" : "Pending"}
          note="College verification"
        />
      </div>
      <div className="dashboard-two">
        <section className="panel">
          <div className="panel-top">
            <h2>Quick actions</h2>
          </div>
          <div className="quick-grid">
            <Link to="/app/profile">
              <UserRound size={22} />
              Edit my profile
              <ArrowRight size={15} />
            </Link>
            <Link to="/app/career">
              <BriefcaseBusiness size={22} />
              Career journey
              <ArrowRight size={15} />
            </Link>
            <Link to="/app/events">
              <CalendarDays size={22} />
              Explore events
              <ArrowRight size={15} />
            </Link>
            <Link to="/app/mentorship">
              <HeartHandshake size={22} />
              Find mentors
              <ArrowRight size={15} />
            </Link>
            <Link to="/directory">
              <Users size={22} />
              Alumni directory
              <ArrowRight size={15} />
            </Link>
            <Link to="/app/community">
              <BookOpen size={22} />
              Community feed
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
        <section className="panel">
          <div className="panel-top">
            <h2>My Profile Details</h2>
            <Link to="/app/profile" className="text-link">
              Edit <ArrowRight size={15} />
            </Link>
          </div>
          <div className="detail-list">
            <div>
              <span>Name</span>
              <strong>{profile.name}</strong>
            </div>
            <div>
              <span>Account type</span>
              <strong>{profile.role}</strong>
            </div>
            <div>
              <span>Course</span>
              <strong>{profile.program}</strong>
            </div>
            <div>
              <span>Department</span>
              <strong>{profile.department}</strong>
            </div>
            <div>
              <span>Passing Year</span>
              <strong>{profile.graduationYear}</strong>
            </div>
            <div>
              <span>Roll / Registration</span>
              <strong>{profile.rollNumber}</strong>
            </div>
          </div>
        </section>
      </div>
      <div className="panel">
        <div className="panel-top">
          <h2>Recent event registrations</h2>
          <Link className="text-link" to="/app/events">
            Browse Events <ArrowRight size={15} />
          </Link>
        </div>
        {events.length ? (
          <div className="list-rows">
            {events.slice(0, 5).map((e) => (
              <div key={e.id} className="list-row">
                <CalendarDays size={19} />
                <span>
                  <strong>Registration ID: {e.eventId}</strong>
                  <small>Registered {humanDate(e.createdAt)}</small>
                </span>
                <Status value={e.status} />
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="No registrations yet"
            text="Explore alumni events and reserve your place."
            icon={CalendarDays}
          />
        )}
      </div>
    </>
  );
}
