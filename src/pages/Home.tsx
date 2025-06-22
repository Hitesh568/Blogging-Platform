import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/contexts/BlogContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import {
  PenTool,
  BookOpen,
  Users,
  TrendingUp,
  ArrowRight,
  Search,
  Star,
} from "lucide-react";
import { Blog } from "@/types";

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { blogs, fetchBlogs, categories, fetchCategories } = useBlog();
  const navigate = useNavigate();
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    // Fetch recent published blogs for homepage
    fetchBlogs({
      status: "published",
      sortBy: "publishedAt",
      sortOrder: "desc",
      limit: 6,
    });
    fetchCategories();
  }, [fetchBlogs, fetchCategories]);

  useEffect(() => {
    // Set featured blogs (most liked recent blogs)
    const featured = blogs
      .filter((blog) => blog.status === "published")
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3);
    setFeaturedBlogs(featured);
  }, [blogs]);

  const stats = [
    {
      title: "Total Blogs",
      value: blogs.filter((b) => b.status === "published").length,
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Categories",
      value: categories.length,
      icon: Star,
      color: "text-green-600",
    },
    {
      title: "Active Writers",
      value: new Set(blogs.map((b) => b.authorId)).size,
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Total Views",
      value: blogs.reduce((sum, blog) => sum + blog.views, 0),
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-muted/50">
          <div className="container mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Share Your Stories
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                A modern platform for writers and readers to connect, share
                ideas, and build a community around great content.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Button size="lg" onClick={() => navigate("/blogs/create")}>
                    <PenTool className="mr-2 h-5 w-5" />
                    Start Writing
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/blogs")}
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Browse Blogs
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate("/register")}>
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/blogs")}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Explore
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.title} className="text-center">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-2">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.title}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Blogs Section */}
        {featuredBlogs.length > 0 && (
          <section className="py-16 px-4">
            <div className="container mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Featured Stories</h2>
                <p className="text-muted-foreground">
                  Discover the most popular and engaging content from our
                  community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" onClick={() => navigate("/blogs")}>
                  View All Blogs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Explore Categories</h2>
                <p className="text-muted-foreground">
                  Find content that interests you
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/blogs?category=${category.slug}`}
                    className="group"
                  >
                    <Card className="text-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div
                            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name.charAt(0)}
                          </div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.postCount} posts
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="py-20 px-4 bg-primary">
            <div className="container mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Ready to Share Your Voice?
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                Join our community of writers and readers. Create your account
                and start sharing your stories with the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate("/register")}
                >
                  <PenTool className="mr-2 h-5 w-5" />
                  Join Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Home;
