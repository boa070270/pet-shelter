const pgPool = require('../db/pg-pool');
const log = require('../log').getLogger('SERVICE.MENU');
const {HttpCodeError} = require('../rest-utils');

class MenuDb {
    /**
     * Get all menu
     *
     *
     */
    async getMenus() {
        log.debug('getMenus with query "select id as "path", component, role, position, parent_id as "parentId" from menu"');
        const menus = await pgPool.query('select id as "path", component, role, position, parent_id as "parentId" from menu');
        log.debug('getMenus with query "select id, lang, title from menu_titles"');
        const titles = await pgPool.query('select id, lang, title from menu_titles');
        return {menus: menus.rows, titles: titles.rows};
    }
    /**
     * upset menu
     * menu
     * {"titles":[{"id":"about","lang":"en","title":"About us"},{"id":"about","lang":"en","title":"About us"}]}
     */
    async upsetMenu(menu, titles = []) {
        log.debug('upsetMenu with query "with data as (select cast(:menu.path as varchar) as id, cast(:menu.position as integer) as position, cast(:menu.parentId as varchar) as parent_id, cast(:menu.component as varchar) as component, cast(:menu.role as varchar) as role ), upd as ( update menu m set position = d.position, parent_id = d.parent_id, component = d.component, role = d.role from data d where m.id = d.id returning m.id ), ins as ( insert into menu (id, position, parent_id, component, role) select id, position, parent_id, component, role from data where not exists (select * from upd) ) update updates set last_updated = now() where entity_id = \'Menu\'"');
        await pgPool.query('with data as (select cast($1 as varchar) as id, cast($2 as integer) as position, cast($3 as varchar) as parent_id, cast($4 as varchar) as component, cast($5 as varchar) as role ), upd as ( update menu m set position = d.position, parent_id = d.parent_id, component = d.component, role = d.role from data d where m.id = d.id returning m.id ), ins as ( insert into menu (id, position, parent_id, component, role) select id, position, parent_id, component, role from data where not exists (select * from upd) ) update updates set last_updated = now() where entity_id = \'Menu\'', [menu.path, menu.position, menu.parentId, menu.component, menu.role]);
        log.debug('upsetMenu with query "with data as (select cast(:titles.id as varchar) as id, cast(:titles.lang as varchar) as lang, cast(:titles.title as varchar) as title ), upd as ( update menu_titles m set id = d.id, lang = d.lang, title = d.title from data d where m.id = d.id and m.lang = d.lang returning m.id, m.lang ), ins as ( insert into menu_titles(id, lang, title) select id, lang, title from data where not exists(select * from upd) ) update updates set last_updated = now() where entity_id = \'Menu\'"');
        for(const title of titles) {
            await pgPool.query(
                `with data as (
                            select cast($1 as varchar) as id,
                            cast($2 as varchar) as lang,
                            cast($3 as varchar) as title
                        ), upd as (
                           update menu_titles m 
                               set id = d.id, lang = d.lang, title = d.title 
                           from data d where m.id = d.id and m.lang = d.lang returning m.id, m.lang
                        ), ins as (
                           insert into menu_titles (id, lang, title) select id, lang, title 
                           from data where not exists(select * from upd)
                        )
                         update updates
                         set last_updated = now()
                         where entity_id = 'Menu'`, [title.id, title.lang, title.title]);
        }
        return menu.path;
    }
    /**
     * Get menu
     * path
     * "foobar"
     */
    async getMenu(path) {
        log.debug('getMenu with query "select id as "path", component, role, position, parent_id as "parentId" from menu where id = :path"');
        let menu = await pgPool.query('select id as "path", component, role, position, parent_id as "parentId" from menu where id = $1', [path]);
        if(menu.rowCount === 0) {
            throw new HttpCodeError(404, `Menu [${path}] not found`);
        }
        log.debug('getMenu with query "select id, lang, title from menu_titles  where id = :path"');
        let titles = await pgPool.query('select id, lang, title from menu_titles where id = $1', [path]);
        return {menu: menu.rows[0], titles: titles.rows};
    }
    /**
     * delete menu
     * path,force
     * "foobar"
     * false
     */
    async deleteMenu(path,force) {
        let result;
        result = await pgPool.query('select id from menu where parent_id = $1', [path]);
        if (result.rowCount > 0) {
            if(!force) {
                throw new HttpCodeError(409, 'There are children menu for this path: '+ path);
            }
            for (const r of result.rows) {
                await this.deleteMenu(r.id, force);
            }
        }
        log.debug('deleteMenu with query "delete from menu_titles where id = :path"');
        await pgPool.query('delete from menu_titles where id = $1', [path]);
        log.debug('deleteMenu with query "delete from menu where id = :path"');
        result = await pgPool.query('delete from menu where id = $1', [path]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `Menu [${path}] not found`);
        }
        return path;
    }

}

const menuDb = new MenuDb();
module.exports = menuDb;
