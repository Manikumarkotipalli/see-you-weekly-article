package com.seeyou.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReactionRequest {
    @NotBlank(message = "Reaction type must be LIKE or LOVE")
    private String reactionType;
}
