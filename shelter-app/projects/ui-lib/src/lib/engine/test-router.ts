import {DefaultUrlSerializer} from '@angular/router';

const dus = new DefaultUrlSerializer();
const tree = dus.parse('/team/33/(user/victor//support:help)?debug=true#fragment');
console.log(tree);
