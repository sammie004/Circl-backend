const db = require('../connection/connection');

const SentInvites = async (req, res) => {
  const senderID = req.user.id;

  const query = `
    SELECT 
      c.id AS connection_id,
      c.status,
      c.created_at AS sent_at,
      u.id AS receiver_id,
      u.email AS receiver_email
    FROM connections c
    JOIN users u ON u.id = c.receiver_id
    WHERE c.sender_id = ?
    ORDER BY c.created_at DESC
  `;

  db.query(query, [senderID], (err, results) => {
    if (err) {
      console.error('[SENT INVITES] Error fetching sent invites:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const invites = results.map(row => ({
      connection_id: row.connection_id,
      status: row.status,
      sent_at: row.sent_at,
      user: {
        id: row.receiver_id,
        email: row.receiver_email
      }
    }));

    return res.status(200).json({
      message: 'Sent invites fetched successfully',
      invites
    });
  });
};

module.exports = { SentInvites };
