exports.getPagination = (page, size) => {
  page = page - 1;
  const limit = size ? +size : 5;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

exports.getPagingData = (data, page, limit) => {
  let { count: totalItems, rows: tableRows } = data;
  totalItems = typeof totalItems === "object" ? totalItems.length : totalItems;

  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    total: totalItems,
    data: tableRows,
    totalPage: totalPages,
    page: currentPage,
  };
};
