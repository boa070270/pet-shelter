import {ListRange} from '@angular/cdk/collections';

export function equals(lst1: ListRange, lst2: ListRange): boolean {
  return lst1.start === lst2.start && lst1.end === lst2.end;
}
/**
 * check is no intersect and no connect
 * @param lst1: ListRange
 * @param lst2: ListRange
 */
export function noIntersect(lst1: ListRange, lst2: ListRange): boolean {
  return lst1.start > lst2.end || lst1.end < lst2.start;
}
/**
 * returns array of ListRange that intersect with lst
 * @param lst: ListRange
 * @param lists: ListRange[]
 */
export function include(lst: ListRange, lists: ListRange[]): ListRange[] {
  return lists.filter(lr => !noIntersect(lr, lst));
}

/**
 * returns collections of absent and present ListRange's that can be united to one lst
 * @param lst: ListRange
 * @param lists: ListRange[]
 */
export function sortOut(lst: ListRange, lists: ListRange[]): {absent: ListRange[], present: ListRange[]} {
  const present = include(lst, lists).sort((a, b) => a.start - b.start);
  const absent: ListRange[] = [];
  if (present.length > 0) {
    let start = lst.start;
    for (const l of present) {
      if (start < l.start) {
        absent.push({start, end: l.start});
      }
      start = l.end;
    }
    if (start < lst.end) {
      absent.push({start, end: lst.end});
    }
  } else {
    absent.push(lst);
  }
  return {absent, present};
}