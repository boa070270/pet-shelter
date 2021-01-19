const Code = require('@hapi/code');
const expect = Code.expect;
const _ = require('lodash');
const byAdmin = require('axios').create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer cdcba59b-7701-4322-ad57-bf86b927f218'
    }
});
const byPublic = require('axios').create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    }
});

describe('menu functional test', ()=>{
    describe('put menu to use in app', () => {
        let menuCollecion = [
            {path: 'about', component:'EndMenuPage', role:'public', position: 0},
            {path: 'history', component:'SubMenuPage', role:'public', position: 0, parentId:'about'},
            {path: 'activity', component:'SubMenuPage', role:'public', position: 1, parentId:'about'},
            {path: 'team', component:'SubMenuPage', role:'public', position: 2, parentId:'about'},
            {path: 'shelter', component:'SubMenuPage', role:'public', position: 3, parentId:'about'},
            {path: 'partners', component:'SubMenuPage', role:'public', position: 4, parentId:'about'},
            {path: 'to-volunteer', component:'SubMenuPage', role:'public', position: 5, parentId:'about'},
            {path: 'reports', component:'SubMenuPage', role:'public', position: 6, parentId:'about'},
            {path: 'reviews', component:'SubMenuPage', role:'public', position: 7, parentId:'about'},
            {path: 'banners', component:'SubMenuPage', role:'public', position: 8, parentId:'about'},
            {path: 'docs', component:'SubMenuPage', role:'public', position: 9, parentId:'about'},

            {path: 'pets', component:'EndMenuPage', role:'public', position: 1},
            {path: 'find', component:'SubMenuPage', role:'public', position: 0, parentId:'pets'},
            {path: 'sick', component:'SubMenuPage', role:'public', position: 1, parentId:'pets'},
            {path: 'care', component:'SubMenuPage', role:'public', position: 2, parentId:'pets'},
            {path: 'disable', component:'SubMenuPage', role:'public', position: 3, parentId:'pets'},
            {path: 'happy', component:'SubMenuPage', role:'public', position: 4, parentId:'pets'},
            {path: 'rainbow', component:'SubMenuPage', role:'public', position: 5, parentId:'pets'},
            {path: 'find-lost', component:'SubMenuPage', role:'public', position: 6, parentId:'pets'},

            {path: 'help', component:'EndMenuPage', role:'public', position: 2},
            {path: 'donate', component:'SubMenuPage', role:'public', position: 0, parentId:'help'},
            {path: 'take-pet', component:'SubMenuPage', role:'public', position: 1, parentId:'help'},
            {path: 'donate-pet', component:'SubMenuPage', role:'public', position: 2, parentId:'help'},
            {path: 'volunteering', component:'SubMenuPage', role:'public', position: 3, parentId:'help'},
            {path: 'helping-things', component:'SubMenuPage', role:'public', position: 4, parentId:'help'},
            {path: 'helping-service', component:'SubMenuPage', role:'public', position: 5, parentId:'help'},
            {path: 'helping-it', component:'SubMenuPage', role:'public', position: 6, parentId:'help'},
            {path: 'take-care', component:'SubMenuPage', role:'public', position: 7, parentId:'help'},

            {path: 'news', component:'EndMenuPage', role:'public', position: 3},
            {path: 'blog', component:'SubMenuPage', role:'public', position: 0, parentId:'news'},
            {path: 'publics', component:'SubMenuPage', role:'public', position: 1, parentId:'news'},
            {path: 'events', component:'SubMenuPage', role:'public', position: 2, parentId:'news'},
            {path: 'actions', component:'SubMenuPage', role:'public', position: 3, parentId:'news'},
            {path: 'info', component:'SubMenuPage', role:'public', position: 4, parentId:'news'},
            {path: 'press', component:'SubMenuPage', role:'public', position: 5, parentId:'news'},
            {path: 'happy-story', component:'SubMenuPage', role:'public', position: 6, parentId:'news'},

            {path: 'projects', component:'EndMenuPage', role:'public', position: 4},
            {path: 'chk_count', component:'SubMenuPage', role:'public', position: 0, parentId:'projects'},
            {path: 'ethics', component:'SubMenuPage', role:'public', position: 1, parentId:'projects'},
            {path: 'rescue', component:'SubMenuPage', role:'public', position: 2, parentId:'projects'},

            {path: 'media', component:'EndMenuPage', role:'public', position: 5},
            {path: 'photo', component:'SubMenuPage', role:'public', position: 0, parentId:'media'},
            {path: 'video', component:'SubMenuPage', role:'public', position: 1, parentId:'media'},

            {path: 'contacts', component:'EndMenuPage', role:'public', position: 6},
            {path: 'admin', component:'SubMenuPage', role:'public', position: 7},
        ];
        let titleCollection = [
            {id: 'about', lang:'uk', title:'Про нас'},
            {id: 'about', lang:'en', title:'About'},
            {id: 'about', lang:'ru', title:'О нас'},
            {id: 'history', lang:'uk', title:'Історія'},
            {id: 'history', lang:'en', title:'History'},
            {id: 'history', lang:'ru', title:'История'},
            {id: 'activity', lang:'uk', title:'Дільність'},
            {id: 'activity', lang:'en', title:'Activity'},
            {id: 'activity', lang:'ru', title:'Деятельность'},
            {id: 'team', lang:'uk', title:'Команда'},
            {id: 'team', lang:'en', title:'Team'},
            {id: 'team', lang:'ru', title:'Команда'},
            {id: 'shelter', lang:'uk', title:'Приют'},
            {id: 'shelter', lang:'en', title:'Shelter'},
            {id: 'shelter', lang:'ru', title:'Приют'},
            {id: 'partners', lang:'uk', title:'Партнери'},
            {id: 'partners', lang:'en', title:'Partners'},
            {id: 'partners', lang:'ru', title:'Партнері'},
            {id: 'to-volunteer', lang:'uk', title:'Волонтерам'},
            {id: 'to-volunteer', lang:'en', title:'Volunteers'},
            {id: 'to-volunteer', lang:'ru', title:'Волонтерам'},
            {id: 'reports', lang:'uk', title:'Звітність'},
            {id: 'reports', lang:'en', title:'Reports'},
            {id: 'reports', lang:'ru', title:'Отчетность'},
            {id: 'reviews', lang:'uk', title:'Відгуки'},
            {id: 'reviews', lang:'en', title:'Reviews'},
            {id: 'reviews', lang:'ru', title:'Отзіві'},
            {id: 'banners', lang:'uk', title:'Наші банери'},
            {id: 'banners', lang:'en', title:'Banners'},
            {id: 'banners', lang:'ru', title:'Наши банері'},
            {id: 'docs', lang:'uk', title:'Документи'},
            {id: 'docs', lang:'en', title:'Documents'},
            {id: 'docs', lang:'ru', title:'Документація'},

            {id: 'pets', lang:'uk', title:'Улюбленці'},
            {id: 'pets', lang:'en', title:'Pets'},
            {id: 'pets', lang:'ru', title:'Наши подопечніе'},
            {id: 'find', lang:'uk', title:'Шукають дім'},
            {id: 'find', lang:'en', title:'Pet adoption'},
            {id: 'find', lang:'ru', title:'Ищем дом'},
            {id: 'sick', lang:'uk', title:'Важко хворі'},
            {id: 'sick', lang:'en', title:'Sick pets'},
            {id: 'sick', lang:'ru', title:'Тяжело больні'},
            {id: 'care', lang:'uk', title:'Потребують догляду'},
            {id: 'care', lang:'en', title:'Care needs'},
            {id: 'care', lang:'ru', title:'Нуждаются в специальном уходе'},
            {id: 'disable', lang:'uk', title:'Інваліди та стареньки'},
            {id: 'disable', lang:'en', title:'Disable'},
            {id: 'disable', lang:'ru', title:'Инвалидіи старички'},
            {id: 'happy', lang:'uk', title:'Щасливчики'},
            {id: 'happy', lang:'en', title:'Happy'},
            {id: 'happy', lang:'ru', title:'Счастливчики'},
            {id: 'rainbow', lang:'uk', title:'З веселкою'},
            {id: 'rainbow', lang:'en', title:'On the rainbow'},
            {id: 'rainbow', lang:'ru', title:'На радуге'},
            {id: 'find-lost', lang:'uk', title:'Зайшли/загубили/віддають'},
            {id: 'find-lost', lang:'en', title:'Find/lost/give away'},
            {id: 'find-lost', lang:'ru', title:'Найдена/потеряна/отдают'},

            {id: 'help', lang:'uk', title:'Допомога'},
            {id: 'help', lang:'en', title:'Helping'},
            {id: 'help', lang:'ru', title:'Как нам помочь'},
            {id: 'donate', lang:'uk', title:'Грошима'},
            {id: 'donate', lang:'en', title:'Donates'},
            {id: 'donate', lang:'ru', title:'Финансово'},
            {id: 'take-pet', lang:'uk', title:'Взяти улюбленця'},
            {id: 'take-pet', lang:'en', title:'Take pets'},
            {id: 'take-pet', lang:'ru', title:'Взять собаку или кошку'},
            {id: 'donate-pet', lang:'uk', title:'Взяти опіку'},
            {id: 'donate-pet', lang:'en', title:'Care pets'},
            {id: 'donate-pet', lang:'ru', title:'Стать опекуном'},
            {id: 'volunteering', lang:'uk', title:'Бути волонтером'},
            {id: 'volunteering', lang:'en', title:'Be volunteer'},
            {id: 'volunteering', lang:'ru', title:'Стать волонтером'},
            {id: 'helping-things', lang:'uk', title:'Допомога речами'},
            {id: 'helping-things', lang:'en', title:'Helping with things'},
            {id: 'helping-things', lang:'ru', title:'Помочь вещами и товарами'},
            {id: 'helping-service', lang:'uk', title:'Допомога послугами'},
            {id: 'helping-service', lang:'en', title:'Helping with service'},
            {id: 'helping-service', lang:'ru', title:'Услугами и работами'},
            {id: 'helping-it', lang:'uk', title:'Інформаційна допомога'},
            {id: 'helping-it', lang:'en', title:'Helping with info'},
            {id: 'helping-it', lang:'ru', title:'Информаціонная помощь'},
            {id: 'take-care', lang:'uk', title:'Перетримка улюбленців'},
            {id: 'take-care', lang:'en', title:'Take care'},
            {id: 'take-care', lang:'ru', title:'Передержка животніх'},

            {id: 'news', lang:'uk', title:'Новини'},
            {id: 'news', lang:'en', title:'News'},
            {id: 'news', lang:'ru', title:'Новости'},
            {id: 'blog', lang:'uk', title:'Блог'},
            {id: 'blog', lang:'en', title:'Blog'},
            {id: 'blog', lang:'ru', title:'Блог'},
            {id: 'publics', lang:'uk', title:'Публікації'},
            {id: 'publics', lang:'en', title:'Publics'},
            {id: 'publics', lang:'ru', title:'Публикации'},
            {id: 'events', lang:'uk', title:'Події'},
            {id: 'events', lang:'en', title:'Events'},
            {id: 'events', lang:'ru', title:'Собітия'},
            {id: 'actions', lang:'uk', title:'Дії'},
            {id: 'actions', lang:'en', title:'Actions'},
            {id: 'actions', lang:'ru', title:'Мероприятия'},
            {id: 'info', lang:'uk', title:'Корисна інформація'},
            {id: 'info', lang:'en', title:'Helping info'},
            {id: 'info', lang:'ru', title:'Полезная информация'},
            {id: 'press', lang:'uk', title:'Преса'},
            {id: 'press', lang:'en', title:'Press'},
            {id: 'press', lang:'ru', title:'СМИ'},
            {id: 'happy-story', lang:'uk', title:'Щастливі розповіді'},
            {id: 'happy-story', lang:'en', title:'Happy story'},
            {id: 'happy-story', lang:'ru', title:'Счастливіе истории'},

            {id: 'projects', lang:'uk', title:'Проекти'},
            {id: 'projects', lang:'en', title:'Projects'},
            {id: 'projects', lang:'ru', title:'Проекті'},
            {id: 'chk_count', lang:'uk', title:'Регулювання безпритульних'},
            {id: 'chk_count', lang:'en', title:'Counting'},
            {id: 'chk_count', lang:'ru', title:'Регулировка численности'},
            {id: 'ethics', lang:'uk', title:'Анімал-етика'},
            {id: 'ethics', lang:'en', title:'Animal ethics'},
            {id: 'ethics', lang:'ru', title:'Анимал-єтика'},
            {id: 'rescue', lang:'uk', title:'Порятунок'},
            {id: 'rescue', lang:'en', title:'Rescuing pets'},
            {id: 'rescue', lang:'ru', title:'Спасeние животніх в кризисе'},

            {id: 'media', lang:'uk', title:'Медіа'},
            {id: 'media', lang:'en', title:'Media'},
            {id: 'media', lang:'ru', title:'Медиа'},
            {id: 'photo', lang:'uk', title:'Фото'},
            {id: 'photo', lang:'en', title:'Photo'},
            {id: 'photo', lang:'ru', title:'Фото'},
            {id: 'video', lang:'uk', title:'Відео'},
            {id: 'video', lang:'en', title:'Video'},
            {id: 'video', lang:'ru', title:'Видео'},

            {id: 'contacts', lang:'uk', title:'Контакти'},
            {id: 'contacts', lang:'en', title:'Contacts'},
            {id: 'contacts', lang:'ru', title:'Контакті'},
            {id: 'admin', lang:'uk', title:'Конфігурація'},
            {id: 'admin', lang:'en', title:'Administration'},
            {id: 'admin', lang:'ru', title:'Настройка'},
        ];
        it('delete all menu', async ()=>{
            const result = await byPublic.get('/menu');
            const data = result.data.data;
            for(const menu of data.menus) {
                if(!menu.parentId) {
                    await byAdmin.delete(`/menu/${menu.path}?force=true`);
                }
            }
        });
        it('put menu', async ()=>{
            for(const menu of menuCollecion) {
                const titles = titleCollection.filter(t => t.id === menu.path);
                const result = await byAdmin.post('/menu', {menu, titles});
                expect(result.data.data).equals({id:menu.path});
            }
        });
    });
});
