'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Filter, Shield, MoreVertical, Ban, CheckCircle, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DbUser {
  id: string;
  name: string;
  role: string;
  email: string;
  created_at: string;
  status?: string;
}

const fallbackUsers: DbUser[] = [
  { id: '1', name: 'A. Kumar', role: 'citizen', email: 'a.kumar@example.com', created_at: '2023-11-15T00:00:00Z', status: 'active' },
  { id: '2', name: 'Dr. S. Sharma', role: 'researcher', email: 's.sharma@bitmesra.ac.in', created_at: '2023-12-01T00:00:00Z', status: 'active' },
  { id: '3', name: 'Tata Steel CSR', role: 'industry', email: 'csr@tatasteel.com', created_at: '2024-01-10T00:00:00Z', status: 'active' },
  { id: '4', name: 'M. Devi', role: 'citizen', email: 'm.devi@example.com', created_at: '2024-02-05T00:00:00Z', status: 'suspended' },
  { id: '5', name: 'Prof. R. Singh', role: 'researcher', email: 'r.singh@nitjsr.ac.in', created_at: '2024-02-20T00:00:00Z', status: 'active' },
  { id: '6', name: 'Admin User', role: 'admin', email: 'admin@collabsolve.jharkhand.gov.in', created_at: '2023-10-01T00:00:00Z', status: 'active' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error || !data || data.length === 0) {
          console.warn('Supabase not configured or no users, using fallback data');
          setUsers(fallbackUsers);
        } else {
          setUsers(data);
        }
      } catch (e) {
        setUsers(fallbackUsers);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const changeRole = async (userId: string, newRole: string) => {
    // Optimistic UI update
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    // Supabase update
    try {
      await supabase.from('users').update({ role: newRole }).eq('id', userId);
    } catch (e) {
      console.error('Failed to update role in Supabase', e);
    }
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    
    try {
      await supabase.from('users').update({ status: newStatus }).eq('id', userId);
    } catch (e) {
      console.error('Failed to update status in Supabase', e);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-3xl font-bold text-on-surface flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> User Management
          </h1>
          <p className="text-on-surface-variant">View and manage platform users, roles, and access.</p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90">
          <Shield className="w-4 h-4" /> Add Admin
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-variant flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search users by name, email, or role..." 
              className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2 outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-variant/30 text-on-surface-variant">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/20 text-on-surface-variant font-label-md uppercase tracking-wider text-sm">
                <th className="p-4 border-b border-surface-variant">User</th>
                <th className="p-4 border-b border-surface-variant">Role</th>
                <th className="p-4 border-b border-surface-variant">Joined</th>
                <th className="p-4 border-b border-surface-variant">Status</th>
                <th className="p-4 border-b border-surface-variant w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={user.id} 
                  className="border-b border-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">{user.name}</div>
                        <div className="text-sm text-on-surface-variant">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      className="capitalize px-3 py-1 rounded-full text-xs font-bold border border-surface-variant bg-surface outline-none cursor-pointer hover:bg-surface-variant/30"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="researcher">Researcher</option>
                      <option value="industry">Industry</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-on-surface-variant text-sm">
                    {user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : 'N/A'}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(user.id, user.status || 'active')}
                      className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-md transition-colors ${
                        user.status === 'active' 
                        ? 'text-success-green hover:bg-success-green/10' 
                        : 'text-error hover:bg-error/10'
                      }`}
                    >
                      {user.status === 'active' ? (
                        <><CheckCircle className="w-4 h-4" /> Active</>
                      ) : (
                        <><Ban className="w-4 h-4" /> Suspended</>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-variant/50">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant">
              No users found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
