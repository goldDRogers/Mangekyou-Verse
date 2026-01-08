import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    _id: string;
    username: string;
    email: string;
    points: number;
    isAdmin: boolean;
    createdAt: string;
}

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, totalPoints: 0, admins: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        checkAdmin();
        fetchUsers();
    }, []);

    const checkAdmin = () => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }

        try {
            const user = JSON.parse(userData);
            if (!user.isAdmin) {
                alert('Access Denied: Admin privileges required');
                navigate('/');
            }
        } catch (error) {
            navigate('/login');
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);

                // Calculate stats
                setStats({
                    totalUsers: data.length,
                    totalPoints: data.reduce((sum: number, u: User) => sum + u.points, 0),
                    admins: data.filter((u: User) => u.isAdmin).length
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAdmin = async (userId: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/admin/users/${userId}/admin`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isAdmin: !currentStatus })
            });

            fetchUsers();
        } catch (error) {
            console.error('Error toggling admin:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1011] flex items-center justify-center">
                <div className="text-white text-xl font-bold">Loading Admin Panel...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1011] py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        Admin <span className="text-brand-primary">Control Panel</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                        System Overview \u0026 User Management
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-brand-card border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Users</p>
                                <p className="text-4xl font-black text-white">{stats.totalUsers}</p>
                            </div>
                            <div className="w-16 h-16 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                                <i className="fa-solid fa-users text-brand-primary text-2xl"></i>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-card border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Points</p>
                                <p className="text-4xl font-black text-white">{stats.totalPoints.toLocaleString()}</p>
                            </div>
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                                <i className="fa-solid fa-coins text-yellow-400 text-2xl"></i>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-card border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Admins</p>
                                <p className="text-4xl font-black text-white">{stats.admins}</p>
                            </div>
                            <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center">
                                <i className="fa-solid fa-shield-halved text-red-400 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-brand-card border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">User Management</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">Points</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">Joined</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">Admin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center">
                                                    <span className="text-brand-primary font-black text-sm">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-white font-bold">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-lg text-xs font-black">
                                                {user.points} pts
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleAdmin(user._id, user.isAdmin)}
                                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${user.isAdmin
                                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                                        : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                                                    }`}
                                            >
                                                {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
