#CREATE database surf;
CREATE TABLE surf.users (id INT NOT NULL AUTO_INCREMENT KEY, username VARCHAR(25), password VARCHAR(50), ban_date timestamp, email_address VARCHAR(25), administrator INT, upvotes INT, downvotes INT);

CREATE TABLE surf.tokens (id INT NOT NULL AUTO_INCREMENT KEY, user_id INT NOT NULL, token VARCHAR(50), expire_time timestamp);