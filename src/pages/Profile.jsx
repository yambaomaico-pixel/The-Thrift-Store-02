import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Profile = () => {
  const { currentUser, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await updatePassword(newPassword);
      setMessage('Password updated successfully.');
      setNewPassword('');
    } catch (err) {
      setError('Failed to update password. You may need to log in again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container" style={{ padding: 'var(--spacing-8) 0' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-8)' }}>My Profile</h1>
      
      <div className="flex gap-8 flex-col" style={{ md: { flexDirection: 'row' } }}>
        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Account Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Full Name</span>
                <p style={{ fontWeight: 500 }}>{currentUser.fullName || 'Not provided'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Email Address</span>
                <p style={{ fontWeight: 500 }}>{currentUser.email}</p>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Account Role</span>
                <p style={{ fontWeight: 500, textTransform: 'capitalize' }}>{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Security</h2>
            
            {message && <div style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>{message}</div>}
            {error && <div style={{ backgroundColor: 'var(--color-error)', color: 'white', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <Input 
                label="New Password" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                minLength="6"
              />
              <Button type="submit" isLoading={loading} style={{ alignSelf: 'flex-start' }}>Update Password</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
