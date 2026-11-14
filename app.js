// Schedule Planner
//
// This entire project was written by Claude, Anthropic's AI model, with very little human
// oversight. The course staff chose to generate it that way and to say so openly, rather
// than quietly passing it off as hand-written. Read it the way you should read any code you
// did not write yourself: carefully, and without assuming it is correct.
//
// The sample course data below is invented. The course numbers are real; the units, meeting
// times, and days are not.

import { timeToMinutes, formatTime, findConflict, summarizeUnits, filterCourses } from "./logic.js";

const DAYS = ["M", "T", "W", "R", "F"];
const DAY_NAMES = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri" };

const FIRST_HOUR = 8;
const LAST_HOUR = 20;
const HOUR_PX = 46;
const UNIT_LIMIT = 54;

let courses = [
  { number: "15-113", name: "Effective Coding with AI",    units: 9,  days: ["M", "W"],      start: "09:00", end: "10:20" },
  { number: "21-120", name: "Differential Calculus",       units: 10, days: ["M", "W", "F"], start: "10:30", end: "11:50" },
  { number: "76-101", name: "Interpretation and Argument", units: 9,  days: ["T", "R"],      start: "13:30", end: "14:50" },
  { number: "15-122", name: "Imperative Computation",      units: 12, days: ["T", "R"],      start: "15:00", end: "16:20" }
];

function addCourse() {
  const number = document.getElementById("number").value.trim();
  const name = document.getElementById("name").value.trim();
  const units = parseInt(document.getElementById("units").value);
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  const days = [];
  document.querySelectorAll(".day").forEach(function (box) {
    if (box.checked) {
      days.push(box.value);
    }
  });

  const message = document.getElementById("message");

  if (!number || !name) {
    message.textContent = "Course number and title are both required.";
    message.className = "message error";
    return;
  }

  if (days.length === 0) {
    message.textContent = "Pick at least one meeting day.";
    message.className = "message error";
    return;
  }

  // turn "09:00" into minutes since midnight so times can be compared
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (endMinutes <= startMinutes) {
    message.textContent = "The end time has to be after the start time.";
    message.className = "message error";
    return;
  }

  // look for a course on a shared day whose meeting time overlaps this one
  const conflict = findConflict({ days: days, start: start, end: end }, courses);
  if (conflict) {
    message.textContent = "That conflicts with " + conflict.number + " (" + conflict.name + ").";
    message.className = "message error";
    return;
  }

  courses.push({ number: number, name: name, units: units, days: days, start: start, end: end });

  document.getElementById("number").value = "";
  document.getElementById("name").value = "";
  document.getElementById("units").value = "";
  document.querySelectorAll(".day").forEach(function (box) {
    box.checked = false;
  });

  message.textContent = "Added " + number + ".";
  message.className = "message ok";
  render();
}

function removeCourse(index) {
  courses.splice(index, 1);
  document.getElementById("message").textContent = "";
  render();
}

function render() {
  const query = document.getElementById("search").value.trim().toLowerCase();

  const unitSummary = summarizeUnits(courses, UNIT_LIMIT);
  const total = unitSummary.total;
  const over = unitSummary.over;

  const shown = renderRoster(query);
  renderWeek();

  document.getElementById("stats").innerHTML =
    '<span class="' + (over ? "over" : "") + '">' + total + " units</span> &middot; " +
    courses.length + (courses.length === 1 ? " course" : " courses");

  let summary = shown + " of " + courses.length + " shown.";
  if (over) {
    summary += ' <span class="over">Over the ' + UNIT_LIMIT + " unit limit, so this needs approval.</span>";
  }
  document.getElementById("summary").innerHTML = summary;
}

function renderRoster(query) {
  const rows = document.getElementById("rows");
  rows.innerHTML = "";
  let shown = 0;
  const matchingCourses = filterCourses(courses, query);

  courses.forEach(function (course, index) {
    if (!matchingCourses.includes(course)) {
      return;
    }
    shown++;

    // show "14:50" to the user as "2:50 PM"
    const startLabel = formatTime(course.start);
    const endLabel = formatTime(course.end);

    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + course.number + "</td>" +
      "<td>" + course.name + "</td>" +
      '<td class="num">' + course.units + "</td>" +
      '<td class="days">' + course.days.join("") + "</td>" +
      '<td class="time">' + startLabel + " to " + endLabel + "</td>" +
      '<td class="actions"><button class="btn-remove" title="Remove ' + course.number +
      '" data-index="' + index + '">&times;</button></td>';
    rows.appendChild(tr);
  });

  if (shown === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td class="empty" colspan="6">' +
      (courses.length === 0 ? "No courses yet. Add one to see your week."
                            : "No courses match that filter.") + "</td>";
    rows.appendChild(tr);
  }

  return shown;
}

function renderWeek() {
  const columnHeight = (LAST_HOUR - FIRST_HOUR + 1) * HOUR_PX;

  let head = '<div class="week-head"><div></div>';
  for (const day of DAYS) {
    head += "<div>" + DAY_NAMES[day] + "</div>";
  }
  head += "</div>";

  let gutter = '<div class="week-gutter">';
  for (let hour = FIRST_HOUR; hour <= LAST_HOUR; hour++) {
    gutter += '<div class="hour">' + (((hour + 11) % 12) + 1) + (hour < 12 ? " am" : " pm") + "</div>";
  }
  gutter += "</div>";

  let columns = "";
  DAYS.forEach(function (day) {
    columns += '<div class="week-col" style="height:' + columnHeight + 'px">';

    courses.forEach(function (course, index) {
      if (!course.days.includes(day)) {
        return;
      }

      const startMinutes = timeToMinutes(course.start);
      const endMinutes = timeToMinutes(course.end);

      const top = Math.max(0, ((startMinutes - FIRST_HOUR * 60) / 60) * HOUR_PX);
      const height = Math.max(22, ((endMinutes - startMinutes) / 60) * HOUR_PX - 2);

      // show "14:50" to the user as "2:50 PM"
      const startLabel = formatTime(course.start);

      columns +=
        '<div class="block tint-' + ((index % 5) + 1) + '" style="top:' + top + "px;height:" + height + 'px">' +
        '<span class="b-num">' + course.number + "</span>" +
        '<span class="b-time">' + startLabel + "</span>" +
        "</div>";
    });

    columns += "</div>";
  });

  document.getElementById("grid").innerHTML = head + '<div class="week-body">' + gutter + columns + "</div>";
}

document.getElementById("add-course").addEventListener("click", addCourse);
document.getElementById("search").addEventListener("input", render);
document.getElementById("rows").addEventListener("click", function (event) {
  const button = event.target.closest(".btn-remove");
  if (button) {
    removeCourse(Number(button.dataset.index));
  }
});
render();
