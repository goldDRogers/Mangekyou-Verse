const supabase = require('../config/supabase');

// Get user's watchlist
exports.getWatchlist = async (req, res) => {
    try {
        const { data: watchlist, error } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map fields for compatibility
        const mapped = watchlist.map(item => ({
            ...item,
            _id: item.id,
            user: item.user_id
        }));

        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add to watchlist
exports.addToWatchlist = async (req, res) => {
    try {
        const { animeId, animeTitle, animePoster, status, rating, notes } = req.body;

        // Check if already in watchlist
        const { data: existingItem } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('anime_id', animeId)
            .single();

        let result;
        if (existingItem) {
            // Update existing
            const { data, error } = await supabase
                .from('watchlist')
                .update({
                    status: status || existingItem.status,
                    rating: rating !== undefined ? rating : existingItem.rating,
                    notes: notes || existingItem.notes,
                    updated_at: new Date()
                })
                .eq('id', existingItem.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new
            const { data, error } = await supabase
                .from('watchlist')
                .insert([
                    {
                        user_id: req.user.id,
                        anime_id: animeId,
                        anime_title: animeTitle,
                        anime_poster: animePoster,
                        status: status || 'plan-to-watch',
                        rating,
                        notes
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.status(201).json({
            ...result,
            _id: result.id,
            user: result.user_id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update watchlist item
exports.updateWatchlistItem = async (req, res) => {
    try {
        const { status, rating, notes } = req.body;

        const { data: watchlistItem, error } = await supabase
            .from('watchlist')
            .update({
                status,
                rating,
                notes,
                updated_at: new Date()
            })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error || !watchlistItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({
            ...watchlistItem,
            _id: watchlistItem.id,
            user: watchlistItem.user_id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove from watchlist
exports.removeFromWatchlist = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('watchlist')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ message: 'Removed from watchlist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check if anime is in watchlist
exports.checkInWatchlist = async (req, res) => {
    try {
        const { data: item, error } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('anime_id', req.params.animeId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is code for "no rows returned" with .single()
            throw error;
        }

        res.json({
            inWatchlist: !!item,
            item: item ? { ...item, _id: item.id, user: item.user_id } : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

