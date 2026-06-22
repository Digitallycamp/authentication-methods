const PresidentModel = require("./presidents.model");
const getPresident = (id) => {
  return PresidentModel.findById(id);
};
const getPresidents = (
  query,
  options = {},
) => {
  const { skip = 0, limit = 0 } =
    options;
  const cursor = PresidentModel.find(
    query,
  ).select(
    "name country  year_in_office",
  );

  if (skip > 0) cursor.skip(skip);
  if (limit > 0) cursor.limit(limit);
  return cursor;
};

module.exports = {
  getPresident,
  getPresidents,
};
