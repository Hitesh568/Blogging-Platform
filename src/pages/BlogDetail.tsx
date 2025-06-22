import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/contexts/BlogContext";
import Layout from "@/components/Layout";
import CommentSection from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  Eye,
  Clock,
  Calendar,
  Share2,
  BookmarkPlus,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowLeft,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentBlog,
    comments,
    fetchBlog,
    fetchComments,
    addBlogComment,
    likeBlog,
    removeBlog,
    isLoading,
  } = useBlog();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchBlog(slug);
    }
  }, [slug, fetchBlog]);

  useEffect(() => {
    if (currentBlog) {
      fetchComments(currentBlog.id);
      setLikeCount(currentBlog.likes);
      // In a real app, you'd check if the current user has liked this blog
      setIsLiked(false);
    }
  }, [currentBlog, fetchComments]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLike = async () => {
    if (!currentBlog) return;

    try {
      const response = await likeBlog(currentBlog.id);
      if (response.success && response.data) {
        setIsLiked(response.data.liked);
        setLikeCount(response.data.likeCount);
        toast.success(response.data.liked ? "Blog liked!" : "Like removed");
      }
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleShare = async () => {
    if (!currentBlog) return;

    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentBlog.title,
          text: currentBlog.excerpt,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleEdit = () => {
    if (currentBlog) {
      navigate(`/blogs/edit/${currentBlog.id}`);
    }
  };

  const handleDelete = async () => {
    if (!currentBlog) return;

    if (window.confirm("Are you sure you want to delete this blog?")) {
      const response = await removeBlog(currentBlog.id);
      if (response.success) {
        toast.success("Blog deleted successfully");
        navigate("/dashboard");
      } else {
        toast.error(response.error || "Failed to delete blog");
      }
    }
  };

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!currentBlog) return;

    const response = await addBlogComment(currentBlog.id, content, parentId);
    if (!response.success) {
      throw new Error(response.error || "Failed to add comment");
    }
  };

  const canEditOrDelete =
    user &&
    currentBlog &&
    (user.id === currentBlog.authorId || user.role === "admin");

  if (isLoading || !currentBlog) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4" />
              <div className="h-4 bg-muted rounded w-1/3 mb-6" />
              <div className="h-64 bg-muted rounded mb-6" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Blog Header */}
          <article className="space-y-6">
            <header className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {currentBlog.title}
              </h1>

              {/* Blog Meta */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Link
                    to={`/profile/${currentBlog.author?.username}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={currentBlog.author?.avatar}
                        alt={currentBlog.author?.fullName}
                      />
                      <AvatarFallback>
                        {currentBlog.author ? (
                          getInitials(currentBlog.author.fullName)
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {currentBlog.author?.fullName || "Unknown Author"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(
                            new Date(
                              currentBlog.publishedAt || currentBlog.createdAt,
                            ),
                            { addSuffix: true },
                          )}
                        </span>
                        {currentBlog.readTime && (
                          <>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{currentBlog.readTime} min read</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  {/* Action Buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={`gap-2 ${isLiked ? "text-red-500 border-red-200" : ""}`}
                  >
                    <Heart
                      className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                    />
                    {likeCount}
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" size="sm">
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>

                  {/* More Actions Menu */}
                  {canEditOrDelete && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Categories and Tags */}
              <div className="space-y-3">
                {currentBlog.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentBlog.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                {currentBlog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentBlog.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Image */}
              {currentBlog.featuredImage && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={currentBlog.featuredImage}
                    alt={currentBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </header>

            {/* Blog Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {currentBlog.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Blog Footer */}
            <footer className="space-y-6">
              <Separator />

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{currentBlog.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{likeCount} likes</span>
                  </div>
                </div>

                {currentBlog.updatedAt !== currentBlog.createdAt && (
                  <p className="text-xs">
                    Updated{" "}
                    {formatDistanceToNow(new Date(currentBlog.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>

              {/* Author Card */}
              {currentBlog.author && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={currentBlog.author.avatar}
                          alt={currentBlog.author.fullName}
                        />
                        <AvatarFallback>
                          {getInitials(currentBlog.author.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {currentBlog.author.fullName}
                        </h4>
                        {currentBlog.author.bio && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {currentBlog.author.bio}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() =>
                            navigate(`/profile/${currentBlog.author?.username}`)
                          }
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </footer>
          </article>

          {/* Comments Section */}
          <Separator />
          <CommentSection
            blogId={currentBlog.id}
            comments={comments}
            onAddComment={handleAddComment}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BlogDetail;
