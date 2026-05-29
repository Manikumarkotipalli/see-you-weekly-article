package com.seeyou.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Comment text is required")
    private String commentText;
}
