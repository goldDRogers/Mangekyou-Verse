const supabase = require('../config/supabase');

exports.getStats = async (req, res) => {
    try {
        const { data: referrals, error } = await supabase
            .from('referrals')
            .select('*, referee:referee_id(username, created_at)')
            .eq('referrer_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            count: referrals.length,
            points: req.user.points,
            referrals: referrals.map(r => ({
                ...r,
                _id: r.id,
                referrer: r.referrer_id,
                referee: {
                    _id: r.referee_id,
                    username: r.referee.username,
                    createdAt: r.referee.created_at
                }
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

