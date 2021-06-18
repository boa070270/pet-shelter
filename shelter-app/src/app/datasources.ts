import {BasicService} from './basic.service';
import {
  AbstractDataSource,
  DataExpectedResult,
  DataService,
  IFilter,
  IOrder,
  LanguageType,
  MainDataSource
} from 'ui-lib';
import {Observable, of} from 'rxjs';
import {ListRange} from '@angular/cdk/collections';
import {map} from 'rxjs/operators';
import {Injectable, OnDestroy} from '@angular/core';
import {BannerType, CarouselType, FieldTypeUI, FileType, MenuTypeUI, PageType, PetType, UserType} from './common/types';
import {DsDataService, DsDataType, DsService, DsType, removeNull} from "./admin/ds.service";

class LanguageDataService extends DataService<LanguageType> {
  constructor(private basicService: BasicService) {
    super();
  }
  deleteData(row: LanguageType): Observable<DataExpectedResult<LanguageType>> {
    return this.basicService.deleteLanguage(row.lang).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  insertData(row: LanguageType): Observable<DataExpectedResult<LanguageType>> {
    return this.basicService.upsertLanguage(removeNull(row)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  obtainData(lstRange?: ListRange, query?: IFilter, order?: IOrder[]): Observable<DataExpectedResult<LanguageType>> {
    return this.basicService.selectLanguage().pipe(
      map(r => {
        const data = r.body.data;
        return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
      })
    );
  }
  updateData(row: LanguageType): Observable<DataExpectedResult<LanguageType>> {
    return this.insertData(removeNull(row));
  }
}
class MenuDataService extends DataService<MenuTypeUI> {
  constructor(private basicService: BasicService) {
    super();
  }
  deleteData(row: MenuTypeUI): Observable<DataExpectedResult<MenuTypeUI>> {
    return this.basicService.deleteMenu2(row.path).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  insertData(row: MenuTypeUI): Observable<DataExpectedResult<MenuTypeUI>> {
    const title = {id: row.path, titles: row.title}; // in: title: [{lang, title}, {lang, title} ..]
    const menu = Object.assign({}, row); // out: { id, titles: [{lang, title}, {lang, title} ..] }
    delete menu.title; // id should be same for every title
    return this.basicService.upsetMenu2(removeNull(menu), removeNull(title)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  obtainData(lstRange?: ListRange, query?: IFilter, order?: IOrder[]): Observable<DataExpectedResult<MenuTypeUI>> {
    return this.basicService.getMenus2().pipe(
      map(r => {
        const {menus, titles} = r.body.data;
        const data = menus.map( m => {
          const {path, component, role, position, parentId} = m;
          return {path, component, role, position, parentId, title: titles.filter( t => t.id === path)};
        });
        return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
      })
    );
  }
  updateData(row: MenuTypeUI): Observable<DataExpectedResult<MenuTypeUI>> {
    return this.insertData(removeNull(row));
  }
}
class FieldDataService extends DataService<FieldTypeUI> {
  constructor(private basicService: BasicService) {
    super();
  }
  deleteData(row: FieldTypeUI): Observable<DataExpectedResult<FieldTypeUI>> {
    return this.basicService.deleteField2(row.name).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  insertData(row: FieldTypeUI): Observable<DataExpectedResult<FieldTypeUI>> {
    const titles = {id: row.name, titles: row.title};
    const field = Object.assign({}, row);
    delete field.title;
    return this.basicService.addField2({field: removeNull(field), titles: removeNull(titles)}).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  obtainData(lstRange?: ListRange, query?: IFilter, orders?: IOrder[]): Observable<DataExpectedResult<FieldTypeUI>> {
    return this.basicService.getFields2().pipe(map( r => {
      const {fields, titles} = r.body.data;
      const data = fields.map( f => {
        const {name, type, subtype, enumValues, order} = f;
        return {name, type, subtype, enumValues, order, title: titles.filter( t => t.id === name)};
      });
      return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
    }));
  }
  updateData(row: FieldTypeUI): Observable<DataExpectedResult<FieldTypeUI>> {
    return this.insertData(removeNull(row));
  }
}
class PetDataService extends DataService<PetType> {
  constructor(private basicService: BasicService) {
    super();
  }
  deleteData(row: PetType): Observable<DataExpectedResult<PetType>> {
    return this.basicService.deletePet2(row.id).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  insertData(row: PetType): Observable<DataExpectedResult<PetType>> {
    return this.basicService.addPet2(removeNull(row)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  obtainData(lstRange?: ListRange, query?: IFilter, order?: IOrder[]): Observable<DataExpectedResult<PetType>> {
    return this.basicService.getPets2().pipe(
      map( r => {
        const data = r.body.data;
        return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
      })
    );
  }
  updateData(row: PetType): Observable<DataExpectedResult<PetType>> {
    return this.basicService.updatePet2(removeNull(row)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
}
class FileDataService extends DataService<FileType> {
  constructor(private basicService: BasicService) {
    super();
  }
  deleteData(row: FileType): Observable<DataExpectedResult<FileType>> {
    return this.basicService.deleteFile2(row.id).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  obtainData(lstRange?: ListRange, query?: IFilter, order?: IOrder[]): Observable<DataExpectedResult<FileType>> {
    return this.basicService.getFiles2().pipe(
      map( r => {
        const data = r.body.data;
        return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
      })
    );
  }
  insertData(row: FileType): Observable<DataExpectedResult<FileType>> {
    return of({responseTime: new Date(0), data: [], totalFiltered: -1, totalAll: -1});
  }
  updateData(row: FileType): Observable<DataExpectedResult<FileType>> {
    return of({responseTime: new Date(0), data: [], totalFiltered: -1, totalAll: -1});
  }
}
class BannerDataService extends DataService<BannerType> {
  constructor(private basicService: BasicService) {
    super();
  }
  deleteData(row: BannerType): Observable<DataExpectedResult<BannerType>> {
    return this.basicService.deleteBanner2(row.id).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  insertData(row: BannerType): Observable<DataExpectedResult<BannerType>> {
    return this.basicService.addBanner2(removeNull(row)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  obtainData(lstRange?: ListRange, query?: IFilter, order?: IOrder[]): Observable<DataExpectedResult<BannerType>> {
    return this.basicService.getBanners2().pipe(
      map( r => {
        const data = r.body.data;
        return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
      })
    );
  }
  updateData(row: BannerType): Observable<DataExpectedResult<BannerType>> {
    return this.basicService.updateBanner2(removeNull(row)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
}
class PageDataService extends DataService<PageType> {
  constructor(private basicService: BasicService) {
    super();
  }
  deleteData(row: PageType): Observable<DataExpectedResult<PageType>> {
    return this.basicService.deletePage2(row.id).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  insertData(row: PageType): Observable<DataExpectedResult<PageType>> {
    return this.basicService.addPage2(removeNull(row)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  obtainData(lstRange?: ListRange, query?: IFilter, order?: IOrder[]): Observable<DataExpectedResult<PageType>> {
    return this.basicService.getPages2().pipe(
      map(r => {
        const data = r.body.data;
        return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
      })
    );
  }
  updateData(row: PageType): Observable<DataExpectedResult<PageType>> {
    return this.basicService.updatePage2(removeNull(row)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
}
class UserDataService extends DataService<UserType> {
  constructor(private basicService: BasicService) {
    super();
  }
  deleteData(row: UserType): Observable<DataExpectedResult<UserType>> {
    return this.basicService.deleteUser2(row.login).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  insertData(row: UserType): Observable<DataExpectedResult<UserType>> {
    return this.basicService.addUser2(removeNull(row)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
  obtainData(lstRange?: ListRange, query?: IFilter, order?: IOrder[]): Observable<DataExpectedResult<UserType>> {
    return this.basicService.getUsers2().pipe(
      map(r => {
        const data = r.body.data;
        return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
      })
    );
  }
  updateData(row: UserType): Observable<DataExpectedResult<UserType>> {
    return this.basicService.updateUser2(removeNull(row)).pipe(
      map(r => {
        return {responseTime: new Date(r.headers.get('Date')), data: [], totalFiltered: -1, totalAll: -1};
      })
    );
  }
}
class CarouselDataService extends DataService<CarouselType> {
  constructor(private basicService: BasicService) {
    super();
  }
  deleteData(row: CarouselType): Observable<DataExpectedResult<CarouselType>> {
    throw new Error('Invalid call');
  }
  insertData(row: CarouselType): Observable<DataExpectedResult<CarouselType>> {
    throw new Error('Invalid call');
  }
  obtainData(lstRange?: ListRange, query?: IFilter, order?: IOrder[]): Observable<DataExpectedResult<CarouselType>> {
    const resource = (query && query.external) ? query.external.resource : 'banner';
    const lang = (query && query.external) ? query.external.lang : undefined;
    const numOf = lstRange ? lstRange.end - lstRange.start : 100;
    const offset = lstRange ? lstRange.start : 0;
    return this.basicService.getCarousel2(resource, lang, numOf, offset).pipe(
      map(r => {
        const data = r.body.data;
        return {responseTime: new Date(r.headers.get('Date')), data, totalFiltered: data.length, totalAll: data.length};
      })
    );
  }
  updateData(row: CarouselType): Observable<DataExpectedResult<CarouselType>> {
    throw new Error('Invalid call');
  }
}

const ALL_EQUAL = () => true;
@Injectable({
  providedIn: 'root'
})
export class DataSources implements OnDestroy {
  readonly Language: AbstractDataSource<LanguageType>;
  readonly Menu: AbstractDataSource<MenuTypeUI>;
  readonly Fields: AbstractDataSource<FieldTypeUI>;
  readonly Pets: AbstractDataSource<PetType>;
  readonly Files: AbstractDataSource<FileType>;
  readonly Banners: AbstractDataSource<BannerType>;
  readonly Pages: AbstractDataSource<PageType>;
  readonly Users: AbstractDataSource<UserType>;
  readonly Carousel: AbstractDataSource<CarouselType>;
  readonly Ds: AbstractDataSource<DsType>;
  constructor(basicService: BasicService) {
    this.Language = new MainDataSource(new LanguageDataService(basicService), 20, 100, ALL_EQUAL, ALL_EQUAL);
    this.Menu = new MainDataSource(new MenuDataService(basicService), 20, 100, ALL_EQUAL, ALL_EQUAL);
    this.Fields = new MainDataSource(new FieldDataService(basicService), 20, 100, ALL_EQUAL, ALL_EQUAL);
    this.Pets = new MainDataSource(new PetDataService(basicService), 20, 100, ALL_EQUAL, ALL_EQUAL);
    this.Files = new MainDataSource(new FileDataService(basicService), 20, 100, ALL_EQUAL, ALL_EQUAL);
    this.Banners = new MainDataSource(new BannerDataService(basicService), 20, 100, ALL_EQUAL, ALL_EQUAL);
    this.Pages = new MainDataSource(new PageDataService(basicService), 20, 100, ALL_EQUAL, ALL_EQUAL);
    this.Users = new MainDataSource(new UserDataService(basicService), 20, 100, ALL_EQUAL, ALL_EQUAL);
    this.Carousel = new MainDataSource(new CarouselDataService(basicService), 20, 100, ALL_EQUAL, ALL_EQUAL);
    this.Ds = new MainDataSource(new DsService(basicService), 20, 100, ALL_EQUAL, ALL_EQUAL);
  }
  ngOnDestroy(): void {
    this.Language.destroy();
    this.Menu.destroy();
    this.Fields.destroy();
    this.Pets.destroy();
    this.Files.destroy();
    this.Banners.destroy();
    this.Pages.destroy();
    this.Carousel.destroy();
    this.Ds.destroy();
  }
}
