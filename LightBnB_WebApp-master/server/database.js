const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require("pg");

const pool = new Pool({
  user: "vitorpratafernandes",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const queryString = `SELECT * FROM users WHERE email = $1;`;
  const queryValues = [email];

  return pool
    .query(queryString, queryValues)
    .then((result) => {
      if (result.rows.length > 0) {
        console.log("User with email:", email, "found:", result.rows[0]);
        return result.rows[0];
      } else {
        console.log("No user found with email:", email);
        return null;
      }
    })
    .catch((err) => {
      console.error("Error getting user with email:", email, err.message);
      return null;
    });
};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const queryString = `SELECT * FROM users WHERE id = $1;`;
  const queryValues = [id];

  return pool
    .query(queryString, queryValues)
    .then((result) => {
      if (result.rows.length > 0) {
        console.log("User with id:", id, "found:", result.rows[0]);
        return result.rows[0];
      } else {
        console.log("No user found with id:", id);
        return null;
      }
    })
    .catch((err) => {
      console.error("Error getting user with id:", id, err.message);
      return null;
    });
};

exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (name, email, password) {
  const queryString = `INSERT INTO users (name, email, password) 
                        VALUES ($1, $2, $3) RETURNING *;`;
  const queryValues = [name, email, password];

  return pool
    .query(queryString, queryValues)
    .then((result) => {
      console.log("User properties", result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.error("Error:", err.message);
      return null;
    });
};

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
 const queryString = `SELECT reservations.*, properties.*,  AVG(property_reviews.rating) AS average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date DESC
  LIMIT $2;`;

  const queryValues = [guest_id, limit];

  return pool
  .query(queryString, queryValues)
  .then((result) => {
    if (result.rows.length > 0) {
      console.log("Reservations for guest with id:", guest_id);
      return result.rows;
    } else {
      console.log("No reservations found for guest with id:", guest_id);
      return null;
    }
  })
  .catch((err) => {
    console.error("Error getting reservations for guest with id:", guest_id, err.message);
    return null;
  });
};


// getAllReservations(10)
//   .then((result) => {
//     if (result) {
//       console.log("Reservations found:", result);
//     } else {
//       console.log("No reservations found");
//     }
//   })
//   .catch((err) => {
//     console.error("Error getting reservations:", err.message);
//   });
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  const queryParams = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(`%${options.owner_id}%`)
      if (queryParams.length === 1) { query
        queryString += `WHERE owner_id = $${queryParams.length}`;
      } else {
        queryString += `AND owner_id = $${queryParams.length}`;
    }
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100, options.maximum_price_per_night * 100);
    if (queryParams.length === 2) {
      queryString += `WHERE cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length} `;
    } else {
      queryString += `AND cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length} `;
    }
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `GROUP BY properties.id
                    HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  } else {
    queryString += `GROUP BY properties.id `;
  }

  queryParams.push(limit);
  queryString += `ORDER BY cost_per_night
                 LIMIT $${queryParams.length};`;

  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams)
    .then((result) => {
      console.log("get all properties:", result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
    const queryString = `INSERT INTO properties (
  owner_id,
  title,
  description,
  thumbnail_photo_url,
  cover_photo_url,
  cost_per_night,
  street,
  city,
  province,
  post_code,
  country,
  parking_spaces,
  number_of_bathrooms,
  number_of_bedrooms)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;`;
  const queryValues = [ 
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms
  ];
  
    return pool
      .query(queryString, queryValues)
      .then((result) => {
        console.log("User properties", result.rows[0]);
        return result.rows[0];
      })
      .catch((err) => {
        console.error("Error:", err.message);
        return null;
      });
  };
exports.addProperty = addProperty;
