-- Sample data. Dates are relative to the day you run setup, so the demo always looks current.
-- The Admin account (id 1) is created by scripts/setup.js from backend/.env. Players use password Player@123.

INSERT INTO users (id,name,email,password_hash,role) VALUES
(2,'Tashi Dorji','tashi@example.com','x','player'),(3,'Karma Wangchuk','karma@example.com','x','player'),
(4,'Sonam Tshering','sonam@example.com','x','player'),(5,'Pema Lhamo','pema@example.com','x','player'),
(6,'Dechen Choden','dechen@example.com','x','player'),(7,'Jigme Namgyel','jigme@example.com','x','player'),
(8,'Ugyen Dema','ugyen@example.com','x','player'),(9,'Tenzin Norbu','tenzin@example.com','x','player'),
(10,'Choki Zangmo','choki@example.com','x','player'),(11,'Dorji Penjor','dorji@example.com','x','player'),
(12,'Namgay Wangmo','namgay@example.com','x','player'),(13,'Yangzom Pelden','yangzom@example.com','x','player');

INSERT INTO players (id,user_id,dzongkhag,contact_no) VALUES
(1,2,'Thimphu','17100001'),
(2,3,'Thimphu','17100002'),
(3,4,'Paro','17100003'),
(4,5,'Paro','17100004'),
(5,6,'Chukha','17100005'),
(6,7,'Chukha','17100006'),
(7,8,'Bumthang','17100007'),
(8,9,'Bumthang','17100008'),
(9,10,'Wangdue Phodrang','17100009'),
(10,11,'Wangdue Phodrang','17100010'),
(11,12,'Samdrup Jongkhar','17100011'),
(12,13,'Samdrup Jongkhar','17100012');

INSERT INTO games (id,name,category,description) VALUES
(1,'PUBG Mobile','battle-royale','Squad-based battle royale played on mobile devices.'),
(2,'Mobile Legends: Bang Bang','moba','5v5 mobile MOBA with fast, team-based matches.'),
(3,'Valorant','shooter','5v5 tactical shooter with unique agent abilities.'),
(4,'Free Fire','battle-royale','Quick 10-minute battle royale for mobile players.'),
(5,'eFootball','sports','Football simulation played in head-to-head matches.');

INSERT INTO teams (id,name,region,coach_name,captain_id,logo_url) VALUES
(1,'Druk Dragons','Thimphu','Coach Lhendup',1,'/uploads/seed/team-1.svg'),
(2,'Thunder Strikers','Paro','Coach Rinchen',3,'/uploads/seed/team-2.svg'),
(3,'Himalayan Wolves','Chukha','Coach Sangay',5,'/uploads/seed/team-3.svg'),
(4,'Snow Leopards','Bumthang','Coach Tshewang',7,'/uploads/seed/team-4.svg'),
(5,'Black Neck Gaming','Wangdue Phodrang','Coach Dawa',9,'/uploads/seed/team-5.svg'),
(6,'Eastern Tigers','Samdrup Jongkhar','Coach Phub',11,'/uploads/seed/team-6.svg');

INSERT INTO team_members (team_id,player_id,status) VALUES
(1,1,'approved'),(1,2,'approved'),(2,3,'approved'),(2,4,'approved'),(3,5,'approved'),(3,6,'approved'),
(4,7,'approved'),(4,8,'approved'),(5,9,'approved'),(5,10,'approved'),(6,11,'approved'),(1,12,'pending');

INSERT INTO tournaments (id,title,game_id,description,location,prize_pool,registration_deadline,start_date,end_date,status) VALUES
(1,'Bhutan National E-Sport Championship 2026',2,'The biggest Mobile Legends championship, with the best teams from across the Dzongkhags competing for the national title.','Thimphu',100000,DATE_ADD(CURDATE(), INTERVAL 40 DAY),DATE_ADD(CURDATE(), INTERVAL 45 DAY),DATE_ADD(CURDATE(), INTERVAL 50 DAY),'upcoming'),
(2,'JNEC Inter-Class Cup',1,'Inter-class PUBG Mobile tournament held at the college campus.','Dewathang',25000,DATE_ADD(CURDATE(), INTERVAL -70 DAY),DATE_ADD(CURDATE(), INTERVAL -65 DAY),DATE_ADD(CURDATE(), INTERVAL -60 DAY),'completed'),
(3,'RUB College Showdown',3,'Valorant showdown between Royal University of Bhutan colleges.','Kanglung',50000,DATE_ADD(CURDATE(), INTERVAL -12 DAY),DATE_ADD(CURDATE(), INTERVAL -9 DAY),DATE_ADD(CURDATE(), INTERVAL 11 DAY),'ongoing'),
(4,'Dzongkhag League Season 2',4,'Free Fire league between Dzongkhag teams across the country.','Phuntsholing',40000,DATE_ADD(CURDATE(), INTERVAL 25 DAY),DATE_ADD(CURDATE(), INTERVAL 30 DAY),DATE_ADD(CURDATE(), INTERVAL 45 DAY),'upcoming'),
(5,'Winter eFootball Cup',5,'A one-weekend eFootball cup open to all registered players.','Thimphu',15000,DATE_ADD(CURDATE(), INTERVAL 10 DAY),DATE_ADD(CURDATE(), INTERVAL 14 DAY),DATE_ADD(CURDATE(), INTERVAL 16 DAY),'upcoming');

INSERT INTO registrations (tournament_id,player_id,team_id,status) VALUES
(1,1,1,'approved'),(1,3,2,'approved'),(1,5,3,'pending'),(1,7,4,'approved'),(1,9,5,'pending'),
(4,2,1,'approved'),(4,6,3,'pending'),(5,12,NULL,'pending'),(3,1,1,'approved'),(2,1,1,'approved');

INSERT INTO matches (id,tournament_id,team1_id,team2_id,stage,match_date) VALUES
(1,2,1,2,'Group Stage',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL -65 DAY), '15:00:00')),(2,2,3,4,'Group Stage',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL -64 DAY), '15:00:00')),
(3,2,5,6,'Group Stage',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL -63 DAY), '15:00:00')),(4,2,1,4,'Semi-final',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL -62 DAY), '14:00:00')),
(5,2,5,2,'Semi-final',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL -62 DAY), '16:00:00')),(6,2,4,5,'Final',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL -60 DAY), '17:00:00')),
(7,3,1,3,'Group Stage',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL -8 DAY), '16:00:00')),(8,3,2,6,'Group Stage',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL -6 DAY), '16:00:00')),
(9,3,4,5,'Group Stage',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL -2 DAY), '17:00:00')),(10,3,1,2,'Group Stage',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00')),
(11,3,3,6,'Group Stage',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '16:00:00')),(12,3,4,1,'Group Stage',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '17:30:00')),
(13,3,5,3,'Group Stage',TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 8 DAY), '15:00:00'));

-- LIVE GAMES sample data: two matches that are being played right now (no result row, is_live = 1).
-- stream_url is left empty on purpose; add a YouTube/Twitch link from Admin > Matches > Edit to embed a real stream.
INSERT INTO matches (id,tournament_id,team1_id,team2_id,stage,match_date,is_live,live_score1,live_score2) VALUES
(14,3,2,4,'Group Stage',DATE_SUB(NOW(), INTERVAL 25 MINUTE),1,1,0),
(15,3,6,1,'Group Stage',DATE_SUB(NOW(), INTERVAL 12 MINUTE),1,0,2);

INSERT INTO results (match_id,score1,score2,winner_id) VALUES
(1,2,1,1),(2,0,2,4),(3,2,0,5),(4,1,2,4),(5,2,0,5),(6,1,2,5),(7,2,0,1),(8,2,1,2),(9,1,2,5);

-- sample notifications so both dashboards show something on the first login
INSERT INTO notifications (user_id,type,title,message,link,is_read,created_at) VALUES
(1,'registration','New tournament registration','Yangzom Pelden registered for Winter eFootball Cup and is waiting for approval.','/admin/registrations',0,DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(1,'team','Team join request','Yangzom Pelden asked to join Druk Dragons.','/admin/teams',0,DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1,'result','Result published','Black Neck Gaming won against Snow Leopards in RUB College Showdown.','/admin/matches',1,DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2,'team','New join request','Yangzom Pelden wants to join Druk Dragons.','/player/team',0,DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2,'tournament','New tournament','Winter eFootball Cup has been announced. Registration is open.','/player/tournaments',0,DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2,'match','Match scheduled','Druk Dragons vs Thunder Strikers is scheduled for tomorrow at 18:00.','/player/matches',1,DATE_SUB(NOW(), INTERVAL 1 DAY)),
(13,'registration','Registration submitted','Your registration for Winter eFootball Cup is waiting for admin approval.','/player/registrations',0,DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(13,'team','Join request sent','Your request to join Druk Dragons is waiting for the captain.','/player/team',1,DATE_SUB(NOW(), INTERVAL 1 HOUR));
