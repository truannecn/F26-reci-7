import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// A first attempt at a generator. It has a problem: run the tests and read
// the counterexample.
const interval: fc.Arbitrary<Interval> = fc.tuple(fc.integer(), fc.integer({min: 0, max: 100})).map(([start, length]): Interval => [start, start+length]);
const intervalList = fc.array(interval);
const disjointIntervals: fc.Arbitrary<Interval[]> = fc
  .array(fc.integer({ min: 0, max: 100 }))
  .map(lengths => {
    let start = 0;

    return lengths.map((length): Interval => {
      const end = start + length;
      const interval: Interval = [start, end];
      start = end + 1; // Next interval starts strictly after this one ends.
      return interval;
    });
  });

  const touchingIntervals: fc.Arbitrary<Interval[]> = fc
  .tuple(
    fc.integer(),
    fc.integer({min:1, max:100}),
    fc.integer({min:1, max:100}),
  )
  .map(([start, length1, length2]): Interval[] => {
    const shared = start + length1;

    return [
      [start, shared],
      [shared, shared + length2],
    ];
  });

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });


  // Add your properties here. Aim for at least one of each pattern:
  // invariant, algebraic, metamorphic, differential, conditional.

  // Pattern: invariant. The output is sorted.
  it('the output is sorted', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        for (let i = 0; i < out.length - 1; i++) {
          const [a, b] = out[i];
          const [c, d] = out[i + 1];
          expect(b).toBeLessThan(c);
        }
      }),
    );
  });

  // Pattern: differential, merging intervals preserve which points they cover
  it('merging intervals preserve which points they cover', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const isCovered = (intervals: Interval[], p: number): boolean =>
          intervals.some(([start, end]) => start <= p && p <= end);
        const out = mergeIntervals(xs);

        for (let p = -10; p <= 110; p += 0.5) {
          expect(isCovered(out, p)).toBe(isCovered(xs, p));
        }

      }),
    );
  });
  
  // Pattern: Metamorphic, changes to the input that don't change the covered points don't change the output
  it('input order does not affect the result', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const reversed = [...xs].reverse();

        expect(mergeIntervals(xs)).toEqual(mergeIntervals(reversed));
      }),
    );
  });

  // Pattern: Algebraic. Merging twice gives the same result as merging once.
  it('merging twice gives the same result as merging once', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const once = mergeIntervals(xs);
        const twice = mergeIntervals(once);

        expect(twice).toEqual(once);
      }),
    );
  });

  // Pattern: Conditional. If the inputs don't overlap, the output is the same as the input.
  it('if the inputs do not overlap, the output is the same as the input', () => {
    fc.assert(
      fc.property(disjointIntervals, xs => {
        expect(mergeIntervals(xs)).toEqual(xs);
      }),
    );
  });

  // Pattern: Conditional. Two intervals that touch are merged into one
  it('merges touching intervals into one', () => {
    fc.assert(
      fc.property(touchingIntervals, xs => {
        expect(mergeIntervals(xs)).toEqual([
          [xs[0][0], xs[1][1]],
        ]);
      }),
    );
  });

  // Pattern: invarinant. Mergine does not modify the input.
  it('does not modify the input', () => {
    fc.assert(
      fc.property(touchingIntervals, xs => {
        const before = structuredClone(xs);
        mergeIntervals(xs);
        expect(xs).toEqual(before);
      }),
    );
    });
});
