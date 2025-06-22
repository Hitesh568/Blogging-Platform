import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useBlog } from "@/contexts/BlogContext";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search as SearchIcon, Filter, BookOpen, X } from "lucide-react";
import { BlogFilters } from "@/types";

const Search: React.FC = () => {
  const {
    blogs,
    categories,
    isLoading,
    fetchBlogs,
    fetchCategories,
    filters,
    setFilters,
  } = useBlog();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  useEffect(() => {
    fetchCategories();

    // Get search query from URL
    const urlQuery = searchParams.get("q") || "";
    const urlCategory = searchParams.get("category") || "";

    if (urlQuery) {
      setSearchQuery(urlQuery);
      handleSearch(urlQuery, urlCategory ? [urlCategory] : []);
    }
  }, []);

  const handleSearch = (query: string, categoryFilters: string[] = []) => {
    const searchFilters: BlogFilters = {
      search: query || undefined,
      categories: categoryFilters.length > 0 ? categoryFilters : undefined,
      status: "published",
      sortBy: "createdAt",
      sortOrder: "desc",
      limit: 20,
    };

    setFilters(searchFilters);
    fetchBlogs(searchFilters);
    setSearchSubmitted(true);

    // Update URL
    const newSearchParams = new URLSearchParams();
    if (query) {
      newSearchParams.set("q", query);
    }
    if (categoryFilters.length > 0) {
      newSearchParams.set("category", categoryFilters[0]);
    }
    setSearchParams(newSearchParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery, selectedCategories);
  };

  const handleCategoryToggle = (categorySlug: string) => {
    const newSelected = selectedCategories.includes(categorySlug)
      ? selectedCategories.filter((c) => c !== categorySlug)
      : [categorySlug]; // For simplicity, only allow one category at a time

    setSelectedCategories(newSelected);
    handleSearch(searchQuery, newSelected);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSearchSubmitted(false);
    setSearchParams(new URLSearchParams());
    setFilters({
      status: "published",
      sortBy: "createdAt",
      sortOrder: "desc",
      limit: 20,
    });
  };

  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || searchSubmitted;

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <SearchIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Search Blogs</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover amazing content from our community. Search by keywords,
              explore categories, or browse the latest posts.
            </p>
          </div>

          {/* Search Form */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearchSubmit} className="space-y-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for blogs, topics, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit">Search</Button>
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearSearch}
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Category Filters */}
                {categories.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Filter by Category:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant={
                            selectedCategories.includes(category.slug)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => handleCategoryToggle(category.slug)}
                        >
                          {category.name} ({category.postCount})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSearchQuery("");
                      handleSearch("", selectedCategories);
                    }}
                  />
                </Badge>
              )}
              {selectedCategories.map((category) => (
                <Badge key={category} variant="secondary" className="gap-1">
                  {category}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleCategoryToggle(category)}
                  />
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Search Results */}
          <div className="space-y-6">
            {/* Results Header */}
            {searchSubmitted && (
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {isLoading
                    ? "Searching..."
                    : `${blogs.length} result${blogs.length !== 1 ? "s" : ""} found`}
                </h2>
              </div>
            )}

            {/* Results Grid */}
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
            ) : searchSubmitted && blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            ) : searchSubmitted && blogs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or browse our categories.
                  </p>
                  <Button variant="outline" onClick={clearSearch}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Default State - Show Popular Categories */
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">
                    Explore Popular Categories
                  </h3>
                  <p className="text-muted-foreground">
                    Start by exploring these popular categories or search for
                    specific topics above.
                  </p>
                </div>

                {categories.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories
                      .filter((cat) => cat.postCount > 0)
                      .slice(0, 8)
                      .map((category) => (
                        <Card
                          key={category.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleCategoryToggle(category.slug)}
                        >
                          <CardContent className="pt-6 text-center">
                            <div
                              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name.charAt(0)}
                            </div>
                            <h4 className="font-semibold mb-1">
                              {category.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {category.postCount} post
                              {category.postCount !== 1 ? "s" : ""}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}

                {categories.filter((cat) => cat.postCount > 0).length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No content available
                      </h3>
                      <p className="text-muted-foreground">
                        No published blogs are available for searching at this
                        time.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
