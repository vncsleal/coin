'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  PieChart,
  BarChart3,
  CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface AnalyticsData {
  monthlyTrends: Array<{
    month: string;
    totalAmount: number;
    expenseCount: number;
    settledAmount: number;
    pendingAmount: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  friendAnalysis: Array<{
    friendId: string;
    friendName: string;
    friendEmail: string;
    totalShared: number;
    expenseCount: number;
    settledAmount: number;
    pendingAmount: number;
  }>;
  settlementOverview: {
    totalOwed: number;
    totalOwing: number;
    totalSettled: number;
    pendingCount: number;
    overdueCount: number;
  };
  summary: {
    totalExpenses: number;
    totalAmount: number;
    averageExpense: number;
    mostActiveMonth: string;
    topCategory: string;
    settlementRate: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function SharedExpenseAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months'); // 3months, 6months, 1year

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/shared-expenses/analytics?range=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Shared Expense Analytics</h2>
          <p className="text-muted-foreground">Insights into your shared spending patterns</p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="3months">3 Months</TabsTrigger>
            <TabsTrigger value="6months">6 Months</TabsTrigger>
            <TabsTrigger value="1year">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              ${data.summary.totalAmount.toFixed(2)} total amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.averageExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per shared expense
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settlement Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.settlementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Expenses fully settled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.topCategory || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Most frequent category
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trends</CardTitle>
              <CardDescription>
                Track your shared expenses and settlement patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalAmount" 
                    stroke="#8884d8" 
                    name="Total Amount"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="settledAmount" 
                    stroke="#82ca9d" 
                    name="Settled Amount"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pendingAmount" 
                    stroke="#ffc658" 
                    name="Pending Amount"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Breakdown by expense categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }: any) => `${category} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {data.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.categoryBreakdown.map((category, index) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${category.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {category.count} expenses
                        </div>
                      </div>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Friend-wise Analysis</CardTitle>
              <CardDescription>
                See who you share expenses with most frequently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.friendAnalysis.map((friend) => (
                  <Card key={friend.friendId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{friend.friendName || friend.friendEmail}</div>
                          <Badge variant="outline">{friend.expenseCount} expenses</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {friend.friendEmail}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-bold text-lg">${friend.totalShared.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          Settled: ${friend.settledAmount.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pending: ${friend.pendingAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Settlement Progress</span>
                        <span>{friend.totalShared > 0 ? ((friend.settledAmount / friend.totalShared) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <Progress 
                        value={friend.totalShared > 0 ? (friend.settledAmount / friend.totalShared) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Settlement Overview</CardTitle>
                <CardDescription>Current settlement status summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${data.settlementOverview.totalOwed.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600">You're Owed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      ${data.settlementOverview.totalOwing.toFixed(2)}
                    </div>
                    <div className="text-sm text-red-600">You Owe</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Settled</span>
                    <span className="font-bold">${data.settlementOverview.totalSettled.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Settlements</span>
                    <Badge variant="outline">{data.settlementOverview.pendingCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overdue Payments</span>
                    <Badge variant="destructive">{data.settlementOverview.overdueCount}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settlement Rate Trend</CardTitle>
                <CardDescription>How quickly settlements are completed</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'settlementRate' ? `${Number(value).toFixed(1)}%` : `$${Number(value).toFixed(2)}`,
                        name === 'settlementRate' ? 'Settlement Rate' : name
                      ]}
                    />
                    <Bar 
                      dataKey="settledAmount" 
                      fill="#82ca9d" 
                      name="Settled Amount"
                    />
                    <Bar 
                      dataKey="pendingAmount" 
                      fill="#ffc658" 
                      name="Pending Amount"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
