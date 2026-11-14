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
