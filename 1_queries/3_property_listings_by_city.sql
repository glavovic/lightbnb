SELECT properties.* avg(property_reviews.rating) as average_rating
FROM properties
JOIN property_reviews on property_id = properties.id
WHERE city LIKE '%ancouv%' 
GROUP BY properties.id
HAVING avg(property_reviews.rating) >= 4
ORDER BY cost_per_night
limit 10;