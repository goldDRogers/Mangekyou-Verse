const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Load env vars
dotenv.config();

// Check Supabase Configuration
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn("WARNING: Supabase credentials missing in .env file. Database operations will fail.");
} else {
    console.log("Supabase connection configured.");
}


const app = express();

const path = require('path');

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for now to allow external images/scripts
}));
app.use(morgan('dev'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/anime', require('./routes/animeRoutes'));
app.use('/api/referral', require('./routes/referralRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));


// Catch-all route to serve the frontend for any non-API request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Only listen if not imported (for testing)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
