import { test } from "node:test";
import assert from "node:assert/strict";
import { findConflict } from "../logic.js";

const courses = [
  {
    number: "CS 101",
    name: "Foundations",
    units: 12,
    days: ["M", "W"],
    start: "09:00",
    end: "10:00",
  },
  {
    number: "CS 202",
    name: "Data Structures",
    units: 12,
    days: ["W", "F"],
    start: "09:30",
    end: "10:30",
  },
];

test("findConflict returns an overlapping course on a shared day", () => {
  const candidate = { days: ["M"], start: "09:30", end: "10:30" };

  assert.deepEqual(findConflict(candidate, courses), courses[0]);
});

test("findConflict returns the first course when several courses overlap", () => {
  const candidate = { days: ["W"], start: "09:45", end: "09:50" };

  assert.deepEqual(findConflict(candidate, courses), courses[0]);
});

test("findConflict returns null for back-to-back meetings", () => {
  const candidate = { days: ["M"], start: "10:00", end: "11:00" };

  assert.equal(findConflict(candidate, courses), null);
});

test("findConflict returns null for overlapping times on different days", () => {
  const candidate = { days: ["T"], start: "09:30", end: "09:45" };

  assert.equal(findConflict(candidate, courses), null);
});

test("findConflict returns null when there are no existing courses", () => {
  const candidate = { days: [], start: "09:00", end: "10:00" };

  assert.equal(findConflict(candidate, []), null);
});
