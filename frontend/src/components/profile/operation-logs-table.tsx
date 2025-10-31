'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OperationLog } from '@/interface/user';
import { Search, Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface OperationLogsTableProps {
  logs: OperationLog[];
  isLoading?: boolean;
}

export default function OperationLogsTable({ logs, isLoading = false }: OperationLogsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  
  // 过滤日志
  const filteredLogs = logs.filter(log => {
    // 搜索过滤
    const matchesSearch = searchTerm === '' || 
      log.operation_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operation_desc.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 类型过滤
    const matchesType = filterType === 'all' || log.operation_type === filterType;
    
    // 日期过滤
    let matchesDate = true;
    if (filterDate !== 'all') {
      const logDate = new Date(log.created_at);
      const now = new Date();
      
      switch (filterDate) {
        case 'today':
          matchesDate = logDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });
  
  // 获取操作类型的显示文本和样式
  const getOperationTypeDisplay = (type: string) => {
    switch (type) {
      case 'profile':
        return { text: '资料修改', variant: 'default' as const };
      case 'password':
        return { text: '密码修改', variant: 'destructive' as const };
      case 'avatar':
        return { text: '头像更新', variant: 'secondary' as const };
      case 'login':
        return { text: '登录', variant: 'outline' as const };
      case 'logout':
        return { text: '登出', variant: 'outline' as const };
      default:
        return { text: type, variant: 'secondary' as const };
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
    } catch {
      return dateString;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          操作日志
        </CardTitle>
        <CardDescription>查看您的账户操作历史记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜索操作或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="w-40">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="操作类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="profile">资料修改</SelectItem>
                  <SelectItem value="password">密码修改</SelectItem>
                  <SelectItem value="avatar">头像更新</SelectItem>
                  <SelectItem value="login">登录</SelectItem>
                  <SelectItem value="logout">登出</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-40">
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <SelectValue placeholder="时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部时间</SelectItem>
                  <SelectItem value="today">今天</SelectItem>
                  <SelectItem value="week">最近7天</SelectItem>
                  <SelectItem value="month">最近30天</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>操作类型</TableHead>
                  <TableHead>操作</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>IP地址</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const typeDisplay = getOperationTypeDisplay(log.operation_type);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeDisplay.variant}>
                          {typeDisplay.text}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.operation_type}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.operation_desc}
                      </TableCell>
                      <TableCell>{log.request_ip || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无操作日志</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'all' || filterDate !== 'all'
                ? '没有找到符合条件的操作记录'
                : '您还没有任何操作记录'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}