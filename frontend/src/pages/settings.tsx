import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore, AuthState } from '@/store/authStore';
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Laptop,
  Save,
  Key,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import Head from 'next/head';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, role } = useAuthStore((s: AuthState) => ({ user: s.user, role: s.role }));
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('system');
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully');
    }, 1000);
  };

  return (
    <ShellLayout role={role || 'student'}>
      <Head>
        <title>Settings | UIMS Portal</title>
      </Head>

      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        <header>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your profile, security, and preferences.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column - Profile & Security */}
          <div className="lg:col-span-7 space-y-10">
            <Card title="Public Profile" icon={User} subtitle="How others see you on the platform">
              <form onSubmit={handleSaveProfile} className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center pb-6 border-b border-gray-50">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-[2rem] bg-brand-100 flex items-center justify-center text-brand-600 text-3xl font-black border-4 border-white shadow-xl">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                    <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-500 hover:text-brand-600 transition-all opacity-0 group-hover:opacity-100">
                      <Save size={16} />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{user?.email}</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{role} Account</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <Input placeholder="Your full name" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input value={user?.email || ''} readOnly className="pl-12 bg-gray-50/50" />
                    </div>
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full sm:w-auto px-8 h-12 rounded-2xl">
                  Save Changes
                </Button>
              </form>
            </Card>

            <Card title="Security & Authentication" icon={Shield} subtitle="Protect your account with a strong password">
              <div className="space-y-6 pt-4">
                <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-brand-600 shadow-sm">
                      <Key size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Account Password</p>
                      <p className="text-xs text-gray-500 font-medium">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl font-bold">Update</Button>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Two-Factor Authentication</p>
                      <p className="text-xs text-red-500 font-bold uppercase tracking-tighter">Disabled</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl font-bold text-brand-600 uppercase text-[10px]">Enable</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Preferences */}
          <div className="lg:col-span-5 space-y-10">
            <Card title="Appearance" icon={Sun} subtitle="Customize your visual experience">
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { id: 'light', icon: Sun, label: 'Light' },
                  { id: 'dark', icon: Moon, label: 'Dark' },
                  { id: 'system', icon: Laptop, label: 'System' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      theme === item.id 
                        ? 'border-brand-500 bg-brand-50/50 text-brand-700' 
                        : 'border-gray-50 bg-white text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <item.icon size={24} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Notifications" icon={Bell} subtitle="Manage how you receive updates">
              <div className="space-y-6 pt-4">
                {[
                  { title: 'Academic Updates', desc: 'Results, attendance alerts, and exam schedules.' },
                  { title: 'Security Alerts', desc: 'Login notifications and password change alerts.' },
                  { title: 'Campus News', desc: 'Events, announcements, and news bulletins.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
