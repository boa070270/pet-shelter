import {combineLatest, EMPTY, Observable, of, timer} from 'rxjs';
import {delay, map, startWith} from 'rxjs/operators';
import {EngineProperties} from "./engine-model";

const partner = new Observable((s) => {
  s.next('World');
});
const currentTime = timer(1000).pipe(map(() => new Date()));
const nCalls = new Observable((n) => {
  let calls = 0;
  const subs = currentTime.subscribe(() => {
    n.next(++calls);
  });
  return {
    unsubscribe: () => {
      subs.unsubscribe();
    }
  };
});
const PROPS = {
  partner, currentTime, nCalls, timer: timer(0, 1000)
};
const curry = (fn, x) => (y) => fn(x, y);
const add = (x: Observable<any>, y: Observable<any>) => {
  return combineLatest([x, y]).pipe(
    map(([w, h]) => w + h ),
  );
};
const sub = (x: Observable<any>, y: Observable<any>) => {
  return combineLatest([x, y]).pipe(
    map(([w, h]) => w - h ),
  );
};
const div = (x: Observable<any>, y: Observable<any>) => {
  return combineLatest([x, y]).pipe(
    map(([w, h]) => w / h ),
  );
};
const mul = (x: Observable<any>, y: Observable<any>) => {
  return combineLatest([x, y]).pipe(
    map(([w, h]) => w * h ),
  );
};

const simpleObs = (x) => new Observable((n) => n.next(x));
export function calculate(s = 'Hello ${partner}, current time is ${currentTime}. You ask ${nCalls} times. ${timer}'): Observable<any> {
  const keyRg = /\${([a-z][0-9A-Za-z]*)}/g;
  const depends = []; let inx = 0; let pos = 0;
  do {
    const r = keyRg.exec(s);
    if (!r) {
      break;
    }
    depends[inx++] = of(s.substring(pos, keyRg.lastIndex - r[0].length));
    if (PROPS[r[1]]) {
      depends[inx++] = PROPS[r[1]];
    } else {
      depends[inx++] = of(r[0]);
    }
    pos = keyRg.lastIndex;
  } while (true);
  if (depends.length > 0) {
    if (pos < s.length) {
      depends[inx++] = of(s.substring(pos));
    }
    return combineLatest(depends).pipe(map(d => d.join('')));
  } else {
    return  of(s);
  }
}
const prop: EngineProperties = new Proxy({}, {
  get(target: {}, p: PropertyKey, receiver: any): any {
    console.log(`GET target:${target}, p:${String(p)}, receiver:${receiver}`);
    return true;
  },
  set(target: {}, p: PropertyKey, value: any, receiver: any): boolean {
    console.log(`SET target:${target}, p:${String(p)}, receiver:${receiver}`);
    return true;
  }
});
calculate().subscribe(value => console.log(value));
calculate().subscribe(value => console.log(value));
prop.one = EMPTY;
prop[1] = EMPTY;
prop.one.subscribe(v => console.log(v));
prop[1].subscribe(v => console.log(v));
