USE crush_db;

DELETE FROM Users WHERE Email LIKE '%@crush.app';

SET @pwd   := '$2b$10$KQ71N6yUgurJxhx/TtYx6.JIM1/TM5g04MmkBVR441Q6K/GPvFUBm'; 
SET @apwd  := '$2b$10$c10fWHQzBfBjt2p9I3vbmu4KcvRUC1Z0cFVu1L0CvZyWhdUDDxPCS'; 
SET @now   := UTC_TIMESTAMP();

INSERT INTO Users (Id, Email, PasswordHash, Name, Birthdate, Gender, InterestedIn, Bio, City, InterestsCsv, IsAdmin, CreatedAt) VALUES
('00000000-0000-0000-0000-0000000000ad', 'admin@crush.app', @apwd, 'Admin', '1990-01-01', 'nonbinary', 'everyone', 'Platform administrator.', '', '', 1, @now);

INSERT INTO Users (Id, Email, PasswordHash, Name, Birthdate, Gender, InterestedIn, Bio, City, InterestsCsv, CreatedAt) VALUES
('11111111-1111-1111-1111-111111111111', 'ivan@crush.app',    @pwd, 'Ivan',    '1996-04-12', 'male',   'female', 'Инженер в София. Обичам планините, кафето и тихите вечери.',       'София',            'Планини,Кафе,Фотография',  @now),
('22222222-2222-2222-2222-222222222222', 'georgi@crush.app',  @pwd, 'Георги',  '1998-09-03', 'male',   'female', 'Китарист в любителска банда. Плевен → Пловдив.',                    'Пловдив',          'Музика,Винил,Кафе',        @now),
('33333333-3333-3333-3333-333333333333', 'nikolay@crush.app', @pwd, 'Николай', '1994-02-28', 'male',   'female', 'Готвач в ресторант във Варна. Ако обичаш мусака — намерили сме се.', 'Варна',            'Готвене,Риболов,Море',     @now),
('44444444-4444-4444-4444-444444444444', 'dimitar@crush.app', @pwd, 'Димитър', '1997-07-17', 'male',   'female', 'Програмист по професия, катерач по душа. Витоша е моят офис.',       'София',            'Катерене,Код,Бира',        @now),
('55555555-5555-5555-5555-555555555555', 'martin@crush.app',  @pwd, 'Мартин',  '1999-11-22', 'male',   'female', 'Студент по архитектура в Бургас. Обичам старите къщи и морето.',      'Бургас',           'Архитектура,Сърф,Книги',   @now);

INSERT INTO Users (Id, Email, PasswordHash, Name, Birthdate, Gender, InterestedIn, Bio, City, InterestsCsv, CreatedAt) VALUES
('66666666-6666-6666-6666-666666666666', 'maria@crush.app',    @pwd, 'Мария',     '2000-03-21', 'female', 'male', 'Художничка и мечтателка. Любимо кино — БНТ в неделя вечер.',        'София',            'Изкуство,Кино,Йога',          @now),
('77777777-7777-7777-7777-777777777777', 'elena@crush.app',    @pwd, 'Елена',     '1998-11-04', 'female', 'male', 'Маратонка, вино в петък, лоши шеги винаги. Пловдив forever.',       'Пловдив',          'Бягане,Вино,Пътешествия',     @now),
('88888888-8888-8888-8888-888888888888', 'desi@crush.app',     @pwd, 'Десислава', '2001-09-30', 'female', 'male', 'Стайни растения, книги и саркастични коментари 24/7.',              'Варна',            'Растения,Книги,Пилатес',      @now),
('99999999-9999-9999-9999-999999999999', 'viktoria@crush.app', @pwd, 'Виктория',  '1997-06-14', 'female', 'male', 'Фотограф на сватби из цяла България. Обичам изгреви и кучета.',      'Велико Търново',   'Фотография,Кучета,Пътувания', @now),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'kalina@crush.app',   @pwd, 'Калина',    '1999-01-08', 'female', 'male', 'Лекар специализант в Русе. Дунав, велосипед, филми на Тарковски.',   'Русе',             'Велосипед,Филми,Кафе',        @now);

INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) VALUES
(UUID(), '11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1585917176080-1841987bf1fe?crop=entropy&cs=srgb&fm=jpg&q=85', 0, @now),
(UUID(), '22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1629001528534-e8a48b636ded?crop=entropy&cs=srgb&fm=jpg&q=85', 0, @now),
(UUID(), '33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1624303966826-260632059640?crop=entropy&cs=srgb&fm=jpg&q=85', 0, @now),
(UUID(), '44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?crop=entropy&cs=srgb&fm=jpg&q=85', 0, @now),
(UUID(), '55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?crop=entropy&cs=srgb&fm=jpg&q=85', 0, @now),
(UUID(), '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1758521540646-abb9612038fb?crop=entropy&cs=srgb&fm=jpg&q=85', 0, @now),
(UUID(), '77777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1753161023962-665967602405?crop=entropy&cs=srgb&fm=jpg&q=85', 0, @now),
(UUID(), '88888888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1609840114117-9aa293a418ae?crop=entropy&cs=srgb&fm=jpg&q=85', 0, @now),
(UUID(), '99999999-9999-9999-9999-999999999999', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=srgb&fm=jpg&q=85', 0, @now),
(UUID(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1619895862022-09114b41f16f?crop=entropy&cs=srgb&fm=jpg&q=85', 0, @now);

INSERT INTO Users (Id, Email, PasswordHash, Name, Gender, BirthDate, InterestedIn, CreatedAt) VALUES 
(UUID(), 'art.elena@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Елена', 'female', '1996-03-12', 'male', NOW()),
(UUID(), 'peak.geri@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Гергана', 'female', '1994-07-24', 'everyone', NOW()),
(UUID(), 'code.maria@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Мария', 'female', '1998-11-05', 'male', NOW()),
(UUID(), 'zen.simona@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Симона', 'female', '1993-02-18', 'female', NOW()),
(UUID(), 'dogmom.radost@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Радост', 'female', '1997-09-30', 'male', NOW()),
(UUID(), 'chef.viki@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Виктория', 'female', '1995-12-14', 'everyone', NOW()),
(UUID(), 'lens.kate@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Катерина', 'female', '1992-06-08', 'male', NOW()),
(UUID(), 'books.silvia@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Силвия', 'female', '1999-04-22', 'female', NOW()),
(UUID(), 'nomad.desi@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Десислава', 'female', '1991-08-17', 'everyone', NOW()),
(UUID(), 'fit.teodora@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Теодора', 'female', '1996-10-03', 'male', NOW()),
(UUID(), 'strings.mihaela@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Михаела', 'female', '1998-01-27', 'everyone', NOW()),
(UUID(), 'gg.bobi@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Борислава', 'female', '2000-05-19', 'male', NOW()),
(UUID(), 'botanical.raya@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Рая', 'female', '1995-03-04', 'female', NOW()),
(UUID(), 'moto.krisi@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Кристина', 'female', '1993-11-29', 'everyone', NOW()),
(UUID(), 'wine.irina@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Ирина', 'female', '1990-09-11', 'male', NOW()),
(UUID(), 'stars.gabi@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Габриела', 'female', '1997-07-07', 'female', NOW()),
(UUID(), 'ocean.yoana@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Йоана', 'female', '1998-08-25', 'everyone', NOW()),
(UUID(), 'ink.margo@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Маргарита', 'female', '1994-12-02', 'male', NOW()),
(UUID(), 'retro.nadia@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Надежда', 'female', '1992-10-15', 'everyone', NOW()),
(UUID(), 'med.zhasmina@example.bg', '$2y$10$PlaceholderHashForPassword123PleaseReplaceThisHashNoww', 'Жасмина', 'female', '1999-02-28', 'male', NOW());

UPDATE Users SET City = 'София', Bio = 'Рисувам портрети и пия твърде много кафе. Търся някой за разходки по изложби.' WHERE Email = 'art.elena@example.bg';
UPDATE Users SET City = 'Пловдив', Bio = 'Всяка събота съм на различна планина. Ако не можеш да носиш раница, плъзни наляво.' WHERE Email = 'peak.geri@example.bg';
UPDATE Users SET City = 'Варна', Bio = 'Пиша код през деня, играя бордови игри през нощта. Търся моя Player 2.' WHERE Email = 'code.maria@example.bg';
UPDATE Users SET City = 'Бургас', Bio = 'Йога инструктор с афинитет към хубавото вино. Балансът е всичко!' WHERE Email = 'zen.simona@example.bg';
UPDATE Users SET City = 'София', Bio = 'Ако кучето ми не те хареса, нямаме шанс. Търся компания за дълги разходки в парка.' WHERE Email = 'dogmom.radost@example.bg';
UPDATE Users SET City = 'Пловдив', Bio = 'Мога да сготвя 3-степенно меню от нищото. Търся някой, който да мие чиниите.' WHERE Email = 'chef.viki@example.bg';
UPDATE Users SET City = 'Варна', Bio = 'Снимам света през аналогов обектив. Обичам спонтанните пътувания.' WHERE Email = 'lens.kate@example.bg';
UPDATE Users SET City = 'Русе', Bio = 'Имам повече непрочетени книги, отколкото свободно време. Фантастика и чай.' WHERE Email = 'books.silvia@example.bg';
UPDATE Users SET City = 'София', Bio = 'Живея от куфар. Днес тук, утре някъде в Азия. Търся спътник за приключения.' WHERE Email = 'nomad.desi@example.bg';
UPDATE Users SET City = 'Стара Загора', Bio = 'Фитнесът е вторият ми дом. Търся някой, който да ме мотивира (и да яде пица с мен в неделя).' WHERE Email = 'fit.teodora@example.bg';
UPDATE Users SET City = 'София', Bio = 'Свиря на бас китара в инди банда. Музиката е моят език.' WHERE Email = 'strings.mihaela@example.bg';
UPDATE Users SET City = 'Пловдив', Bio = 'PC геймър, обичам RPG-та и фентъзи. Нека направим дуо в реалния живот.' WHERE Email = 'gg.bobi@example.bg';
UPDATE Users SET City = 'Бургас', Bio = 'Апартаментът ми прилича на джунгла от стайни растения. Обичам спокойните вечери.' WHERE Email = 'botanical.raya@example.bg';
UPDATE Users SET City = 'София', Bio = 'Карам мотор и слушам рок. Не си търся "принц на бял кон", а мъж на черен мотор.' WHERE Email = 'moto.krisi@example.bg';
UPDATE Users SET City = 'Пловдив', Bio = 'Сомелиер по душа. Търся човек за дегустации и дълги разговори до сутринта.' WHERE Email = 'wine.irina@example.bg';
UPDATE Users SET City = 'Варна', Bio = 'Зодия Рак с асцендент Скорпион. Ако не вярваш в астрология, поне бъди забавен.' WHERE Email = 'stars.gabi@example.bg';
UPDATE Users SET City = 'Бургас', Bio = 'Лятото съм на караваната, зимата мечтая за морето. Търся слънчев човек.' WHERE Email = 'ocean.yoana@example.bg';
UPDATE Users SET City = 'София', Bio = 'Татуист с цветна коса и още по-цветен характер. Търся муза.' WHERE Email = 'ink.margo@example.bg';
UPDATE Users SET City = 'Велико Търново', Bio = 'Обожавам винтидж модата и старите филми. Романтик по душа.' WHERE Email = 'retro.nadia@example.bg';
UPDATE Users SET City = 'Плевен', Bio = 'Студент по медицина. Имам време само за 1 среща седмично, така че нека си заслужава!' WHERE Email = 'med.zhasmina@example.bg';

INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/1.jpg', 0, NOW() FROM Users WHERE Email = 'art.elena@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/2.jpg', 0, NOW() FROM Users WHERE Email = 'peak.geri@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/3.jpg', 0, NOW() FROM Users WHERE Email = 'code.maria@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/4.jpg', 0, NOW() FROM Users WHERE Email = 'zen.simona@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/5.jpg', 0, NOW() FROM Users WHERE Email = 'dogmom.radost@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/6.jpg', 0, NOW() FROM Users WHERE Email = 'chef.viki@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/7.jpg', 0, NOW() FROM Users WHERE Email = 'lens.kate@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/8.jpg', 0, NOW() FROM Users WHERE Email = 'books.silvia@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/9.jpg', 0, NOW() FROM Users WHERE Email = 'nomad.desi@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/10.jpg', 0, NOW() FROM Users WHERE Email = 'fit.teodora@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/11.jpg', 0, NOW() FROM Users WHERE Email = 'strings.mihaela@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/12.jpg', 0, NOW() FROM Users WHERE Email = 'gg.bobi@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/13.jpg', 0, NOW() FROM Users WHERE Email = 'botanical.raya@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/14.jpg', 0, NOW() FROM Users WHERE Email = 'moto.krisi@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/15.jpg', 0, NOW() FROM Users WHERE Email = 'wine.irina@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/16.jpg', 0, NOW() FROM Users WHERE Email = 'stars.gabi@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/17.jpg', 0, NOW() FROM Users WHERE Email = 'ocean.yoana@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/18.jpg', 0, NOW() FROM Users WHERE Email = 'ink.margo@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/19.jpg', 0, NOW() FROM Users WHERE Email = 'retro.nadia@example.bg';
INSERT INTO Photos (Id, UserId, Url, Position, CreatedAt) SELECT UUID(), Id, 'https://randomuser.me/api/portraits/women/20.jpg', 0, NOW() FROM Users WHERE Email = 'med.zhasmina@example.bg';
