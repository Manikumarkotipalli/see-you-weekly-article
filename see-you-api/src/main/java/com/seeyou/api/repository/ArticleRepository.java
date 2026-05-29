package com.seeyou.api.repository;

import com.seeyou.api.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    Optional<Article> findBySlug(String slug);
    List<Article> findByStatusOrderByCreatedDateDesc(String status);
    List<Article> findByStatusAndCategoryNameOrderByCreatedDateDesc(String status, String categoryName);
    List<Article> findAllByOrderByCreatedDateDesc();
    
    @Query("SELECT a FROM Article a WHERE a.status = :status AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.summary) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY a.createdDate DESC")
    List<Article> searchArticles(@Param("status") String status, @Param("query") String query);

    List<Article> findTop3ByStatusAndCategoryNameAndIdNotOrderByCreatedDateDesc(String status, String categoryName, Long id);
}
