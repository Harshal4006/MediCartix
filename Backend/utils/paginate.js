export const parsePagination = (query, defaults = {}) => {
  const defPage = defaults.page ?? 1;
  const defLimit = defaults.limit ?? 20;
  const maxLimit = defaults.maxLimit ?? 50;

  const page = Math.max(1, parseInt(query.page) || defPage);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const paginationMeta = (page, limit, skip, total, count) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
  hasMore: skip + count < total,
});
