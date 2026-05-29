package com.seeyou.api.dto;

import com.seeyou.api.model.Author;
import com.seeyou.api.model.Category;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ArticleDetailResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String summary;
    private String featuredImage;
    private String status;
    private Integer readingTime;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private Category category;
    private Author author;
    private long likeCount;
    private long loveCount;
    private List<CommentResponse> comments;
}
