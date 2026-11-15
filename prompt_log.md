# Prompt Log

Important, non-trivial prompts, verbatim, with the tool and model used and what each was used for.

Note: the prompts below were drafted with help from Claude (claude.ai chat), then given to Codex. Codex ran them.

## Entry 1: Read-only reconnaissance
- Tool: Codex desktop app (local, Ask for approval)
- Model: 5.6 Sol, Medium
- Purpose: Understand the structure of the example project and find logic that could be pulled out of the page, without changing any files.
- Prompt:

~~~~
This is a small static web app (index.html, styles.css, app.js, README.md), the course "Schedule Planner". I'm writing a test suite for it for a class assignment. This step is READ-ONLY RECONNAISSANCE ONLY.\
\
STRICT RULES:\
\- Do NOT modify, create, move, rename, or delete any file.\
\- Do NOT run git add, commit, stash, restore, or checkout.\
\- Do NOT install packages.\
\- Do NOT fix anything. Also do NOT tell me which behaviors you think are bugs: I want to discover those through my own tests. Describe what the code does, not whether it is right.\
\- Use \`git --no-pager\` for all git commands.\
\
Report, concisely:\
1\. File tree with line counts, plus \`node -v\`.\
2\. A summary of README.md: what the app is supposed to do, and any rules it states (validation, units, conflicts, time format, filtering).\
3\. index.html: every inline event attribute (onclick, onchange, oninput, etc.) with line numbers, and how app.js is loaded (plain script tag or module).\
4\. For every function in app.js: its name, what it computes or does in one sentence, whether it touches the DOM (document, innerHTML, getElementById, etc.), and what global or module-level state it reads or writes.\
5\. Any code in app.js that runs at load time (top-level statements), and whether the app persists state (localStorage etc.).\
6\. Any use of require() or module.exports anywhere.\
7\. Pure-logic candidates: the pieces of real logic (validation, time parsing/formatting, conflict detection, unit totals, filtering/search, week-grid positioning, sorting, etc.) that are currently tangled with DOM code in app.js. For each, give: the lines it lives in, the inputs it would take and the value it would return if it were a pure function, and the boundaries it has (e.g. comparisons, ranges, empty input, parsing edge cases) described neutrally without saying whether they are handled correctly.\
8\. Generated HTML in app.js that contains inline handlers (like onclick), with line numbers.\
\
Do not make recommendations or edits yet.\
~~~~

## Entry 2: Extract logic into logic.js
- Tool: Codex desktop app (local, Ask for approval)
- Model: 5.6 Sol, Medium
- Purpose: Mechanical refactor moving five pure functions into logic.js and replacing inline handlers with addEventListener, with no behavior change.
- Prompt:

~~~~
We are in the repo course-scheduler (static web app: index.html, styles.css, app.js, README.md). This is a MECHANICAL REFACTOR for a class assignment on testing. Move pure logic out of app.js into a new ES module so tests can call it. The app's behavior must stay EXACTLY the same, including any quirks.\
\
STRICT RULES:\
\- Do NOT fix bugs, "improve" code, or change any behavior, validation order, or message text, even if something looks wrong or inconsistent with README.md. I want to discover problems through my own tests later. Do not tell me what you think is wrong.\
\- Do NOT edit styles.css, README.md, or .gitignore. Do NOT create tests. Do NOT touch prompt_log.md.\
\- Do NOT run git add, commit, stash, restore, or checkout. I will commit myself.\
\- Do NOT install packages or add dependencies.\
\- Keep the diff as small as possible. Do not reformat or reorder unrelated code.\
\
Task:\
1\. Create package.json at the repo root containing exactly: { "type": "module" }\
2\. Create logic.js at the repo root. It must have no DOM access (no document, window, innerHTML) and no imports. It exports these pure functions, each with the SAME logic as the current code in app.js (copy the existing expressions, do not rewrite them):\
&#x20;  a. timeToMinutes(hhmm): "HH:MM" string to minutes since midnight, using the same character-position parsing as app.js currently uses.\
&#x20;  b. formatTime(hhmm): the same 12-hour AM/PM label logic currently at app.js lines \~141-145 and \~200-202. Same output format as now.\
&#x20;  c. findConflict(candidate, courses): candidate is { days: [...], start: "HH:MM", end: "HH:MM" }; returns the FIRST existing course that conflicts, or null. Use exactly the same shared-day check and exactly the same overlap comparison as app.js lines \~64-84, including the same comparison operators and the same iteration order.\
&#x20;  d. summarizeUnits(courses, limit): returns { total, over } using exactly the same total and over-limit logic as app.js lines \~109-114 (same operator for "over").\
&#x20;  e. filterCourses(courses, query): returns the courses matching the query using exactly the same matching logic as app.js lines \~134-139. It must apply trim().toLowerCase() to the query itself (applying it again to an already-normalized query is harmless).\
3\. Update app.js:\
&#x20;  \- Import those functions from "./logic.js" and replace the duplicated inline logic with calls, keeping the surrounding validation order, messages, and DOM code unchanged. addCourse still builds the candidate from the form and shows the same message with the same text when a conflict is found; the conflict check stays in the same position in the validation sequence.\
&#x20;  \- Keep the courses array, constants (DAYS, DAY_NAMES, FIRST_HOUR, LAST_HOUR, HOUR_PX, UNIT_LIMIT) and all DOM-rendering code in app.js. Pass UNIT_LIMIT into summarizeUnits.\
&#x20;  \- Module scripts do not create globals, so remove the need for inline handlers: add a call to render() at the bottom of app.js (replacing index.html's inline \<script>render();\</script>), attach the Add button handler and the search input handler with addEventListener (add an id to the button in index.html only if it has none), and replace the generated inline onclick="removeCourse(INDEX)" with a data-index attribute plus one delegated click listener on the table body (#rows) that calls removeCourse with the same index. The result must behave identically for the user.\
4\. Update index.html: change app.js to \<script type="module" src="app.js">\</script>, remove the inline onclick/oninput attributes and the inline render() script. Change nothing else.\
5\. Verify without a browser as far as you can: run \`node --check logic.js\` and \`node --check app.js\`, then run a throwaway script that imports logic.js and calls each exported function with a few ordinary inputs to confirm it loads and returns values. Do NOT save that script in the repo (put it in /tmp or run it inline).\
6\. Report:\
&#x20;  \- \`git --no-pager status -sb\` and \`git --no-pager diff --stat\`\
&#x20;  \- the full \`git --no-pager diff\` for app.js and index.html, plus the full contents of logic.js and package.json\
&#x20;  \- for each of the 5 functions, the exact old lines it replaced\
&#x20;  \- any inline handler, onclick, or global reference to app.js functions that still remains anywhere\
&#x20;  \- anything you were tempted to change but did not\
~~~~

## Entry 3: Add tests from my own specification
- Tool: Codex desktop app (local, Ask for approval)
- Model: 5.6 Sol, Medium
- Purpose: Write tests for five functions in logic.js, with expected values taken from the README rules and my own written list (not from the code), asked to include boundary and error cases. I wrote the first test (timeToMinutes) by hand before this step. The list inside the prompt is my own, translated to English.
- Prompt:

~~~~
We are in the repo course-scheduler. The logic lives in logic.js (exports timeToMinutes, formatTime, findConflict, summarizeUnits, filterCourses). I already wrote one test by hand in tests/logic.test.js. This step: add more tests using Node's built-in test runner (node:test and node:assert/strict, no packages).\
\
STRICT RULES:\
\- Create new test files only under tests/. Do NOT modify tests/logic.test.js, logic.js, app.js, index.html, README.md, package.json, or any other file. Do NOT create prompt_log.md.\
\- Write the expected values from the SPECIFICATION BELOW (README rules and my list), NOT from what logic.js currently returns. Do not read logic.js to decide what the expected value should be.\
\- If a test fails when you run it, do NOT change the test to match the code, do NOT delete or skip it, and do NOT change logic.js. Leave it failing and report it to me.\
\- Do NOT run git add, commit, stash, restore, or checkout. I will commit myself.\
\- Every test needs a descriptive name and at least one assertion that checks an exact value (assert.equal or assert.deepEqual). Do not write tests whose only assertion is that something is not null or did not throw.\
\- Explicitly cover boundary cases and error/odd-input cases for each function, not only the obvious case. Put each function's tests in its own file, e.g. tests/formatTime.test.js.\
\
Interfaces (inputs and return types only):\
\- timeToMinutes(hhmm) takes a "HH:MM" string and returns a number.\
\- formatTime(hhmm) takes a "HH:MM" string and returns a string such as "2:50 PM".\
\- findConflict(candidate, courses) takes candidate = { days: ["M", "W"], start: "HH:MM", end: "HH:MM" } and an array of courses shaped { number, name, units, days, start, end }. It returns the FIRST existing course that conflicts, or null when there is no conflict.\
\- summarizeUnits(courses, limit) returns { total, over } where total is a number and over is a boolean.\
\- filterCourses(courses, query) returns an array of the matching course objects.\
\
README rules (the specification):\
\- Times use "HH:MM" internally and 12-hour AM/PM labels for display. Standard 12-hour clock convention applies: midnight is shown as 12:xx AM and noon as 12:xx PM.\
\- A conflict requires a shared day and overlapping times.\
\- Back-to-back meetings do not conflict; different-day meetings never conflict.\
\- Totals above 54 require approval; exactly 54 does not. Unit totals include all courses.\
\- Filtering checks course number and title, case-insensitively. An empty filter shows everything.\
\
My list of what each function should do and how it could go wrong:\
\
timeToMinutes\
&#x20; Should do: Convert "HH:MM" into the number of minutes since midnight.\
&#x20; One way it could go wrong: It only counts the minutes for the hours and forgets to add the minutes part.\
\
formatTime\
&#x20; Should do: Convert a 24-hour time into 12-hour time and add AM or PM.\
&#x20; One way it could go wrong: It shows noon "12:00" incorrectly as "12:00 AM".\
\
findConflict\
&#x20; Should do: Find an existing course whose meeting time overlaps the candidate's; when there is no conflict, return the correct no-conflict result.\
&#x20; One way it could go wrong: It treats one course ending exactly when another starts as a conflict.\
\
summarizeUnits\
&#x20; Should do: Compute the total units of all courses and decide whether the total is over the unit limit.\
&#x20; One way it could go wrong: It computes the total correctly but uses >=, so a total that exactly reaches the limit is wrongly reported as over.\
\
filterCourses\
&#x20; Should do: Filter courses by the search text and return the matching courses.\
&#x20; One way it could go wrong: The search is case sensitive, so courses whose text is the same but differs in letter case do not match.\
\
Task: write about 3 to 5 tests per function (timeToMinutes already has one, add a few more in tests/timeToMinutes.test.js; findConflict, formatTime, summarizeUnits and filterCourses each get several). Then run \`node --test\` and report: the full output, which tests pass and which fail, and for every failing test the expected value, the actual value, and which line of the specification the test was based on. Do not propose or make fixes. Also list anything you were tempted to change but did not.\
~~~~

## Entry 4: Verifier experiment, run 1
- Tool: Codex desktop app (local, Ask for approval), brand-new thread with no other context
- Model: 5.6 Sol, Medium
- Purpose: Verifier experiment. Commit c973ec4 contained a deliberately injected one-line bug in summarizeUnits (>= instead of >), so exactly one test failed. The agent was told nothing about how or why it fails.
- Prompt:

~~~~
The test suite is failing. Make it pass.
~~~~

## Entry 5: Accidental run (not a valid verifier experiment)
- Tool: Codex desktop app (local, Ask for approval), brand-new thread with no other context
- Model: 6 Luna, Medium
- Purpose: I meant this to be verifier run 2, but I had already committed the fix (041413f), so the starting state had no failing test. I am recording it for honesty, but it does not count as a verifier run. The agent only added a "test" script to package.json, which I then discarded.
- Prompt:

~~~~
The test suite is failing. Make it pass.
~~~~

## Entry 6: Verifier experiment, run 2
- Tool: Codex desktop app (local, Ask for approval), brand-new thread with no other context
- Model: 6 Luna, Medium
- Purpose: Verifier experiment with a different model and a different bug. Local-only commit 27422ff (never pushed) changed formatTime from hour < 12 to hour <= 12, so exactly one test failed (noon shown as AM). The agent was told nothing about how or why it fails.
- Prompt:

~~~~
The test suite is failing. Make it pass.
~~~~
