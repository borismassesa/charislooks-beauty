-- Create admin user if not exists
INSERT INTO admin_users (username, email, password)
SELECT 'admin', 'admin@charislooks.com', '$2a$10$YourHashedPasswordHere'
WHERE NOT EXISTS (
    SELECT 1 FROM admin_users WHERE username = 'admin'
);

