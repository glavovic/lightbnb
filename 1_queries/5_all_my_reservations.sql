SELECT reservations.*, properties.*, avg(property_reviews.rating)
FROM reservations
JOIN users ON users.id = reservations.guest_id
JOIN properties ON property_id = properties.id
JOIN property_reviews ON reservation_id = reservations.id
WHERE users.id = 1 AND reservations.end_date < now()::date
GROUP BY reservations.id, properties.id
ORDER BY reservations.start_date
LIMIT 10;