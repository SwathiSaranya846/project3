// ─── middleware/validate.js ───────────────────────────────────────
// The Gatekeeper Rule: "Never Trust the Client."
// App-level validation runs BEFORE hitting the database.
// Schema-level constraints are the SECOND layer inside MongoDB.
// ──────────────────────────────────────────────────────────────────

const isValidEmail    = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isNonEmpty      = (v) => typeof v === 'string' && v.trim().length > 0;
const ROLES           = ['admin', 'member'];
const STATUSES        = ['todo', 'in-progress', 'done'];
const PRIORITIES      = ['low', 'medium', 'high'];

const fail = (res, details) =>
  res.status(400).json({ success: false, error: 'Validation failed', details });

// ── Users ──────────────────────────────────────────────────────────
const validateCreateUser = (req, res, next) => {
  const errors = [];
  const { name, email, role } = req.body;
  if (!isNonEmpty(name))  errors.push('name is required');
  if (!isNonEmpty(email)) errors.push('email is required');
  else if (!isValidEmail(email)) errors.push('email format is invalid');
  if (role && !ROLES.includes(role)) errors.push(`role must be: ${ROLES.join(' | ')}`);
  if (errors.length) return fail(res, errors);
  next();
};

const validateUpdateUser = (req, res, next) => {
  const errors = [];
  const { name, email, role } = req.body;
  if (name  !== undefined && !isNonEmpty(name))  errors.push('name must be non-empty');
  if (email !== undefined) {
    if (!isNonEmpty(email))      errors.push('email must be non-empty');
    else if (!isValidEmail(email)) errors.push('email format is invalid');
  }
  if (role !== undefined && !ROLES.includes(role)) errors.push(`role must be: ${ROLES.join(' | ')}`);
  if (errors.length) return fail(res, errors);
  next();
};

// ── Tasks ──────────────────────────────────────────────────────────
const validateCreateTask = (req, res, next) => {
  const errors = [];
  const { title, status, priority } = req.body;
  if (!isNonEmpty(title))  errors.push('title is required');
  if (status   && !STATUSES.includes(status))     errors.push(`status must be: ${STATUSES.join(' | ')}`);
  if (priority && !PRIORITIES.includes(priority)) errors.push(`priority must be: ${PRIORITIES.join(' | ')}`);
  if (errors.length) return fail(res, errors);
  next();
};

const validateUpdateTask = (req, res, next) => {
  const errors = [];
  const { title, status, priority } = req.body;
  if (title    !== undefined && !isNonEmpty(title))         errors.push('title must be non-empty');
  if (status   !== undefined && !STATUSES.includes(status)) errors.push(`status must be: ${STATUSES.join(' | ')}`);
  if (priority !== undefined && !PRIORITIES.includes(priority)) errors.push(`priority must be: ${PRIORITIES.join(' | ')}`);
  if (errors.length) return fail(res, errors);
  next();
};

module.exports = { validateCreateUser, validateUpdateUser, validateCreateTask, validateUpdateTask };