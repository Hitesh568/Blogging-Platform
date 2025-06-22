import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/contexts/BlogContext";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  Eye,
  Heart,
  Calendar,
  Shield,
  Trash2,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { User } from "@/types";
import { getUsers as getUsersFromStorage, setUsers } from "@/lib/storage";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { blogs, fetchBlogs, removeBlog, isLoading } = useBlog();
  const navigate = useNavigate();
  const [users, setUsersState] = useState<User[]>([]);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    // Fetch all data
    fetchBlogs({ limit: 100 });
    loadUsers();
  }, [user, navigate, fetchBlogs]);

  const loadUsers = () => {
    const allUsers = getUsersFromStorage();
    setUsersState(allUsers);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleDeleteBlog = async (blogId: string) => {
    const response = await removeBlog(blogId);
    if (response.success) {
      toast.success("Blog deleted successfully");
    } else {
      toast.error(response.error || "Failed to delete blog");
    }
  };

  const handleEditBlog = (blogId: string) => {
    navigate(`/blogs/edit/${blogId}`);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsersState(updatedUsers);

    // In a real app, this would be an API call
    // For demo purposes, we'll update localStorage
    setUsers(updatedUsers);

    toast.success("User deleted successfully");
  };

  const stats = {
    totalUsers: users.length,
    totalBlogs: blogs.length,
    publishedBlogs: blogs.filter((b) => b.status === "published").length,
    draftBlogs: blogs.filter((b) => b.status === "draft").length,
    totalViews: blogs.reduce((sum, blog) => sum + blog.views, 0),
    totalLikes: blogs.reduce((sum, blog) => sum + blog.likes, 0),
  };

  // Recent activity (most recent blogs)
  const recentBlogs = [...blogs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage users, blogs, and platform analytics
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Users className="h-8 w-8 text-blue-600 mx-auto" />
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Users</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto" />
                  <div className="text-2xl font-bold">{stats.totalBlogs}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Blogs
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto" />
                  <div className="text-2xl font-bold">
                    {stats.publishedBlogs}
                  </div>
                  <div className="text-sm text-muted-foreground">Published</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Edit className="h-8 w-8 text-orange-600 mx-auto" />
                  <div className="text-2xl font-bold">{stats.draftBlogs}</div>
                  <div className="text-sm text-muted-foreground">Drafts</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Eye className="h-8 w-8 text-cyan-600 mx-auto" />
                  <div className="text-2xl font-bold">{stats.totalViews}</div>
                  <div className="text-sm text-muted-foreground">Views</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Heart className="h-8 w-8 text-red-600 mx-auto" />
                  <div className="text-2xl font-bold">{stats.totalLikes}</div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="blogs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="blogs">Manage Blogs</TabsTrigger>
              <TabsTrigger value="users">Manage Users</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            {/* Blogs Management */}
            <TabsContent value="blogs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Blogs</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6 space-y-4">
                            <div className="h-4 bg-muted rounded" />
                            <div className="h-4 bg-muted rounded w-2/3" />
                            <div className="h-20 bg-muted rounded" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {blogs.map((blog) => (
                        <BlogCard
                          key={blog.id}
                          blog={blog}
                          showActions
                          onEdit={handleEditBlog}
                          onDelete={handleDeleteBlog}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No blogs found
                      </h3>
                      <p className="text-muted-foreground">
                        No blogs have been created yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Management */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userItem) => (
                        <TableRow key={userItem.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={userItem.avatar}
                                  alt={userItem.fullName}
                                />
                                <AvatarFallback>
                                  {getInitials(userItem.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {userItem.fullName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  @{userItem.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{userItem.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                userItem.role === "admin"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {userItem.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(userItem.createdAt),
                              "MMM d, yyyy",
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/profile/${userItem.username}`)
                                  }
                                >
                                  View Profile
                                </DropdownMenuItem>
                                {userItem.id !== user.id && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete User
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete User
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete{" "}
                                          {userItem.fullName}? This action
                                          cannot be undone and will remove all
                                          their blogs and comments.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteUser(userItem.id)
                                          }
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Activity */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Blog Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentBlogs.length > 0 ? (
                    <div className="space-y-4">
                      {recentBlogs.map((blog) => (
                        <div
                          key={blog.id}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          <Activity className="h-6 w-6 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{blog.title}</span>
                              <Badge
                                variant={
                                  blog.status === "published"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {blog.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              by {blog.author?.fullName} •{" "}
                              {format(new Date(blog.createdAt), "MMM d, yyyy")}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {blog.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {blog.likes}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No recent activity
                      </h3>
                      <p className="text-muted-foreground">
                        No recent blog activity to show.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
