const db = require('../connection/connection');

const filterUsers = (req, res) => {
  const { faculty, level } = req.query;

  const query = `
    SELECT
      u.id,
      u.email,
      p.faculty,
      p.level,
      p.full_name
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE
      (? IS NULL OR p.faculty = ?)
      AND
      (? IS NULL OR p.level = ?)
    ORDER BY p.created_at DESC
  `;

  db.query(query, [faculty || null, faculty || null, level || null, level || null], (err, results) => {
    if (err) {
      console.error('[FILTER USERS] Error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(200).json({
      message: 'Users filtered successfully',
      count: results.length,
      users: results
    });
  });
};

module.exports = { filterUsers };
