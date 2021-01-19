--stored documents, images, etc.
CREATE TABLE IF NOT EXISTS public.storage_lob
(
	id VARCHAR (16) NOT NULL PRIMARY KEY,
    original_name varchar(256),
    encoding VARCHAR (64),
    mimetype VARCHAR (256),
    size INTEGER,
    created timestamptz default now()
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
    role VARCHAR(64)
);
CREATE TABLE IF NOT EXISTS public.menu_titles
(
    id VARCHAR(16) REFERENCES menu(id),
    lang VARCHAR(6) REFERENCES shelter_lang(lang),
    title VARCHAR(64),
    PRIMARY KEY (id, lang)
);
CREATE TABLE IF NOT EXISTS public.pets_fields
(
    name varchar(10) PRIMARY KEY,
    type varchar(10) not null,
    enum_values VARCHAR(512),
    subtype varchar(10)
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
    score bigint,
    draft boolean default TRUE,
    tags VARCHAR(256),
    restriction VARCHAR(100)
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
    id VARCHAR(16) PRIMARY KEY
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
CREATE TABLE IF NOT EXISTS public.pet_sequencer
(
    id varchar(6) primary key,
    next integer
);
