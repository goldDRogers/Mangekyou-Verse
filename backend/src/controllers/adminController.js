const supabase = require('../config/supabase');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        if (!req.user.is_admin && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied: Admin privileges required' });
        }

        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, email, referral_code, points, is_admin, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map for compatibility
        const mapped = users.map(u => ({
            ...u,
            _id: u.id,
            isAdmin: u.is_admin,
            createdAt: u.created_at,
            referralCode: u.referral_code
        }));

        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle admin status
exports.toggleAdminStatus = async (req, res) => {
    try {
        if (!req.user.is_admin && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied: Admin privileges required' });
        }

        const { isAdmin } = req.body;
        const { data: user, error } = await supabase
            .from('users')
            .update({ is_admin: isAdmin })
            .eq('id', req.params.userId)
            .select('id, username, email, points, is_admin')
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            ...user,
            _id: user.id,
            isAdmin: user.is_admin
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        if (!req.user.is_admin && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied: Admin privileges required' });
        }

        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.userId)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

