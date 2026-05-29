package com.seeyou.api.controller;

import com.seeyou.api.dto.*;
import com.seeyou.api.model.*;
import com.seeyou.api.repository.*;
import com.seeyou.api.security.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    // 1. Admin Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        if (adminUsername.equals(request.getUsername()) && adminPassword.equals(request.getPassword())) {
            String token = tokenService.generateToken(adminUsername);
            return ResponseEntity.ok(new LoginResponse(token, adminUsername));
        }
        Map<String, String> err = new HashMap<>();
        err.put("error", "Invalid credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
    }

    // 2. Dashboard Overview Metrics
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        long totalArticles = articleRepository.count();
        long publishedArticles = articleRepository.findByStatusOrderByCreatedDateDesc("PUBLISHED").size();
        long draftArticles = totalArticles - publishedArticles;
        long totalComments = commentRepository.count();
        long pendingComments = commentRepository.findAllByOrderByCreatedDateDesc().stream()
                .filter(c -> "PENDING".equals(c.getStatus())).count();
        long totalReactions = reactionRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalArticles", totalArticles);
        stats.put("publishedArticles", publishedArticles);
        stats.put("draftArticles", draftArticles);
        stats.put("totalComments", totalComments);
        stats.put("pendingComments", pendingComments);
        stats.put("totalReactions", totalReactions);

        return ResponseEntity.ok(stats);
    }

    // 3. Manage Articles (All drafts and published)
    @GetMapping("/articles")
    public ResponseEntity<List<ArticleSummaryResponse>> getAllArticles() {
        List<Article> articles = articleRepository.findAllByOrderByCreatedDateDesc();
        List<ArticleSummaryResponse> dtos = articles.stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // 4. Create Article
    @PostMapping("/articles")
    public ResponseEntity<?> createArticle(@Valid @RequestBody ArticleRequest request) {
        Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
        if (categoryOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Category not found\"}");
        }

        List<Author> authors = authorRepository.findAll();
        if (authors.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"No author initialized in database\"}");
        }
        Author author = authors.get(0);

        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = slugify(request.getTitle());
        } else {
            slug = slugify(slug);
        }

        // Check if slug is unique
        if (articleRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        int readingTime = request.getReadingTime() != null ? request.getReadingTime() : calculateReadingTime(request.getContent());

        Article article = Article.builder()
                .title(request.getTitle())
                .slug(slug)
                .content(request.getContent())
                .summary(request.getSummary())
                .featuredImage(request.getFeaturedImage())
                .status(request.getStatus().toUpperCase())
                .readingTime(readingTime)
                .category(categoryOpt.get())
                .author(author)
                .build();

        Article saved = articleRepository.save(article);
        return ResponseEntity.ok(mapToSummary(saved));
    }

    // 5. Update Article
    @PutMapping("/articles/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable Long id, @Valid @RequestBody ArticleRequest request) {
        Optional<Article> articleOpt = articleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Article article = articleOpt.get();

        Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
        if (categoryOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Category not found\"}");
        }

        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = slugify(request.getTitle());
        } else {
            slug = slugify(slug);
        }

        // Verify if slug belongs to another article
        Optional<Article> existingSlug = articleRepository.findBySlug(slug);
        if (existingSlug.isPresent() && !existingSlug.get().getId().equals(id)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        int readingTime = request.getReadingTime() != null ? request.getReadingTime() : calculateReadingTime(request.getContent());

        article.setTitle(request.getTitle());
        article.setSlug(slug);
        article.setContent(request.getContent());
        article.setSummary(request.getSummary());
        article.setFeaturedImage(request.getFeaturedImage());
        article.setStatus(request.getStatus().toUpperCase());
        article.setReadingTime(readingTime);
        article.setCategory(categoryOpt.get());

        Article updated = articleRepository.save(article);
        return ResponseEntity.ok(mapToSummary(updated));
    }

    // 6. Delete Article
    @DeleteMapping("/articles/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        if (!articleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        articleRepository.deleteById(id);
        return ResponseEntity.ok("{\"status\": \"DELETED\"}");
    }

    // 7. Manage Comments (List all for moderation)
    @GetMapping("/comments")
    public ResponseEntity<List<Comment>> getAllComments() {
        return ResponseEntity.ok(commentRepository.findAllByOrderByCreatedDateDesc());
    }

    // 8. Moderate Comment Status (APPROVED / SPAM / PENDING)
    @PutMapping("/comments/{id}/status")
    public ResponseEntity<?> updateCommentStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        
        Optional<Comment> commentOpt = commentRepository.findById(id);
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Comment comment = commentOpt.get();
        comment.setStatus(status.toUpperCase());
        commentRepository.save(comment);
        return ResponseEntity.ok("{\"status\": \"" + comment.getStatus() + "\"}");
    }

    // 9. Delete Comment
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        if (!commentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        commentRepository.deleteById(id);
        return ResponseEntity.ok("{\"status\": \"DELETED\"}");
    }

    // 10. Add Category
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@Valid @RequestBody Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Category already exists\"}");
        }
        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(saved);
    }

    // 11. Delete Category
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            categoryRepository.deleteById(id);
            return ResponseEntity.ok("{\"status\": \"DELETED\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Category is linked to articles and cannot be deleted\"}");
        }
    }

    // 12. Update Author Profile details
    @PutMapping("/author")
    public ResponseEntity<?> updateAuthor(@Valid @RequestBody Author authorDetails) {
        List<Author> authors = authorRepository.findAll();
        if (authors.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"No author profile to update\"}");
        }
        Author author = authors.get(0);
        author.setName(authorDetails.getName());
        author.setBio(authorDetails.getBio());
        author.setProfileImage(authorDetails.getProfileImage());
        author.setGithubLink(authorDetails.getGithubLink());
        author.setLinkedinLink(authorDetails.getLinkedinLink());
        author.setTwitterLink(authorDetails.getTwitterLink());
        author.setPortfolioLink(authorDetails.getPortfolioLink());

        Author updated = authorRepository.save(author);
        return ResponseEntity.ok(updated);
    }

    // Slugification Helper
    private String slugify(String title) {
        if (title == null || title.isEmpty()) {
            return "untitled-" + System.currentTimeMillis();
        }
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "") // Keep alphanumeric, spaces, and hyphens
                .replaceAll("\\s+", "-")          // Replace spaces with hyphens
                .replaceAll("-+", "-")           // Collapse double hyphens
                .replaceAll("^-|-$", "")          // Trim leading/trailing hyphens
                .trim();
    }

    // Estimate Reading Time helper
    private int calculateReadingTime(String content) {
        if (content == null || content.isEmpty()) {
            return 1;
        }
        String[] words = content.split("\\s+");
        int wordsPerMinute = 200; // Average reading speed
        int minutes = (int) Math.ceil((double) words.length / wordsPerMinute);
        return Math.max(1, minutes);
    }

    // Helper: Map Entity to Summary DTO
    private ArticleSummaryResponse mapToSummary(Article a) {
        long likes = reactionRepository.countByArticleIdAndReactionType(a.getId(), "LIKE");
        long loves = reactionRepository.countByArticleIdAndReactionType(a.getId(), "LOVE");
        long comments = commentRepository.findByArticleIdAndStatusOrderByCreatedDateDesc(a.getId(), "APPROVED").size();
        return ArticleSummaryResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .slug(a.getSlug())
                .summary(a.getSummary())
                .featuredImage(a.getFeaturedImage())
                .status(a.getStatus())
                .readingTime(a.getReadingTime())
                .createdDate(a.getCreatedDate())
                .updatedDate(a.getUpdatedDate())
                .categoryName(a.getCategory() != null ? a.getCategory().getName() : "Uncategorized")
                .authorName(a.getAuthor() != null ? a.getAuthor().getName() : "Anonymous")
                .likeCount(likes)
                .loveCount(loves)
                .commentCount(comments)
                .build();
    }
}
