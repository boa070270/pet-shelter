import {ObservableWithRefresh} from '../src/lib/ui-types';
import {generate, merge} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {fromArray} from 'rxjs/internal/observable/fromArray';

class TestObservableWithRefresh extends ObservableWithRefresh<number> {
  start = 1;
  refresh(): void {
    this.newSource(generate(this.start++, x => x < 10, x => x + 2).pipe(toArray()));
  }
}

const observable = new TestObservableWithRefresh(generate(0, x => x < 10, x => x + 1).pipe(toArray()));

console.log('log of first generator with A');
const subs1 = observable.subscribe(next => { console.log('A', next); } );
console.log('log of first generator with B');
const subs2 = observable.subscribe(next => { console.log('B', next); } );
console.log('log of second generator with A abd B');
observable.refresh();
subs1.unsubscribe();
console.log('log of third generator with B');
observable.refresh();
subs2.unsubscribe();
console.log('there are no any subscriber so no log');
observable.refresh();
console.log('subscribe C subscriber and log of fourth generator');
const subs3 = observable.subscribe(next => { console.log('C', next); } );
console.log('subscribe D subscriber and log of fourth generator');
const subs4 = observable.subscribe(next => { console.log('D', next); } );
subs3.unsubscribe();
subs4.unsubscribe();
console.log('=================');
enum Color {
  red= 'Red', black = 'Black'
}

for (const value of Object.getOwnPropertyNames(Color)) {
  console.log('Value:', value);
  console.log(value === Color.red);
  console.log(typeof value);
}
console.log('typeof Color.red:', typeof Color.red);

const from1 = fromArray([true]);
const merge1 = merge(from1, generate(0, x => x < 5, x => x + 1));
const merge2 = merge(from1, generate(0, x => x < 5, x => x + 1));
const merge3 = merge(merge1, merge2);
merge1.subscribe(x => console.log('merge1', x));
merge2.subscribe(x => console.log('merge2', x));
merge3.subscribe(x => console.log('merge3', x));

enum E {
  one, two
}

console.log(E.one);
console.log(E['one']);

function asEnum<T>(v: any, e: any): T {
  if (e[v] !== undefined) {
    return e[v];
  }
  return null;
}
interface III {
  f: E;
}
console.log(asEnum(1, E));
const iii: III = {
  f: asEnum<E>(1, E)
};
console.log(iii);
const iii2: III = {
  f: asEnum<E>(undefined, E)
};
console.log(iii2);
const iii3: III = {
  f: asEnum<E>(null, E)
};
console.log(iii3);
