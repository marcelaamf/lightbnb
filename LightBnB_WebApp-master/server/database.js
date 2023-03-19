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
getUserWithEmail('test2@example.com').then((result) => {
  console.log(result);
});
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
      console.log("User added:", result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.error("Error adding user", err.message);
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
  return getAllProperties(null, 2);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {
      // console.log(result.rows)
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
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
