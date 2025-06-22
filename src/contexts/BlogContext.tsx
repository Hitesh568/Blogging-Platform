import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  Blog,
  Comment,
  Category,
  BlogFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types";
import {
  saveBlog,
  getFilteredBlogs,
  getBlog,
  deleteBlog,
  toggleBlogLike,
  getBlogComments,
  addComment,
  getAllCategories,
} from "@/lib/blog";

interface BlogContextType {
  // State
  blogs: Blog[];
  currentBlog: Blog | null;
  comments: Comment[];
  categories: Category[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;

  // Blog operations
  createBlog: (blogData: Partial<Blog>) => Promise<ApiResponse<Blog>>;
  updateBlog: (
    blogId: string,
    blogData: Partial<Blog>,
  ) => Promise<ApiResponse<Blog>>;
  fetchBlogs: (filters?: BlogFilters) => Promise<void>;
  fetchBlog: (identifier: string) => Promise<void>;
  removeBlog: (blogId: string) => Promise<ApiResponse<void>>;
  likeBlog: (
    blogId: string,
  ) => Promise<ApiResponse<{ liked: boolean; likeCount: number }>>;

  // Comment operations
  fetchComments: (blogId: string) => Promise<void>;
  addBlogComment: (
    blogId: string,
    content: string,
    parentId?: string,
  ) => Promise<ApiResponse<Comment>>;

  // Category operations
  fetchCategories: () => Promise<void>;

  // Filters
  filters: BlogFilters;
  setFilters: (filters: BlogFilters) => void;
  clearFilters: () => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const useBlog = (): BlogContextType => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
};

interface BlogProviderProps {
  children: ReactNode;
}

export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFiltersState] = useState<BlogFilters>({
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 10,
    offset: 0,
  });

  const createBlog = useCallback(
    async (blogData: Partial<Blog>): Promise<ApiResponse<Blog>> => {
      setIsLoading(true);
      try {
        const response = await saveBlog(blogData);
        if (response.success) {
          // Refresh blogs after creation
          await fetchBlogs(filters);
        }
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  const updateBlog = useCallback(
    async (
      blogId: string,
      blogData: Partial<Blog>,
    ): Promise<ApiResponse<Blog>> => {
      setIsLoading(true);
      try {
        const response = await saveBlog(blogData, blogId);
        if (response.success) {
          // Update current blog if it's the same one
          if (currentBlog?.id === blogId && response.data) {
            setCurrentBlog(response.data);
          }
          // Refresh blogs after update
          await fetchBlogs(filters);
        }
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [currentBlog, filters],
  );

  const fetchBlogs = useCallback(
    async (searchFilters?: BlogFilters) => {
      setIsLoading(true);
      try {
        const filtersToUse = searchFilters || filters;
        const response = await getFilteredBlogs(filtersToUse);
        if (response.success && response.data) {
          setBlogs(response.data.data);
          setTotalPages(response.data.totalPages);
          setCurrentPage(response.data.page);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  const fetchBlog = useCallback(async (identifier: string) => {
    setIsLoading(true);
    try {
      const response = await getBlog(identifier);
      if (response.success && response.data) {
        setCurrentBlog(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeBlog = useCallback(
    async (blogId: string): Promise<ApiResponse<void>> => {
      setIsLoading(true);
      try {
        const response = await deleteBlog(blogId);
        if (response.success) {
          // Remove from current blogs list
          setBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
          // Clear current blog if it's the deleted one
          if (currentBlog?.id === blogId) {
            setCurrentBlog(null);
          }
        }
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [currentBlog],
  );

  const likeBlog = useCallback(
    async (
      blogId: string,
    ): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> => {
      try {
        const response = await toggleBlogLike(blogId);
        if (response.success && response.data) {
          // Update the blog in the blogs list
          setBlogs((prev) =>
            prev.map((blog) =>
              blog.id === blogId
                ? { ...blog, likes: response.data!.likeCount }
                : blog,
            ),
          );
          // Update current blog if it's the same one
          if (currentBlog?.id === blogId) {
            setCurrentBlog((prev) =>
              prev ? { ...prev, likes: response.data!.likeCount } : null,
            );
          }
        }
        return response;
      } catch (error) {
        return {
          success: false,
          error: "Failed to toggle like",
        };
      }
    },
    [currentBlog],
  );

  const fetchComments = useCallback(async (blogId: string) => {
    setIsLoading(true);
    try {
      const response = await getBlogComments(blogId);
      if (response.success && response.data) {
        setComments(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBlogComment = useCallback(
    async (
      blogId: string,
      content: string,
      parentId?: string,
    ): Promise<ApiResponse<Comment>> => {
      try {
        const response = await addComment(blogId, content, parentId);
        if (response.success && response.data) {
          // Add the new comment to the comments list
          setComments((prev) => [response.data!, ...prev]);
        }
        return response;
      } catch (error) {
        return {
          success: false,
          error: "Failed to add comment",
        };
      }
    },
    [],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  const setFilters = useCallback((newFilters: BlogFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      sortBy: "createdAt",
      sortOrder: "desc",
      limit: 10,
      offset: 0,
    });
  }, []);

  const value: BlogContextType = {
    // State
    blogs,
    currentBlog,
    comments,
    categories,
    isLoading,
    totalPages,
    currentPage,

    // Blog operations
    createBlog,
    updateBlog,
    fetchBlogs,
    fetchBlog,
    removeBlog,
    likeBlog,

    // Comment operations
    fetchComments,
    addBlogComment,

    // Category operations
    fetchCategories,

    // Filters
    filters,
    setFilters,
    clearFilters,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};
