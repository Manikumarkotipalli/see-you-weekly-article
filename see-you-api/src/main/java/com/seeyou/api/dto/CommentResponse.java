package com.seeyou.api.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {
    private Long id;
    private String username;
    private String commentText;
    private String status;
    private LocalDateTime createdDate;
}
