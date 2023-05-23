// tslint:disable:max-line-length
import {combineLatest, EMPTY, fromEvent, Observable, of, ReplaySubject, Subject, Subscription, timer} from 'rxjs';
import {EventEmitter} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {fromPromise} from 'rxjs/internal-compatibility';
import {map, mergeMap, tap} from 'rxjs/operators';
import {EngineModelService} from '../shared';

export interface EngineProperty<T> extends Observable<T> {
  init?: (m: EngineModel) => Observable<void>;
  dispose?: () => Observable<void>;
}
export interface EngineProperties {
  [name: string]: EngineProperty<any>;
}
const DISPOSE = Symbol('Engine.dispose');
function proxyHandler(m: EngineModel): ProxyHandler<EngineProperties> {
  const original: {[key: string]: {s: Subscription, o: EngineProperty<any>}} = {};
  const subscription = new Subscription();
  return {
    get(target: {}, p: PropertyKey, receiver: any): any {
      if (typeof p === 'symbol') {
        if (p === Symbol.toPrimitive) {
          return (hint) => {
            switch (hint) {
              case 'number':
                return NaN;
              case 'string':
                return '' + Object.keys(target);
              default:
                return 'properties';
            }
          };
        } else if (p === DISPOSE) {
          for (const n in target) {
            if (target.hasOwnProperty(n)) {
              delete target[n];
            }
          }
          for (const n in original) {
            if (original.hasOwnProperty(n)) {
              delete original[n];
            }
          }
          subscription.unsubscribe();
          return EMPTY;
        } else if (p === Symbol.toStringTag) {
          return 'properties:' + Object.keys(target);
        }
      }
      if (!target[p]) {
        target[p] = new ReplaySubject(1);
      }
      return target[p];
    },
    deleteProperty(target: EngineProperties, name: PropertyKey): boolean {
      if (typeof name !== 'string') {
        return false;
      }
      if (original[name as string]) {
        const orig = original[name];
        subscription.remove(orig.s);
        orig.s.unsubscribe();
        orig.o.dispose();
        delete target[name];
        this.eventEmitter.emit('delete-property');
        return true;
      }
    },
    set(target: EngineProperties, name: PropertyKey, v: any, receiver: any): boolean {
      if (typeof name !== 'string') {
        return false;
      }
      const event = {event: '', name};
      if (original[name as string]) {
        const orig = original[name];
        subscription.remove(orig.s);
        orig.s.unsubscribe();
        orig.o.dispose();
        event.event = 'property-modified';
      } else {
        if (!target[name as  string]) {
          target[name as string] = new ReplaySubject(1);
        }
        event.event = 'property-added';
      }
      let property = v;
      if (!(v instanceof Observable)) {
        let f;
        if (!v || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint' || typeof v === 'symbol') {
          f = simpleConst;
        } else if (typeof v === 'function') {
          f = functionAct;
        } else if (typeof v === 'string') {
          try {
            const o = JSON.stringify(v);
            const cl = coerceBaseEngineProperty(o);
            if (cl) {
              f = knownClass(cl);
            } else {
              f = simpleConst;
            }
          } catch (e) {
            f = simpleConst;
          }
        }
        if (!f) {
          const c = coerceBaseEngineProperty(v);
          if (c) {
            f = knownClass(c);
          } else {
            f = simpleConst;
          }
        }
        property = factory(f, this)(v);
      }
      original[name] = {o: property, s: subscription.add(property.subscribe(n => (target[name] as Subject<any>).next(n)))};
      m.eventEmitter.emit(event);
      return true;
    }
  };
}
export interface EngineEnvironment {
  router: Router;
  modelSource: EngineModelService;
}
export interface EngineModel {
  parent: EngineModel;
  environment: EngineEnvironment;
  properties: EngineProperties;
  eventEmitter: EventEmitter<any>;
}

export class SimpleEngineModel implements EngineModel {
  eventEmitter = new EventEmitter<any>();
  properties: EngineProperties;
  url: string;
  constructor(public parent: EngineModel, public environment: EngineEnvironment) {
    this.properties = new Proxy({}, proxyHandler(this));
    this.url = this.environment.router.url;
    this.environment.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd && !e.url.startsWith(this.url)) {
        // this.environment.router.parseUrl(this.url).root.segments[0];
        // @ts-ignore
        this.properties[DISPOSE].subscribe(v => null);
      }
    });
  }
}
const KNOWN_CLASSES = ['StringBuilderAct', 'FunctionAct', 'ActivateRouterAct', 'ListenerAct',
  'RunWebWorkerAct', 'EvalAct', 'SequenceAct', 'ParallelRaceAct', 'ParallelAllAct', 'ConditionalAct',
  'SwitchAct', 'IterateAct', 'HttpAct', 'LoadDynamicPageAct', 'LoadDataSourceAct', 'LoadEngineModelAct'];
function coerceBaseEngineProperty(o: any): any {
  if (typeof o === 'object' &&  KNOWN_CLASSES.includes(o.class)) {
    return o.class;
  }
}
function knownClass(cl: string): EnginePropertyFunc {
  switch (cl) {
    case 'StringBuilderAct':
      return stringBuilder;
    case 'ActivateRouterAct':
      return activateRouterAct;
    case 'ListenerAct':
      return listenerAct;
    case 'RunWebWorkerAct':
      return runWebWorkerAct;
    case 'EvalAct':
      return evalAct;
    case 'SequenceAct':
      return sequenceAct;
    case 'ParallelRaceAct':
      return parallelRaceAct;
    case 'ParallelAllAct':
      return parallelAllAct;
    case 'ConditionalAct':
      return conditionalAct;
    case 'SwitchAct':
      return switchAct;
    case 'IterateAct':
      return iterateAct;
    case 'HttpAct':
      return httpAct;
    case 'LoadDynamicPageAct':
      return loadDynamicPageAct;
    case 'LoadDataSourceAct':
      return loadDataSourceAct;
    case 'LoadEngineModelAct':
      return loadEngineModelAct;
  }
}
type EnginePropertyFunc = (m: EngineModel, v: any) => EngineProperty<any>;
const factory = (f: EnginePropertyFunc, m: EngineModel) => (v) => f(m, v);
const simpleConst = (m: EngineModel, s: any): EngineProperty<any> => new Observable(subscriber => subscriber.next(s));
const stringBuilder = (m: EngineModel, s: any): EngineProperty<any> =>  {
  const keyRg = /\${([a-z][0-9A-Za-z]*)}/g;
  const depends = [];
  let inx = 0;
  let pos = 0;
  do {
    const r = keyRg.exec(s);
    if (!r) {
      break;
    }
    depends[inx++] = of(s.substring(pos, keyRg.lastIndex - r[0].length));
    if (m.properties[r[1]]) {
      depends[inx++] = m.properties[r[1]];
    } else {
      depends[inx++] = of(r[0]);
    }
    pos = keyRg.lastIndex;
  } while (true);
  if (depends.length > 0) {
      if (pos < s.length) {
        depends[inx++] = of(s.substring(pos));
      }
      return combineLatest(depends).pipe(map(d => d.join(''))); // TODO check if is any memory leek there
  } else {
    return of(s);
  }
};
const functionAct = (m: EngineModel, v: any): EngineProperty<any> => new Observable<any>(o => {
  o.next(v(m.properties));
  const subs = m.eventEmitter.subscribe(() => o.next(v(m.properties)));
  return {
    unsubscribe(): void {
      subs.unsubscribe();
    }
  };
});
/**
 * Дозволяє активувати роутер
 * {
 *    commands: 'url' or [],
 *    extras: {
 *        relativeTo?: ActivatedRoute | null
 *        queryParams?: Params | null
 *        fragment?: string
 *        queryParamsHandling?: QueryParamsHandling | null
 *        preserveFragment?: boolean,
 *        skipLocationChange?: boolean
 *        replaceUrl?: boolean
 *        state?: {...}
 *    }
 * }
 */
const activateRouterAct = (m: EngineModel, nav: any): EngineProperty<any> => {
  const command = (nav.command instanceof Observable) ? nav.command : stringBuilder(m, nav.command);
  const extras = (nav.extras instanceof Observable) ? nav.extras : stringBuilder(m, nav.extras);
  return combineLatest([command, extras]).pipe(mergeMap(([c, e]) => fromPromise(m.environment.router.navigate(c as any[], e))));
};

/**
 * Дозволяє підключити поле до системних і внутрішніх евентів, таймер також тут
 * {
 *   target: 'document'|'timer'|'property'|'engine',
 *   event: 'event name',
 *   options?: EventListenerOptions,
 *   property: 'property name'
 * }
 * TODO add throttle, maybe there need to be different listeners
 */
const listenerAct = (m: EngineModel, e: any): EngineProperty<any> => {
  const f = e.property ? (v) => m.properties[e.property] = v : (v) => null;
  switch (e.target) {
    case 'document':
      return fromEvent(document, e.event).pipe(tap(f));
    case 'window':
      return fromEvent(window, e.event).pipe(tap(f));
    case 'timer':
      return timer().pipe(tap(f)); // TODO what is throttle used here?
    case 'engine':
      return m.eventEmitter.pipe(f); // TODO what type of event do I expect here?
  }
};

/**
 * Дозволяє запустити Web Worker process
 * 'property name'
 */
const runWebWorkerAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;

/**
 * Дозволяе вирахувати вираз ${property-name} використовується для отримання значеня від властивості з іменем property-name
 * на момент запиту. $(property-name) додатково підписується на зміни і повідомляє про зміну поля
 * Hello ${userName}, the time is $(currentTime)
 * {
 *   eval: string;
 *   type: string; //optional
 * }
 */
const evalAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;

/**
 * Доволяє описати послідовність дій.
 * Це може бути зміна якоїсь властивості, або виклик властивості:
 * propertyA=Hello world!
 * propertyB=${propertyA}
 * $(propertyC)
 */
const sequenceAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;

/**
 * Формат як у SequenceAct, запуск типу race (очікується - перший завершений)
 */
const parallelRaceAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;
/**
 * Формат як у SequenceAct, запуск типу all (очікується - всі завершені)
 */
const parallelAllAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;

/**
 * if/else/then
 */
const conditionalAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;

/**
 * switch/case
 */
const switchAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;

/**
 * Дозволяє ітерацію
 */
const iterateAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;

/**
 * Дозволяє виконати HTTP запит
 */
const httpAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;

/**
 * Дозволяє отримати данні для динамічної сторінки по ІД
 */
const loadDynamicPageAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;

/**
 * Дозволяє отримати данні для DataSource по ІД
 */
const loadDataSourceAct = (m: EngineModel, v: any): EngineProperty<any> => EMPTY;

/**
 * Дозволяє отримати модель процессу по ІД
 */
const loadEngineModelAct = (m: EngineModel, v: any): EngineProperty<any> => {
  const model = new SimpleEngineModel(m, m.environment);
  // TODO I not sure that would work. This model is linked to router, it one can be linked to m.eventEmitter and windows and document
  return m.environment.modelSource.loadModel(v).pipe(mergeMap(a => {
    for (const p in a) {
      if (a.hasOwnProperty(p)) {
        model.properties[p] = a[p];
      }
    }
    return model.properties.index;
  }), mergeMap(() => new Observable(n => n.next(model))));
};
