import { test } from "node:test";
import assert from "node:assert/strict";
import { filterCourses } from "../logic.js";

const courses = [
  {
    number: "CS 101",
    name: "Programming Foundations",
    units: 12,
    days: ["M", "W"],
    start: "09:00",
    end: "10:00",
  },
  {
    number: "MATH 220",
    name: "Discrete Mathematics",
    units: 9,
    days: ["T", "R"],
    start: "11:00",
    end: "12:00",
  },
];

test("filterCourses returns every course for an empty query", () => {
  assert.deepEqual(filterCourses(courses, ""), courses);
});

test("filterCourses matches course numbers case-insensitively", () => {
  assert.deepEqual(filterCourses(courses, "cs 101"), [courses[0]]);
});

test("filterCourses matches course titles case-insensitively", () => {
  assert.deepEqual(filterCourses(courses, "dIsCrEtE"), [courses[1]]);
});

test("filterCourses ignores surrounding whitespace in a query", () => {
  assert.deepEqual(filterCourses(courses, "  cs 101  "), [courses[0]]);
});

test("filterCourses returns an empty array when nothing matches", () => {
  assert.deepEqual(filterCourses(courses, "biology"), []);
});

test("filterCourses returns an empty array when searching an empty course list", () => {
  assert.deepEqual(filterCourses([], "cs"), []);
});
