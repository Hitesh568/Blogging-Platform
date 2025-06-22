import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBlog } from "@/contexts/BlogContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Send,
  Eye,
  ArrowLeft,
  Plus,
  X,
  FileText,
  Image,
} from "lucide-react";
import { toast } from "sonner";
import { Blog } from "@/types";

const blogSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(10000, "Content must be less than 10,000 characters"),
  excerpt: z
    .string()
    .max(300, "Excerpt must be less than 300 characters")
    .optional(),
  featuredImage: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  status: z.enum(["draft", "published"]),
});

type BlogFormData = z.infer<typeof blogSchema>;

const BlogEditor: React.FC = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    createBlog,
    updateBlog,
    fetchBlog,
    currentBlog,
    categories,
    fetchCategories,
    isLoading,
  } = useBlog();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(blogId);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      featuredImage: "",
      status: "draft",
    },
  });

  // Fetch categories and blog data
  useEffect(() => {
    fetchCategories();
    if (isEditing && blogId) {
      fetchBlog(blogId);
    }
  }, [fetchCategories, fetchBlog, isEditing, blogId]);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && currentBlog) {
      // Check if user can edit this blog
      if (currentBlog.authorId !== user?.id && user?.role !== "admin") {
        toast.error("You don't have permission to edit this blog");
        navigate("/dashboard");
        return;
      }

      form.reset({
        title: currentBlog.title,
        content: currentBlog.content,
        excerpt: currentBlog.excerpt,
        featuredImage: currentBlog.featuredImage || "",
        status: currentBlog.status,
      });
      setSelectedCategories(currentBlog.categories);
      setTags(currentBlog.tags);
    }
  }, [currentBlog, isEditing, form, user, navigate]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  const onSubmit = async (
    data: BlogFormData,
    status: "draft" | "published",
  ) => {
    setIsSubmitting(true);

    try {
      const blogData: Partial<Blog> = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || data.content.substring(0, 150) + "...",
        featuredImage: data.featuredImage || undefined,
        categories: selectedCategories,
        tags,
        status,
      };

      let response;
      if (isEditing && blogId) {
        response = await updateBlog(blogId, blogData);
      } else {
        response = await createBlog(blogData);
      }

      if (response.success) {
        toast.success(`Blog ${isEditing ? "updated" : "created"} successfully`);
        navigate("/dashboard");
      } else {
        toast.error(response.error || "Failed to save blog");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = (data: BlogFormData) => {
    onSubmit(data, "draft");
  };

  const handlePublish = (data: BlogFormData) => {
    onSubmit(data, "published");
  };

  const generateExcerpt = () => {
    const content = form.getValues("content");
    if (content) {
      const excerpt = content.substring(0, 150) + "...";
      form.setValue("excerpt", excerpt);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditing ? "Edit Blog" : "Create New Blog"}
                </h1>
                <p className="text-muted-foreground">
                  {isEditing
                    ? "Update your blog post"
                    : "Share your thoughts with the world"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/blogs", "_blank")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          <Form {...form}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your blog title"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your blog content here..."
                              className="min-h-[400px] resize-vertical"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-muted-foreground">
                            {field.value.length}/10,000 characters
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Excerpt</FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={generateExcerpt}
                              disabled={isSubmitting}
                            >
                              Auto-generate
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of your blog (optional)"
                              className="min-h-[100px] resize-vertical"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-muted-foreground">
                            {(field.value || "").length}/300 characters
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Featured Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Featured Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Image URL (optional)"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                          {field.value && (
                            <div className="mt-2">
                              <img
                                src={field.value}
                                alt="Featured"
                                className="w-full h-32 object-cover rounded-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() =>
                            handleCategoryToggle(category.name)
                          }
                          disabled={isSubmitting}
                        />
                        <Label
                          htmlFor={category.id}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddTag}
                        disabled={isSubmitting || !newTag.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Publish</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">
                                Published
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={form.handleSubmit(handleSaveDraft)}
                        disabled={isSubmitting || isLoading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Saving..." : "Save Draft"}
                      </Button>

                      <Button
                        type="button"
                        className="w-full"
                        onClick={form.handleSubmit(handlePublish)}
                        disabled={isSubmitting || isLoading}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Publishing..." : "Publish"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default BlogEditor;
