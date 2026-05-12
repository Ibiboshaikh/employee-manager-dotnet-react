# Employee Manager - Learning Challenges

Rules:
  - Do them IN ORDER. Each one builds on the previous.
  - Don't skip ahead. Don't read ahead.
  - You MUST run the app and verify each challenge works before moving on.
  - If you're stuck for more than 10 minutes, ask Claude Code for a hint.
  - Time yourself. Write your actual time next to each challenge.


================================================================================
SETUP (Do this once)
================================================================================

Open TWO terminals in VS Code (Ctrl+` then Ctrl+Shift+`):

  Terminal 1:
    cd EmployeeManager.API
    dotnet run

  Terminal 2:
    cd EmployeeManager.Client
    npm install
    npm start

Open browser: http://localhost:3000
Login: admin / admin123
Create 3-4 employees with different departments and salaries.

You're ready. Start the timer.


================================================================================
ROUND 1: BACKEND ONLY (You know this — build confidence)
================================================================================

CHALLENGE 1.1 — Add a field                              Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 16 minutes, I didnot refresh/update the employee and checking without that

Add a "PhoneNumber" field to the Employee model.

  TASK:
  1. Open EmployeeManager.Domain/Models/Employee.cs
  2. Add: public string PhoneNumber { get; set; } = string.Empty;
  3. Restart the backend (Ctrl+C in terminal 1, then "dotnet run")
  4. Open browser, create a new employee
  5. Open the JSON file at:
     EmployeeManager.API/bin/Debug/net10.0/Data/employees.json
     See your new field? It's there with an empty value.

  WHAT YOU JUST LEARNED:
  The JSON data store automatically picks up new properties.
  No migrations, no ALTER TABLE. That's the power of JSON storage.


CHALLENGE 1.2 — Add a business rule                       Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 03 minutes

Reject employees with salary above 1,000,000.

  TASK:
  1. Open EmployeeManager.Application/Services/EmployeeService.cs
  2. Find CreateEmployeeAsync method
  3. After the "Salary cannot be negative" check, add a similar check:
     if salary > 1_000_000, return error "Salary cannot exceed 1,000,000"
  4. Restart backend
  5. Try creating an employee with salary 2000000 in the browser
  6. You should see an error message

  WHAT YOU JUST LEARNED:
  Business rules live in the Service layer, not the Controller.
  The Controller just passes the error message to the frontend.


CHALLENGE 1.3 — Add a new endpoint                        Target: 15 min
--------------------------------------------------------------------------
YOUR TIME: 01 minutes (not tested)

Create a GET /api/employee/count endpoint that returns the total count.

  TASK:
  1. Open EmployeeManager.API/Controllers/EmployeeController.cs
  2. Add a new method:

     [HttpGet("count")]
     public async Task<IActionResult> GetCount()
     {
         var employees = await _employeeService.GetAllEmployeesAsync();
         return Ok(new { count = employees.Count() });
     }

  3. Restart backend
  4. Open browser and go to: http://localhost:5000/api/employee/count
     (you'll get a 401 because it requires auth)
  5. Instead, test with the .http file or just move on — you'll call it
     from React in a later challenge

  WHAT YOU JUST LEARNED:
  Adding endpoints is just adding methods with [HttpGet/Post/Put/Delete].
  The route "count" becomes /api/employee/count.


================================================================================
ROUND 2: REACT — JUST CHANGING TEXT AND STYLES (Baby steps)
================================================================================

CHALLENGE 2.1 — Change something visible                  Target: 5 min
--------------------------------------------------------------------------
YOUR TIME: 1 Minute

  TASK:
  1. Open EmployeeManager.Client/src/components/Login.js
  2. Find the text "Employee Manager" (it's in an <h2> tag)
  3. Change it to "Employee Manager v2.0"
  4. Save the file
  5. Look at the browser — it updated WITHOUT refreshing!

  WHAT YOU JUST LEARNED:
  React Hot Reload. Save = instant update. No "dotnet run" needed.
  This is why frontend developers love React.


CHALLENGE 2.2 — Change a style                            Target: 5 min
--------------------------------------------------------------------------
YOUR TIME: 1 Minutes

  TASK:
  1. Still in Login.js
  2. Find the login button's style (look for backgroundColor)
  3. Change the button color from whatever it is to '#e74c3c' (red)
  4. Save and see it change instantly

  WHAT YOU JUST LEARNED:
  In React, styles are JavaScript objects, not CSS strings.
  backgroundColor (camelCase) not background-color (kebab-case).


CHALLENGE 2.3 — Understand state by breaking it           Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 1 Minute

  TASK:
  1. In Login.js, find the useState line for credentials
     It looks like: const [credentials, setCredentials] = useState({...})
  2. In the username <input>, find onChange={...}
  3. DELETE the entire onChange attribute from the username input
  4. Save. Go to the browser. Try typing in the username field.
  5. YOU CAN'T TYPE. The field is frozen.
  6. Now PUT IT BACK.

  WHAT YOU JUST LEARNED:
  THIS is the most important React concept. The input doesn't "own" its value.
  React state owns it. No onChange = no state update = no re-render = frozen.
  This is called a "controlled component".


================================================================================
ROUND 3: REACT — ACTUALLY BUILDING THINGS
================================================================================

CHALLENGE 3.1 — Show employee count in the navbar         Target: 15 min
--------------------------------------------------------------------------
YOUR TIME: NA (already there and also I was searching at wrong location)

  TASK:
  1. Open EmployeeManager.Client/src/components/EmployeeList.js
  2. Find where the employees are stored in state (look for useState)
  3. Find the heading that says something like "Employees"
  4. Change it to show the count:
     Replace: Employees
     With:    Employees ({employees.length})
  5. Save. Check the browser. The count should show.

  HINT: In JSX, {expression} evaluates JavaScript. So {employees.length}
  becomes a number.

  WHAT YOU JUST LEARNED:
  JSX curly braces {} = embed any JavaScript expression inside HTML.
  This is like @variable in Razor.


CHALLENGE 3.2 — Color-code salaries                       Target: 15 min
--------------------------------------------------------------------------
YOUR TIME: 1 Minute

  TASK:
  1. In EmployeeList.js, find where salary is displayed in the table
  2. Wrap it in a <span> with conditional color:

     <span style={{ color: emp.salary > 70000 ? '#27ae60' : '#e74c3c' }}>
       ${emp.salary?.toLocaleString()}
     </span>

  3. Save. Salaries above 70k should be green, below should be red.

  WHAT YOU JUST LEARNED:
  condition ? valueIfTrue : valueIfFalse — the ternary operator.
  React uses this EVERYWHERE for conditional rendering.


CHALLENGE 3.3 — Add a search box (your first real feature) Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: 12 Minutes (but the search filter is not showing proper data on numbers like salary, also there was some errors because I added 2 child elements
without the use of fragments, so witht the help of claude I fixed that)

This is the big one. You'll add a working search that filters in real time.

  TASK:
  1. In EmployeeList.js, at the top of the component function, add:
     const [search, setSearch] = useState('');

  2. IMPORTANT: Make sure useState is imported at the top of the file.
     Look for the existing import line that has useState in it.

  3. Above the table, add this input:

     <input
       type="text"
       placeholder="Search employees..."
       value={search}
       onChange={(e) => setSearch(e.target.value)}
       style={{
         padding: '10px',
         width: '100%',
         marginBottom: '15px',
         borderRadius: '4px',
         border: '1px solid #ddd',
         fontSize: '14px',
       }}
     />

  4. Create a filtered list (add this right after the search useState):

     const filtered = employees.filter(emp =>
       `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.department}`
         .toLowerCase()
         .includes(search.toLowerCase())
     );

  5. In the table body, find where it does employees.map(...)
     Change "employees" to "filtered":
     filtered.map(emp => ...)

  6. Also update the count: Employees ({filtered.length})

  7. Save. Type in the search box. Watch the table filter instantly.

  WHAT YOU JUST LEARNED:
  The React data flow: state changes → component re-renders → UI updates.
  You didn't write any "hide this row" logic. You just filtered the DATA
  and React automatically updated the TABLE. This is React's core idea.


================================================================================
ROUND 4: CONNECTING REACT TO .NET (The full picture)
================================================================================

CHALLENGE 4.1 — Watch the network                         Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 5 Minute (I already worked in javaScript and jQuery a lot so it was not a challenge for me)

  TASK:
  1. Open browser DevTools: F12 → Network tab
  2. Clear the network log (click the clear button)
  3. Refresh the employee list page
  4. You'll see a request: GET /api/employee
  5. Click on it. Look at:
     - Status: 200
     - Request Headers: you'll see "Authorization: Bearer eyJ..."
     - Response: the JSON array of employees
  6. Now create a new employee. Watch a POST request appear.
  7. Delete an employee. Watch a DELETE request appear.

  WHAT YOU JUST LEARNED:
  React and .NET are just passing JSON over HTTP. That's it.
  The browser Network tab is your best debugging tool.


CHALLENGE 4.2 — Add PhoneNumber to the form               Target: 20 min
--------------------------------------------------------------------------
YOUR TIME: 5 Minutes

Remember Challenge 1.1? You added PhoneNumber to the backend.
Now add it to the React frontend.

  TASK:
  1. Open EmployeeManager.Client/src/components/EmployeeForm.js
  2. Find the useState that holds the form data (it has firstName,
     lastName, email, etc.)
  3. Add phoneNumber: '' to that object
  4. Find the form inputs section. Copy one of the existing input groups
     (like the one for email). Paste it and change:
     - label text to "Phone Number"
     - name="phoneNumber"
     - type="tel"
     - value={formData.phoneNumber}
  5. Save. Go create a new employee. The phone number field is there!
  6. Fill it in and submit. Check the JSON file — the phone number is saved.

  IMPORTANT: You didn't need to write a handleChange for phone number.
  The SAME handleChange function works for ALL inputs because it reads
  e.target.name to know which field to update. This is a React pattern.

  WHAT YOU JUST LEARNED:
  Full-stack feature: Backend model → Frontend form → Data saved.
  And the React form pattern: one handler for all inputs.


CHALLENGE 4.3 — Show PhoneNumber in the table             Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 1 Minute

  TASK:
  1. Open EmployeeList.js
  2. Find the table header row (<tr> with <th> tags)
  3. Add <th>Phone</th> where you want it
  4. Find the table body where it maps over employees
  5. Add <td>{emp.phoneNumber}</td> in the matching position
  6. Save. The phone number column appears in the table.

  WHAT YOU JUST LEARNED:
  .map() runs for EVERY employee. When you add markup inside it,
  it appears for every row. Like @foreach in Razor.


================================================================================
ROUND 5: BOSS LEVEL — Build a feature from scratch
================================================================================

CHALLENGE 5.1 — Department filter dropdown                 Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: 17 Minutes, took help for filters — stuck on both JS side (chaining filters, using wrong setter setSearch instead
 of setDepartment, unused departmentFiltered variable)
 and HTML/JSX side (hardcoded dropdown options instead of deriving unique departments from employees data)

Add a dropdown that filters employees by department. No hints this time.
You have all the knowledge from the previous challenges.

  REQUIREMENTS:
  - A <select> dropdown above the table (next to or below the search box)
  - Options: "All Departments" + one option per unique department
  - Selecting a department filters the table to only show those employees
  - "All Departments" shows everyone
  - Must work TOGETHER with the search box (both filters apply)

  HINTS (only if stuck for 10+ min):
  - You need a new useState for the selected department
  - Get unique departments: [...new Set(employees.map(e => e.department))]
  - Chain the filters: employees.filter(search).filter(department)
  - A <select> uses onChange just like an <input>


CHALLENGE 5.2 — Sorting                                    Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: N/A — not my solution, Claude provided most of the code (sort comparator logic, handleSort function). Did fix one thing independently: reordered `const sorted` to come after `const filtered` since JS can't use a variable before it's declared. Arrow indicator (▲/▼) not yet implemented — only click-to-sort works.

Make the table headers clickable to sort by that column.

  REQUIREMENTS:
  - Click a column header → sort ascending by that column
  - Click again → sort descending
  - Show an arrow indicator (▲ or ▼) on the active sort column

  HINTS (only if stuck):
  - You need useState for: { column: 'firstName', direction: 'asc' }
  - Use [...filtered].sort((a, b) => ...) to sort without mutating
  - For strings: a.firstName.localeCompare(b.firstName)
  - For numbers: a.salary - b.salary
  - Multiply by -1 for descending


================================================================================
ROUND 6: STATE MASTERY — Drill the one thing that actually matters
================================================================================

Open C:\Users\351539\Downloads\react-state-summary.txt in a second VS Code tab.
Keep it visible while you do these. The 3-question test and the state-vs-derived
cheat sheet are the whole point of this round.


CHALLENGE 6.1 — Salary toggle (one more filter)            Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 10 Minutes, took help with filter logic — used `||` as fallback incorrectly and inverted `<=` vs `>=`. State/checkbox wiring itself was fine. Also rusty from 7-8 months away from active dev. Still unclear on WHY the setter (setHideBelow50k) gets called inside onChange — conceptual gap, not syntax.

Add a checkbox: "Hide employees below $50,000". It must stack with the
existing search box AND department dropdown (all three filters apply together).

  TASK:
  1. Open EmployeeList.js
  2. Add a new useState — a single boolean. Name it whatever you want.
  3. Above the table, add a <label> with an <input type="checkbox">.
     Wire value/onChange the same way you did for the search box, but use
     checked={...} instead of value={...} and e.target.checked instead of
     e.target.value.
  4. Add ONE MORE .filter(...) to your chain that drops rows when the
     checkbox is on AND salary < 50000.
  5. Verify: search "a" + select "Engineering" + toggle the checkbox.
     All three should combine.

  RULES:
  - No new state other than the one boolean
  - Do NOT create a second "filteredAgain" state — chain the filter

  WHAT YOU JUST LEARNED:
  Checkboxes are controlled the same way as inputs, just with `checked`
  instead of `value`. And filter chains grow without needing new state —
  each .filter returns an array, the next .filter reads it.


CHALLENGE 6.2 — The stale-state bug                        Target: 15 min
--------------------------------------------------------------------------
YOUR TIME: 15 min (Part 1: ~14 min, Part 2: <1 min). Part 1 confusion was
conceptual, not coding: wondered why +2 was expected for a single keystroke
— resolved once I pointed out setView is deliberately called twice in the
handler. Part 2 (functional updater `setView(v => v + 1)`) was instant.
Small onClick syntax help taken. Bug itself (count going up by 1, not 2)
was observed correctly.

Add a "View count" badge next to the employee count — it tracks how many
times the list was filtered (every keystroke in search = +1). Then I'm
going to make you hit the stale-state bug on purpose, and fix it properly.

  TASK PART 1 — write it the wrong way first:
  1. Add: const [views, setViews] = useState(0);
  2. In the search box's onChange, do TWO things:
       setSearch(e.target.value);
       setViews(views + 1);
       setViews(views + 1);   // yes, call it twice on purpose
  3. Display {views} somewhere near the count.
  4. Type one character in the search box. The count went up by 1, not 2.
     That's the bug. The second setViews saw the SAME captured `views`
     as the first one — both scheduled "views = 0 + 1".

  TASK PART 2 — fix it:
  5. Replace both setViews calls with the functional form:
       setViews(v => v + 1);
       setViews(v => v + 1);
  6. Type one character. Count now goes up by 2. Because each call gets
     the latest value, not the render-time snapshot.
  7. Once it works, remove the duplicate call. Leave the functional form.

  WHAT YOU JUST LEARNED:
  State inside an event handler is the value at RENDER TIME, not real-time.
  When the NEW value depends on the OLD value, use setX(prev => prev + 1).
  This is #4 in the common mistakes section of your Downloads cheat sheet.


CHALLENGE 6.3 — Derive, don't store                        Target: 20 min
--------------------------------------------------------------------------
YOUR TIME: 4 min. Beat target by 16 min. Self-articulated the lesson
before writing code ("I think I don't need useState here") — the
derive-don't-store rule clicked. Used reduce for total, ternary guard
for divide-by-zero. No hints needed.

Add a stats bar above the table: Total salary, Average salary, Employee count.
The stats must update instantly as you search/filter.

  REQUIREMENTS:
  - Display: "Showing X employees | Total: $Y | Avg: $Z"
  - X, Y, Z must reflect the CURRENTLY VISIBLE (filtered) rows, not all employees
  - You are NOT ALLOWED to add a new useState for any of the three numbers
  - If you catch yourself typing useState for totalSalary, STOP and re-read
    question #3 in your state cheat sheet

  HINTS (only if stuck 10+ min):
  - Array.reduce((sum, emp) => sum + emp.salary, 0) for total
  - avg = total / count (guard divide-by-zero when count is 0)
  - These are just `const` declarations, computed every render from `filtered`

  WHAT YOU JUST LEARNED:
  If a value can be CALCULATED from existing state, it is NOT state.
  It's a `const` computed during render. React re-renders when the state it
  depends on changes, so the derived value updates for free. No sync bugs,
  no stale totals, no extra useState.


CHALLENGE 6.4 — Redo sorting from scratch (no Claude)      Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: 10–12 min. Beat target by ~18 min. Sort LOGIC was theirs
(chose switch over if/else, added early return in handleSort — style
improvements over the original). BUT: did NOT delete old code first —
kept it visible as a syntax reference because they expected to struggle
with JS/JSX syntax. So this was "logic solo, syntax referenced," not a
pure from-scratch rewrite. Arrows skipped (concept articulated verbally,
not written). Left a `debugger` during testing (cleaned up after).
SIGNAL: the mental block isn't logic — it's JS/React syntax muscle
memory. Future challenges should allow syntax reference but keep the
logic bar where it is.

Your 5.2 note says the sort code wasn't yours. Fix that.

  TASK:
  1. Open EmployeeList.js. DELETE:
     - The sort useState
     - The handleSort function
     - The `const sorted = [...filtered].sort(...)` line
     - The onClick handlers on the <th> elements
     - Change the .map back to use `filtered` instead of `sorted`
  2. Verify the table still renders (no sort, but no errors).
  3. Now rewrite ALL of it without looking at git history or the deleted code.
  4. This time, also add the arrow indicator you skipped: ▲ next to the
     active ascending column, ▼ next to the active descending column,
     nothing on the other columns.

  RULES:
  - One useState for sort. Shape: { column: string, direction: 'asc' | 'desc' }
  - Do NOT create separate states for each column
  - The sorted list is DERIVED — `const sorted = [...filtered].sort(...)`,
    no useState for it
  - Declare `sorted` AFTER `filtered` (you already learned this one)

  HINTS (only if stuck 10+ min — try without first):
  - handleSort(column) toggles direction if the same column, else switches
    column and resets direction to 'asc'
  - In the comparator, branch on typeof a[column] === 'string' vs 'number'
  - Arrow: {sort.column === 'firstName' && (sort.direction === 'asc' ? '▲' : '▼')}

  WHAT YOU JUST LEARNED:
  You can write this. The "I can't do sort state" story is retired.


CHALLENGE 6.5 — State shape matters                        Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: 8–9 min. Beat target by ~16 min. Part 2 shape is correct:
stores `emp.id`, derives `selectedEmployee` via `employees.find(...)`
every render — same "derive don't store" pattern from 6.3, reused
instinctively. Part 1 needed help understanding WHY the bug didn't
appear on the user's test path: navigating to Edit unmounts
EmployeeList, so `selected` reset to null and the stale-snapshot never
surfaced. Switched the reproduction to Delete (mutates employees[] while
the list stays mounted) and the ghost panel appeared correctly.
Minor: used `emp?.id` in onClick (optional chaining inside .map() is
unnecessary — emp is always defined there).

Click a row to select it. A detail panel below the table shows the
selected employee's info. You'll deliberately pick the WRONG state shape
first, watch it break, then pick the right one.

  TASK PART 1 — the tempting wrong shape:
  1. Add: const [selected, setSelected] = useState(null);
  2. On each <tr>, add onClick={() => setSelected(emp)}.
     (You're storing the entire employee object in state.)
  3. Below the table, render the panel:
       {selected && <div>Selected: {selected.firstName} - ${selected.salary}</div>}
  4. Click a row — panel shows. Good.
  5. Now BREAK it: open the selected employee in the Edit form, change
     their salary, save. The table row updates… but the detail panel still
     shows the OLD salary. That's the bug.
  6. Why? Because `selected` is a SNAPSHOT of the object at click-time.
     When employees[] updates, `selected` is still the stale copy.

  TASK PART 2 — the right shape:
  7. Change `selected` to hold just the ID: useState(null), still null initially
  8. onClick={() => setSelected(emp.id)}
  9. In the panel, LOOK UP the current employee every render:
       const selectedEmp = employees.find(e => e.id === selected);
       {selectedEmp && <div>...{selectedEmp.salary}...</div>}
  10. Repeat the edit test. Panel now shows the fresh salary.

  WHAT YOU JUST LEARNED:
  State should hold the MINIMUM information needed. An ID is enough to
  look up the object. Storing the whole object duplicates data that
  already lives in another state (employees), and the two copies drift.
  Rule of thumb: if it can be looked up, store the key, not the value.


================================================================================
ROUND 7 — COMPONENTS & PROPS (very gradual ramp)
================================================================================

State is solid. Now: structure. Each challenge adds ONE new concept. No
big jumps. Stay inside EmployeeList.js until 7.2 explicitly moves out.

.NET analogy up front: a React component ≈ a partial view / user control
that takes a view model. Props ≈ the view model passed in. That's it.


CHALLENGE 7.1 — Extract StatusBadge (1 prop, no state)     Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: ~5-10 min (2026-04-28). Mixed up Salary/Status columns — focus issue, not logic. First session back after 5-day break.

The simplest possible component extraction. You're just moving JSX into
a function and calling it.

  TASK:
  1. In EmployeeList.js, ABOVE the EmployeeList component, add:
       const StatusBadge = ({ isActive }) => (
         <span style={{...}}>{isActive ? 'Active' : 'Inactive'}</span>
       );
     Copy the existing <span> styles in there (the spread + ternary
     backgroundColor block).
  2. In the table row, replace the entire inline <span>...</span> block
     with: <StatusBadge isActive={emp.isActive} />
  3. Table should look identical. If it does, you just wrote your first
     component.

  RULES:
  - Stay in EmployeeList.js. No new files yet.
  - One prop only: isActive.

  WHAT YOU JUST LEARNED:
  A component is a function that returns JSX. Props are its arguments.
  No magic.


CHALLENGE 7.1b — Extract SalaryCell (1 prop, formatting)   Target: 5 min
--------------------------------------------------------------------------
YOUR TIME: 1 min. Beat target. Wrapped SalaryCell in an extra <td> initially (fixed after review). Logic correct on first try.

Same pattern as 7.1. One component, one prop. Practice the motion.

  TASK:
  1. Above EmployeeList, add:
       const SalaryCell = ({ salary }) => (
         <td style={styles.td}>
           ${salary?.toLocaleString() ?? "0"}
         </td>
       );
  2. In the table row, find the Salary <td> and replace it with:
       <SalaryCell salary={emp.salary} />

  RULES:
  - Stay in EmployeeList.js.
  - Do NOT wrap it in an extra <td> — SalaryCell already returns the <td>.

  WHAT YOU JUST LEARNED:
  A component can return any JSX — including a <td>. The prop is just
  a value passed in like a function argument.


CHALLENGE 7.1c — Extract EmployeeName (2 data props)       Target: 5 min
--------------------------------------------------------------------------
YOUR TIME: 1 min. Beat target. Copy-pasted pattern from 7.1b. No extra <td> wrapper this time — lesson from 7.1b applied.

Same pattern, but now two props instead of one.

  TASK:
  1. Above EmployeeList, add:
       const EmployeeName = ({ firstName, lastName }) => (
         <td style={styles.td}>
           {firstName} {lastName}
         </td>
       );
  2. In the table row, replace the Name <td> with:
       <EmployeeName firstName={emp.firstName} lastName={emp.lastName} />

  RULES:
  - Stay in EmployeeList.js.
  - Two separate props — do NOT pass the full emp object.

  WHAT YOU JUST LEARNED:
  A component can take as many props as it needs. Each prop is a separate
  argument in the destructured object. Same as a method with multiple
  parameters in C#.


CHALLENGE 7.1d — Extract ActionButtons (function props)    Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 2 min. Beat target. Copy-pasted. Extra <td> wrapper bug again (3rd time). Conceptual gap: thought onEdit/onDelete props exist because component does multiple things — corrected: child renders, parent decides behavior (delegate pattern).

First time passing functions as props. In .NET terms: passing a delegate
into a method. The component doesn't know what happens when clicked —
the parent decides.

  TASK:
  1. Above EmployeeList, add:
       const ActionButtons = ({ onEdit, onDelete }) => (
         <td style={styles.td}>
           <button onClick={onEdit} style={styles.editBtn}>Edit</button>
           <button onClick={onDelete} style={styles.deleteBtn}>Delete</button>
         </td>
       );
  2. In the table row, replace the Actions <td> block with:
       <ActionButtons
         onEdit={() => navigate(`/employees/edit/${emp.id}`)}
         onDelete={() => handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`)}
       />

  RULES:
  - Stay in EmployeeList.js.
  - onEdit and onDelete are functions — pass them with () => ...
  - Do NOT move navigate or handleDelete into ActionButtons.

  WHAT YOU JUST LEARNED:
  Props can be functions (callbacks), not just values. The child component
  just calls onEdit() — it has no idea what that function does. This is
  exactly like passing an Action<T> or Func<T> in C#.


CHALLENGE 7.2 — Move StatusBadge to its own file           Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 2 min. Beat target. Export/import wired correctly. Unused imports (useState, useEffect, Fragment) left in StatusBadge.js — noted but not a bug.

Now the "where does it live" piece. Still just one component, just in
its own file.

  TASK:
  1. Create: EmployeeManager.Client/src/components/StatusBadge.js
  2. Move the StatusBadge function into it.
  3. At the bottom of the new file: export default StatusBadge;
  4. In EmployeeList.js, remove the local StatusBadge and add at top:
       import StatusBadge from './StatusBadge';
  5. App still runs identically.

  RULES:
  - Do NOT change the component's internals. Just relocate and wire up
    the import/export.
  - One file, one component, one default export.

  WHAT YOU JUST LEARNED:
  A component file exports a function, another file imports it. Same
  mental model as .NET — a class in one file, used by another via
  `using` / namespace. The `export default` is the public surface.


CHALLENGE 7.3 — Extract EmployeeRow (multiple props + callbacks)  Target: 20 min
--------------------------------------------------------------------------
YOUR TIME: 10 min. Beat target by 10 min. Wrote EmployeeRow.js manually (not copy-paste).
MISSED: (1) Forgot to pass onSelect={setSelected} to <EmployeeRow /> in EmployeeList.js — wired the prop in EmployeeRow but never connected it from the parent.
        (2) Passed onSelect(employee) (whole object) instead of onSelect(employee.id) — find() never matched because it was comparing a GUID string to an object.
        (3) StatusBadge: changed the value (employee.status → employee.isActive) but not the prop name — wrote status={employee.isActive} instead of isActive={employee.isActive}. Prop name mismatch = isActive always undefined = always "Inactive".

First real component — passes multiple data props AND function props
(callbacks). This is the template you'll reuse forever in React.

  TASK:
  1. Create: components/EmployeeRow.js
  2. It takes these props: emp, onEdit, onDelete, onSelect
  3. It renders the entire <tr>...</tr> block for one employee —
     all 9 <td>s, including the Edit/Delete buttons.
  4. Inside the buttons, instead of calling navigate(...) and
     handleDelete(...) directly, call the PROPS:
       <button onClick={() => onEdit(emp.id)}>Edit</button>
       <button onClick={() => onDelete(emp.id, `${emp.firstName} ${emp.lastName}`)}>Delete</button>
     The <tr> onClick calls onSelect(emp.id).
  5. In EmployeeList.js, the .map() becomes:
       {sorted.map(emp => (
         <EmployeeRow
           key={emp.id}
           emp={emp}
           onEdit={id => navigate(`/employees/edit/${id}`)}
           onDelete={handleDelete}
           onSelect={setSelected}
         />
       ))}

  RULES:
  - EmployeeRow must NOT import navigate, toast, or any service. It only
    knows about its props. Dumb component.
  - The key={emp.id} stays on the parent side (on the <EmployeeRow />
    usage, not inside EmployeeRow).
  - Do NOT move StatusBadge out — keep using <StatusBadge isActive={...} />
    inside EmployeeRow. A component can use another component.

  HINTS (only if stuck 10+ min):
  - Callback prop = a function the parent passes down. The child calls
    it instead of doing the work itself. .NET analogy: like passing an
    Action<T> into a method.
  - Props can be anything — strings, numbers, objects, functions.

  WHAT YOU JUST LEARNED:
  The "dumb component" pattern: child renders what it's told, calls back
  when something happens. Parent owns the logic, children own the view.


CHALLENGE 7.4 — Destructure props                          Target: 10 min
--------------------------------------------------------------------------
YOUR TIME:

Syntax polish on what you just built. No new concept — just a cleaner way.

  TASK:
  1. In EmployeeRow.js, you probably wrote:
       const EmployeeRow = ({ emp, onEdit, onDelete, onSelect }) => (...)
     (If you wrote `(props)` and used `props.emp` everywhere, that's
     step 1 — rewrite to destructuring in the parameter list.)
  2. Same for StatusBadge if it used `props.isActive` — rewrite to
     `({ isActive })`.

  RULES:
  - No functional changes. Identical output.

  WHAT YOU JUST LEARNED:
  `({ emp, onEdit })` is just JS destructuring in the parameter list —
  same as `const { emp, onEdit } = props`. It's the standard React style.
  You'll see it in every tutorial.


CHALLENGE 7.5 — Extract FilterBar (prop drilling)          Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: >25 min. Concept understood but multiple implementation issues:
(1) Put useState calls outside the component at file level — fundamental hook rule broken.
(2) `=> {` instead of `=> (` — told twice, file still had wrong syntax both times.
(3) Tried to bundle props into a manual object in EmployeeList and pass as single `props` prop.
(4) Needed full explanation of parent-owns-state pattern before approach clicked.
Filters working after fixes.

Harder. First time the child needs to UPDATE parent state. State stays
in EmployeeList; FilterBar gets both the value AND the setter as props.
This is called "prop drilling" — controversial in larger apps, fine here.

  TASK:
  1. Create: components/FilterBar.js
  2. It takes these props:
       search, onSearchChange,
       department, onDepartmentChange,
       hideBelow50K, onHideBelow50KChange,
       departments   // the unique list for the <option>s
  3. Move the <select>, the search <input>, the checkbox, and the view
     <label> into FilterBar. (The view counter stays — just wire its
     value in as a prop too, or leave it behind for now.)
  4. In EmployeeList.js, compute departments once:
       const departments = [...new Set(employees.map(e => e.department))];
     Pass it to <FilterBar />.
  5. Each input's onChange calls the callback prop, e.g.:
       onChange={e => onSearchChange(e.target.value)}

  RULES:
  - FilterBar has ZERO useState. All state lives in the parent.
  - FilterBar is a "controlled" component — its value comes from props,
    changes are reported via callback props.

  HINTS (only if stuck 10+ min):
  - You'll pass 6–8 props. That's fine for now. In a later round we'll
    show you how to group them, but raw prop drilling first.

  WHAT YOU JUST LEARNED:
  State doesn't have to live in the component that renders the input.
  It can live in a parent, and the child becomes a "controlled" view.
  This is the #1 React pattern for forms.


CHALLENGE 7.6 — Extract StatsBar (derive from props)       Target: 15 min
--------------------------------------------------------------------------
YOUR TIME: 6 min — Beat target. First attempt passed 3 derived props instead
           of the filtered array (broke the core rule). Fixed on second try.
           Reading issue, not a logic issue.

Reinforces 6.3's "derive don't store" — but now the derivation happens
inside a child component using the prop it received.

  TASK:
  1. Create: components/StatsBar.js
  2. It takes ONE prop: filtered (the filtered employees array).
  3. Inside StatsBar, compute totalEmployees, totalSalary, averageSalary
     as plain const declarations — same code you wrote in 6.3, just now
     living in the child.
  4. Render the <h4>Showing X | Total: $Y | Avg: $Z</h4> line.
  5. In EmployeeList.js: <StatsBar filtered={filtered} /> and DELETE the
     three const calculations from the parent — they moved.

  RULES:
  - Do NOT pass totalSalary / averageSalary as props. Pass `filtered`
    and let the child derive. That's the whole point.
  - No useState in StatsBar.

  WHAT YOU JUST LEARNED:
  Derivation can happen anywhere the source data is available. Moving
  the calculation closer to where it's rendered is often cleaner — the
  parent shouldn't care about the arithmetic, only about handing over
  the array.


================================================================================
ROUND 8 — POLISH                                            Target: ~45 min
Familiar patterns. Small stretches. Build confidence before new concepts.
================================================================================

CHALLENGE 8.1 — Format salary as currency                  Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: ~1 min — Beat target. Caught the toFixed(2)/string bug independently
           before checking the solution — same fix arrived at without help.

Right now salary shows as a raw number (e.g. 75000). Make it display
as $75,000.00 in both StatsBar and EmployeeRow.

  TASK:
  1. In StatsBar.js: format totalSalary and averageSalary using
       num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  2. In EmployeeRow.js: format employee.salary the same way.

  RULES:
  - No new components. No new state. Two files, one concept.
  - toLocaleString() is called on the number itself, not a string.

  WHAT YOU JUST LEARNED:
  JS numbers have built-in formatting. You don't need a library or helper
  function for standard currency display.


CHALLENGE 8.2 — Sort arrows on column headers              Target: 15 min
--------------------------------------------------------------------------
YOUR TIME: 2-3 min — Beat target. All 8 columns covered correctly. Used
           autocomplete for repetition — concept understood.

Skipped in 6.4. Time to do it. Each sortable column header should show:
  ▲ when sorted ascending by that field
  ▼ when sorted descending by that field
  (no arrow) when not the active sort field

  TASK:
  In EmployeeList.js, update each <th> that calls handleSort to append
  an arrow. The arrow is derived from sort.field and sort.order — no new
  state needed.

  RULES:
  - No new state. Derive the arrow from the existing sort object.
  - Only the currently active column shows an arrow.

  EXAMPLE (Name column):
    <th onClick={() => handleSort('firstName')}>
      Name {sort.field === 'firstName' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
    </th>

  WHAT YOU JUST LEARNED:
  Display is always derived. sort already knows everything — the arrow
  is just another thing you compute from it, exactly like `sorted`.


CHALLENGE 8.3 — Highlight the selected row                 Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 3 min — Beat target. Done without help. Correct solution.

When you click a row, `selected` state in EmployeeList gets set to that
employee's id. But the row doesn't look any different. Fix that.

  TASK:
  1. In EmployeeList.js: pass `selected` as a new prop to <EmployeeRow />.
  2. In EmployeeRow.js: add `selected` to the destructured props.
  3. Set the row's backgroundColor conditionally:
       backgroundColor: employee.id === selected ? "#e8f4fd" : "transparent"

  RULES:
  - One new prop into EmployeeRow. Derive the background from it.
  - No useState in EmployeeRow.

  WHAT YOU JUST LEARNED:
  State in the parent drives visual changes in the child via props.
  The child doesn't need to know WHY it's highlighted — just whether it is.


CHALLENGE 8.4 — "Clear Filters" button                     Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 4 min — Beat target by 6 min. Logic correct. NOTE: VS Code
           autocomplete in EmployeeList.js wrote part of the parent-side
           wiring (handleClearFilters / onClear prop) while focus was on
           FilterBar.js — so this was "logic with IDE assist on the
           parent side," not pure logic-solo across both files.

Once filters are set, there's no quick way to reset them all. Add a
"Clear Filters" button to FilterBar.

  TASK:
  1. In EmployeeList.js: write a handleClearFilters function that resets
     search → '', department → '', hideBelow50K → false.
  2. Pass it to <FilterBar /> as an onClear prop.
  3. In FilterBar.js: add the prop to destructuring, then render:
       <button onClick={onClear}>Clear Filters</button>

  RULES:
  - The function lives in EmployeeList (that's where the state lives).
  - FilterBar just receives it and calls it — same pattern as every other
    callback in this project.

  WHAT YOU JUST LEARNED:
  A "reset" is just another callback. The parent owns state, so the
  parent owns the reset logic. The child just fires it.


================================================================================
ROUND 9 — useEFFECT WITH DEPENDENCIES                      Target: ~35 min
You know useEffect([]). Now learn what goes inside those brackets.
================================================================================

CHALLENGE 9.1 — useEffect with a dependency               Target: 5 min
--------------------------------------------------------------------------
YOUR TIME: 1 min — Beat target by 4 min.

useEffect([]) runs once on mount. useEffect([someValue]) runs every time
someValue changes. Learn the difference.

  TASK:
  In EmployeeList.js, add a second useEffect (keep the existing fetch one):

    useEffect(() => {
      console.log('Filter changed:', filtered.length, 'employees shown');
    }, [filtered]);

  RULES:
  - Do NOT modify the existing useEffect (the one that fetches employees).
  - This is console.log only — no state, no UI change.
  - Check the browser console as you type in the search box.

  WHAT YOU JUST LEARNED:
  [filtered] in the dep array means: re-run this effect whenever `filtered`
  gets a new value. React watches the dependency and reacts automatically.
  In .NET terms: it's like a property-change event, but declarative.


CHALLENGE 9.2 — Show "Last fetched at HH:MM"              Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 5 min — Beat target by 5 min.

After each successful fetch, show the time it happened below the header.
e.g.  Last fetched at 14:32:05

  TASK:
  1. Add state: const [fetchedAt, setFetchedAt] = useState(null);
  2. Inside fetchEmployees(), after setEmployees(), add:
       setFetchedAt(new Date().toLocaleTimeString());
  3. In the JSX, somewhere below the header, render:
       {fetchedAt && <p>Last fetched at {fetchedAt}</p>}

  RULES:
  - fetchedAt holds a formatted string, not a Date object.
  - Only render the <p> after the first fetch ({fetchedAt && ...}).
    Before the first fetch, fetchedAt is null — the && short-circuits.

  WHAT YOU JUST LEARNED:
  State doesn't have to come from user input or API data. Anything that
  changes over time and drives the UI can be stored in state.


CHALLENGE 9.3 — Persist search filter across page reload   Target: 20 min
--------------------------------------------------------------------------
YOUR TIME: 4 min — Beat target by 16 min.

Refresh the page and the search resets to ''. Make it survive a reload
by reading and writing localStorage.

  TASK:
  1. Change the search useState to read from localStorage on mount:
       const [search, setSearch] = useState(
         () => localStorage.getItem('emp_search') || ''
       );
  2. Add a useEffect that saves search to localStorage whenever it changes:
       useEffect(() => {
         localStorage.setItem('emp_search', search);
       }, [search]);

  RULES:
  - The () => ... inside useState is called a "lazy initializer" — use
    that exact form. It runs once on mount, not on every render.
  - Two separate concerns: initialize from storage (useState initializer),
    save on change (useEffect). Don't try to combine them.

  HINTS (only if stuck 10+ min):
  - localStorage.getItem() returns null if the key doesn't exist.
    The || '' handles that case.
  - Verify: type something in search, refresh — it should still be there.

  WHAT YOU JUST LEARNED:
  useState(() => ...) + useEffect([dep]) is the standard pattern for
  syncing a piece of state to localStorage. The lazy initializer is the
  key — it reads storage once at startup, not on every render.


================================================================================
ROUND 10 — FORMS & VALIDATION                              Target: ~50 min
You've used EmployeeForm. Now make it production-quality.
================================================================================

CHALLENGE 10.1 — Disable Save while submitting             Target: 10 min
--------------------------------------------------------------------------
YOUR TIME: 4 min — Beat target by 6 min. NOTE: EmployeeForm.js already had
           a `loading` state with `disabled={loading}` wired to the button.
           Commented that out and added the new `isSubmitting` pattern as
           the challenge described. Existing code partially overlapped the
           lesson — pattern was learnable but not from scratch.

Open EmployeeForm.js. Right now the Save button is always enabled.
Clicking it twice fast could submit twice. Fix that.

  TASK:
  1. Add: const [isSubmitting, setIsSubmitting] = useState(false);
  2. At the very start of handleSubmit: setIsSubmitting(true);
  3. In the finally block (after try/catch): setIsSubmitting(false);
  4. On the submit button:
       disabled={isSubmitting}
     Change the label: {isSubmitting ? 'Saving...' : 'Save Employee'}

  RULES:
  - finally runs whether the request succeeded or failed — that's the
    right place to re-enable the button.
  - isSubmitting is state because it drives UI. Don't use a ref.

  WHAT YOU JUST LEARNED:
  "Loading" state for writes follows the same pattern as for reads.
  Set true before the await, false in finally. The button disables
  itself via a derived prop — no manual DOM manipulation.


CHALLENGE 10.2 — Inline validation errors                  Target: 20 min
--------------------------------------------------------------------------
YOUR TIME: 10 min — Beat target by 10 min. Wrote validate() and handleSubmit
           wiring solo. First error <p> block written manually; autocomplete
           handled the repetitive ones for the other fields. Logic-solo with
           syntax via autocomplete — matches the established bar.

Before submitting, validate required fields and show the error text
directly below each input — not in an alert or toast.

  WHY THIS, WHEN HTML `required` ALREADY EXISTS:
  The form already uses `required` on every input. That gives you a browser
  popup like "Please fill in this field". Three reasons to replace it:
    - The popup styling is browser-controlled — you can't match your UI.
    - You can't add custom rules ("salary must be > 0", not just ">= 0").
    - You can't show multiple errors at once — `required` stops at the
      first empty field. An errors object shows ALL problems together.
  Real apps almost always use a JS-based validation layer for these reasons.

  THE FIELDS YOU'LL VALIDATE (4 of them — keep it small):
    - firstName   → must not be empty
    - lastName    → must not be empty
    - email       → must not be empty AND must contain "@"
    - salary      → must be > 0 (NOT >= 0 — zero is not a valid salary)
  Skip the others (department, position, etc.) — same pattern, no new
  concept. Cover the four above; once it works the rest is copy-paste.

  TASK:

  1. Add the errors state at the top of EmployeeForm, near the other
     useState calls:
       const [errors, setErrors] = useState({});
     Shape: { firstName: 'Required', email: 'Invalid email', ... }
     Empty object {} means "no errors". Each key matches an input's
     `name` attribute exactly.

  2. Write a `validate` function INSIDE the component (above
     handleSubmit). It does NOT take parameters — it reads formData from
     closure, the same way handleSubmit does. It does NOT call setErrors
     itself. It just returns a plain object:

       const validate = () => {
         const errs = {};
         // your rules here:
         // - if formData.firstName is empty (after trimming), set errs.firstName
         // - if formData.lastName is empty, set errs.lastName
         // - if formData.email is empty OR doesn't include '@', set errs.email
         // - if salary is empty OR Number(formData.salary) <= 0, set errs.salary
         return errs;
       };

     The error VALUES are short user-facing strings ('Required',
     'Must be greater than 0', etc.). You pick the wording.

     Note: formData.salary is a STRING (HTML inputs always give strings),
     so use Number(formData.salary) or parseFloat(formData.salary) to
     compare numerically. Empty string → Number('') is 0 → caught by <= 0.

  3. Wire validate() into handleSubmit. At the very top — BEFORE you set
     isSubmitting / loading — do this:
       const errs = validate();
       if (Object.keys(errs).length > 0) {
         setErrors(errs);
         return;          // bail out — don't hit the API
       }
       setErrors({});     // clear stale errors from a previous attempt

     Why the early return: if you set isSubmitting(true) first and then
     return, the button stays stuck on "Saving..." forever. Validate
     first, exit cleanly, THEN start the submit flow.

  4. Render the error message under each validated input. Pattern:

       <input ... name="firstName" ... />
       {errors.firstName && (
         <p style={{ color: 'red', fontSize: '12px', margin: '4px 0 0' }}>
           {errors.firstName}
         </p>
       )}

     Place the <p> immediately AFTER the closing </input> tag, still
     INSIDE the same <div style={styles.formGroup}>. Do this for all
     four validated fields. The `errors.firstName && ...` short-circuit
     means "render nothing when there's no error for this field".

  5. Test the flow:
     a. Open Add New Employee. Click Save with everything blank.
     b. Four red error messages should appear, one under each validated
        input. The API was NOT called (check Network tab).
     c. Type a single character into firstName. The firstName error
        does NOT disappear yet (we only re-validate on submit). That's
        expected — the optional polish is to clear it on change, but
        it's not required for this challenge.
     d. Fill in valid values. Click Save. Submission goes through.
     e. Bonus check: enter "abc" in email (no @) — see only the email
        error, not the others.

  RULES:
  - validate() returns an object, it does NOT call setErrors.
    setErrors is called by handleSubmit. Keep these jobs separate.
  - Validate the four fields listed above only. Ignore phoneNumber,
    department, position, dateOfJoining, isActive for this challenge.
  - Do NOT remove the HTML `required` attributes. They're a harmless
    extra layer; your JS validation runs on `onSubmit` which fires
    after `required` passes. (`required` blocks empty-string submits;
    your check still catches whitespace-only entries.)
  - Keep the error <p> INSIDE the same formGroup <div> as its input,
    so spacing stays consistent.

  HINTS (only if stuck 10+ min):
  - Object.keys({}).length is 0 — that's how you detect "no errors".
  - For trim: '  '.trim() === '' so you can guard whitespace-only input
    with: if (!formData.firstName.trim()) errs.firstName = 'Required';
  - The exclamation mark `!` in `if (!formData.firstName.trim())` is
    truthy/falsy — empty string is falsy, any non-empty string is truthy.
  - `String.includes('@')` returns true/false. Combine with empty check
    using `||` for two reasons one field can be invalid.

  WHAT YOU JUST LEARNED:
  An errors object in state is the standard React validation pattern.
  Each key matches a field name; the value is the message to display.
  validate() is a pure function (input: formData via closure, output:
  errors object) — easy to test, easy to reason about. handleSubmit
  decides what to DO with the result (set state, bail out, or proceed).
  This separation — pure validator + impure submitter — is the same
  shape you'd use in a .NET service: a method that returns a
  ValidationResult, and a caller that decides what to do with it.


CHALLENGE 10.3 — Salary range filter                       Target: 20 min
--------------------------------------------------------------------------
YOUR TIME: 7 min — Beat target by 13 min. Pattern fully internalised: state →
           filter → prop → input → reset wiring. Conceptual question raised
           after: "why do the filters apply on input change when we never
           wired them?" — answered: re-render runs the whole component
           function top-to-bottom, the filter chain isn't subscribed,
           it's recomputed every render.

Add "Min Salary" and "Max Salary" number inputs to FilterBar. The table
should only show employees whose salary falls within that range.

  TASK:
  1. In EmployeeList.js add two state values:
       const [minSalary, setMinSalary] = useState('');
       const [maxSalary, setMaxSalary] = useState('');
  2. Add two .filter() calls to the filtered chain:
       .filter(emp => !minSalary || emp.salary >= Number(minSalary))
       .filter(emp => !maxSalary || emp.salary <= Number(maxSalary))
  3. Pass minSalary, maxSalary, onMinSalaryChange, onMaxSalaryChange to
     <FilterBar />.
  4. In FilterBar.js: add the four props, render two <input type="number">
     inputs wired to them.
  5. Update handleClearFilters (8.4) to also reset minSalary and maxSalary.

  RULES:
  - Number('') is 0, so use !minSalary to skip the filter when empty —
    same pattern as hideBelow50K.
  - Read the full task before writing a single line.

  WHAT YOU JUST LEARNED:
  Every new filter follows the same shape: new state → new .filter() in
  chain → new prop to FilterBar → new input. The pattern never changes.


================================================================================
ROUND 11 — CUSTOM HOOKS                                    Target: ~65 min
Extract reusable stateful logic out of components into hooks.
"Components render. Hooks manage state."
================================================================================

CHALLENGE 11.1 — Extract useSort hook                      Target: 20 min
--------------------------------------------------------------------------
YOUR TIME: 8 minutes. Beat target by 12 min. Logic understood solo;
took syntax reference from CHALLENGES.md skeleton and EmployeeList.js.
Mental model after: "custom hook = importable JS module, like a
CommonJS file you import where needed." Sharpened in discussion to:
custom hook is a FACTORY — every component that calls it gets its own
independent state instance, not a shared utility. The "use" prefix is
a contract with React's runtime/linter, not just a naming style.

  ──────────────────────────────────────────────────────────────────────
  THE PROBLEM (why this challenge exists)
  ──────────────────────────────────────────────────────────────────────

  Right now, EmployeeList.js owns sort state and the handleSort function:

    const [sort, setSort] = useState({ field: 'firstName', order: 'asc' });

    const handleSort = (field) => {
      if (field === sort.field) {
        setSort({ field: field, order: sort.order === 'asc' ? 'desc' : 'asc' });
        return;
      }
      setSort({ field: field, order: 'asc' });
    };

  That logic is NOT specific to employees. It would work identically for
  a list of products, customers, invoices, or anything else. But today
  it lives inside EmployeeList — so if you build a ProductList tomorrow,
  you would copy-paste this code. That is the smell this challenge fixes.


  ──────────────────────────────────────────────────────────────────────
  WHAT IS A CUSTOM HOOK? (the .NET mental model)
  ──────────────────────────────────────────────────────────────────────

  A custom hook is just a plain JavaScript FUNCTION:
    - Its name MUST start with "use" (this is how React identifies it)
    - It can call other hooks (useState, useEffect, useMemo, etc.)
    - It returns whatever you want (object, array, single value)

  .NET parallel:
    Component  =  Controller    (handles UI / HTTP)
    Custom hook =  Service       (reusable business logic)

  Just like in .NET you would extract logic from a fat controller into
  ISortService and inject it, in React you extract stateful logic from
  a fat component into a useSort() hook and call it.

  The difference: there is no DI container. You don't register the hook
  anywhere. You just import it and call it. React handles the "wiring"
  by tracking which component is currently rendering when the hook runs.


  ──────────────────────────────────────────────────────────────────────
  TASK
  ──────────────────────────────────────────────────────────────────────

  STEP 1 — Create a new folder and file:
    src/hooks/useSort.js

    (Convention: every custom hook lives in src/hooks/. One file per hook.)

  STEP 2 — Write the hook. Skeleton (fill in the blanks):

    import { useState } from 'react';

    function useSort(initialField) {
      const [sort, setSort] = useState({ field: initialField, order: 'asc' });

      const handleSort = (field) => {
        // Move the EXACT logic from EmployeeList here.
        // Do not change behavior. Just relocate the function.
      };

      return { sort, handleSort };
    }

    export default useSort;

  STEP 3 — Use the hook in EmployeeList.js:

    BEFORE (lines 80, 87-99):
      const [sort, setSort] = useState({ field: 'firstName', order: 'asc' });
      const handleSort = (field) => { ... };

    AFTER:
      import useSort from '../hooks/useSort';
      // ...
      const { sort, handleSort } = useSort('firstName');

    Delete the original useState and handleSort. The rest of the file
    stays exactly the same — `sort.field`, `sort.order`, and `handleSort`
    are still in scope, just supplied by the hook.


  ──────────────────────────────────────────────────────────────────────
  RULES
  ──────────────────────────────────────────────────────────────────────

  - The hook NAME must start with "use". `useSort`, not `sortHook` or
    `getSort`. React's lint rules and runtime checks rely on this.
  - Hooks can only be called at the TOP LEVEL of a component or another
    hook. Never inside an if, loop, or callback. (Same rule as before
    for useState — it just now applies to your own hook too.)
  - EmployeeList must behave IDENTICALLY after the refactor. Click a
    column header → sort flips asc/desc. Click another → sort by that
    field, asc. Same as today. If anything looks different, you broke it.


  ──────────────────────────────────────────────────────────────────────
  COMMON MISTAKES TO AVOID
  ──────────────────────────────────────────────────────────────────────

  1. Forgetting to RETURN the values:
     If you don't `return { sort, handleSort }`, the component gets
     `undefined` and crashes on `sort.field`.

  2. Returning the wrong shape:
     The component does `const { sort, handleSort } = useSort(...)`.
     So the hook MUST return an object with exactly those two keys.
     Returning `[sort, handleSort]` (array) would also work but you
     would have to destructure as an array in the component.

  3. Trying to read `sort` outside the hook by exporting `setSort`:
     Don't expose `setSort`. The whole point is that `handleSort` is
     the only sanctioned way to change sort state. Hide the setter.

  4. Calling the hook conditionally:
     `if (something) { const x = useSort('name'); }` — illegal. Hooks
     must run in the same order on every render. Top-level only.


  ──────────────────────────────────────────────────────────────────────
  WHY THIS MATTERS (the enterprise angle)
  ──────────────────────────────────────────────────────────────────────

  Custom hooks are how real React codebases stay sane. A typical
  enterprise EmployeeList component is 800-1500 lines if all logic
  lives inline. After extraction:
    useSort, useFilter, usePagination, useEmployees, useDebounce,
    useAuth, usePermissions, ...
  the component shrinks to ~200 lines of pure JSX + composition.

  This challenge is small (one hook, one piece of state). Round 11.2
  and 11.3 will extract bigger ones. By the end of Round 11, your
  EmployeeList will be HALF its current size and twice as readable.

  This is the single most important pattern in modern React. Get it
  into muscle memory now.


  ──────────────────────────────────────────────────────────────────────
  WHAT YOU JUST LEARNED
  ──────────────────────────────────────────────────────────────────────

  Custom hooks are how you extract stateful logic from components.
  Same idea as moving logic from a controller into a service in .NET —
  the component gets simpler, the logic becomes reusable, and you
  start thinking in terms of COMPOSING hooks instead of writing
  one giant component that does everything.


CHALLENGE 11.2 — Extract useEmployeeFilter hook            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: 5 minutes (excluding side discussion on naming + hook
semantics). Beat target by 20 min. Logic understood solo; copy-pasted
filter chain syntax from EmployeeList.js. Self-assessment milestone:
"I know what needs to be done once I understand the question — only
syntax has rust." This matches the bar: logic-solo, syntax-referenced.
Sharpened understanding during this challenge: a hook named useFilter
implies generic reuse it doesn't have — renamed to useEmployeeFilter
to match real enterprise naming (per-entity hooks, not fake-generic).

  ──────────────────────────────────────────────────────────────────────
  THE PROBLEM (why this challenge exists)
  ──────────────────────────────────────────────────────────────────────

  EmployeeList.js currently has FIVE pieces of filter state:

    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('');
    const [hideBelow50K, sethideBelow50K] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');

  Plus a chained filter derivation:

    const filtered = employees
      .filter(emp => `${emp.firstName} ${emp.lastName} ...`.includes(search))
      .filter(emp => !department || emp.department === department)
      .filter(emp => !hideBelow50K || emp.salary >= 900)
      .filter(emp => !minSalary || emp.salary >= parseFloat(minSalary))
      .filter(emp => !maxSalary || emp.salary <= parseFloat(maxSalary));

  All ten lines are filter logic. None of it is specific to
  EmployeeList — any list with searchable/filterable rows would need
  the same shape. This is even more obviously reusable than `useSort`.


  ──────────────────────────────────────────────────────────────────────
  WHAT'S NEW VS 11.1 (the conceptual jump)
  ──────────────────────────────────────────────────────────────────────

  11.1 introduced custom hooks. 11.2 adds two new wrinkles:

  1. THE HOOK TAKES A PARAMETER.
     `useEmployeeFilter(employees)` receives the array to filter.
     Hooks are just functions — they accept arguments like any function.

     .NET parallel: a service method that takes a List<Employee> and
     returns a filtered IEnumerable<Employee>. Same idea.

  2. THE HOOK RETURNS A DERIVED VALUE, NOT JUST STATE.
     `filtered` is computed FROM state (the search/department/salary
     filters) and the input (employees). It is recomputed on every
     render of the component that uses the hook.

     This is the big leap: a hook does not just hold state. It can
     OWN A SLICE OF LOGIC — state + computation + handlers — and
     expose only what the caller needs.

  3. OBJECT RETURN, NOT ARRAY.
     `useSort` got away with `return [sort, handleSort]` because it
     returns 2 things. `useEmployeeFilter` returns 9+ things — array
     destructuring by position would be unreadable. Use an object.

     Convention:
       - 2 values, paired (state + setter)  →  array return
       - Many values, mixed shapes          →  object return


  ──────────────────────────────────────────────────────────────────────
  TASK
  ──────────────────────────────────────────────────────────────────────

  STEP 1 — Create the file:
    src/hooks/useEmployeeFilter.js

    NAMING NOTE: We call this `useEmployeeFilter`, not `useFilter`,
    because the filter shape is specific to Employee (search,
    department, salary range). A generic `useFilter` would have to
    accept filter definitions as parameters — a different design.
    Real codebases name hooks specifically per entity. Don't claim
    generic reuse you don't have.

  STEP 2 — Skeleton (fill in the blanks):

    import { useState } from 'react';

    function useEmployeeFilter(employees) {
      const [search, setSearch] = useState('');
      const [department, setDepartment] = useState('');
      const [hideBelow50K, sethideBelow50K] = useState('');
      const [minSalary, setMinSalary] = useState('');
      const [maxSalary, setMaxSalary] = useState('');

      const filtered = employees
        .filter(/* search filter */)
        .filter(/* department filter */)
        .filter(/* hideBelow50K filter */)
        .filter(/* minSalary filter */)
        .filter(/* maxSalary filter */);

      return {
        search, setSearch,
        department, setDepartment,
        hideBelow50K, sethideBelow50K,
        minSalary, setMinSalary,
        maxSalary, setMaxSalary,
        filtered,
      };
    }

    export default useEmployeeFilter;

  STEP 3 — In EmployeeList.js:

    BEFORE:
      const [search, setSearch] = useState('');
      const [department, setDepartment] = useState('');
      const [hideBelow50K, sethideBelow50K] = useState('');
      const [minSalary, setMinSalary] = useState('');
      const [maxSalary, setMaxSalary] = useState('');
      // ... (the localStorage useEffect for search stays in EmployeeList
      //      OR moves into useEmployeeFilter — your call. Both are valid.)
      const filtered = employees.filter(...).filter(...);

    AFTER:
      import useEmployeeFilter from '../hooks/useEmployeeFilter';
      // ...
      const {
        search, setSearch,
        department, setDepartment,
        hideBelow50K, sethideBelow50K,
        minSalary, setMinSalary,
        maxSalary, setMaxSalary,
        filtered,
      } = useEmployeeFilter(employees);

    Keep the `sorted` line (Round 5 sort) — it operates on `filtered`
    and stays in EmployeeList for now. We'll address it later.


  ──────────────────────────────────────────────────────────────────────
  RULES
  ──────────────────────────────────────────────────────────────────────

  - The hook receives `employees` as a PARAMETER. It does NOT fetch.
    Fetching is Round 11.3's job (useEmployees).
  - EmployeeList behavior must NOT change. Same search box, same
    department dropdown, same salary range, same checkbox — all
    behave identically.
  - Read the entire TASK before writing. Don't half-extract.


  ──────────────────────────────────────────────────────────────────────
  COMMON MISTAKES TO AVOID
  ──────────────────────────────────────────────────────────────────────

  1. Forgetting to PASS employees to the hook:
     `const { filtered } = useEmployeeFilter();` — `filtered` will be
     undefined. The hook needs the array as input.
     `useEmployeeFilter(employees)`.

  2. Returning `filter` instead of `filtered`:
     `filter` is the array method name. `filtered` is the variable.
     Easy typo, hard-to-find bug.

  3. Filtering an undefined array on first render:
     If `employees` starts as `null` (before fetch completes), then
     `null.filter(...)` crashes. Currently EmployeeList initialises
     employees as `[]`, so this is fine. If you ever change that, the
     hook would need a guard: `(employees || []).filter(...)`.

  4. Forgetting `sethideBelow50K` is mis-cased on purpose:
     Note the lowercase `s` in `sethideBelow50K` (existing typo in the
     codebase). Match it exactly so EmployeeList's existing JSX still
     works. Don't "fix" it as part of this challenge — minimal scope.

  5. Re-declaring filter state in EmployeeList by accident:
     If you don't DELETE the old useState lines, you'll have two copies
     of every filter — one in the hook (used by `filtered`) and one in
     the component (wired to the inputs). The UI will appear dead because
     setting the component state doesn't affect the hook's state.


  ──────────────────────────────────────────────────────────────────────
  THE LOCALSTORAGE useEffect — KEEP IT OR MOVE IT?
  ──────────────────────────────────────────────────────────────────────

  EmployeeList.js currently has:
    useEffect(() => { localStorage.setItem('search', search); }, [search])

  Two valid choices:
    A) Leave it in EmployeeList (simpler, less to change).
    B) Move it into useEmployeeFilter (cleaner — the hook owns search state,
       so it should own search persistence too).

  Recommendation: leave it in EmployeeList for now (option A). Round
  11 is about extraction, not architecture cleanup. If you want to
  move it later, that's a separate refactor. Minimal scope for now.


  ──────────────────────────────────────────────────────────────────────
  WHY THIS MATTERS (the enterprise angle)
  ──────────────────────────────────────────────────────────────────────

  Almost every enterprise list view has filters. Search box, dropdown
  filters, date ranges, checkboxes. A per-entity filter hook
  (`useEmployeeFilter`, `useProductFilter`, etc.) is one of the most
  common custom hook patterns you will see in production React.
  Generic `useTableFilters` exists too but is harder to design well —
  most teams build per-entity hooks first and only generalise later
  if the same shape repeats 3+ times (the Rule of Three).

  Bonus consideration (DON'T fix this now, but notice it):
    The filter chain runs on EVERY render — even if only `selected` or
    `view` state changes (which have nothing to do with filters). This
    is wasteful. The fix is `useMemo`, which Round 11+ will hint at.
    For now, correctness over performance.


  ──────────────────────────────────────────────────────────────────────
  HINTS (only if stuck 10+ min)
  ──────────────────────────────────────────────────────────────────────

  - Start by copy-pasting the state declarations and `filtered` chain
    into useEmployeeFilter.js, wrap them in a function, add the return object.
    Then delete them from EmployeeList.
  - If the UI freezes / inputs don't react: check that EmployeeList is
    using the destructured `setSearch` etc. from the hook, not the
    deleted local ones.


  ──────────────────────────────────────────────────────────────────────
  WHAT YOU JUST LEARNED
  ──────────────────────────────────────────────────────────────────────

  A hook can accept parameters. Passing `employees` in lets the hook
  derive `filtered` — the hook "closes over" the parameter just like
  any function closes over its arguments.

  More importantly: a hook can OWN A FEATURE — state + derivation +
  setters — and expose a clean interface. The component goes from
  "knows everything about filtering" to "asks useEmployeeFilter to handle
  filtering and just renders the result." That separation is the
  whole point of Round 11.


CHALLENGE 11.3 — Extract useEmployees hook                 Target: 20 min
--------------------------------------------------------------------------
YOUR TIME: ~13 min est (target 20). Logic understood solo; copy-pasted
fetch and delete bodies from EmployeeList.js (logic-solo, syntax-referenced).

Architectural decisions taken unprompted:
  1. Removed `setEmployees` from the return — nothing outside the hook
     consumed it. Deviated from the spec, but the deviation is YAGNI-clean
     (don't widen the public surface for hypothetical needs).
  2. Removed `fetchEmployees` from the return — moved its useEffect inside
     the hook, so no external caller is needed. Matches the spec's RULE:
     "fetchEmployees doesn't need to be returned if EmployeeList doesn't
     call it directly."
  3. Kept `fetchedAt` inside the hook (full feature ownership — the
     timestamp is *about* the fetch, so it belongs with the fetch).
     Same instinct as 11.2's localStorage-into-hook decision.

New concept surfaced (and clicked):
  - useEffect dep arrays + function identity. First attempt used
    `[fetchEmployees]` as deps after the extraction, which causes an
    infinite loop because functions are recreated every render →
    reference inequality → effect re-fires → setState → re-render.
    Three fixes explained: `[]` for mount-only, move the function
    inside the effect's closure, or `useCallback`. Mapped to .NET
    delegate-reference comparison — clicked immediately.

Final cleanup pass: requested unused-removal and comment cleanup across
both files (hook + EmployeeList). EmployeeList is now mostly JSX,
organized into HOOKS / LOCAL UI STATE / DERIVED VALUES / NAVIGATION +
USER INFO / HANDLERS / RENDER sections — Round 11's stated goal achieved.

Move the fetch and delete logic out of EmployeeList into a hook.

  TASK:
  1. Create: src/hooks/useEmployees.js
  2. useEmployees() returns:
       { employees, setEmployees, loading, handleDelete }
  3. Move into the hook: employees useState, loading useState, the
     fetchEmployees function, the handleDelete function, and the
     useEffect that calls fetchEmployees on mount.
  4. Move the toast import too — it's used inside handleDelete.
  5. In EmployeeList.js replace with:
       const { employees, setEmployees, loading, handleDelete } = useEmployees();

  RULES:
  - navigate is used inside handleDelete for the logout flow — if it's
    not used there, remove it from handleDelete. Check first.
  - fetchEmployees doesn't need to be returned if EmployeeList doesn't
    call it directly (the hook's own useEffect handles it).
  - EmployeeList behavior must not change.

  WHAT YOU JUST LEARNED:
  After Round 11, EmployeeList.js should be mostly JSX. That's the goal.
  Components render. Hooks manage state. Same as separating a controller
  from its service layer — each piece has one job.


================================================================================
ROUND 12 — ADVANCED PATTERNS                               Target: ~100 min
Multiple concepts in play. Read each task fully before starting.
================================================================================

CHALLENGE 12.1 — Pagination                                Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: ~8 min est (target 30). Syntax copied verbatim from this
challenge's TASK block — pagination is mostly array slicing once you
see the pattern, no real friction. Logic understood solo.

One spec gap caught during review: the suggested reset useEffect
`useEffect(() => { setPage(1); }, [search, department, hideBelow50K])`
misses `minSalary` and `maxSalary` (added in a later challenge round).
Refactored to `[filtered.length]` — depends on the result count instead
of enumerating each filter, so it stays correct as new filters are
added. User chose this on first try after the flag.

Side data prep (not part of the challenge time): grew employees.json
from 3 → 79 records, salaries rescaled to $550–$2000 so the
hideBelow50K filter (which actually checks >= 900) has ~16 records
to hide. 11 departments for dropdown variety.

Open items to finish before marking 12.1 fully done:
  1. Stale comment "(not implemented yet)" on the page useState line.
  2. Next-button edge case: `disabled={page === totalPages}` doesn't
     catch totalPages=0 (when filters return zero results). Fix to
     `>= totalPages`.
  3. Pagination controls placed between table and selectedEmployee
     label. Move the label above pagination or move pagination
     outside the Fragment.

The list can grow long. Add pagination: 10 employees per page with
Prev / Next buttons and a "Page X of Y" label.

  TASK:
  1. Add: const [page, setPage] = useState(1);
         const pageSize = 10;
  2. After `sorted`, derive:
       const totalPages = Math.ceil(sorted.length / pageSize);
       const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize);
  3. Render paginated instead of sorted in the table .map().
  4. Below the table, render:
       <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
       <span> Page {page} of {totalPages} </span>
       <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
  5. When any filter changes, reset to page 1:
       useEffect(() => { setPage(1); }, [search, department, hideBelow50K]);

  RULES:
  - totalPages and paginated are derived — not state.
  - setPage(p => p - 1) is the safe functional updater form.
  - The reset useEffect is critical — without it, changing a filter
    while on page 5 could leave you stranded on an empty page.

  WHAT YOU JUST LEARNED:
  Pagination is just array slicing. One piece of state (page) drives
  everything. Everything else is derived.


CHALLENGE 12.2 — Replace window.confirm with a modal       Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

window.confirm() is blocking and can't be styled. Replace it with a
React modal component.

  TASK:
  1. Create: components/ConfirmModal.js
     Props: isOpen (bool), message (string), onConfirm (fn), onCancel (fn)
     Render nothing when isOpen is false. When true, show an overlay with
     the message and two buttons: "Yes, Delete" and "Cancel".
  2. In EmployeeList.js (or useEmployees hook):
     - Add state: const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
     - handleDelete(id, name): set confirm to open with id and name — do NOT
       call the API yet.
     - handleConfirmDelete(): call deleteEmployee(confirm.id), reset confirm.
     - handleCancelDelete(): reset confirm to { open: false, id: null, name: '' }.
  3. Render <ConfirmModal> in the JSX, wired to the confirm state.

  RULES:
  - No window.confirm() anywhere after this challenge.
  - ConfirmModal must be absolutely positioned (a real overlay with a dark
    background behind it), not inline in the table.
  - Read each step before writing it.

  WHAT YOU JUST LEARNED:
  State-driven modals follow the same pattern as everything else: a flag
  controls visibility, callbacks wire actions back up to the parent.
  No DOM manipulation — React renders or doesn't based on the state flag.


CHALLENGE 12.3 — Undo delete                               Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

After deleting an employee, give the user 5 seconds to undo it. Show a
toast with an "Undo" button. If clicked, the employee comes back.

  TASK:
  1. In handleDelete, after the API call succeeds:
     - Capture the deleted employee BEFORE removing from state:
         const deleted = employees.find(e => e.id === id);
     - Remove from state as usual (setEmployees filter).
     - Show a toast with an Undo button inside:
         toast.success(
           <span>
             {name} deleted.{' '}
             <button onClick={() => handleUndo(deleted)}>Undo</button>
           </span>,
           { autoClose: 5000 }
         );
  2. Write handleUndo(employee):
     - Add the employee back to local state:
         setEmployees(prev => [...prev, employee]);
     - Show: toast.success('Delete undone.');

  RULES:
  - Undo is local-only (add back to state). No API call to restore.
  - The deleted employee must be captured before the state update —
    after setEmployees it's gone from the array.
  - react-toastify supports JSX inside toast() — the button is valid.

  WHAT YOU JUST LEARNED:
  Toasts can contain interactive JSX. "Undo" patterns don't need complex
  state — capture what you need before removing it, pass it into the
  handler, and restore with a state update.


================================================================================
TRACKING
================================================================================

Fill this in as you complete each challenge:

  Challenge  | Target  | Your Time | Completed?
  -----------|---------|-----------|----------
  1.1        | 10 min  | 16 min    | Over target — didn't refresh browser to verify.
  1.2        | 10 min  | 3 min     | Beat target.
  1.3        | 15 min  | 1 min     | Not tested — drafted only, not verified.
  2.1        |  5 min  | 1 min     | Beat target.
  2.2        |  5 min  | 1 min     | Beat target.
  2.3        | 10 min  | 1 min     | Beat target.
  3.1        | 15 min  | N/A       | Already in the code; spent time looking in wrong place.
  3.2        | 15 min  | 1 min     | Beat target.
  3.3        | 25 min  | 12 min    | Beat target. Fragment issue fixed with help. Salary search not filtering numbers.
  4.1        | 10 min  | 5 min     | Beat target. Prior JS/jQuery experience helped.
  4.2        | 20 min  | 5 min     | Beat target.
  4.3        | 10 min  | 1 min     | Beat target.
  5.1        | 30 min  | 17 min    | Beat target. Help needed on filter chaining and deriving unique departments.
  5.2        | 30 min  | N/A       | Not own solution — Claude wrote comparator and handleSort. Redone in 6.4.
  6.1        | 10 min  | ~10 min*  | *coding time; spread over full day (2026-04-22, first code in ~8 months). Filter logic help taken.
  6.2        | 15 min  | 15 min    | On target. Stale-state bug clicked.
  6.3        | 20 min  | 4 min     | Beat target. "Derive don't store" clicked.
  6.4        | 30 min  | 10-12 min | Beat target. Sort logic now yours. Arrows skipped (concept held).
  6.5        | 25 min  | 8-9 min   | Beat target. Right shape chosen. "Store key, not value" clicked.
  7.1        | 10 min  | ~5-10 min | Mixed up Salary/Status columns (focus, not logic). First session back after 5-day break.
  7.1b       |  5 min  | 1 min     | Extra <td> wrapper bug caught on review; fixed immediately.
  7.1c       |  5 min  | 1 min     | Copy-pasted pattern. Clean — no wrapper bug this time.
  7.1d       | 10 min  | 2 min     | Extra <td> wrapper again. Callback concept explained — child renders, parent decides.
  7.2        | 10 min  | 2 min     | Clean export/import. Unused imports in StatusBadge.js.
  7.3        | 20 min  | 10 min    | Beat target. Wrote EmployeeRow.js manually. Multi-prop + callback pattern clicked.
  7.4        | 10 min  | ~4 min    | Already done in 7.3 — had destructuring from the start. Attempted ({ props }) which is wrong (destructures a prop named "props", not the props object). Also tried bundling props into a manual object in EmployeeList. Zero actual change needed — lesson: you wrote the right pattern in 7.3 without realising it.
  7.5        | 25 min  | >25 min   | Concept understood but implementation had multiple issues: (1) put useState calls outside the component at file level — fundamental hook rule broken; (2) `=> {` instead of `=> (` — told twice, file still had wrong syntax both times; (3) tried to bundle props into a manual object in EmployeeList and pass as single `props` prop — showed parent-child wiring mental model was not fully clear. Filters working after fixes.
  7.6        | 15 min  | 6 min     | Beat target. First attempt broke core rule (passed 3 derived props instead of filtered array). Fixed on second try. Reading issue, not logic issue.
  8.1        | 10 min  | ~1 min    | Beat target. Caught toFixed(2) string bug independently.
  8.2        | 15 min  | 2-3 min   | Beat target. All 8 columns. Autocomplete for repetition.
  8.3        | 10 min  | 3 min     | Beat target. No help. Correct solution.
  8.4        | 10 min  | 4 min     | Beat target. Autocomplete in EmployeeList.js wrote part of parent-side wiring while working on FilterBar.js.
  9.1        |  5 min  | 1 min     | Beat target.
  9.2        | 10 min  | 5 min     | Beat target.
  9.3        | 20 min  | 4 min     | Beat target.
  10.1       | 10 min  | 4 min     | Beat target. EmployeeForm.js already had `loading`/`disabled={loading}`; commented it out and added the new `isSubmitting` pattern.
  10.2       | 20 min  | 10 min    | Beat target by 10 min. Wrote validate() and handleSubmit wiring solo. Wrote the first error <p> block manually; autocomplete handled the repetitive ones for the other fields. Logic-solo, syntax-referenced via autocomplete — matches the bar.
  10.3       | 20 min  | 7 min     | Beat target by 13 min. Filter pattern fully internalised. Asked the right conceptual question afterward: "why do filters apply on input change when we never wired them?" — re-render flow.
  11.1       | 20 min  | 8 min     | Beat target by 12 min. Logic understood solo; took syntax reference from CHALLENGES.md skeleton and EmployeeList.js. Mental model after: "custom hook = importable JS module." Sharpened to: factory that gives each calling component its own state instance (not a shared utility).
  11.2       | 25 min  | 5 min     | Beat target by 20 min. Excludes side discussion on naming/hook semantics. Copy-pasted filter chain from EmployeeList.js (logic-solo, syntax-referenced). Two senior-level instincts on this challenge: (1) questioned generic hook name → renamed to useEmployeeFilter; (2) moved localStorage useEffect AND lazy initializer into the hook without reading the suggestion (chose option B over recommended option A). Both decisions are architecturally cleaner — feature ownership over minimal scope. Self-articulated: "I know what to do if I understand the question; only syntax has rust." Healthy stage.
  11.3       | 20 min  | ~13 min   | Beat target by ~7 min. Logic-solo, syntax-referenced. Two senior-instinct deviations from spec (dropped setEmployees and fetchEmployees from return — both YAGNI-clean). Surfaced function-identity / useEffect dep gotcha — full explanation given, .NET delegate analogy clicked. Final pass: requested cleanup of unused code and comments across both files.
  12.1       | 30 min  | ~8 min    | Beat target by ~22 min. Syntax copy-pasted from spec; logic understood solo. Caught spec gap: reset useEffect deps `[search, department, hideBelow50K]` missed minSalary/maxSalary. Refactored to `[filtered.length]` — cleaner, future-filter-safe. 3 minor polish items open (stale comment, totalPages=0 edge case, control placement).
  12.2       | 35 min  |           |
  12.3       | 35 min  |           |

  Total target time: ~10h (Rounds 1–7: ~5h | Round 8: 45m | Round 9: 35m |
                           Round 10: 50m | Round 11: 65m | Round 12: 100m)
  Your total time:   ___

After you finish all challenges, you will understand:
  - How .NET Clean Architecture works (layers, DI, interfaces)
  - How React components, state, and effects work
  - How React and .NET communicate over HTTP
  - How to add full-stack features (model → service → controller → form → table)
  - How to extract reusable logic into custom hooks
  - How to build production-quality forms with validation
  - How to manage advanced UI patterns (pagination, modals, undo)
