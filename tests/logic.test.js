import { test } from "node:test";
import assert from "node:assert/strict";
import { timeToMinutes } from "../logic.js";

test("timeToMinutes converts time to minutes since midnight", () => {
  assert.equal(timeToMinutes("08:25"), 505);
});