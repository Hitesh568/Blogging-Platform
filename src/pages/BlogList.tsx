import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useBlog } from "@/contexts/BlogContext";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  X,
  BookOpen,
} from "lucide-react";
import { BlogFilters } from "@/types";
import { cn } from "@/lib/utils";

const BlogList: React.FC = () => {
  const {
    blogs,
    categories,
    isLoading,
    totalPages,
    currentPage,
    fetchBlogs,
    fetchCategories,
    filters,
    setFilters,
    clearFilters,
  } = useBlog();

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Initialize filters from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "";
    const urlSort = searchParams.get("sort") || "createdAt";
    const urlOrder = searchParams.get("order") || "desc";

    setLocalSearch(urlSearch);

    if (urlCategory) {
      setSelectedCategories([urlCategory]);
    }

    const newFilters: BlogFilters = {
      search: urlSearch || undefined,
      categories: urlCategory ? [urlCategory] : undefined,
      status: "published",
      sortBy: urlSort as any,
      sortOrder: urlOrder as any,
      limit: 12,
      offset: 0,
    };

    setFilters(newFilters);
    fetchCategories();
  }, []);

  // Fetch blogs when filters change
  useEffect(() => {
    fetchBlogs(filters);
  }, [filters, fetchBlogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: localSearch });
  };

  const handleCategoryToggle = (categorySlug: string) => {
    const newSelected = selectedCategories.includes(categorySlug)
      ? selectedCategories.filter((c) => c !== categorySlug)
      : [...selectedCategories, categorySlug];

    setSelectedCategories(newSelected);
    applyFilters({
      categories: newSelected.length > 0 ? newSelected : undefined,
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    applyFilters({ sortBy: sortBy as any, sortOrder: sortOrder as any });
  };

  const applyFilters = (newFilters: Partial<BlogFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      offset: 0, // Reset to first page
    };

    setFilters(updatedFilters);

    // Update URL params
    const newSearchParams = new URLSearchParams();
    if (updatedFilters.search) {
      newSearchParams.set("search", updatedFilters.search);
    }
    if (updatedFilters.categories && updatedFilters.categories.length > 0) {
      newSearchParams.set("category", updatedFilters.categories[0]);
    }
    if (updatedFilters.sortBy) {
      newSearchParams.set("sort", updatedFilters.sortBy);
    }
    if (updatedFilters.sortOrder) {
      newSearchParams.set("order", updatedFilters.sortOrder);
    }

    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * (filters.limit || 12);
    setFilters({ ...filters, offset: newOffset });
  };

  const clearAllFilters = () => {
    setLocalSearch("");
    setSelectedCategories([]);
    clearFilters();
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    filters.search ||
    (filters.categories && filters.categories.length > 0) ||
    filters.sortBy !== "createdAt" ||
    filters.sortOrder !== "desc";

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Discover Blogs</h1>
              <p className="text-muted-foreground">
                Explore amazing content from our community
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && "bg-muted")}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blogs..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {filters.search}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setLocalSearch("");
                        applyFilters({ search: undefined });
                      }}
                    />
                  </Badge>
                )}
                {filters.categories?.map((category) => (
                  <Badge key={category} variant="secondary" className="gap-1">
                    {category}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleCategoryToggle(category)}
                    />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Categories */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Categories</Label>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={category.slug}
                              checked={selectedCategories.includes(
                                category.slug,
                              )}
                              onCheckedChange={() =>
                                handleCategoryToggle(category.slug)
                              }
                            />
                            <Label
                              htmlFor={category.slug}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {category.name} ({category.postCount})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Sort By</Label>
                      <Select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onValueChange={handleSortChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt-desc">
                            Newest First
                          </SelectItem>
                          <SelectItem value="createdAt-asc">
                            Oldest First
                          </SelectItem>
                          <SelectItem value="title-asc">Title A-Z</SelectItem>
                          <SelectItem value="title-desc">Title Z-A</SelectItem>
                          <SelectItem value="likes-desc">Most Liked</SelectItem>
                          <SelectItem value="views-desc">
                            Most Viewed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${blogs.length} blogs found`}
              </p>
            </div>

            {/* Blog Grid/List */}
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
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4",
                )}
              >
                {blogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    compact={viewMode === "list"}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No blogs found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogList;
