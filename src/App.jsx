import React from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';
import { PublicLayout, PortalLayout, Protected } from './components/Components';
import {
  Directory, AlumniDetail, PublicEvents, PublicJobs,
  PublicNews, PublicNewsDetail, PublicMentorship, PublicCommunity, About
} from './pages/PublicPages';
import { Login, Register } from './pages/AuthPages';
import { Dashboard } from './pages/Dashboard';
import { MyProfile, Career } from './pages/Profile';
import { MemberEvents, MemberJobs, MemberMentorship, MemberCommunity } from './pages/Engagement';
import { AdminOverview, ManageAlumni, ManageEvents, ManageJobs, ManageCommunity, ManageNews } from './pages/Admin';
import { Reports } from './pages/Reports';
import { EmailVerification } from './pages/EmailVerification';
import { Home } from "./pages/Home";

function NotFound() {
  return <section className="section wrap">
    <h1>404 · Page not found</h1>
    <p>The requested page does not exist. Choose a section below to continue.</p>
    <div className="action-row">
      <Link className="btn btn-primary" to="/">Home</Link>
      <Link className="btn btn-outline" to="/events">Events</Link>
      <Link className="btn btn-outline" to="/news">News</Link>
    </div>
  </section>;
}

/** URLs are kept consistent with the public header, footer, alumni sidebar and admin sidebar. */
export default function App() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="directory" element={<Directory />} />
      <Route path="directory/:id" element={<AlumniDetail />} />
      <Route path="events" element={<PublicEvents />} />
      <Route path="jobs" element={<PublicJobs />} />
      <Route path="news" element={<PublicNews />} />
      <Route path="news/:id" element={<PublicNewsDetail />} />
      <Route path="mentorship" element={<PublicMentorship />} />
      <Route path="community" element={<PublicCommunity />} />
      <Route path="about" element={<About />} />
      {/* Backwards compatibility with previous release */}
      <Route path="alumni_events" element={<Navigate to="/events" replace />} />
      <Route path="alumni_jobs" element={<Navigate to="/jobs" replace />} />
      <Route path="alumni_news" element={<Navigate to="/news" replace />} />
      <Route path="*" element={<NotFound />} />
    </Route>

    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />

    <Route path="app" element={<Protected><PortalLayout /></Protected>}>
      <Route index element={<Dashboard />} />
      <Route path="profile" element={<MyProfile />} />
      <Route path="verify-email" element={<EmailVerification />} />
      <Route path="career" element={<Career />} />
      <Route path="events" element={<MemberEvents />} />
      <Route path="jobs" element={<MemberJobs />} />
      <Route path="mentorship" element={<MemberMentorship />} />
      <Route path="community" element={<MemberCommunity />} />
      <Route path="alumni_events" element={<Navigate to="/app/events" replace />} />
      <Route path="alumni_jobs" element={<Navigate to="/app/jobs" replace />} />
      <Route path="*" element={<NotFound />} />
    </Route>

    <Route path="admin" element={<Protected staff><PortalLayout admin /></Protected>}>
      <Route index element={<AdminOverview />} />
      <Route path="alumni" element={<ManageAlumni />} />
      <Route path="events" element={<ManageEvents />} />
      <Route path="jobs" element={<ManageJobs />} />
      <Route path="community" element={<ManageCommunity />} />
      <Route path="news" element={<ManageNews />} />
      <Route path="reports" element={<Reports />} />
      <Route path="alumni_events" element={<Navigate to="/admin/events" replace />} />
      <Route path="alumni_jobs" element={<Navigate to="/admin/jobs" replace />} />
      <Route path="alumni_news" element={<Navigate to="/admin/news" replace />} />
      <Route path="*" element={<NotFound />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>;
}
