package com.seeyou.api.repository;

import com.seeyou.api.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    long countByArticleIdAndReactionType(Long articleId, String reactionType);
    Optional<Reaction> findByArticleIdAndReactionTypeAndIpAddress(Long articleId, String reactionType, String ipAddress);
}
