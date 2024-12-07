
-- CREATE TABLE users (
--     user_id TEXT PRIMARY KEY,
--     username TEXT UNIQUE NOT NULL,
--     email TEXT UNIQUE NOT NULL,
--     password TEXT NOT NULL,
--     created_at TEXT DEFAULT CURRENT_TIMESTAMP,
--     updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
--     is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)), -- For soft deletion or deactivation of accounts
--     role TEXT DEFAULT 'USER' CHECK(role IN ('USER', 'ADMIN')) -- Role-based access control
-- );



-- CREATE TABLE todos (
--     id TEXT PRIMARY KEY,
--     title TEXT NOT NULL,
--     description TEXT,
--     status TEXT DEFAULT 'TODO' CHECK(status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
--     priority TEXT DEFAULT 'LOW' CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
--     created_at TEXT DEFAULT CURRENT_TIMESTAMP,
--     updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
--     is_deleted INTEGER DEFAULT 0 CHECK(is_deleted IN (0, 1)), -- Enhanced boolean usage
--     user_id TEXT NOT NULL, -- Foreign key for associating todos with users
--     FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
-- );





-- select * from users;
