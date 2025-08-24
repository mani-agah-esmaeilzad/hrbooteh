'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Database, Code, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const APIConfigPanel = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState('https://your-api-domain.com/api');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setConnectionStatus('success');
      toast.success('اتصال با موفقیت برقرار شد');
    } catch (error) {
      setConnectionStatus('error');
      toast.error('خطا در برقراری اتصال');
    }
  };

  const endpoints = [
    {
      category: 'Authentication',
      items: [
        { 
          method: 'POST', 
          path: '/auth/login', 
          description: 'ورود کاربر',
          params: {
            body: { username: 'string', password: 'string' },
            response: { token: 'string', user: 'UserObject', expiresIn: 'number' }
          }
        },
        { 
          method: 'POST', 
          path: '/auth/register', 
          description: 'ثبت نام کاربر جدید',
          params: {
            body: { username: 'string', password: 'string', email: 'string', firstName: 'string', lastName: 'string' },
            response: { success: 'boolean', message: 'string', userId: 'number' }
          }
        },
        { 
          method: 'POST', 
          path: '/auth/refresh', 
          description: 'تجدید توکن احراز هویت',
          params: {
            headers: { Authorization: 'Bearer {token}' },
            response: { token: 'string', expiresIn: 'number' }
          }
        }
      ]
    },
    {
      category: 'N8N WebSocket Chat',
      items: [
        { 
          method: 'WS', 
          path: '/ws/chat/{sessionId}', 
          description: 'اتصال سوکت چت ۳ نفره (۲ AI + کاربر)',
          params: {
            connect: { sessionId: 'string', userId: 'number', scenario: 'string' },
            send: { type: 'user_message', content: 'string', timestamp: 'datetime' },
            receive: { type: 'ai1_message | ai2_message', content: 'string', character: 'string', timestamp: 'datetime' }
          }
        },
        { 
          method: 'POST', 
          path: '/chat/start-session', 
          description: 'شروع جلسه چت جدید',
          params: {
            body: { userId: 'number', scenario: 'string' },
            response: { sessionId: 'string', characters: 'Array<Character>', websocketUrl: 'string' }
          }
        }
      ]
    },
    {
      category: 'Scenarios & Characters',
      items: [
        { 
          method: 'GET', 
          path: '/scenarios', 
          description: 'دریافت لیست سناریوها',
          params: {
            response: { scenarios: 'Array<{id, name, description, characters: Array<Character>}>' }
          }
        },
        { 
          method: 'GET', 
          path: '/characters', 
          description: 'دریافت لیست کاراکترهای AI',
          params: {
            response: { characters: 'Array<{id, name, personality, avatar, voice_settings}>' }
          }
        }
      ]
    },
    {
      category: 'Results & Analytics',
      items: [
        { 
          method: 'GET', 
          path: '/results/session/{sessionId}', 
          description: 'نتایج جلسه چت',
          params: {
            response: { analysis: 'object', score: 'number', insights: 'Array<string>', recommendations: 'Array<string>' }
          }
        },
        { 
          method: 'GET', 
          path: '/analytics/user/{userId}', 
          description: 'آنالیز کلی کاربر',
          params: {
            response: { sessions: 'Array<Session>', progress: 'object', strengths: 'Array<string>', areas_for_improvement: 'Array<string>' }
          }
        }
      ]
    }
  ];

  const dbTables = [
    {
      name: 'Users',
      description: 'جدول کاربران',
      fields: [
        'Id (int, PK, Auto)',
        'Username (nvarchar(50), Unique)',
        'PasswordHash (nvarchar(255))',
        'FirstName (nvarchar(100))',
        'LastName (nvarchar(100))',
        'Email (nvarchar(255))',
        'PreferredLanguage (nvarchar(10), Default: fa)',
        'Avatar (nvarchar(255), nullable)',
        'CreatedAt (datetime)',
        'UpdatedAt (datetime)'
      ]
    },
    {
      name: 'Scenarios',
      description: 'جدول سناریوهای چت',
      fields: [
        'Id (int, PK, Auto)',
        'Name (nvarchar(100))',
        'Description (nvarchar(500))',
        'Category (nvarchar(50))',
        'DifficultyLevel (int)', // 1-5
        'EstimatedDuration (int)', // minutes
        'IsActive (bit)',
        'CreatedAt (datetime)'
      ]
    },
    {
      name: 'Characters',
      description: 'جدول کاراکترهای AI',
      fields: [
        'Id (int, PK, Auto)',
        'Name (nvarchar(100))',
        'Personality (ntext)',
        'Role (nvarchar(100))', // mentor, colleague, client, etc.
        'Avatar (nvarchar(255))',
        'VoiceSettings (ntext)', // JSON for voice parameters
        'SystemPrompt (ntext)',
        'IsActive (bit)',
        'CreatedAt (datetime)'
      ]
    },
    {
      name: 'ChatSessions',
      description: 'جدول جلسات چت',
      fields: [
        'Id (int, PK, Auto)',
        'UserId (int, FK to Users)',
        'ScenarioId (int, FK to Scenarios)',
        'SessionKey (nvarchar(36), Unique)', // GUID
        'Status (nvarchar(20))', // active, completed, abandoned
        'Character1Id (int, FK to Characters)',
        'Character2Id (int, FK to Characters)',
        'StartedAt (datetime)',
        'CompletedAt (datetime, nullable)',
        'CreatedAt (datetime)'
      ]
    },
    {
      name: 'ChatMessages',
      description: 'جدول پیام‌های چت',
      fields: [
        'Id (int, PK, Auto)',
        'SessionId (int, FK to ChatSessions)',
        'SenderType (nvarchar(20))', // user, ai1, ai2
        'SenderId (int, nullable)', // CharacterId if AI
        'Content (ntext)',
        'MessageOrder (int)',
        'Timestamp (datetime)',
        'IsVisible (bit, Default: 1)',
        'CreatedAt (datetime)'
      ]
    },
    {
      name: 'SessionAnalysis',
      description: 'جدول تحلیل جلسات',
      fields: [
        'Id (int, PK, Auto)',
        'SessionId (int, FK to ChatSessions)',
        'OverallScore (decimal(5,2))',
        'CommunicationScore (decimal(5,2))',
        'ProblemSolvingScore (decimal(5,2))',
        'EmotionalIntelligenceScore (decimal(5,2))',
        'KeyInsights (ntext)', // JSON array
        'Strengths (ntext)', // JSON array
        'AreasForImprovement (ntext)', // JSON array
        'Recommendations (ntext)', // JSON array
        'DetailedAnalysis (ntext)',
        'CreatedAt (datetime)'
      ]
    },
    {
      name: 'UserProgress',
      description: 'جدول پیشرفت کاربران',
      fields: [
        'Id (int, PK, Auto)',
        'UserId (int, FK to Users)',
        'ScenarioId (int, FK to Scenarios)',
        'BestScore (decimal(5,2))',
        'TotalSessions (int)',
        'CompletedSessions (int)',
        'AverageScore (decimal(5,2))',
        'LastSessionAt (datetime)',
        'CreatedAt (datetime)',
        'UpdatedAt (datetime)'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-executive-pearl via-white to-executive-silver/20 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-executive-navy to-executive-navy-light rounded-2xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-executive-charcoal">تنظیمات API و دیتابیس</h1>
            <p className="text-executive-ash">پیکربندی بک‌اند .NET Core و MySQL</p>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">پیکربندی API</TabsTrigger>
            <TabsTrigger value="endpoints">مستندات API</TabsTrigger>
            <TabsTrigger value="database">ساختار دیتابیس</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  تنظیمات اتصال API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">آدرس پایه API</label>
                  <Input
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    placeholder="https://your-api-domain.com/api"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
                    {connectionStatus === 'testing' ? 'در حال تست...' : 'تست اتصال'}
                  </Button>
                  
                  {connectionStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">اتصال موفق</span>
                    </div>
                  )}
                  
                  {connectionStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">خطا در اتصال</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints">
            <div className="grid gap-6">
              {endpoints.map((category) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.items.map((endpoint, index) => (
                        <div key={index} className="p-4 bg-executive-pearl/30 rounded-lg border border-executive-ash-light/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant={endpoint.method === 'GET' ? 'default' : endpoint.method === 'WS' ? 'destructive' : 'secondary'}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm text-executive-navy font-mono">
                                {endpoint.path}
                              </code>
                            </div>
                            <span className="text-sm text-executive-ash">
                              {endpoint.description}
                            </span>
                          </div>
                          {endpoint.params && (
                            <div className="mt-3 p-3 bg-white/50 rounded-lg">
                              <h5 className="text-xs font-semibold text-executive-charcoal mb-2">پارامترها:</h5>
                              <div className="space-y-2 text-xs">
                                {Object.entries(endpoint.params).map(([key, value]) => (
                                  <div key={key} className="flex gap-2">
                                    <span className="font-mono text-executive-navy min-w-[80px]">{key}:</span>
                                    <span className="text-executive-ash font-mono">{JSON.stringify(value, null, 1).replace(/[{}]/g, '').replace(/"/g, '')}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="database">
            <div className="grid gap-6">
              {dbTables.map((table) => (
                <Card key={table.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      {table.name}
                    </CardTitle>
                    <p className="text-executive-ash">{table.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {table.fields.map((field, index) => (
                        <div key={index} className="p-2 bg-executive-pearl/20 rounded font-mono text-sm">
                          {field}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default APIConfigPanel;