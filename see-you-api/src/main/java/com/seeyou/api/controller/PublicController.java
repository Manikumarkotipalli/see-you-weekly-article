package com.seeyou.api.controller;

import com.seeyou.api.dto.*;
import com.seeyou.api.model.*;
import com.seeyou.api.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class PublicController {

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

    // 1. Author Metadata
    @GetMapping("/author")
    public ResponseEntity<Author> getAuthor() {
        List<Author> authors = authorRepository.findAll();
        if (authors.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(authors.get(0));
    }

    // 2. Categories
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    // 3. Articles (Paginated / Filtered / Searched)
    @GetMapping("/articles")
    public ResponseEntity<List<ArticleSummaryResponse>> getArticles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        List<Article> articles;
        if (search != null && !search.trim().isEmpty()) {
            articles = articleRepository.searchArticles("PUBLISHED", search);
        } else if (category != null && !category.trim().isEmpty()) {
            articles = articleRepository.findByStatusAndCategoryNameOrderByCreatedDateDesc("PUBLISHED", category);
        } else {
            articles = articleRepository.findByStatusOrderByCreatedDateDesc("PUBLISHED");
        }

        List<ArticleSummaryResponse> dtos = articles.stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // 4. Single Article Page
    @GetMapping("/articles/{slug}")
    public ResponseEntity<ArticleDetailResponse> getArticleBySlug(@PathVariable String slug) {
        Optional<Article> articleOpt = articleRepository.findBySlug(slug);
        if (articleOpt.isEmpty() || !articleOpt.get().getStatus().equals("PUBLISHED")) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapToDetail(articleOpt.get()));
    }

    // 5. Related Articles
    @GetMapping("/articles/{slug}/related")
    public ResponseEntity<List<ArticleSummaryResponse>> getRelatedArticles(@PathVariable String slug) {
        Optional<Article> articleOpt = articleRepository.findBySlug(slug);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Article current = articleOpt.get();
        String categoryName = current.getCategory() != null ? current.getCategory().getName() : "";
        List<Article> related = articleRepository.findTop3ByStatusAndCategoryNameAndIdNotOrderByCreatedDateDesc(
                "PUBLISHED", categoryName, current.getId());
        
        List<ArticleSummaryResponse> dtos = related.stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // 6. Submit Reaction (Like/Love)
    @PostMapping("/articles/{id}/react")
    public ResponseEntity<?> reactToArticle(
            @PathVariable Long id,
            @Valid @RequestBody ReactionRequest requestDto,
            HttpServletRequest request) {
        
        Optional<Article> articleOpt = articleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String ipAddress = request.getRemoteAddr();
        String type = requestDto.getReactionType().toUpperCase();

        if (!type.equals("LIKE") && !type.equals("LOVE")) {
            return ResponseEntity.badRequest().body("{\"error\": \"Reaction type must be LIKE or LOVE\"}");
        }

        // Check if this IP has already reacted to this article with this type
        Optional<Reaction> existing = reactionRepository.findByArticleIdAndReactionTypeAndIpAddress(id, type, ipAddress);

        if (existing.isPresent()) {
            // Toggle off (remove reaction) to prevent spamming while allowing undoing
            reactionRepository.delete(existing.get());
            return ResponseEntity.ok("{\"status\": \"REMOVED\"}");
        } else {
            Reaction reaction = Reaction.builder()
                    .article(articleOpt.get())
                    .reactionType(type)
                    .ipAddress(ipAddress)
                    .build();
            reactionRepository.save(reaction);
            return ResponseEntity.ok("{\"status\": \"ADDED\"}");
        }
    }

    // 7. Submit Comment
    @PostMapping("/articles/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest requestDto) {
        
        Optional<Article> articleOpt = articleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Comment comment = Comment.builder()
                .article(articleOpt.get())
                .username(requestDto.getUsername())
                .commentText(requestDto.getCommentText())
                .status("APPROVED") // Automatically approve comments initially, can override or change in properties
                .build();

        Comment saved = commentRepository.save(comment);
        CommentResponse response = CommentResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .commentText(saved.getCommentText())
                .status(saved.getStatus())
                .createdDate(saved.getCreatedDate())
                .build();
        
        return ResponseEntity.ok(response);
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

    // Helper: Map Entity to Detail DTO
    private ArticleDetailResponse mapToDetail(Article a) {
        long likes = reactionRepository.countByArticleIdAndReactionType(a.getId(), "LIKE");
        long loves = reactionRepository.countByArticleIdAndReactionType(a.getId(), "LOVE");
        List<CommentResponse> comments = commentRepository.findByArticleIdAndStatusOrderByCreatedDateDesc(a.getId(), "APPROVED")
                .stream()
                .map(c -> CommentResponse.builder()
                        .id(c.getId())
                        .username(c.getUsername())
                        .commentText(c.getCommentText())
                        .status(c.getStatus())
                        .createdDate(c.getCreatedDate())
                        .build())
                .collect(Collectors.toList());

        return ArticleDetailResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .slug(a.getSlug())
                .content(a.getContent())
                .summary(a.getSummary())
                .featuredImage(a.getFeaturedImage())
                .status(a.getStatus())
                .readingTime(a.getReadingTime())
                .createdDate(a.getCreatedDate())
                .updatedDate(a.getUpdatedDate())
                .category(a.getCategory())
                .author(a.getAuthor())
                .likeCount(likes)
                .loveCount(loves)
                .comments(comments)
                .build();
    }
}
