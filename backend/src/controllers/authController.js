const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock User Store for when Supabase is not configured
let mockUsers = [];

const isSupabaseMocked = () => {
    return !process.env.SUPABASE_URL ||
        process.env.SUPABASE_URL.includes('your-project-id') ||
        !process.env.SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY === 'your-anon-key';
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', {
        expiresIn: '30d',
    });
};

// Generate a random referral code
const createReferralCode = (username) => {
    return `${username.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

exports.register = async (req, res) => {
    try {
        const { name, username, email, password, referralCode } = req.body;

        // Accept either 'name' or 'username'
        const userName = name || username;

        if (!userName || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        if (isSupabaseMocked()) {
            console.warn("Using MOCK DATABASE for registration - Supabase not configured.");
            const existingUser = mockUsers.find(u => u.email === email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists (Mock Database)' });
            }
        } else {
            // Check if user exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .single();

            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
        }

        let referredById = null;
        let referrerUser = null;

        if (referralCode) {
            const { data: refUser } = await supabase
                .from('users')
                .select('*')
                .eq('referral_code', referralCode)
                .single();

            if (refUser) {
                referrerUser = refUser;
                referredById = refUser.id;
            }
        }

        const newReferralCode = createReferralCode(userName);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newUser;
        if (isSupabaseMocked()) {
            newUser = {
                id: `mock-user-${Date.now()}`,
                username: userName,
                email,
                password: hashedPassword,
                referral_code: newReferralCode,
                referred_by: referredById,
                points: referredById ? 50 : 0
            };
            mockUsers.push(newUser);
        } else {
            // Create user
            const { data: createdUser, error: createError } = await supabase
                .from('users')
                .insert([
                    {
                        username: userName,
                        email,
                        password: hashedPassword,
                        referral_code: newReferralCode,
                        referred_by: referredById,
                        points: referrerUser ? 50 : 0 // Bonus for being referred
                    }
                ])
                .select()
                .single();

            if (createError) throw createError;
            newUser = createdUser;
        }

        if (newUser) {
            // If referred, create Referral record and update referrer points
            if (referrerUser) {
                await supabase.from('referrals').insert([
                    {
                        referrer_id: referrerUser.id,
                        referee_id: newUser.id,
                        status: 'completed'
                    }
                ]);

                // Reward logic: +100 points for referrer
                await supabase
                    .from('users')
                    .update({ points: (referrerUser.points || 0) + 100 })
                    .eq('id', referrerUser.id);
            }

            res.status(201).json({
                token: generateToken(newUser.id),
                user: {
                    _id: newUser.id,
                    name: newUser.username,
                    email: newUser.email,
                    referralCode: newUser.referral_code,
                    points: newUser.points || 0
                }
            });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user;
        if (isSupabaseMocked()) {
            console.warn("Using MOCK DATABASE for login.");
            user = mockUsers.find(u => u.email === email);
        } else {
            const { data: foundUser, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            user = foundUser;
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                token: generateToken(user.id),
                user: {
                    _id: user.id,
                    name: user.username,
                    email: user.email,
                    referralCode: user.referral_code,
                    points: user.points || 0
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        let user;
        if (isSupabaseMocked()) {
            user = mockUsers.find(u => u.id === req.user.id);
        } else {
            const { data: foundUser, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', req.user.id)
                .single();
            user = foundUser;
        }

        if (user) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                referralCode: user.referral_code,
                points: user.points
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

