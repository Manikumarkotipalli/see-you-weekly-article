package com.seeyou.api.repository;

import com.seeyou.api.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByArticleIdAndStatusOrderByCreatedDateDesc(Long articleId, String status);
    List<Comment> findByArticleIdOrderByCreatedDateDesc(Long articleId);
    List<Comment> findAllByOrderByCreatedDateDesc();
}
