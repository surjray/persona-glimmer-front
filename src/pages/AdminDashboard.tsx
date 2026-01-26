import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Users, MessageSquare, FileText, BarChart3, Search, Loader2, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [literacySurveys, setLiteracySurveys] = useState<any[]>([]);
  const [postTopicSurveys, setPostTopicSurveys] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, usersRes, messagesRes, literacyRes, postTopicRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getAllUsers(),
        adminApi.getAllMessages({ limit: 1000 }),
        adminApi.getAllLiteracySurveyResponses(),
        adminApi.getAllPostTopicSurveyResponses(),
      ]);

      setDashboardStats(statsRes.data);
      setUsers(usersRes.data.users);
      setMessages(messagesRes.data.messages);
      setLiteracySurveys(literacyRes.data.responses);
      setPostTopicSurveys(postTopicRes.data.responses);
    } catch (error: any) {
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await adminApi.getUserData(userId);
      setSelectedUser(response.data);
    } catch (error: any) {
      toast({
        title: 'Error loading user data',
        description: error.message || 'Failed to load user details',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There is no data available to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(val => 
      typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    ).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = messages.filter(msg =>
    msg.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.topicTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Research Platform Data Management</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalMessages || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Literacy Surveys</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.completedLiteracySurvey || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Post-Topic Surveys</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.completedPostTopicSurveys || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
            <TabsTrigger value="literacy">Literacy Surveys ({literacySurveys.length})</TabsTrigger>
            <TabsTrigger value="post-topic">Post-Topic Surveys ({postTopicSurveys.length})</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>View and manage all registered users</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button onClick={() => exportToCSV(users, 'users')} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Topic Progress</TableHead>
                        <TableHead>Literacy Survey</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>Agent {user.assignedAgentId} (EQ: {typeof user.agentEQ === 'string' ? user.agentEQ.charAt(0).toUpperCase() + user.agentEQ.slice(1) : user.agentEQ}, IQ: {typeof user.agentIQ === 'string' ? user.agentIQ.charAt(0).toUpperCase() + user.agentIQ.slice(1) : user.agentIQ})</TableCell>
                            <TableCell>Topic {user.currentTopicIndex + 1}/20</TableCell>
                            <TableCell>{user.hasCompletedLiteracySurvey ? '✅' : '❌'}</TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                onClick={() => handleViewUser(user.id)}
                                variant="outline"
                                size="sm"
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Messages</CardTitle>
                    <CardDescription>View all chat messages between users and agents</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button onClick={() => exportToCSV(messages, 'messages')} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMessages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No messages found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMessages.map((msg) => (
                          <TableRow key={msg.id}>
                            <TableCell className="text-sm">
                              {new Date(msg.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-medium">{msg.userEmail}</TableCell>
                            <TableCell>{msg.topicTitle}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs ${
                                msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {msg.role}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-md truncate">{msg.content}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Literacy Surveys Tab */}
          <TabsContent value="literacy" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Literacy Survey Responses</CardTitle>
                    <CardDescription>All responses to the AI literacy assessment</CardDescription>
                  </div>
                  <Button onClick={() => exportToCSV(literacySurveys, 'literacy-surveys')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Email</TableHead>
                        <TableHead>Question ID</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {literacySurveys.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No survey responses found
                          </TableCell>
                        </TableRow>
                      ) : (
                        literacySurveys.map((response) => (
                          <TableRow key={response.id}>
                            <TableCell className="font-medium">{response.userEmail}</TableCell>
                            <TableCell>{response.questionId}</TableCell>
                            <TableCell>{response.responseValue}</TableCell>
                            <TableCell>{new Date(response.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Post-Topic Surveys Tab */}
          <TabsContent value="post-topic" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Post-Topic Survey Responses</CardTitle>
                    <CardDescription>All responses to post-topic surveys</CardDescription>
                  </div>
                  <Button onClick={() => exportToCSV(postTopicSurveys, 'post-topic-surveys')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Email</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Question ID</TableHead>
                        <TableHead>Response (1-7)</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {postTopicSurveys.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No survey responses found
                          </TableCell>
                        </TableRow>
                      ) : (
                        postTopicSurveys.map((response) => (
                          <TableRow key={response.id}>
                            <TableCell className="font-medium">{response.userEmail}</TableCell>
                            <TableCell>{response.topicTitle}</TableCell>
                            <TableCell>{response.questionId}</TableCell>
                            <TableCell>{response.responseValue}</TableCell>
                            <TableCell>{new Date(response.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Details: {selectedUser.user.email}</CardTitle>
                    <CardDescription>Complete user data and interactions</CardDescription>
                  </div>
                  <Button onClick={() => setSelectedUser(null)} variant="outline" size="sm">
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">User Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Email:</strong> {selectedUser.user.email}</div>
                    <div><strong>Agent:</strong> Agent {selectedUser.user.assignedAgentId} (EQ: {typeof selectedUser.user.agentEQ === 'string' ? selectedUser.user.agentEQ.charAt(0).toUpperCase() + selectedUser.user.agentEQ.slice(1) : selectedUser.user.agentEQ}, IQ: {typeof selectedUser.user.agentIQ === 'string' ? selectedUser.user.agentIQ.charAt(0).toUpperCase() + selectedUser.user.agentIQ.slice(1) : selectedUser.user.agentIQ})</div>
                    <div><strong>Current Topic:</strong> {selectedUser.user.currentTopicIndex + 1}/20</div>
                    <div><strong>Literacy Survey:</strong> {selectedUser.user.hasCompletedLiteracySurvey ? 'Completed' : 'Not Completed'}</div>
                    <div><strong>Completed Topics:</strong> {selectedUser.progress.completedTopics}</div>
                    <div><strong>Total Interactions:</strong> {selectedUser.progress.totalInteractions}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Messages ({selectedUser.messages.length})</h3>
                  <div className="rounded-md border max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Topic</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.messages.map((msg: any) => (
                          <TableRow key={msg.id}>
                            <TableCell>{msg.topicTitle}</TableCell>
                            <TableCell>{msg.role}</TableCell>
                            <TableCell className="max-w-md truncate">{msg.content}</TableCell>
                            <TableCell className="text-sm">{new Date(msg.timestamp).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Survey Responses</h3>
                  <Tabs defaultValue="literacy">
                    <TabsList>
                      <TabsTrigger value="literacy">Literacy Survey ({selectedUser.literacySurveyResponses.length})</TabsTrigger>
                      <TabsTrigger value="post-topic">Post-Topic ({selectedUser.postTopicSurveyResponses.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="literacy">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Question ID</TableHead>
                              <TableHead>Response</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedUser.literacySurveyResponses.map((resp: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>{resp.questionId}</TableCell>
                                <TableCell>{resp.responseValue}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    <TabsContent value="post-topic">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Topic</TableHead>
                              <TableHead>Question ID</TableHead>
                              <TableHead>Response</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedUser.postTopicSurveyResponses.map((resp: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>{resp.topicTitle}</TableCell>
                                <TableCell>{resp.questionId}</TableCell>
                                <TableCell>{resp.responseValue}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
