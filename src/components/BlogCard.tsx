import React from "react";
import { Link } from "react-router-dom";
import { Blog } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Eye,
  Clock,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/contexts/BlogContext";

interface BlogCardProps {
  blog: Blog;
  showActions?: boolean;
  compact?: boolean;
  onLike?: (blogId: string) => void;
  onEdit?: (blogId: string) => void;
  onDelete?: (blogId: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  showActions = false,
  compact = false,
  onLike,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const { likeBlog } = useBlog();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onLike) {
      onLike(blog.id);
    } else {
      await likeBlog(blog.id);
    }
  };

  const canEditOrDelete =
    user && (user.id === blog.authorId || user.role === "admin");

  return (
    <Card
      className={cn(
        "group hover:shadow-md transition-shadow",
        compact && "h-fit",
      )}
    >
      <CardHeader className={cn("space-y-4", compact && "pb-2")}>
        {/* Blog Image */}
        {blog.featuredImage && !compact && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Header Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar
              className={cn("flex-shrink-0", compact ? "h-8 w-8" : "h-10 w-10")}
            >
              <AvatarImage
                src={blog.author?.avatar}
                alt={blog.author?.fullName}
              />
              <AvatarFallback>
                {blog.author ? getInitials(blog.author.fullName) : "??"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-medium truncate",
                  compact ? "text-sm" : "text-base",
                )}
              >
                {blog.author?.fullName || "Unknown Author"}
              </p>
              <div
                className={cn(
                  "flex items-center gap-2 text-muted-foreground",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                {blog.readTime && (
                  <>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{blog.readTime} min read</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {(showActions || canEditOrDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEditOrDelete && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(blog.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(blog.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", compact && "pt-0")}>
        {/* Title and Excerpt */}
        <Link
          to={`/blogs/${blog.slug}`}
          className="block space-y-2 group-hover:text-primary transition-colors"
        >
          <h3
            className={cn(
              "font-bold line-clamp-2",
              compact ? "text-lg" : "text-xl",
            )}
          >
            {blog.title}
          </h3>
          {!compact && (
            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </Link>

        {/* Categories */}
        {blog.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.categories.slice(0, compact ? 2 : 3).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
            {blog.categories.length > (compact ? 2 : 3) && (
              <Badge variant="outline" className="text-xs">
                +{blog.categories.length - (compact ? 2 : 3)}
              </Badge>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{blog.views}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-red-500"
              onClick={handleLike}
            >
              <Heart className="h-4 w-4 mr-1" />
              <span>{blog.likes}</span>
            </Button>
          </div>

          {/* Status Badge */}
          {blog.status !== "published" && (
            <Badge
              variant={blog.status === "draft" ? "outline" : "secondary"}
              className="text-xs"
            >
              {blog.status}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
