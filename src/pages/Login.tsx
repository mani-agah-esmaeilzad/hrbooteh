
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const router = useRouter();
  const { setUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // بررسی اینکه آیا اکانت وجود ندارد
        if (response.status === 404 && data.message?.includes('یافت نشد')) {
          toast.info('اکانت شما وجود ندارد. لطفاً ابتدا ثبت‌نام کنید');
          router.push('/register');
          return;
        }
        throw new Error(data.message || 'خطا در ورود');
      }

      if (data.success && data.data) {
        // ذخیره توکن در localStorage
        localStorage.setItem('token', data.data.token);
        
        // ذخیره اطلاعات کاربر
        const user = data.data.user;
        setUser(user);
        
        toast.success('ورود موفقیت‌آمیز بود');
        router.push('/');
      } else {
        throw new Error('خطا در ورود');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-executive-pearl via-white to-executive-silver/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 left-0 w-96 h-96 bg-executive-navy rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-executive-gold rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-executive-ash-light/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-executive-navy to-executive-navy-light rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-executive-charcoal">سامانه ارزیابی مهارت‌های حرفه‌ای</h1>
              <p className="text-executive-ash text-sm">سیستم تحلیل و ارزیابی تخصصی</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-8 py-12">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-luxury border border-white/20 overflow-hidden">
            {/* Card Header */}
            <div className="px-8 py-8 bg-gradient-to-r from-executive-navy to-executive-navy-light text-center relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">ورود به سیستم</h2>
                <p className="text-executive-navy-light/80 text-sm">دسترسی به پنل ارزیابی تخصصی</p>
              </div>
            </div>

            {/* Login Form */}
            <div className="px-8 py-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-executive-charcoal font-semibold text-sm">
                    نام کاربری
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-executive-ash" />
                    </div>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="h-12 pr-12 text-base bg-executive-pearl/50 border-executive-ash-light focus:border-executive-navy focus:bg-white transition-all duration-300 rounded-xl"
                      placeholder="نام کاربری خود را وارد کنید"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-executive-charcoal font-semibold text-sm">
                    رمز عبور
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-executive-ash" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="h-12 pr-12 pl-12 text-base bg-executive-pearl/50 border-executive-ash-light focus:border-executive-navy focus:bg-white transition-all duration-300 rounded-xl"
                      placeholder="رمز عبور خود را وارد کنید"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-3 flex items-center text-executive-ash hover:text-executive-navy transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!formData.username.trim() || !formData.password.trim() || loading}
                  className="w-full h-14 bg-gradient-to-r from-executive-navy to-executive-navy-light hover:from-executive-navy-dark hover:to-executive-navy text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      در حال ورود...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      ورود به سیستم
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Info Section */}
              <div className="mt-8 pt-6 border-t border-executive-ash-light/30">
                <div className="bg-executive-gold-light/20 rounded-xl p-4 border border-executive-gold/20">
                  <p className="text-center text-sm text-executive-charcoal-light">
                    <span className="font-semibold">راهنمایی:</span> با هر نام کاربری و رمز عبوری می‌توانید وارد شوید
                  </p>
                </div>
                
                {/* Sign Up Section */}
                <div className="mt-6 text-center">
                  <p className="text-executive-ash text-sm mb-3">
                    حساب کاربری ندارید؟
                  </p>
                  <Button
                    onClick={() => router.push('/register')}
                    variant="outline"
                    className="w-full bg-white/80 hover:bg-white border-executive-gold text-executive-gold hover:text-executive-gold-dark transition-all duration-300"
                  >
                    ثبت‌نام کنید
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-executive-ash text-sm">
              © ۱۴۰۳ سامانه ارزیابی مهارت‌های حرفه‌ای. تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
