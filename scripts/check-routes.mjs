/** Lightweight route regression guard; runs without third-party dependencies. */
import fs from 'node:fs';
const app = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const layout = fs.readFileSync(new URL('../src/components/Components.jsx', import.meta.url), 'utf8');
const publicPages = fs.readFileSync(new URL('../src/pages/PublicPages.jsx', import.meta.url), 'utf8');
const paths = [
  ['public events', '<Route path="events" element={<PublicEvents'],
  ['public jobs', '<Route path="jobs" element={<PublicJobs'],
  ['public news', '<Route path="news" element={<PublicNews'],
  ['public news detail', '<Route path="news/:id" element={<PublicNewsDetail'],
  ['member events', '<Route path="events" element={<MemberEvents'],
  ['member jobs', '<Route path="jobs" element={<MemberJobs'],
  ['email verification', '<Route path="verify-email" element={<EmailVerification'],
  ['admin events', '<Route path="events" element={<ManageEvents'],
  ['admin jobs', '<Route path="jobs" element={<ManageJobs'],
  ['admin news', '<Route path="news" element={<ManageNews']
];
for (const [name, marker] of paths) {
  if (!app.includes(marker)) throw Error(`Missing ${name}: ${marker}`);
}
const menuLinks = [
  '/events', '/jobs', '/news', '/app/events', '/app/jobs',
  '/admin/events', '/admin/jobs', '/admin/news'
];
for (const link of menuLinks) {
  if (!layout.includes(`'${link}'`) && !layout.includes(`to="${link}"`)) {
    throw Error(`Navigation link missing: ${link}`);
  }
}
if (!publicPages.includes('export function PublicNews()')) throw Error('Public news list missing');
if (!publicPages.includes('export function PublicNewsDetail()')) throw Error('Public news detail missing');
console.log('Route regression check passed: public, member, admin routes + navigation + news pages.');
