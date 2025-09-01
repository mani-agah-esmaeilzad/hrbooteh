'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !lastName.trim()) {
            setError('نام و نام خانوادگی الزامی است.');
            return;
        }
        if (password !== passwordConfirmation) {
            setError('رمزهای عبور یکسان نیستند.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: name,
                    email: email,
                    password: password,
                    password_confirmation: passwordConfirmation,
                    first_name: name,
                    last_name: lastName
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error) {
                    throw new Error(data.error);
                }
                throw new Error(data.message || 'خطا در ثبت‌نام');
            }

            if (data.success && data.data.token) {
                toast.success('حساب کاربری با موفقیت ایجاد شد. در حال انتقال به پرسشنامه خودارزیابی...');
                // Save token and user data
                localStorage.setItem('token', data.data.token);
                setUser(data.data.user);
                router.push('/self-assessment');
            } else {
                throw new Error(data.message || 'خطا در ثبت‌نام');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-xl">ثبت‌نام</CardTitle>
                    <CardDescription>برای ساخت حساب کاربری جدید، اطلاعات زیر را وارد کنید</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">نام</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">نام خانوادگی</Label>
                                <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">ایمیل</Label>
                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">رمز عبور</Label>
                                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="password-confirm">تکرار رمز عبور</Label>
                                <Input id="password-confirm" type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required />
                            </div>
                            {error && <p className="text-red-500 text-sm whitespace-pre-line">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'در حال ساخت حساب...' : 'ثبت‌نام'}
                            </Button>
                        </div>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        حساب کاربری دارید؟{" "}
                        <a href="/login" className="underline">
                            وارد شوید
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

