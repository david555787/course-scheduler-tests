export function timeToMinutes(hhmm) {
  return Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
}

export function formatTime(hhmm) {
  const hour = Number(hhmm.slice(0, 2));
  return (hour % 12) + ":" + hhmm.slice(3, 5) + (hour < 12 ? " AM" : " PM");
}

export function findConflict(candidate, courses) {
  const startMinutes = timeToMinutes(candidate.start);
  const endMinutes = timeToMinutes(candidate.end);

  for (const course of courses) {
    let sharesADay = false;
    for (const day of candidate.days) {
      if (course.days.includes(day)) {
        sharesADay = true;
      }
    }
    if (!sharesADay) {
      continue;
    }

    const otherStart = timeToMinutes(course.start);
    const otherEnd = timeToMinutes(course.end);

    if (startMinutes <= otherEnd && otherStart <= endMinutes) {
      return course;
    }
  }

  return null;
}

export function summarizeUnits(courses, limit) {
  let total = 0;
  for (const course of courses) {
    total += course.units;
  }
  const over = total > limit;

  return { total: total, over: over };
}

export function filterCourses(courses, query) {
  query = query.trim().toLowerCase();

  return courses.filter(function (course) {
    const haystack = (course.number + " " + course.name).toLowerCase();
    if (query && !haystack.includes(query)) {
      return false;
    }
    return true;
  });
}
