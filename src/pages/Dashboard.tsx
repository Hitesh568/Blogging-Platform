import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/contexts/BlogContext";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PenTool,
  BookOpen,
  Heart,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { blogs, fetchBlogs, removeBlog, isLoading } = useBlog();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Fetch user's blogs
      fetchBlogs({
        author: user.id,
        sortBy: "updatedAt",
        sortOrder: "desc",
        limit: 50,
      });
    }
  }, [user, fetchBlogs]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleEditBlog = (blogId: string) => {
    navigate(`/blogs/edit/${blogId}`);
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      const response = await removeBlog(blogId);
      if (response.success) {
        toast.success("Blog deleted successfully");
      } else {
        toast.error(response.error || "Failed to delete blog");
      }
    }
  };

  const userBlogs = blogs.filter((blog) => blog.authorId === user?.id);
  const publishedBlogs = userBlogs.filter(
    (blog) => blog.status === "published",
  );
  const draftBlogs = userBlogs.filter((blog) => blog.status === "draft");

  const stats = {
    totalBlogs: userBlogs.length,
    publishedBlogs: publishedBlogs.length,
    totalViews: userBlogs.reduce((sum, blog) => sum + blog.views, 0),
    totalLikes: userBlogs.reduce((sum, blog) => sum + blog.likes, 0),
  };

  if (!user) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* User Info */}
            <Card className="lg:w-1/3">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.bio && <p className="text-sm">{user.bio}</p>}
                  <p className="text-xs text-muted-foreground">
                    Member since {format(new Date(user.createdAt), "MMMM yyyy")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/profile")}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="lg:w-2/3 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <BookOpen className="h-8 w-8 text-blue-600 mx-auto" />
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
                    <PenTool className="h-8 w-8 text-green-600 mx-auto" />
                    <div className="text-2xl font-bold">
                      {stats.publishedBlogs}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Published
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <Eye className="h-8 w-8 text-purple-600 mx-auto" />
                    <div className="text-2xl font-bold">{stats.totalViews}</div>
                    <div className="text-sm text-muted-foreground">
                      Total Views
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <Heart className="h-8 w-8 text-red-600 mx-auto" />
                    <div className="text-2xl font-bold">{stats.totalLikes}</div>
                    <div className="text-sm text-muted-foreground">
                      Total Likes
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate("/blogs/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Blog
                </Button>
                <Button variant="outline" onClick={() => navigate("/blogs")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse All Blogs
                </Button>
                {user.role === "admin" && (
                  <Button variant="outline" onClick={() => navigate("/admin")}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Blogs */}
          <Card>
            <CardHeader>
              <CardTitle>My Blogs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="all">
                    All ({userBlogs.length})
                  </TabsTrigger>
                  <TabsTrigger value="published">
                    Published ({publishedBlogs.length})
                  </TabsTrigger>
                  <TabsTrigger value="drafts">
                    Drafts ({draftBlogs.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6 space-y-4">
                            <div className="h-4 bg-muted rounded" />
                            <div className="h-4 bg-muted rounded w-2/3" />
                            <div className="h-20 bg-muted rounded" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : userBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userBlogs.map((blog) => (
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
                      <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No blogs yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Start sharing your thoughts with the world
                      </p>
                      <Button onClick={() => navigate("/blogs/create")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Blog
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="published" className="space-y-4">
                  {publishedBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {publishedBlogs.map((blog) => (
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
                        No published blogs
                      </h3>
                      <p className="text-muted-foreground">
                        Publish your drafts to share them with the community
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="drafts" className="space-y-4">
                  {draftBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {draftBlogs.map((blog) => (
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
                      <Edit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No drafts</h3>
                      <p className="text-muted-foreground">
                        Create a draft to save your work in progress
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
