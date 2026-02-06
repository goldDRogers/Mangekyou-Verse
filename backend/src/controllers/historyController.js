const supabase = require('../config/supabase');

exports.getHistory = async (req, res) => {
    try {
        const { data: history, error } = await supabase
            .from('watch_history')
            .select('*')
            .eq('user_id', req.user.id)
            .order('last_watched', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Map for compatibility
        const mapped = history.map(item => ({
            ...item,
            _id: item.id,
            user: item.user_id
        }));

        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateHistory = async (req, res) => {
    const { animeId, episodeId, animeTitle, episodeNumber, progress, totalDuration, image } = req.body;

    try {
        // Upsert logic for Supabase
        const { data: history, error } = await supabase
            .from('watch_history')
            .upsert({
                user_id: req.user.id,
                anime_id: animeId,
                episode_id: episodeId,
                anime_title: animeTitle,
                episode_number: episodeNumber,
                progress,
                total_duration: totalDuration,
                image,
                last_watched: new Date()
            }, {
                onConflict: 'user_id,anime_id,episode_id' // Requires a unique constraint in Postgres
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            ...history,
            _id: history.id,
            user: history.user_id
        });
    } catch (error) {
        console.error('Update History Error:', error);
        res.status(500).json({ message: error.message });
    }
};

