-- Check if database exists, create if not
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'weekly_article_db')
BEGIN
    CREATE DATABASE weekly_article_db;
END
GO

USE weekly_article_db;
GO

-- Create Login and User if they don't exist
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'weekly_article_user')
BEGIN
    CREATE LOGIN weekly_article_user WITH PASSWORD = 'SecurePass123!', DEFAULT_DATABASE = weekly_article_db, CHECK_POLICY = OFF;
END
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'weekly_article_user')
BEGIN
    CREATE USER weekly_article_user FOR LOGIN weekly_article_user;
    ALTER ROLE db_owner ADD MEMBER weekly_article_user;
END
GO

-- Drop tables if they exist (in reverse order of dependencies)
IF OBJECT_ID('reactions', 'U') IS NOT NULL DROP TABLE reactions;
IF OBJECT_ID('comments', 'U') IS NOT NULL DROP TABLE comments;
IF OBJECT_ID('articles', 'U') IS NOT NULL DROP TABLE articles;
IF OBJECT_ID('categories', 'U') IS NOT NULL DROP TABLE categories;
IF OBJECT_ID('authors', 'U') IS NOT NULL DROP TABLE authors;
GO

-- Create Tables
CREATE TABLE authors (
    author_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    bio NVARCHAR(MAX) NULL,
    profile_image VARCHAR(255) NULL,
    github_link VARCHAR(255) NULL,
    linkedin_link VARCHAR(255) NULL,
    twitter_link VARCHAR(255) NULL,
    portfolio_link VARCHAR(255) NULL
);

CREATE TABLE categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE articles (
    article_id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content NVARCHAR(MAX) NOT NULL,
    summary NVARCHAR(500) NULL,
    featured_image VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'PUBLISHED'
    reading_time INT NOT NULL DEFAULT 1,
    created_date DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_date DATETIME2 NOT NULL DEFAULT GETDATE(),
    category_id INT FOREIGN KEY REFERENCES categories(category_id),
    author_id INT FOREIGN KEY REFERENCES authors(author_id)
);

CREATE TABLE comments (
    comment_id INT IDENTITY(1,1) PRIMARY KEY,
    article_id INT FOREIGN KEY REFERENCES articles(article_id) ON DELETE CASCADE,
    username NVARCHAR(100) NOT NULL,
    comment_text NVARCHAR(MAX) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'APPROVED', -- 'PENDING', 'APPROVED', 'SPAM'
    created_date DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE reactions (
    reaction_id INT IDENTITY(1,1) PRIMARY KEY,
    article_id INT FOREIGN KEY REFERENCES articles(article_id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL, -- 'LIKE', 'LOVE'
    ip_address VARCHAR(45) NOT NULL,
    created_date DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Seed Data
INSERT INTO authors (name, bio, profile_image, github_link, linkedin_link, twitter_link, portfolio_link)
VALUES (
    N'Manikumar Kotipalli',
    N'Data Engineer and Full Stack Developer passionate about scalable architectures, real-time data pipelines, and writing about software engineering.',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    'https://github.com',
    'https://linkedin.com',
    'https://twitter.com',
    'https://portfolio.com'
);

INSERT INTO categories (category_name) VALUES 
(N'Technology'),
(N'Data Engineering'),
(N'Personal Thoughts'),
(N'Tutorials'),
(N'Weekly Notes');

DECLARE @AuthorId INT = 1;
DECLARE @TechCatId INT, @DataCatId INT, @ThoughtCatId INT;

SELECT @TechCatId = category_id FROM categories WHERE category_name = N'Technology';
SELECT @DataCatId = category_id FROM categories WHERE category_name = N'Data Engineering';
SELECT @ThoughtCatId = category_id FROM categories WHERE category_name = N'Personal Thoughts';

-- Insert Sample Articles
INSERT INTO articles (title, slug, content, summary, featured_image, status, reading_time, category_id, author_id, created_date, updated_date)
VALUES 
(
    N'Building Scalable Web Architectures in 2026',
    'building-scalable-web-architectures-in-2026',
    N'### Introduction

Designing web architectures that scale seamlessly to support millions of concurrent users requires a deep understanding of bottlenecks, caching, state management, and database replication. In this article, we explore modern best practices including edge computing, distributed caching, and micro-frontends.

### Key Architectural Pillars

1. **Edge Computing**: Push computing logic as close to the user as possible. Frameworks like Next.js utilize Edge Middleware to run redirects, authentication checks, and geo-specific logic with single-digit millisecond latency.
2. **Distributed Caching**: Redis cluster configuration ensures highly available session state and rapid data retrieval, shielding primary databases from read spikes.
3. **Database Scaling**: Implement read-replicas and connection pooling. Mixed SQL Server configurations can handle high write loads when read-only analytical workloads are routed to read-replicas.

### Conclusion

Scalability is not a one-time setup but a continuous refinement process. Start minimal, locate your bottlenecks, and scale modularly.',
    N'An in-depth look at designing modern web systems that handle millions of users, focusing on caching, database replication, and edge runtime optimizations.',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    'PUBLISHED',
    6,
    @TechCatId,
    @AuthorId,
    DATEADD(day, -10, GETDATE()),
    DATEADD(day, -10, GETDATE())
),
(
    N'Designing Real-Time Data Pipelines with Apache Kafka',
    'designing-real-time-data-pipelines-with-apache-kafka',
    N'### Introduction

In modern data engineering, batch processing is no longer sufficient for real-time analytics. Organizations need event streaming platforms that can process high-throughput data streams with sub-second latency. Apache Kafka is the gold standard for this task.

### Core Kafka Concepts

- **Topics**: Categories or feed names to which records are published.
- **Producers**: Publish data to topics.
- **Consumers**: Subscribe to and process records from topics.
- **Partitions**: Topics are divided into partitions, enabling parallel consumer processing.

```
+-----------+     +------------+     +------------+
| Producers | --> | Kafka Topic | --> | Consumers  |
+-----------+     +------------+     +------------+
                        |
                        +---> Partitions [0, 1, 2]
```

### Implementing Best Practices

To avoid message loss, set `acks=all` on producers. For high throughput, use batching configuration (`linger.ms=20`). Ensure your consumers are partitioned and grouped properly to maximize parallel processing without bottlenecks.',
    N'A comprehensive guide for data engineers on building reliable, high-throughput, and low-latency real-time streaming pipelines using Apache Kafka.',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    'PUBLISHED',
    8,
    @DataCatId,
    @AuthorId,
    DATEADD(day, -3, GETDATE()),
    DATEADD(day, -3, GETDATE())
),
(
    N'The Art of Weekly Writing: Lessons Learned',
    'the-art-of-weekly-writing-lessons-learned',
    N'### Why Write Weekly?

Commiting to publishing a weekly article is both rewarding and challenging. Over the past few months, I have found that it clarifies my thoughts, builds a consistent learning habit, and creates a repository of knowledge that others can benefit from.

### Key Takeaways

1. **Ideation is Continuous**: Keep a notebook of ideas. Never sit down to write without a pre-decided topic.
2. **Done is Better than Perfect**: Perfection is the enemy of consistency. Deliver value, check your facts, and publish.
3. **Engage with Feedback**: Comments and reactions are valuable signals to what content resonates most with your audience.

I encourage everyone in tech to write. It forces you to understand topics at a deeper level.',
    N'My journey of writing one article every week: the productivity habits, the technical benefits, and how to overcome writer block.',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
    'PUBLISHED',
    4,
    @ThoughtCatId,
    @AuthorId,
    DATEADD(day, -1, GETDATE()),
    DATEADD(day, -1, GETDATE())
);

-- Insert Sample Comments
DECLARE @Article1Id INT, @Article2Id INT;
SELECT @Article1Id = article_id FROM articles WHERE slug = 'building-scalable-web-architectures-in-2026';
SELECT @Article2Id = article_id FROM articles WHERE slug = 'designing-real-time-data-pipelines-with-apache-kafka';

INSERT INTO comments (article_id, username, comment_text, status, created_date) VALUES
(@Article1Id, N'Sarah Connor', N'This is a fantastic summary! I am currently working on scaling our Redis cache and the point on edge middleware checks really resonates.', 'APPROVED', DATEADD(day, -9, GETDATE())),
(@Article1Id, N'John Doe', N'How do you manage schema migrations when handling read-replicas in SQL Server?', 'APPROVED', DATEADD(day, -8, GETDATE())),
(@Article2Id, N'Alice Smith', N'Excellent write up on Kafka! Setting acks=all has saved us from data loss in several critical scenarios.', 'APPROVED', DATEADD(day, -2, GETDATE()));

-- Insert Sample Reactions
INSERT INTO reactions (article_id, reaction_type, ip_address, created_date) VALUES
(@Article1Id, 'LIKE', '127.0.0.1', GETDATE()),
(@Article1Id, 'LOVE', '127.0.0.1', GETDATE()),
(@Article1Id, 'LIKE', '192.168.1.1', GETDATE()),
(@Article2Id, 'LIKE', '127.0.0.1', GETDATE());
GO
