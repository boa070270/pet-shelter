/**
 * choiceFormat - return formatted string. The principle is like java.text.ChoiceFormat
 * Rules:
 * some text {0} as number and we want that number with correct plural form {0,0# seconds|1# second|(1..)# seconds}
 * {n} - inserts params[n]
 * {n,choice|choice|choice} - insert n with choice string, the choice format next:
 * condition#string - where condition can be:
 *    n# - define equal value
 *    (x..y) - range with exclusive borders
 *    [x..y] - range with inclusive borders
 *    Ranges can be (x..y] and [x..y), also range can be defined only with one border (..4]
 * e.g. "It was {0,(..0]-th years|1# year|(1..)-th} ago" wile translated as:
 * 0 : It was 0-th years ago
 * 1 : It was 1 year ago
 * 5 : It was 5-th years ago
 * something like this
 * @param str formatted string
 * @param params - parameters
 */
export function choiceFormat(str: string, ...params: any[]): string {
  return str.replace(/\{\d*.*\}/g, (s: string) => {
    const [num, choices] = s.substring(1, s.length - 1).split(',');
    // @ts-ignore
    const param = num * 1;
    if (!isNaN(param) && params[param] !== undefined) {
      const parameter = trParam(params[param]);
      if (choices) {
        const choice = choices.split('|');
        for (const ch of choice) {
          let res;
          if (ch.startsWith('[') || ch.startsWith('(')) {
            res = parseRangeChoice(parameter, ch);
          } else {
            const i = ch.indexOf('#');
            if (i > 0) {
              // tslint:disable-next-line:triple-equals
              if (parameter == ch.substring(0, i)) {
                res = parameter + ch.substring(i + 1);
              }
            } else if (parameter === '') {
              res = ch.substring(1);
            }
          }
          if (res) {
            return res;
          }
        }
      }
      return parameter;
    }
    return '';
  });
}
function trParam(p: any): any {
  if (typeof p === 'object') {
    if (p === null) {
      return 'null';
    }
    if (p instanceof Error) {
      return `${p.name}: ${p.message}.\n${p.stack}`;
    }
    return JSON.stringify(p);
  }
  if (typeof p === 'function') {
    return `function ${p.name}`;
  }
  return p;
}
function parseRangeChoice(parameter: string, choice: string): string {
  const i = choice.search(/[\]\)]/);
  if (i >= 0) {
    const cond = choice.substring(1, i);
    const d = cond.search('..');
    if (d >= 0) {
      const [left, right] = cond.split('..');
      let condinion;
      // @ts-ignore
      if (!isNaN(parameter * 1)) {
        // checks as number
        // @ts-ignore
        // tslint:disable-next-line:max-line-length
        const {pn, ln, rn} = {pn: parameter * 1, ln: left ? left * 1 : Number.MIN_SAFE_INTEGER, rn: right ? right * 1 : Number.MAX_SAFE_INTEGER};
        condinion =
          ((pn >= ln && choice.charAt(0) === '[') || (pn > ln && choice.charAt(0) === '('))
          &&
          ((pn <= rn && choice.charAt(i) === ']') || (pn < rn && choice.charAt(i) === ')'));

      } else {
        condinion =
          // tslint:disable-next-line:max-line-length
          ((left === '' && choice.charAt(0) === '(') || (parameter >= left && choice.charAt(0) === '[') || (parameter > left && choice.charAt(0) === '('))
          &&
          // tslint:disable-next-line:max-line-length
          ((right === '' && choice.charAt(i) === ')') || (parameter <= right && choice.charAt(i) === ']') || (parameter < right && choice.charAt(i) === ')'));
      }
      if (condinion) {
        return parameter + choice.substring(i + 1);
      }
    }
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Provide methods for scheduling the execution of a callback.
 */
export const scheduler = {
  /**
   * Schedule a callback to be called after some delay.
   *
   * Returns a function that when executed will cancel the scheduled function.
   */
  schedule(taskFn: () => void, delay: number): () => void {
    const id = setTimeout(taskFn, delay);
    return () => clearTimeout(id);
  },

  /**
   * Schedule a callback to be called before the next render.
   * (If `window.requestAnimationFrame()` is not available, use `scheduler.schedule()` instead.)
   *
   * Returns a function that when executed will cancel the scheduled function.
   */
  scheduleBeforeRender(taskFn: () => void): () => void {
    // TODO(gkalpak): Implement a better way of accessing `requestAnimationFrame()`
    //                (e.g. accounting for vendor prefix, SSR-compatibility, etc).
    if (typeof window === 'undefined') {
      // For SSR just schedule immediately.
      return scheduler.schedule(taskFn, 0);
    }

    if (typeof window.requestAnimationFrame === 'undefined') {
      const frameMs = 16;
      return scheduler.schedule(taskFn, frameMs);
    }

    const id = window.requestAnimationFrame(taskFn);
    return () => window.cancelAnimationFrame(id);
  },
};

/**
 * Convert a camelCased string to kebab-cased.
 */
export function camelToDashCase(input: string): string {
  return input.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
}

/**
 * Convert a kebab-cased string to camelCased.
 */
export function kebabToCamelCase(input: string): string {
  return input.replace(/-([a-z\d])/g, (_, char) => char.toUpperCase());
}

export function CombineProperty(target: any, propertyKey: string, descriptor: PropertyDescriptor): any {

}
