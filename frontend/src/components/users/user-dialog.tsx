import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { X } from 'lucide-react';

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    user?: any;
}

export const UserDialog = ({ open, onOpenChange, onSuccess, user }: UserDialogProps) => {
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'cashier',
        password: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.profile?.role || 'cashier',
                password: ''
            });
        } else {
            setFormData({
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                role: 'cashier',
                password: ''
            });
        }
    }, [user, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = {
                ...formData,
                profile: { role: formData.role }
            };

            if (formData.password) {
                payload.password = formData.password;
            } else if (!user) {
                alert('Password is required for new users');
                setLoading(false);
                return;
            } else {
                delete payload.password;
            }

            delete payload.role;

            if (user) {
                await axios.patch(`http://localhost:8000/api/v1/users/${user.id}/`, payload, {
                    headers: { Authorization: `Token ${token}` }
                });
            } else {
                await axios.post('http://localhost:8000/api/v1/users/', payload, {
                    headers: { Authorization: `Token ${token}` }
                });
            }

            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.detail || 'Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{user ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-black transition-colors"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-black transition-colors"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-black transition-colors"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-black transition-colors"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-black transition-colors bg-white"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="cashier">Cashier</option>
                            <option value="accountant">Accountant</option>
                            <option value="admin">Admin</option>
                            <option value="auditor">Auditor</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {user ? 'New Password (Optional)' : 'Password'}
                        </label>
                        <input
                            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-black transition-colors"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!user}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
