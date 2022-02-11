const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  // let user;
  // for (const userId in users) {
  //   user = users[userId];
  //   if (user.email.toLowerCase() === email.toLowerCase()) {
  //     break;
  //   } else {
  //     user = null;
  //   }
  // }
  queryString =`
  SELECT *
  FROM users
  WHERE email = $1`;

  return pool
    .query(queryString, [email])
    .then((result) => result.rows[0])
    .catch((err) => {
    console.log(err.message);
  });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  // return Promise.resolve(users[id]);
  queryString =`
  SELECT *
  FROM users
  WHERE id = $1`;
  return pool
    .query(queryString, [id])
    .then((res) => res.rows[0])
    .catch((err) => {
      console.log(err.message);
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);
  insertString = `
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)`;

  return pool
  .query(insertString, [user.name, user.email, user.password])
  .then((res) => res.rows)
  .catch((err) => {
    console.log(err.message);
  });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  // return getAllProperties(null, 2);
  queryString = `
  SELECT properties.*, reservations.*, AVG(property_reviews.rating) as average_rating
  FROM properties
  JOIN reservations ON properties.id = reservations.property_id
  JOIN property_reviews ON property_reviews.property_id = properties.id
  WHERE reservations.guest_id = $1 AND reservations.end_date < now()::date
  GROUP BY properties.id, reservations.id
  LIMIT $2;`;
  
  const values = [guest_id, limit]

  return pool
  .query(queryString, values)
  .then((result) => result.rows)
  .catch((err) => err.message);
}

exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
//  const getAllProperties = (options, limit = 10) => {
//   return pool
//     .query(`SELECT * FROM properties LIMIT $1`, [limit])
//     .then((result) => result.rows)
//     .catch((err) => {
//       console.log(err.message);
//     });
// };

const getAllProperties = function(options, limit = 10) {

  let queryParams = [];

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  LEFT JOIN property_reviews ON properties.id = property_id
  WHERE true `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND city ILIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `AND owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100, options.maximum_price_per_night * 100);
    queryString += `AND cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length} `;
  }

  queryString += `GROUP BY properties.id `;
 
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams)
    .then(res => res.rows)
    .catch(error => console.error('error', error.stack));
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
// const addProperty = function(property) {
//   const propertyId = Object.keys(properties).length + 1;
//   property.id = propertyId;
//   properties[propertyId] = property;
//   return Promise.resolve(property);
// }
const addProperty = function(property) {
  
  const propOwner = property.owner_id;
  const propTitle = property.title;
  const propDesc = property.description;
  const propThumbnail = property.thumbnail_photo_url;
  const propCover = property.cover_photo_url;
  const propCost = property.cost_per_night;
  const propParking = property.parking_spaces;
  const propBathrooms = property.number_of_bathrooms;
  const propBedrooms = property.number_of_bedrooms;
  const propCountry = property.country;
  const propStreet = property.street;
  const propCity = property.city;
  const propProvince = property.province;
  const propPostal = property.post_code;

  const queryString = `
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;`;

  const formValues = [propOwner, propTitle , propDesc , propThumbnail , propCover , propCost, propParking , propBathrooms , propBedrooms , propCountry, propStreet, propCity , propProvince, propPostal];

  console.log(queryString, formValues);

  return pool.query(queryString, formValues)
    .then(res => res.rows[0])
    .catch(error => console.error('error', error.stack));

};
exports.addProperty = addProperty;

