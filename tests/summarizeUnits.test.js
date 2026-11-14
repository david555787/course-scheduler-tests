import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeUnits } from "../logic.js";

test("summarizeUnits reports zero total for an empty course list", () => {
  assert.deepEqual(summarizeUnits([], 54), { total: 0, over: false });
});

test("summarizeUnits includes every course in the total", () => {
  const courses = [{ units: 12 }, { units: 9 }, { units: 6 }];

  assert.deepEqual(summarizeUnits(courses, 54), { total: 27, over: false });
});

test("summarizeUnits does not mark a total exactly at the limit as over", () => {
  const courses = [{ units: 18 }, { units: 18 }, { units: 18 }];

  assert.deepEqual(summarizeUnits(courses, 54), { total: 54, over: false });
});

test("summarizeUnits marks a total above the limit as over", () => {
  const courses = [{ units: 30 }, { units: 25 }];

  assert.deepEqual(summarizeUnits(courses, 54), { total: 55, over: true });
});

test("summarizeUnits respects a limit other than 54", () => {
  const courses = [{ units: 6 }, { units: 5 }];

  assert.deepEqual(summarizeUnits(courses, 10), { total: 11, over: true });
});

test("summarizeUnits handles fractional and zero-unit courses", () => {
  const courses = [{ units: 4 }, { units: 5.5 }, { units: 0 }];

  assert.deepEqual(summarizeUnits(courses, 10), { total: 9.5, over: false });
});
