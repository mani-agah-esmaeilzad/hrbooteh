'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface ChatMessage {
  sender_type: 'user' | 'ai';
  sender_name: string;
  message: string;
  created_at: string;
}

interface ChatSession {
  assessment_type: string;
  created_at: string;
  messages: ChatMessage[];
}

const AdminPage = () => {
  const { user, token, loading: loadingAuth } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatSession>>({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loadingAuth) {
      // Still loading auth status, do nothing yet
      return;
    }

    if (!user || user.role !== 'admin') {
      // User is loaded but not admin, or no user (not logged in)
      toast.error('Access Denied: You must be an administrator to view this page.');
      router.push('/'); // Redirect non-admins or non-logged-in users
      setLoadingUsers(false); // Stop loading users, as we won't fetch them
      return;
    }

    // If we reach here, user is loaded and is an admin. Proceed to fetch users.
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data.data);
        } else {
          setError(data.error || 'Failed to fetch users');
          toast.error(data.error || 'Failed to fetch users');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
        toast.error(err.message || 'An unexpected error occurred');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user, token, router, loadingAuth]);

  const fetchChatHistory = async (userId: number) => {
    setLoadingChats(true);
    setChatHistory({}); // Clear previous chat history
    try {
      const res = await fetch(`/api/admin/chats?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setChatHistory(data.data);
      } else {
        setError(data.error || 'Failed to fetch chat history');
        toast.error(data.error || 'Failed to fetch chat history');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingChats(false);
    }
  };

  if (loadingAuth || loadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Loading admin panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700">
        <p className="text-lg font-semibold">Error: {error}</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => router.push('/')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        <div className="w-24"></div> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User List Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" /> Registered Users
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow 
                    key={u.id} 
                    onClick={() => {
                      setSelectedUser(u);
                      fetchChatHistory(u.id);
                    }}
                    className={cn(
                      "cursor-pointer hover:bg-blue-50",
                      selectedUser?.id === u.id && "bg-blue-100 hover:bg-blue-100"
                    )}
                  >
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Chat History Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-green-600" /> Chat History for {selectedUser?.username || 'Select a User'}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto p-4 bg-gray-50 rounded-lg">
            {loadingChats ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                <p className="ml-2 text-gray-600">Loading chat history...</p>
              </div>
            ) : selectedUser && Object.keys(chatHistory).length === 0 ? (
              <p className="text-center text-gray-500">No chat sessions found for this user.</p>
            ) : selectedUser ? (
              Object.keys(chatHistory).map(sessionUuid => {
                const session = chatHistory[sessionUuid];
                return (
                  <div key={sessionUuid} className="mb-6 p-3 bg-white rounded-lg shadow-sm border-gray-200">
                    <div className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">
                      Session ({session.assessment_type}) - {new Date(session.created_at).toLocaleString()}
                    </div>
                    <div className="space-y-3">
                      {session.messages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "flex",
                            msg.sender_type === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] p-2 rounded-lg",
                            msg.sender_type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                          )}>
                            <p className="text-xs font-semibold mb-1">{msg.sender_name || msg.sender_type}</p>
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs text-right opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">Select a user from the list to view their chat history.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
