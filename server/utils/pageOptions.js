// Shared pagination helper: every list endpoint accepts ?page= and ?limit=.
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// Turns the query string into skip/limit values that are always safe to use.
function pageOptions(query = {}) {
  const page = toPositiveInt(query.page, 1);
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

// The one envelope every list response uses, so the client always knows
// how many pages are left.
function pagedResult(items, total, page, limit) {
  return {
    items,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    total,
    limit,
  };
}

module.exports = { pageOptions, pagedResult, DEFAULT_LIMIT, MAX_LIMIT };
