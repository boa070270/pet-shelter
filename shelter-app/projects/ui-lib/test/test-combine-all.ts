import {fromEvent, generate, interval} from 'rxjs';
import { map, combineAll, take } from 'rxjs/operators';

const clicks = generate(0, x => x < 10, x => x + 1);
const higherOrder = clicks.pipe(
   map(ev =>
      interval(Math.random() * 2000).pipe(take(3))
   ),
   take(2)
);
const result = higherOrder.pipe(
   combineAll()
);

result.subscribe(x => console.log(x));
