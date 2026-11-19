class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
// lets us use async/await in routes without try/catch everywhere
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// empty text becomes NULL for the database
const nn = (v) => (v === undefined || v === null || v === '' ? null : v);
const need = (cond, msg) => { if (!cond) throw new HttpError(400, msg); };
const dt = (v) => String(v).replace('T', ' ').slice(0, 19);
// an image is either an uploaded file (/uploads/...) or a pasted web link (https://...)
const img = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const ok = typeof v === 'string' && v.length <= 500 && !v.includes('..') && (/^\/uploads\/[\w./-]+$/.test(v) || /^https?:\/\/[^\s"'<>]+$/i.test(v));
  if (!ok) throw new HttpError(400, 'Invalid image. Upload a file or paste a full http(s) image link.');
  return v;
};
module.exports = { HttpError, wrap, nn, need, dt, img };
