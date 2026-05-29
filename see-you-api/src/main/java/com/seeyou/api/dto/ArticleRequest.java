package com.seeyou.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ArticleRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String slug;

    @NotBlank(message = "Content is required")
    private String content;

    private String summary;
    private String featuredImage;

    @NotBlank(message = "Status must be DRAFT or PUBLISHED")
    private String status;

    private Integer readingTime;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
