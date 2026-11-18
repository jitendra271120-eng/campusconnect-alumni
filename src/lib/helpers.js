export const humanDate = value => {
  if (!value) return 'TBA';
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'});
};
export const createdMillis = value => value?.toMillis?.() ?? (value ? new Date(value).getTime() || 0 : 0);
export const clean = value => typeof value === 'string' ? value.trim() : value;
export const compact = str => String(str || '').trim().replace(/\s+/g, ' ');
export const initials = name => String(name || 'A').split(' ').filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase();
export const isValidUrl = url => !url || /^https:\/\//i.test(url);
export const firebaseError = error => ({'auth/email-already-in-use':'An account already exists for this email.','auth/invalid-credential':'Invalid email or password.','auth/weak-password':'Please use a password with at least six characters.','permission-denied':'Firestore rejected this request. The alumni portal security rules may not be deployed to the selected Firebase project. Ask the project administrator to merge and deploy them.', 'unavailable':'Firestore is unavailable. Check your connection and try again.'}[error?.code] || error?.message || 'Something went wrong.');
export const csvDownload = (rows, filename='report.csv') => {
  if (!rows?.length) return false;
  const headers = Object.keys(rows[0]);
  const quote = value => `"${String(value ?? '').replace(/"/g,'""')}"`;
  const csv = '\uFEFF' + [headers.map(quote).join(','), ...rows.map(row=>headers.map(key=>quote(row[key])).join(','))].join('\r\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href); return true;
};
