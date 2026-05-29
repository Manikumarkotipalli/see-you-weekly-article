package com.seeyou.api.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ArticleSummaryResponse {
    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String featuredImage;
    private String status;
    private Integer readingTime;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String categoryName;
    private String authorName;
    private long likeCount;
    private long loveCount;
    private long commentCount;
}
