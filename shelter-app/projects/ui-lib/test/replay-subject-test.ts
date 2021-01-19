import {BehaviorSubject, ReplaySubject, Subscription} from 'rxjs';

// const subject = new ReplaySubject(5); // buffer size is 5
const subject = new BehaviorSubject('begin');
const subscription = new Subscription();

function trigger(something): void {
  subject.next(something);
}

subscription.add(subject.subscribe((x) => console.log('a: ' + x)));

trigger('TEST');

const tmpSubscription = subject.subscribe((x) => console.log('b: ' + x));


trigger('TEST2');

tmpSubscription.unsubscribe();

trigger('TEST3');

subscription.add(subject.subscribe((x) => console.log('c: ' + x)));

for (let i = 0; i < 1000; i++) {
  subscription.add(subject.subscribe((x) => console.log(`subscriber-${i}: ` + x)));
}

trigger('TEST4');

subscription.unsubscribe();

trigger('TEST5');

subscription.add(subject.subscribe((x) => console.log('d: ' + x)));

