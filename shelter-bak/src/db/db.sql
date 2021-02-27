--stored documents, images, etc.
CREATE TABLE IF NOT EXISTS public.storage_lob
(
	id VARCHAR (16) NOT NULL PRIMARY KEY,
    original_name varchar(256),
    encoding VARCHAR (64),
    mimetype VARCHAR (256),
    size INTEGER,
    created timestamptz default now(),
    comment varchar(512)
);
CREATE TABLE IF NOT EXISTS public.shelter_lang
(
    lang VARCHAR(6) NOT NULL PRIMARY KEY,
    display_name VARCHAR(16) NOT NULL,
    rate INTEGER
);
INSERT INTO public.shelter_lang (lang, display_name, rate)
SELECT 'en' as lang, 'English' as display_name, 0 as rate
WHERE not exists( select * from public.shelter_lang where lang = 'en');

INSERT INTO public.shelter_lang (lang, display_name, rate)
SELECT 'uk' as lang, 'Ukrainian' as display_name, 1 as rate
WHERE not exists( select * from public.shelter_lang where lang = 'uk');

INSERT INTO public.shelter_lang (lang, display_name, rate)
SELECT 'ru' as lang, 'Russian' as display_name, 2 as rate
WHERE not exists( select * from public.shelter_lang where lang = 'ru');

-- we support only two-level menu
CREATE TABLE IF NOT EXISTS public.menu
(
    id VARCHAR(16) PRIMARY KEY,
    position integer default 0,
    parent_id VARCHAR(16), -- null for top menu
    component VARCHAR(32),
    role VARCHAR(64),
    url varchar(1024)
);
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'about', 0, null, 'MenuPage', 'public', '/about'
where not exists(select * from menu where id = 'about');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'history', 0, 'about', 'MenuPage', 'public', '/about/history'
where not exists(select * from menu where id = 'history');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'activity', 1, 'about', 'MenuPage', 'public', '/about/activity'
where not exists(select * from menu where id = 'activity');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'team', 2, 'about', 'MenuPage', 'public', '/about/team'
where not exists(select * from menu where id = 'team');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'shelter', 3, 'about', 'MenuPage', 'public', '/about/shelter'
where not exists(select * from menu where id = 'shelter');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'partners', 4, 'about', 'MenuPage', 'public', '/about/partners'
where not exists(select * from menu where id = 'partners');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'to-volunteer', 5, 'about', 'MenuPage', 'public', '/about/to-volunteer'
where not exists(select * from menu where id = 'to-volunteer');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'reports', 6, 'about', 'MenuPage', 'public', '/about/reports'
where not exists(select * from menu where id = 'reports');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'reviews', 7, 'about', 'MenuPage', 'public', '/about/reviews'
where not exists(select * from menu where id = 'reviews');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'banners', 8, 'about', 'MenuPage', 'public', '/about/banners'
where not exists(select * from menu where id = 'banners');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'docs', 9, 'about', 'MenuPage', 'public', '/about/docs'
where not exists(select * from menu where id = 'docs');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'pets', 1, null, 'MenuPage', 'public', '/pets'
where not exists(select * from menu where id = 'pets');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'find', 0, 'pets', 'MenuPage', 'public', '/pets/find'
where not exists(select * from menu where id = 'find');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'sick', 1, 'pets', 'MenuPage', 'public', '/pets/sick'
where not exists(select * from menu where id = 'sick');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'care', 2, 'pets', 'MenuPage', 'public', '/pets/care'
where not exists(select * from menu where id = 'care');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'disable', 3, 'pets', 'MenuPage', 'public', '/pets/disable'
where not exists(select * from menu where id = 'disable');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'happy', 4, 'pets', 'MenuPage', 'public', '/pets/happy'
where not exists(select * from menu where id = 'happy');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'rainbow', 5, 'pets', 'MenuPage', 'public', '/pets/rainbow'
where not exists(select * from menu where id = 'rainbow');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'find-lost', 6, 'pets', 'MenuPage', 'public', '/pets/find-lost'
where not exists(select * from menu where id = 'find-lost');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'help', 2, null, 'MenuPage', 'public', '/help'
where not exists(select * from menu where id = 'help');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'donate', 0, 'help', 'MenuPage', 'public', '/help/donate'
where not exists(select * from menu where id = 'donate');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'take-pet', 1, 'help', 'MenuPage', 'public', '/help/take-pet'
where not exists(select * from menu where id = 'take-pet');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'donate-pet', 2, 'help', 'MenuPage', 'public', '/help/donate-pet'
where not exists(select * from menu where id = 'donate-pet');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'volunteering', 3, 'help', 'MenuPage', 'public', '/help/volunteering'
where not exists(select * from menu where id = 'volunteering');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'helping-things', 4, 'help', 'MenuPage', 'public', '/help/helping-things'
where not exists(select * from menu where id = 'helping-things');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'helping-service', 5, 'help', 'MenuPage', 'public', '/help/helping-service'
where not exists(select * from menu where id = 'helping-service');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'helping-it', 6, 'help', 'MenuPage', 'public', '/help/helping-it'
where not exists(select * from menu where id = 'helping-it');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'take-care', 7, 'help', 'MenuPage', 'public', '/help/take-care'
where not exists(select * from menu where id = 'take-care');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'news', 3, null, 'MenuPage', 'public', '/news'
where not exists(select * from menu where id = 'news');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'blog', 0, 'news', 'MenuPage', 'public', '/news/blog'
where not exists(select * from menu where id = 'blog');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'publics', 1, 'news', 'MenuPage', 'public', '/news/publics'
where not exists(select * from menu where id = 'publics');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'events', 2, 'news', 'MenuPage', 'public', '/news/events'
where not exists(select * from menu where id = 'events');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'actions', 3, 'news', 'MenuPage', 'public', '/news/actions'
where not exists(select * from menu where id = 'actions');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'info', 4, 'news', 'MenuPage', 'public', '/news/info'
where not exists(select * from menu where id = 'info');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'press', 5, 'news', 'MenuPage', 'public', '/news/press'
where not exists(select * from menu where id = 'press');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'happy-story', 6, 'news', 'MenuPage', 'public', '/news/happy-story'
where not exists(select * from menu where id = 'happy-story');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'projects', 4, null, 'MenuPage', 'public', '/projects'
where not exists(select * from menu where id = 'projects');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'chk_count', 0, 'projects', 'MenuPage', 'public', '/projects/chk_count'
where not exists(select * from menu where id = 'chk_count');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'ethics', 1, 'projects', 'MenuPage', 'public', '/projects/ethics'
where not exists(select * from menu where id = 'ethics');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'rescue', 2, 'projects', 'MenuPage', 'public', '/projects/rescue'
where not exists(select * from menu where id = 'rescue');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'media', 5, null, 'MenuPage', 'public', '/media'
where not exists(select * from menu where id = 'media');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'photo', 0, 'media', 'MenuPage', 'public', '/media/photo'
where not exists(select * from menu where id = 'photo');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'video', 1, 'media', 'MenuPage', 'public', '/media/video'
where not exists(select * from menu where id = 'video');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'contacts', 6, null, 'MenuPage', 'public', '/contacts'
where not exists(select * from menu where id = 'contacts');
INSERT INTO public.menu (id, position, parent_id, component, role, url)
select 'admin', 7, null, 'MenuPage', 'public', '/admin'
where not exists(select * from menu where id = 'admin');
CREATE TABLE IF NOT EXISTS public.menu_titles
(
    id VARCHAR(16) REFERENCES menu(id),
    lang VARCHAR(6) REFERENCES shelter_lang(lang),
    title VARCHAR(64),
    PRIMARY KEY (id, lang)
);
INSERT INTO public.menu_titles (id, lang, title)
SELECT 'about', 'uk', 'Про нас'
WHERE NOT exists(SELECT * FROM menu_titles WHERE id = 'about' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'about', 'en', 'About'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'about' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'about', 'ru', 'О нас'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'about' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'history', 'uk', 'Історія'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'history' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'history', 'en', 'History'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'history' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'history', 'ru', 'История'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'history' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'activity', 'uk', 'Дільність'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'activity' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'activity', 'en', 'Activity'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'activity' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'activity', 'ru', 'Деятельность'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'activity' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'team', 'uk', 'Команда'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'team' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'team', 'en', 'Team'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'team' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'team', 'ru', 'Команда'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'team' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'shelter', 'uk', 'Приют'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'shelter' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'shelter', 'en', 'Shelter'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'shelter' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'shelter', 'ru', 'Приют'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'shelter' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'partners', 'uk', 'Партнери'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'partners' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'partners', 'en', 'Partners'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'partners' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'partners', 'ru', 'Партнері'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'partners' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'to-volunteer', 'uk', 'Волонтерам'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'to-volunteer' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'to-volunteer', 'en', 'Volunteers'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'to-volunteer' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'to-volunteer', 'ru', 'Волонтерам'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'to-volunteer' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'reports', 'uk', 'Звітність'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'reports' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'reports', 'en', 'Reports'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'reports' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'reports', 'ru', 'Отчетность'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'reports' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'reviews', 'uk', 'Відгуки'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'reviews' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'reviews', 'en', 'Reviews'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'reviews' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'reviews', 'ru', 'Отзіві'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'reviews' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'banners', 'uk', 'Наші банери'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'banners' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'banners', 'en', 'Banners'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'banners' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'banners', 'ru', 'Наши банері'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'banners' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'docs', 'uk', 'Документи'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'docs' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'docs', 'en', 'Documents'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'docs' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'docs', 'ru', 'Документація'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'docs' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'pets', 'uk', 'Улюбленці'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'pets' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'pets', 'en', 'Pets'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'pets' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'pets', 'ru', 'Наши подопечніе'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'pets' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'find', 'uk', 'Шукають дім'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'find' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'find', 'en', 'Pet adoption'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'find' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'find', 'ru', 'Ищем дом'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'find' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'sick', 'uk', 'Важко хворі'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'sick' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'sick', 'en', 'Sick pets'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'sick' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'sick', 'ru', 'Тяжело больні'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'sick' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'care', 'uk', 'Потребують догляду'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'care' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'care', 'en', 'Care needs'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'care' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'care', 'ru', 'Нуждаются в специальном уходе'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'care' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'disable', 'uk', 'Інваліди та стареньки'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'disable' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'disable', 'en', 'Disable'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'disable' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'disable', 'ru', 'Инвалидіи старички'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'disable' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'happy', 'uk', 'Щасливчики'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'happy' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'happy', 'en', 'Happy'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'happy' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'happy', 'ru', 'Счастливчики'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'happy' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'rainbow', 'uk', 'З веселкою'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'rainbow' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'rainbow', 'en', 'On the rainbow'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'rainbow' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'rainbow', 'ru', 'На радуге'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'rainbow' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'find-lost', 'uk', 'Зайшли/загубили/віддають'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'find-lost' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'find-lost', 'en', 'Find/lost/give away'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'find-lost' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'find-lost', 'ru', 'Найдена/потеряна/отдают'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'find-lost' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'help', 'uk', 'Допомога'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'help' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'help', 'en', 'Helping'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'help' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'help', 'ru', 'Как нам помочь'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'help' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'donate', 'uk', 'Грошима'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'donate' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'donate', 'en', 'Donates'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'donate' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'donate', 'ru', 'Финансово'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'donate' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'take-pet', 'uk', 'Взяти улюбленця'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'take-pet' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'take-pet', 'en', 'Take pets'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'take-pet' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'take-pet', 'ru', 'Взять собаку или кошку'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'take-pet' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'donate-pet', 'uk', 'Взяти опіку'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'donate-pet' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'donate-pet', 'en', 'Care pets'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'donate-pet' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'donate-pet', 'ru', 'Стать опекуном'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'donate-pet' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'volunteering', 'uk', 'Бути волонтером'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'volunteering' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'volunteering', 'en', 'Be volunteer'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'volunteering' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'volunteering', 'ru', 'Стать волонтером'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'volunteering' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'helping-things', 'uk', 'Допомога речами'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'helping-things' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'helping-things', 'en', 'Helping with things'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'helping-things' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'helping-things', 'ru', 'Помочь вещами и товарами'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'helping-things' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'helping-service', 'uk', 'Допомога послугами'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'helping-service' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'helping-service', 'en', 'Helping with service'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'helping-service' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'helping-service', 'ru', 'Услугами и работами'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'helping-service' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'helping-it', 'uk', 'Інформаційна допомога'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'helping-it' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'helping-it', 'en', 'Helping with info'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'helping-it' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'helping-it', 'ru', 'Информаціонная помощь'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'helping-it' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'take-care', 'uk', 'Перетримка улюбленців'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'take-care' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'take-care', 'en', 'Take care'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'take-care' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'take-care', 'ru', 'Передержка животніх'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'take-care' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'news', 'uk', 'Новини'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'news' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'news', 'en', 'News'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'news' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'news', 'ru', 'Новости'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'news' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'blog', 'uk', 'Блог'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'blog' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'blog', 'en', 'Blog'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'blog' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'blog', 'ru', 'Блог'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'blog' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'publics', 'uk', 'Публікації'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'publics' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'publics', 'en', 'Publics'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'publics' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'publics', 'ru', 'Публикации'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'publics' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'events', 'uk', 'Події'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'events' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'events', 'en', 'Events'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'events' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'events', 'ru', 'Собітия'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'events' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'actions', 'uk', 'Дії'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'actions' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'actions', 'en', 'Actions'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'actions' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'actions', 'ru', 'Мероприятия'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'actions' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'info', 'uk', 'Корисна інформація'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'info' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'info', 'en', 'Helping info'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'info' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'info', 'ru', 'Полезная информация'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'info' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'press', 'uk', 'Преса'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'press' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'press', 'en', 'Press'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'press' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'press', 'ru', 'СМИ'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'press' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'happy-story', 'uk', 'Щастливі розповіді'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'happy-story' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'happy-story', 'en', 'Happy story'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'happy-story' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'happy-story', 'ru', 'Счастливіе истории'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'happy-story' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'projects', 'uk', 'Проекти'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'projects' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'projects', 'en', 'Projects'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'projects' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'projects', 'ru', 'Проекті'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'projects' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'chk_count', 'uk', 'Регулювання безпритульних'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'chk_count' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'chk_count', 'en', 'Counting'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'chk_count' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'chk_count', 'ru', 'Регулировка численности'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'chk_count' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'ethics', 'uk', 'Анімал-етика'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'ethics' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'ethics', 'en', 'Animal ethics'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'ethics' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'ethics', 'ru', 'Анимал-єтика'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'ethics' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'rescue', 'uk', 'Порятунок'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'rescue' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'rescue', 'en', 'Rescuing pets'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'rescue' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'rescue', 'ru', 'Спасeние животніх в кризисе'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'rescue' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'media', 'uk', 'Медіа'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'media' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'media', 'en', 'Media'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'media' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'media', 'ru', 'Медиа'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'media' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'photo', 'uk', 'Фото'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'photo' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'photo', 'en', 'Photo'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'photo' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'photo', 'ru', 'Фото'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'photo' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'video', 'uk', 'Відео'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'video' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'video', 'en', 'Video'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'video' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'video', 'ru', 'Видео'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'video' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'contacts', 'uk', 'Контакти'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'contacts' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'contacts', 'en', 'Contacts'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'contacts' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'contacts', 'ru', 'Контакті'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'contacts' and lang = 'ru');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'admin', 'uk', 'Конфігурація'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'admin' and lang = 'uk');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'admin', 'en', 'Administration'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'admin' and lang = 'en');
INSERT INTO public.menu_titles (id, lang, title) SELECT 'admin', 'ru', 'Настройка'
WHERE NOT EXISTS (SELECT * FROM menu_titles WHERE id = 'admin' and lang = 'ru');

CREATE TABLE IF NOT EXISTS public.pets_fields
(
    name varchar(10) PRIMARY KEY,
    type varchar(10) not null,
    enum_values VARCHAR(512),
    subtype varchar(10),
    fld_order integer default 0
);
CREATE TABLE IF NOT EXISTS public.field_titles
(
    name varchar(10) REFERENCES pets_fields(name),
    lang VARCHAR(6) REFERENCES shelter_lang(lang),
    title VARCHAR(64),
    PRIMARY KEY (name, lang)
);
-- we stored updates our entities
CREATE TABLE IF NOT EXISTS public.updates
(
    entity_id VARCHAR(64) PRIMARY KEY,
    last_updated timestamptz default now()
);
/*
 select * from updates where last_update > ?
 */
-- pages
CREATE TABLE IF NOT EXISTS public.pages
(
    id VARCHAR(16) PRIMARY KEY,
    lang VARCHAR(6),
    title VARCHAR(256),
    summary VARCHAR(256),
    body text,
    created timestamptz default now(),
    modified timestamptz default now(),
    score bigint,
    draft boolean default TRUE,
    tags VARCHAR(256),
    restriction VARCHAR(100),
    path VARCHAR(1024),
    menu_id varchar(16)
);
CREATE TABLE IF NOT EXISTS public.page_attachment
(
    id_page VARCHAR(16),
    id_asset VARCHAR(16) REFERENCES storage_lob(id) ON DELETE CASCADE,
    tooltip VARCHAR(256),
    CONSTRAINT uk_page_attachment PRIMARY KEY (id_page, id_asset)
);
CREATE TABLE IF NOT EXISTS public.banner
(
    id VARCHAR(16) PRIMARY KEY,
    id_asset varchar(16) REFERENCES storage_lob(id) ON DELETE CASCADE,
    target_url VARCHAR(1024),
    tooltip VARCHAR(256),
    score integer,
    lang varchar(6)
);
CREATE TABLE IF NOT EXISTS public.pets
(
    id VARCHAR(16) PRIMARY KEY,
    created timestamptz default now(),
    modified timestamptz default now()
);
CREATE TABLE IF NOT EXISTS public.pet_asset
(
    id_pet VARCHAR(16) REFERENCES pets(id) ON DELETE CASCADE,
    id_asset varchar(16) REFERENCES storage_lob(id) ON DELETE CASCADE,
    tooltip VARCHAR(256)
);
CREATE TABLE IF NOT EXISTS public.pets_info
(
    id_pet VARCHAR(16) REFERENCES pets(id) ON DELETE CASCADE,
    name VARCHAR(16) REFERENCES pets_fields(name) ON DELETE CASCADE,
    value text
);
CREATE TABLE IF NOT EXISTS public.users
(
    login VARCHAR(64) NOT NULL PRIMARY KEY,
    authType VARCHAR(10),
    password_hash VARCHAR(128),
    role VARCHAR(16) default 'public',
    created timestamptz default now(),
    enabled boolean default true
);
insert into users(login, authType, password_hash, role, created, enabled)
select 'admin', 'basic', 'TE4WlMk/LpjMXEXnoYP2Fbob+F7eXmYXiajUkCX/lCM=', 'writer,admin', now(), true
WHERE not exists(select login from users where login = 'admin');

CREATE TABLE IF NOT EXISTS public.pet_sequencer
(
    id varchar(6) primary key,
    next integer
);
CREATE TABLE IF NOT EXISTS public.votes
(
    res_id varchar(16), -- id of page,pet,asset,comment (any resource that has ID and has survey)
    vote_id int default 0, -- is used when resource has more than one survey
    browser_id uuid not null,
    vote varchar(64)
);
create index if not exists votes_index2
    on votes (res_id);
create index if not exists votes_index1
    on votes (res_id, browser_id);
CREATE TABLE IF NOT EXISTS public.comments
(
    id varchar(16) primary key,
    res_id varchar(16) not null,-- id of page,pet,asset (any resource that has ID)
    comm_id varchar(16),-- is used when comment is added to comment
    nick_name varchar(64),
    browser_id uuid not null,
    created timestamptz default now(),
    comment varchar(1024)
);
create index if not exists idx_comments_res_id on public.comments (res_id);
CREATE TABLE IF NOT EXISTS public.browsers
(
    browser_id uuid primary key,
    remote_ip varchar(64),
    enabled boolean default true,
    created timestamptz default now(),
    updated timestamptz
);
