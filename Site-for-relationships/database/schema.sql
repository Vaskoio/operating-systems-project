CREATE DATABASE IF NOT EXISTS crush_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crush_db;

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS Users (
  Id              CHAR(36)      NOT NULL PRIMARY KEY,
  Email           VARCHAR(255)  NOT NULL UNIQUE,
  PasswordHash    VARCHAR(255)  NOT NULL,
  Name            VARCHAR(100)  NOT NULL,
  Birthdate       DATE          NOT NULL,
  Gender          VARCHAR(20)   NOT NULL DEFAULT 'female',
  InterestedIn    VARCHAR(20)   NOT NULL DEFAULT 'male',
  Bio             VARCHAR(500)  NOT NULL DEFAULT '',
  City            VARCHAR(100)  NOT NULL DEFAULT '',
  MinAge          INT           NOT NULL DEFAULT 18,
  MaxAge          INT           NOT NULL DEFAULT 60,
  MaxDistanceKm   INT           NOT NULL DEFAULT 100,
  InterestsCsv    VARCHAR(500)  NOT NULL DEFAULT '',
  IsAdmin         TINYINT(1)    NOT NULL DEFAULT 0,
  CreatedAt       DATETIME      NOT NULL
);

-- ---------- photos ----------
CREATE TABLE IF NOT EXISTS Photos (
  Id         CHAR(36)     NOT NULL PRIMARY KEY,
  UserId     CHAR(36)     NOT NULL,
  Url        VARCHAR(1000) NOT NULL,
  Position   INT          NOT NULL DEFAULT 0,
  CreatedAt  DATETIME     NOT NULL,
  FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
CREATE INDEX IX_Photos_UserId ON Photos(UserId);

-- ---------- swipes ----------
CREATE TABLE IF NOT EXISTS Swipes (
  Id         CHAR(36)  NOT NULL PRIMARY KEY,
  SwiperId   CHAR(36)  NOT NULL,
  TargetId   CHAR(36)  NOT NULL,
  Liked      TINYINT(1) NOT NULL,
  CreatedAt  DATETIME  NOT NULL,
  UNIQUE KEY UX_Swipe (SwiperId, TargetId),
  FOREIGN KEY (SwiperId) REFERENCES Users(Id) ON DELETE CASCADE,
  FOREIGN KEY (TargetId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- ---------- matches ----------
CREATE TABLE IF NOT EXISTS Matches (
  Id         CHAR(36)  NOT NULL PRIMARY KEY,
  User1Id    CHAR(36)  NOT NULL,
  User2Id    CHAR(36)  NOT NULL,
  CreatedAt  DATETIME  NOT NULL,
  UNIQUE KEY UX_Match (User1Id, User2Id),
  FOREIGN KEY (User1Id) REFERENCES Users(Id) ON DELETE CASCADE,
  FOREIGN KEY (User2Id) REFERENCES Users(Id) ON DELETE CASCADE
);

-- ---------- messages ----------
CREATE TABLE IF NOT EXISTS Messages (
  Id         CHAR(36)      NOT NULL PRIMARY KEY,
  MatchId    CHAR(36)      NOT NULL,
  SenderId   CHAR(36)      NOT NULL,
  Body       VARCHAR(1000) NOT NULL,
  CreatedAt  DATETIME      NOT NULL,
  FOREIGN KEY (MatchId)  REFERENCES Matches(Id) ON DELETE CASCADE,
  FOREIGN KEY (SenderId) REFERENCES Users(Id)   ON DELETE CASCADE
);
CREATE INDEX IX_Messages_MatchId_CreatedAt ON Messages(MatchId, CreatedAt);
