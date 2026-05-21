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
YOUR TIME: ~22 min (2026-05-12) — beat target by 13. Logic-solo on state
shape + two-step delete + option B (handlers in hook). Stuck once on
rendering JSX inside the hook body — clicked after "hooks return data,
components render JSX." Side-quest: pre-existing dead App.css import.

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
YOUR TIME: ~6-7 min (2026-05-12) — beat target by ~28 min. Syntax
copy-referenced from this challenge's TASK block (user's standing
working pattern, see Logic-vs-Syntax note). Logic-solo on the
capture-before-remove order and the Undo-button-in-toast pattern.

Stuck point: tried `toast.dismiss(this.toastId)` — .NET/jQuery reflex.
`this` is undefined inside an arrow-fn-in-a-hook. Pattern internalized:
`const toastId = toast.success(...)` captures the ID; the onClick closure
reads `toastId` at click time, by which point assignment has completed
(same shape as a captured C# delegate).

Cleanup pass after the implementation: added function-level comments,
fixed mixed-indent / object-literal spacing across useEmployees +
EmployeeList + ConfirmModal. Two real bugs surfaced during the cleanup:
  1. Leftover `debugger` statement in ConfirmModal (would pause DevTools
     every time the modal opened).
  2. Prop-name mismatch — ConfirmModal destructured `oncancel`, parent
     passed `onCancel`. Cancel button was wired to undefined and did
     nothing. Renamed to `onCancel` and the button works.

Closed remaining 12.1 polish items in the same pass:
  - Next-button `page === totalPages` -> `page >= totalPages` (handles
    the totalPages=0 case when filters return zero results).
  - Selected-employee label moved above the pagination controls (was
    sitting between pagination and the modal).

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
ROUND 13 — ADVANCED PATTERNS (designed 2026-05-12, post-Round-12)
================================================================================

Round 12 finished the vanilla React UX patterns. Round 13 covers the
"enterprise" patterns that show up in every production React codebase:
state machines (useReducer), cross-component state (Context), perf
controls (memo / useCallback / useMemo), and resilience (ErrorBoundary).

13.5 is intentionally different — a "no-reference" capstone to measure
where your syntax recall actually is. Logic-solo is the bar as always;
the question 13.5 answers is *how much* you still need to look up.


CHALLENGE 13.1 — Replace useState with useReducer            Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: ~5 min (2026-05-12) — beat target by 25 min. Logic-solo,
syntax copied from spec (standing pattern). Reducer is correctly pure:
switch on action.type, immutable returns, default case returns state.
All 3 dispatch sites wired (handleDelete → 'open', onConfirm finally
→ 'close', onCancel → 'close'). Pattern clicked immediately — same shape
as a .NET state-machine where each method returns a new state.
Caught during review: leftover `debugger` statement before the return
(2nd occurrence — first was in ConfirmModal during 12.2). Becoming a
pattern — needs a "ctrl+shift+F for `debugger`" reflex before done.
Minor: quote style inconsistency between `'open'` and `"close"`.

The confirm state in useEmployees has 3 fields and 2 distinct transitions
(open / close). useState is fine but useReducer makes the transitions
explicit and pure-functional. Same pattern that Redux / Zustand / React
Query all build on under the hood.

  TASK:
  1. Above useEmployees (or in a separate file), define the reducer:

       function confirmReducer(state, action) {
         switch (action.type) {
           case 'open':  return { open: true, id: action.id, name: action.name };
           case 'close': return { open: false, id: null, name: '' };
           default:      return state;
         }
       }

  2. In useEmployees, replace:
       const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
     with:
       const [confirm, dispatch] = useReducer(confirmReducer, { open: false, id: null, name: '' });

  3. Update handleDelete:
       dispatch({ type: 'open', id, name });
  4. Update onConfirm finally + onCancel:
       dispatch({ type: 'close' });

  RULES:
  - The reducer must be a PURE FUNCTION — no setState calls, no API calls,
    no side effects. Just state in, state out.
  - Default case returns the state unchanged. Don't throw — silent
    fallthrough is the convention.

  WHAT YOU JUST LEARNED:
  useReducer = state machine with named transitions. Same shape as a .NET
  state object with methods, but the methods are pure data (action objects)
  instead of mutating functions. The reducer is independently testable.


CHALLENGE 13.2 — Context API for auth                        Target: 45 min
--------------------------------------------------------------------------
YOUR TIME: ~14-15 min (2026-05-12) — beat target by ~30 min. Logic-solo
on the AuthContext shape, Provider wrap, and useAuth narrowing. Three
small rust points surfaced and closed inline:
  1. `const x = useAuth(); x(args)` — treated useAuth as a function.
     Reframe: useAuth returns the value object `{ user, login, logout }`,
     not a function. Destructure to get the function.
  2. `const { loginCredentials } = useAuth();` — destructured a property
     that didn't exist (context exposes `login`, not `loginCredentials`).
  3. Name collision in Login.js: an existing local `login` variable
     clashed with `login` from context. Pattern learned: destructure
     with rename — `const { login: doLogin } = useAuth();`.
Logout crash: post-logout, `user` becomes null and EmployeeList re-renders
once before ProtectedRoute redirects, crashing on `user.fullName`. Fixed
with optional chaining `user?.fullName`. Pattern internalised: any value
that can become null mid-flow needs `?.` access in the JSX.

Right now, user info is scraped from localStorage in 3 different places
(Login.js, EmployeeList.js, api.js interceptor). That's prop-drilling-by-
localStorage. Wrap it in a Context so every component reads the same source.

  TASK:
  1. Create src/context/AuthContext.js:

       import { createContext, useContext, useState } from 'react';

       const AuthContext = createContext(null);

       export function AuthProvider({ children }) {
         const [user, setUser] = useState(() =>
           JSON.parse(localStorage.getItem('user') || 'null')
         );

         const login = (userData, token) => {
           localStorage.setItem('user', JSON.stringify(userData));
           localStorage.setItem('token', token);
           setUser(userData);
         };

         const logout = () => {
           localStorage.removeItem('user');
           localStorage.removeItem('token');
           setUser(null);
         };

         return (
           <AuthContext.Provider value={{ user, login, logout }}>
             {children}
           </AuthContext.Provider>
         );
       }

       export const useAuth = () => useContext(AuthContext);

  2. Wrap <App /> in <AuthProvider> in index.js.
  3. In Login.js: instead of writing localStorage directly, call
       const { login } = useAuth();
       login(userData, token);
  4. In EmployeeList.js: replace the localStorage.getItem("user") parse with:
       const { user, logout } = useAuth();
     And call logout() in handleLogout instead of clearing localStorage manually.

  RULES:
  - Lazy initializer pattern in useState (the `() => JSON.parse(...)`) — only
    runs once on mount, not on every render. This is the same pattern from
    useEmployeeFilter localStorage.
  - useContext returns null if there is no Provider above it. Don't forget
    the wrap in index.js.

  WHAT YOU JUST LEARNED:
  Context = global state without prop drilling. Maps to .NET = registering
  a singleton service in the DI container. The pattern that grows into
  Redux / Zustand / React Query — they all use Context underneath.


CHALLENGE 13.3 — React.memo + useCallback                    Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: ~20 min (2026-05-12) — beat target by 10, but the most
friction-heavy challenge of Round 13 so far. Memo concept itself clicked
quickly once explained; what slowed things was a cluster of small
JS/React-structural pieces, all syntax-layer:

  1. Couldn't add console.log inside the `=> (` implicit-return form —
     JS gotcha (expression body vs block body). Reframe: `=> (` returns
     ONE expression; for statements, use `=> { ...; return (...); }`.
  2. Tried to declare `const onEdit = useCallback(...)` inside the JSX /
     `.map` — React structural rule: declarations live in the component
     body, not inside the render output.
  3. Prop-signature mismatch: EmployeeRow passed the WHOLE `employee`
     object to onEdit/onDelete, but the parent's useCallback signatures
     expected `(id)` and `(id, name)`. Edit/Delete navigated to
     `[object Object]` until fixed.
  4. Third leftover `debugger` in 3 challenges. Pattern is real — adding
     a "ctrl+shift+F debugger" reflex before done is the right
     correction.

Conceptual mental model captured separately in
`Downloads/react-memo-explained.txt` after this round so the
function-identity trap doesn't have to be re-derived. Sharpening note:
13.3 had THREE interlocking pieces (memo wrap + useCallback at parent +
prop signature in child) — first challenge that required getting all
three right for the optimization to actually work. Structural complexity
> any single previous round.

EmployeeRow re-renders on EVERY parent re-render — even when typing in the
search box (which doesn't change any row's props). On a 79-row table that's
79 unnecessary re-renders per keystroke. Fix it with React.memo + useCallback.

  TASK:
  1. In EmployeeRow.js, add a render log at the top of the component:
       console.log('EmployeeRow render:', employee.id);
     Then export the component wrapped in memo:
       import { memo } from 'react';
       export default memo(EmployeeRow);

  2. Open DevTools, type in the search box. Watch the console.
     You'll still see every row re-render. React.memo can't see "props
     unchanged" because `onEdit`, `onDelete`, `onSelect` are NEW functions
     every render.

  3. In EmployeeList.js, wrap the callbacks in useCallback:
       const onEdit = useCallback((id) =>
         navigate(`/employees/edit/${id}`), [navigate]);
       const onDelete = useCallback((id, name) =>
         handleDelete(id, name), [handleDelete]);
     Pass these to EmployeeRow instead of inline arrow functions.

  4. Type in the search box again. Now only rows whose `employee` actually
     changed should re-render. (Probably none — search filters them OUT,
     it doesn't change them.)

  5. Remove the console.log after verifying.

  RULES:
  - React.memo does a shallow prop comparison. Functions and objects
    created inline = new identity every render = memo is defeated.
  - useCallback's dep list matters. Wrong deps = stale closure.

  WHAT YOU JUST LEARNED:
  Function identity is the silent killer of React perf. React.memo +
  useCallback together = avoid unnecessary re-renders. Maps to .NET:
  a new lambda is a new delegate; equality is reference, not "logical
  sameness." Same trap, same fix.


CHALLENGE 13.4 — Error Boundary                              Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: ~10 min (2026-05-12) — beat target by 15. Clean class-component
implementation: getDerivedStateFromError + componentDidCatch + handleRetry +
conditional render. Wrapped Router in App.js. Tonal break from the rest of
Round 13 (class instead of hooks) handled with no friction — the .NET
class-with-lifecycle-methods mental model carried over directly.
Minor polish: indentation drift in App.js (inner Router not nested under
ErrorBoundary) and ErrorBoundary.render() body, no file header comment.

Without an error boundary, a render-time throw in any component takes
down the whole React tree (white screen of death). With one, you isolate
the damage and show a fallback.

This is also the one place React still requires a CLASS component —
the hook API doesn't expose `componentDidCatch`.

  TASK:
  1. Create src/components/ErrorBoundary.js:

       import { Component } from 'react';

       class ErrorBoundary extends Component {
         state = { hasError: false, error: null };

         static getDerivedStateFromError(error) {
           return { hasError: true, error };
         }

         componentDidCatch(error, info) {
           console.error('ErrorBoundary caught:', error, info);
         }

         handleRetry = () => this.setState({ hasError: false, error: null });

         render() {
           if (this.state.hasError) {
             return (
               <div style={{ padding: 24 }}>
                 <h2>Something went wrong.</h2>
                 <p>{this.state.error?.message}</p>
                 <button onClick={this.handleRetry}>Retry</button>
               </div>
             );
           }
           return this.props.children;
         }
       }

       export default ErrorBoundary;

  2. In App.js, wrap your <Routes> (or just the protected ones):
       <ErrorBoundary>
         <Routes>...</Routes>
       </ErrorBoundary>

  3. Test it. Temporarily add to EmployeeList:
       if (employees.length > 5) throw new Error('Forced render crash');
     Reload — you should see the fallback, NOT a white screen. Click Retry.
     Then REMOVE the throw.

  RULES:
  - Error boundaries catch errors during RENDER, lifecycle methods, and
    child constructors. They do NOT catch errors in event handlers,
    async code, or server-side rendering.
  - The class component is correctness, not stylistic preference. Hooks
    cannot replace this yet.

  WHAT YOU JUST LEARNED:
  React error boundaries = controller-level try/catch in .NET. Same goal:
  contain failures so they don't cascade. The retry pattern is the same
  shape as a polly retry policy at the .NET layer.


CHALLENGE 13.5 — No-Reference Capstone                       Target: 45 min
--------------------------------------------------------------------------
YOUR TIME: ~75 min (2026-05-13) — over target by ~30 min.

[Claude — opener]: This was the right test of integration. Context +
custom hook + Modal + EmployeeList wiring all designed solo, in plain
English over Q&A, BEFORE writing a line of code. Architectural
decisions were senior-tier. The 30-min overrun was syntax-recall and a
try/catch logic gap — not unclear thinking.

What was built (self-designed, no spec; broader scope than the
original 13.5 brief — added cross-page state and a modal viewer):
  - RecentActivityContext.js — Context + Provider holding the activity
    list, mirrored on the AuthContext pattern user already had.
  - useRecentActivity custom hook — ergonomic accessor over the
    Context, exposes addActivity + the entries list.
  - RecentActivityModal.js — modal showing the last 5 entries, receives
    list + onClose as props.
  - EmployeeList wiring — useState boolean for modal visibility, "View
    Recent Activities" button toggles it, conditional render mirroring
    ConfirmModal's shape.
  - addActivity wired into useEmployees on both delete and undo paths
    (cap-at-5 by dropping the oldest).

Logic decisions made solo before code (all correct on first pass):
  - Context for shared state (not prop-drilling — matched auth pattern).
  - Modal visibility state in EmployeeList, NOT in the hook. Diagnostic
    "whose responsibility — hook or component?" applied correctly: hook
    returns data, component owns UI state.
  - Custom hook wraps Context (same shape a useAuth would have).
  - Files named recentActivityContext, useRecentActivity,
    RecentActivityModal — picked solo, confirmed before writing.

Stuck point 1 — inline onClick syntax: user found the ConfirmModal
mirror in the same file but couldn't reconstruct the
`onClick={() => setX(true)}` line from memory. Claude provided the one
line. Real diagnosis: VS Code autocomplete had been silently filling
the syntax-scaffolding role that the CHALLENGES.md TASK block plays in
formal challenges — when AC didn't carry this specific spot, recall hit
zero. Documented in the autocomplete-dependency memory.

Stuck point 2 — undo was a soft undo: refresh wiped the restored row
because handleUndo only updated React state, never re-created the
employee on the server. User added a POST /api/employee call. First
try/catch attempt placed the success-path (setEmployees + "Delete
undone" toast + addActivity) inside `finally` — which always runs.
Net effect would have been: on failure, error toast fires AND success
toast fires AND row reappears in UI AND activity log records success.
Concept reinforced (same as .NET): `finally` is for cleanup that must
run regardless of outcome; the success path goes in `try` after the
`await`. Fixed on second pass.

Backend ID-mismatch bug surfaced during review: EmployeeRepository
.CreateAsync overwrites the incoming Id with Guid.NewGuid(), so after
undo the server holds the employee under a NEW id while local state
still has the OLD id. Subsequent delete/edit on the undone row would
target a non-existent server id → 404. User noted and deferred the
fix to a backend-focused pass (will likely add an "if Id provided,
honor it" branch in CreateAsync).

Cleanup pass (same session):
  - Removed 5th leftover `debugger` statement. Habit watch is now a
    confirmed pattern, not a one-off.
  - Removed dead `const employeeData = { ...employee }` shallow copy
    (passed straight to createEmployee, never modified).
  - Combined two `from "../services/api"` imports into one line.
  - Updated stale comment "No API call — purely client-side" — the
    function does call the API now.
  - Fixed indentation drift in handleUndo (6-space inside try,
    `} catch (error) {` same-line to match the rest of the file,
    removed empty `finally {}` block).

User's own reflection mid-session: *"syntax rust is fine but I am
happy that I am logically improving in react.js"*. Later endorsed as
long-term strategy: *"I think I am bad in raw syntax recall from very
long, currently the focus should be on understanding react not
syntax."*

[Claude — closer]: Counting this as 13.5 done. Logic and architecture
were the wins; raw recall stalled in two predictable spots. AC-off
capstone idea retracted — would test the wrong thing. Round 13 is
fully closed. Real signal forward: in Rounds 14–18, time-over-target
on pure syntax-stall is expected and acceptable; the bar is whether
architectural decisions land correctly *before* writing code. They
did here.

This is the syntax-recall test. The goal isn't to build something
complicated — it's to find out which patterns your fingers actually
remember and which still need a lookup.

  SCOPE:
  Build a "Recent Activity" panel that shows the last 5 delete/undo
  events with timestamps. Display it below the table, above the modal.

  WHAT TO BUILD:
  1. A custom hook useActivityLog() that exposes:
       - entries: array of { id, action, name, at } (cap at 5 most recent)
       - log(action, name): pushes a new entry, drops the oldest if >5
  2. A RecentActivity component that renders the entries list with
     bullet styling. Empty state: "No recent activity."
  3. Wire it: call log('delete', name) inside the toast.success block
     in useEmployees, and log('undo', name) inside handleUndo.
     RecentActivity goes in EmployeeList above the modal.

  THE ACTUAL RULES (this is the test):
  - DO NOT copy syntax from this challenge body. There's no syntax shown
    above on purpose. Look only at React API docs (react.dev) if you must.
  - You MAY look at other components in this project for layout shape —
    but not for the hook/state pattern.
  - When you genuinely can't recall a syntax piece, write a one-line
    comment `// TODO: lookup syntax for X` and KEEP MOVING. Don't grind.
  - When done, list in the YOUR TIME notes which pieces needed lookup.
    Honest signal: that list shows where your recall actually is.

  WHAT YOU'RE MEASURING:
  - Pieces you wrote from muscle memory = ✓ internalised, no more drilling.
  - Pieces you had to look up = ✓ still need a few more reps.
  - Concept gaps (you genuinely don't know how to approach something) =
    flag — that's a real learning need, not just rust.

  WHAT COMES AFTER:
  Round 13 closes here. The next round is TypeScript migration. Round
  13.5's "lookup list" tells us what to drill once more in JS BEFORE we
  add TS on top — TypeScript will throw you back to "need reference" for
  every pattern; better to enter that phase with the JS muscle memory
  already firm.


================================================================================
ROUND 14 — TYPESCRIPT FOUNDATIONS (designed 2026-05-12)
================================================================================

Pacing: ONE round per week. This round is intentionally gentle.
TypeScript will reset your syntax recall to zero — that's expected, not a
setback. Your logic and design intuition carry over completely; only the
annotations are new. Do one challenge per day. Sit with each conversion
before moving on. The goal isn't speed here — it's letting TS feel
natural before Round 15 piles on more.


CHALLENGE 14.1 — Add TypeScript to the project              Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: ~24 min (done 2026-05-13). Beat target by 6 min.

  [Claude — notes]:
  Setup landed clean, but with one real-world snag worth recording.

  CRA peer-dep conflict: `npm install --save-dev typescript` pulled
  typescript@6.0.3 (latest), but `react-scripts@5.0.1` declares a peer
  dep of `typescript@"^3.2.1 || ^4"`. Install failed with ERESOLVE.
  Fix: pinned `typescript@4.9.5` (last v4 release, fully compatible
  with CRA 5). Reasonable because CRA is in maintenance — chasing the
  latest TS would require ejecting or migrating to Vite, neither of
  which fits this round.

  `npm audit fix` ran into the same conflict and was skipped. The 31
  CRA-stack vulns are background noise for a learning repo (no prod
  exposure, no secrets in deps) — accepted, not ignored.

  tsconfig.json created at Client root with the canonical settings
  from the spec block above. `strict: true` is on. `isolatedModules`
  is on (required because CRA's babel transpiler can't see across
  files — every .ts/.tsx must be a valid module on its own, hence the
  `export {}` trick when a file has nothing else to export).
  `jsx: "react-jsx"` is the new (React 17+) transform — no need for
  `import React from 'react'` at the top of every component.

  StatusBadge.js → StatusBadge.tsx rename verified — `npm start`
  compiled clean, `npx tsc --noEmit` reported zero errors.

  Pattern internalised: TypeScript bolts onto a CRA project without a
  big-bang rewrite. .js and .tsx coexist; the bundler reads both. File-
  by-file migration is the right move, and the order should be leaves
  first (StatusBadge) → hooks → containers → entry points.

Install TypeScript, generate tsconfig.json, rename one file to .tsx, and
get a clean build. The smallest possible win — but the setup is real and
needs to work before anything else.

  TASK:
  1. cd EmployeeManager.Client
  2. Run:
       npm install --save-dev typescript @types/react @types/react-dom @types/node
  3. Create tsconfig.json at the Client root with reasonable defaults:
       {
         "compilerOptions": {
           "target": "ES2020",
           "lib": ["dom", "dom.iterable", "esnext"],
           "module": "esnext",
           "moduleResolution": "node",
           "jsx": "react-jsx",
           "strict": true,
           "esModuleInterop": true,
           "allowSyntheticDefaultImports": true,
           "resolveJsonModule": true,
           "isolatedModules": true,
           "noEmit": true,
           "skipLibCheck": true,
           "forceConsistentCasingInFileNames": true
         },
         "include": ["src"]
       }
  4. Rename one simple file — StatusBadge.js → StatusBadge.tsx
  5. Run `npm start` and confirm no errors. The .tsx file will compile.
  6. Run `npx tsc --noEmit` and confirm no type errors.

  RULES:
  - `strict: true` is non-negotiable. Loose TS is worse than no TS.
  - Don't convert anything else yet. One file is the win.

  WHAT YOU JUST LEARNED:
  TypeScript is bolted onto a React project via tsconfig + .tsx files;
  the bundler (webpack via CRA) reads both .js and .tsx side by side.
  You can migrate file by file — no big-bang rewrite needed.


CHALLENGE 14.2 — Type the domain models                     Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: ~15 min (done 2026-05-14). Beat target by 10 min.

  [Claude — notes]:
  Step 1 (Models.ts) was the cleaner half; step 2 (StatusBadge refactor)
  is where the real learning happened. Three syntax/concept bugs and one
  pattern-level lapse surfaced — all worth the time.

  Models.ts bugs surfaced during review (all fixed):
    1. `id: Number` (capital N) — the boxed JS wrapper class, not the
       primitive. TS allows it but it's wrong: you'd rarely want to type
       `id` as `new Number(5)`. Fixed to lowercase `number`. Same
       distinction as C# `Int32` vs `int` — primitives are what you want
       99% of the time.
    2. `userName` on User vs `username` on LoginRequest — inconsistent
       casing for the same field across two domain types. Picked lowercase
       `username` to match what ASP.NET Core actually serializes (camelCase
       JSON output). Domain types should match the wire format, not the
       C# property casing.
    3. `role: user[role]` — two errors in one line. The C# equivalent is
       `nameof(User.Role)`; the TS equivalent is `User['role']` — capital U
       (type reference), square brackets, **quoted string literal** for the
       field name. `user[role]` would mean "the type of the `role` property
       on the value named `user`" — but `user` is not a value in scope, and
       even if it were, this is type-position syntax. Fixed to `User['role']`.

  Concept gap surfaced — over-correction loop on case sensitivity:
  After the line-29 fix, user tried referencing `user` (lowercase) elsewhere
  and got TS error "cannot find name user, did you mean User?". Read that
  as "lowercase is wrong everywhere" → lowercased all four interface
  declarations (`employee`, `user`, `loginRequest`, `loginResponse`) to
  make the references compile. That's exactly inverted. The rule is the
  same as C#: types are PascalCase, values are camelCase. The TS error was
  telling user the *reference* needed a capital U, not that *declarations*
  should match the broken reference. Reverted to PascalCase. Cost ~3-4 min
  to untangle. False-friend lesson reinforced: don't change the
  declaration to match a broken consumer — change the consumer to match
  the declaration.

  StatusBadge.tsx refactor (step 2) — first real cross-file TS dependency
  in the codebase. Pattern internalised: import Employee from Models, type
  prop as `employee: Employee`, access fields off the object. The value of
  this only becomes visible later when renaming a field in Models.ts will
  red-squiggle every consumer instantly — same flow as renaming a C#
  property and watching the compiler light up call sites.

  Design trade-off recorded in the spec (step 2 NOTE block): `employee:
  Employee` is intentionally worse design than `isActive: boolean` for
  this exercise — leaf components should ask for the smallest data they
  need. We accepted the worse design here as TS-practice scaffolding,
  not as a pattern to copy in real code.

  Two-sided refactor caller-side miss — the pattern-level lapse:
  After refactoring StatusBadge.tsx to take `employee` instead of `isActive`,
  the caller in EmployeeRow.js got partially updated:
        BEFORE:  <StatusBadge isActive={employee.isActive} />
        DONE:    <StatusBadge isActive={employee} />               ← stale name
        SHOULD:  <StatusBadge employee={employee} />               ← correct
  The right-hand side (value) got fixed, the left-hand side (prop name)
  stayed stale. TS stayed silent because EmployeeRow is still `.js` — no
  caller-side type checking on JSX prop names from a JS file. Runtime
  blew up on `employee.isActive` against undefined. This is the **second**
  incident of this exact shape (first was `oncancel` vs `onCancel` in 12.3
  cleanup). Memory saved: see feedback_two_sided_refactor.md. Future cue
  before any prop-API refactor: "prop name first, then value — every
  caller's left-hand side is now suspect." Same flow as C# F12 / find-
  usages after a method-signature rename, except JS-side callers need to
  be walked by hand until Round 14-15 converts them all to .tsx.

  Stray file at session end: src/Types/Employee.ts (empty
  `export interface Employee {}` body) still exists alongside Models.ts.
  Leftover from 2026-05-13 session — should be deleted to close out 14.2
  fully.

  Verify status: `npm start` working, badges render correctly. Recommend
  also running `npx tsc --noEmit` before marking truly done, to confirm
  no type errors in the Models.ts / StatusBadge.tsx pair.

Create TypeScript interfaces that match the shape of Employee and User
returned by your .NET API. These types become the contract every component
and hook reads from.

  TASK:
  1. Create src/types/models.ts:

       export interface Employee {
         id: number;
         firstName: string;
         lastName: string;
         email: string;
         department: string;
         position: string;
         phoneNumber: string;
         salary: number;
         dateOfJoining: string;   // ISO date string from .NET
         isActive: boolean;
       }

       export interface User {
         id: number;
         username: string;
         fullName: string;
         role: 'Admin' | 'User';  // string literal union
       }

       export interface LoginRequest {
         username: string;
         password: string;
       }

       export interface LoginResponse {
         token: string;
         fullName: string;
         role: User['role'];
       }

  2. Refactor StatusBadge.tsx to take the full Employee object as a prop
     instead of `isActive: boolean`. This is the cross-file type-dependency
     practice — the whole point of step 2.

     Two files change:

     A) StatusBadge.tsx — change the prop shape and the body:

        - Add the import at the top of the file:
            import { Employee } from "../Types/Models";

        - Change the prop interface body:
            BEFORE:  export interface StatusBadgeProps { isActive: boolean }
            AFTER:   export interface StatusBadgeProps { employee: Employee }

        - Change the destructure on the component signature:
            BEFORE:  const StatusBadge = ({ isActive }: StatusBadgeProps) => (
            AFTER:   const StatusBadge = ({ employee }: StatusBadgeProps) => (

        - Update the two `isActive` references inside the JSX body:
            BEFORE:  backgroundColor: isActive ? "#4caf50" : "#f44336",
            AFTER:   backgroundColor: employee.isActive ? "#4caf50" : "#f44336",

            BEFORE:  {isActive ? "Active" : "Inactive"}
            AFTER:   {employee.isActive ? "Active" : "Inactive"}

     B) EmployeeRow.js — update the caller. The prop API just changed,
        so every site that renders <StatusBadge /> needs to pass the new
        prop shape:

            BEFORE:  <StatusBadge isActive={employee.isActive} />
            AFTER:   <StatusBadge employee={employee} />

        EmployeeRow already has the full `employee` object in scope
        (it's the row's own prop), so no other wiring changes.

  VERIFY:
  - Run `npx tsc --noEmit` — must report zero errors. If `Employee` import
    fails, check the relative path (`../Types/Models`, capital T to match
    the folder name on disk).
  - Run `npm start` and confirm the badge still renders "Active" / "Inactive"
    correctly for each row.

  NOTE ON THE DESIGN TRADE-OFF (read this — it's the actual lesson):
  Passing `employee: Employee` is a worse design in isolation than the
  original `isActive: boolean`. A leaf component should ask for the smallest
  data it needs (props minimalism), and `isActive` is one field — making
  StatusBadge depend on the full 10-field Employee shape locks it to one
  domain and bloats the test surface. The .NET equivalent: you would not
  pass a whole `Employee` entity to a method that only reads `IsActive`.

  We do it here anyway for one specific reason: TypeScript practice. The
  spec wants you to feel a real cross-file type dependency — Employee
  defined in Models.ts, imported by StatusBadge.tsx — so that when you
  later rename `isActive` → `active` in Models.ts, every consumer lights
  up in red. That refactor-safety is the autocomplete-payoff TS gives you,
  and it's hard to feel until you wire one of these end-to-end.

  In a real codebase you'd keep StatusBadge as `isActive: boolean` and
  practice the Employee import on EmployeeRow / EmployeeForm / useEmployees
  instead. Noting this so future you doesn't take the shortcut as a
  pattern.

  RULES:
  - Use `interface` not `type` for object shapes — extension is cleaner.
  - String literal unions ('Admin' | 'User') beat raw strings — TS catches
    typos.
  - Field optionality (`?`) only when the API genuinely returns undefined.
    Don't lie about the shape.

  WHAT YOU JUST LEARNED:
  Domain types are the foundation. Once Employee is a TS interface, every
  component that takes one gets autocomplete and red squiggles for typos —
  the same value props give in C#.


CHALLENGE 14.3 — Type a leaf component                      Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: 5 Min

  [Claude — notes]:
  Clean conversion. Props interface (EmployeeRowProps) co-located at the
  top of the file — correct placement, matches the rule from 14.3 follow-up
  in 14.2's notes ([[feedback_csharp_ts_interface_false_friend]]). The
  destructure `({ employee, onEdit, onDelete, onSelect, selected }:
  EmployeeRowProps)` is the standard TS form — no React.FC, as the spec
  RULES required.

  One real bug to flag (not breaking yet, but will bite):
    onEdit: (id: number) => void
    onDelete: (id: number, name: string) => void
    onSelect: (id: number) => void
    selected: number | null
  But Employee.id is `string` (a GUID) — see api.ts:148 and the .NET
  backend. So the row's callback signatures expect `number` but the
  values being passed (`employee.id`) are strings. TS isn't catching it
  *yet* because EmployeeList is still .js — once 15.5 converts it, every
  one of these `id: number` will red-squiggle.
  Fix when you get there: change to `id: string` and `selected: string | null`.
  Same in any other component that took its lead from this spec.

  Inherited from the spec — the original CHALLENGE 14.3 task block above
  has `id: number` baked in. That was wrong for this codebase (GUIDs, not
  ints). Noted, not a knock on the user.

Convert EmployeeRow.js → EmployeeRow.tsx. Leaf component, only props
to type. Best place to feel out React + TS without complexity.

  TASK:
  1. Rename EmployeeRow.js → EmployeeRow.tsx.
  2. Define the props interface above the component:

       import { Employee } from '../types/models';

       interface EmployeeRowProps {
         employee: Employee;
         onEdit: () => void;
         onDelete: () => void;
         onSelect: (id: number) => void;
         selected: number | null;
       }

       function EmployeeRow({
         employee, onEdit, onDelete, onSelect, selected,
       }: EmployeeRowProps) { ... }

  3. Save. Watch the IDE flag any usage in EmployeeList that passes the
     wrong shape — they'll be red until you convert EmployeeList too.
     Ignore for now; that's the migration trail.

  RULES:
  - Don't use React.FC — it's outdated convention. Just type props directly.
  - Function-typed callbacks: `() => void` for no-arg, `(id: number) => void`
    for typed args. Same shape as a C# Action / Action<int>.
  - Run `npx tsc --noEmit` after — should pass with zero errors *for this file*.

  WHAT YOU JUST LEARNED:
  Props are typed via an interface. Callback props are typed by their
  signature. The IDE becomes a contract enforcer — saves you the
  "passed wrong prop shape" bugs that JS lets slip silently.


CHALLENGE 14.4 — Type a custom hook (generic intro)         Target: 35 min
--------------------------------------------------------------------------
YOUR TIME: 5 Min

  [Claude — notes]:
  Clean implementation. All three TS pieces from the spec landed:
    - Generic `<T>` declared on the function signature.
    - `keyof T` constrains the field arg — typo-proof.
    - Tuple return `[SortState<T>, (field: keyof T) => void]` matches
      the destructure call site shape.
  The setter uses the functional update form (`setSort(prev => ...)`)
  with the toggle/reset logic intact from the .js version — a clean
  port, no logic changes. `SortState<T>` is exported (interface), which
  is the right call: any component that wants to type its own sort
  state can import it.

  Minor formatting nit only — extra blank line on line 16 between the
  useState block and `const handleSort`. Doesn't matter for correctness;
  flag only if portfolio-polish pass is on (see
  [[project_employeemanager_is_portfolio]]).

  This was the FIRST encounter with TS generics + `keyof`. Pattern test:
  in 15.2 (your current challenge) the discriminated union is the next
  TS-only concept — should feel similar (new vocabulary, familiar idea).

Convert useSort.js → useSort.ts. This is your first generic hook — it can
sort an array of any T with a key. Same shape as a C# generic method.

  NEW HERE — read this before TASK:
  - `<T>` (generic type parameter): same idea as C# `<T>` — a placeholder
    for "whatever type the caller passes in." `function useSort<T>(...)`
    means useSort works for Employee[], User[], anything. The caller
    pins it: `useSort<Employee>('firstName')`.
  - `keyof T`: a built-in TS operator. If `T = Employee`, then `keyof T`
    is the union `'id' | 'firstName' | 'lastName' | ...` — every property
    name of T as a string literal. C# analogy: `nameof(Employee.FirstName)`,
    except TS knows ALL property names at compile time, not just one.
    Why we use it: typo-proof field names. `useSort<Employee>('frstName')`
    becomes a compile error, not a runtime undefined.
  - String literal union (`'asc' | 'desc'`): the type is exactly those two
    strings, nothing else. Same as a C# enum but written inline.
  - Tuple return type `[SortState<T>, (field: keyof T) => void]`: TS for
    "this function returns an array of EXACTLY two items, item 0 is a
    SortState<T> and item 1 is a function." Same shape useState uses.
    C# analogy: `(SortState<T>, Action<string>)` tuple return.

  TASK:
  1. Rename useSort.js → useSort.ts.
  2. Type the hook to be generic over the item type:

       import { useState } from 'react';

       type SortOrder = 'asc' | 'desc';

       interface SortState<T> {
         field: keyof T;
         order: SortOrder;
       }

       function useSort<T>(initialField: keyof T): [SortState<T>, (field: keyof T) => void] {
         const [sort, setSort] = useState<SortState<T>>({
           field: initialField,
           order: 'asc',
         });

         const handleSort = (field: keyof T) => {
           setSort(prev =>
             prev.field === field
               ? { ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }
               : { field, order: 'asc' }
           );
         };

         return [sort, handleSort];
       }

       export default useSort;

  3. In EmployeeList (still .js), the call site becomes:
       const [sort, handleSort] = useSort<Employee>('firstName');
     (You'll need to convert EmployeeList in a later challenge — for now
     the .js call site uses inferred any, which still works.)

  RULES:
  - `keyof T` is the magic that makes the field name type-safe — only
    actual properties of T are accepted.
  - Generic constraints (`<T extends ...>`) come later. For now, plain T
    is enough.
  - The return tuple type `[SortState<T>, (field: keyof T) => void]` matches
    the destructure shape at call sites.

  WHAT YOU JUST LEARNED:
  Custom hooks become generic the same way C# methods do. `<T>` declared
  on the function, used throughout. `keyof T` is one of TypeScript's most
  useful operators — your sort field can only be a real property of the
  data type. Typos = compile error.


CHALLENGE 14.5 — No-reference TS challenge                  Target: 40 min
--------------------------------------------------------------------------
YOUR TIME: 5 Min

  [Claude — notes]:
  Pattern-(b) callbacks across the board — `(value: string) => void`
  rather than raw event types. That's the cleaner choice for this code,
  and it lines up with how the rest of the project communicates with
  FilterBar already. Good instinct.

  FilterBarProps covers all 13 props the JS version had:
    search/department/hideBelow50K + their 3 setters,
    view + onViewChange (with the trickier `(updater: (prev: number) => number)`
    signature — that's the prev-state-updater form of setState; nailed it),
    departments: string[], onClear, minSalary/maxSalary + 2 setters.
  Nothing missing, nothing typed as `any`. Interface co-located at top
  of file — correct per the false-friend rule.

  One subtle thing worth recording — onViewChange is typed as
    `(updater: (prev: number) => number) => void`
  not the simpler `(view: number) => void`. That's because EmployeeList
  calls it as `onViewChange(v => v + 1)` (the prev-state updater pattern,
  same shape as `setX(prev => prev + 1)`). The TS signature has to match
  *how the parent uses it*, not just "it sets a number." This is a
  pattern-recognition win — easy to mistype as `(v: number) => void` and
  have TS complain at the EmployeeList call site once .tsx-ified.

  No-reference rule check: file body has no copy/paste structure from
  EmployeeRow.tsx — the interface order and the inline `<input>` types
  are FilterBar's own. If you DID lean on EmployeeRow / StatusBadge,
  note it in YOUR TIME — same measurement discipline as 13.5.

Convert FilterBar.js → FilterBar.tsx with NO reference to this challenge
file. You may look at react.dev / typescriptlang.org / TS error messages —
but not at the other .tsx files you've already converted.

  NEW HERE — event handler types:
  - `React.ChangeEvent<HTMLInputElement>`: TS type for the `e` parameter
    inside `onChange={e => ...}` on an <input>. The `<HTMLInputElement>`
    part tells TS what `e.target` is — so `e.target.value` and
    `e.target.checked` autocomplete correctly. C# analogy: an EventArgs
    subclass — same idea, more specific per element type.
  - `React.ChangeEvent<HTMLSelectElement>`: same shape but for <select>.
    A handler used on BOTH must union them:
    `React.ChangeEvent<HTMLInputElement | HTMLSelectElement>`.
  - Two valid prop signatures for a callback:
      (a) `onChange: (e: React.ChangeEvent<HTMLInputElement>) => void`
          — child passes the raw event up.
      (b) `onChange: (value: string) => void`
          — child unwraps `e.target.value` and only sends the value.
    (b) is cleaner — parent doesn't need to know DOM event types.
    Use (b) when the parent only cares about the value. Most of this
    project uses (b).

  SCOPE:
  - Define the props interface for FilterBar based on what EmployeeList
    passes (search, setSearch, department, etc.).
  - Type each callback prop with the right event handler signature
    (input change is `(e: React.ChangeEvent<HTMLInputElement>) => void`
     or just the value: `(value: string) => void`).
  - Type the `view`, `onClear`, `departments: string[]` correctly.

  RULES:
  - No copying from EmployeeRow.tsx or StatusBadge.tsx. Type it from
    scratch.
  - When you genuinely can't recall a TS syntax, write `// TODO: lookup TS`
    and KEEP MOVING. Don't grind. Note in YOUR TIME which pieces needed
    lookup.
  - `npx tsc --noEmit` should pass for this file when done.

  WHAT YOU'RE MEASURING:
  After 4 TS challenges, this is your first honest TS-recall test. The
  lookup list tells us if Round 15 should slow down or speed up.


================================================================================
ROUND 15 — TYPESCRIPT DEEPER (designed 2026-05-12)
================================================================================

Pacing: Still one challenge per day. This is where TS starts paying off —
the generic hooks and discriminated unions catch real bugs the JS version
silently shipped. Don't rush. The goal of Round 15 is "TS feels normal."


CHALLENGE 15.1 — Type the API service                       Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: 5 Min

  [Claude — notes]:
  Every export is typed with the full `Promise<AxiosResponse<T>>` return.
  That's MORE explicit than the spec asked for — the spec had several
  functions returning the bare axios call with no explicit return type
  (which TS would infer fine). Going explicit is enterprise-style and
  the right call for a portfolio file. Examples:
    getEmployees(): Promise<AxiosResponse<Employee[]>>
    createEmployee(employee: Omit<Employee, 'id'>): Promise<AxiosResponse<Employee>>
    deleteEmployee(id: string): Promise<AxiosResponse<void>>
  All 6 endpoints typed. `Omit<Employee, 'id'>` used for create + update
  payloads — correct (server assigns the id).

  Deviation from spec worth calling out as a WIN:
  The spec block had `id: number` on getEmployee / updateEmployee /
  deleteEmployee. User correctly used `id: string` — matching the .NET
  backend (employee ids are GUIDs). This was an unprompted correction
  against the spec, based on knowing the backend. Senior-instinct call.
  See [[feedback_architectural_instincts]].

  Side effect: EmployeeRow.tsx (14.3) still has `id: number` callbacks
  inherited from its own spec. Those will conflict with api.ts once
  EmployeeList is .tsx-ified in 15.5 — flagged in 14.3's notes above.

  Three small things to note (none are bugs — keep them in mind):
  1. Line 27 import order — `axios` before `Employee/...` is fine.
     TS / ESLint don't enforce; just consistency.
  2. Line 148-149 has the arrow split across lines awkwardly
     (`api.get<Employee>` on one line, the URL on the next). Reads fine,
     just cosmetic. VS Code's formatter on save would tighten it.
  3. The JSDoc comments (`@param {string} id`) are leftover from the .js
     version — they say `{string}` and `{Object}`. In TS, the type
     annotations on the function signature ARE the source of truth;
     JSDoc types become redundant and can drift. Two options:
        (a) keep JSDoc but drop the `{type}` part — keep only the
            description: `@param id - The employee's GUID`
        (b) delete the @param lines entirely and rely on the TS types.
     Either is fine. Both > leaving the JSDoc types as they are.

Convert api.js → api.ts. Type each function's request and response shape.
This is where TS catches "called the wrong endpoint" / "passed wrong field"
bugs at compile time instead of runtime.

  NEW HERE — read this before TASK:
  - `axios`: a third-party HTTP client library. Same role as
    `HttpClient` in .NET — it sends GET/POST/PUT/DELETE requests and
    returns the response. We use it instead of the browser's built-in
    `fetch()` because: automatic JSON parsing, interceptors (auth token
    injection, 401 handling), and a cleaner API.
  - `axios.create({ baseURL: '/api' })`: returns a configured axios
    instance — every call made through it prefixes `/api`. Same as
    `new HttpClient { BaseAddress = new Uri("/api") }` in .NET.
  - `AxiosResponse<T>`: the SHAPE of the value axios resolves with.
    It's an object like `{ data: T, status: number, headers: ... }`.
    The `<T>` is what `.data` is typed as. So when you write
    `const res = await getEmployees()`, `res.data` is `Employee[]`,
    not `any`. C# analogy: `HttpResponseMessage` with a typed body.
  - `api.get<Employee[]>('/employee')`: the `<Employee[]>` tells axios
    "the response body will be an Employee array — type `.data`
    accordingly." Same shape as `httpClient.GetFromJsonAsync<List<Employee>>()`
    in .NET.
  - `Omit<Employee, 'id'>`: a TS UTILITY TYPE. Means "the Employee
    interface but WITHOUT the `id` field." Used for create payloads
    because the server assigns the id — the client should never send
    one. C# analogy: a DTO without the Id property — but in TS you
    don't have to write a separate type, you derive it from Employee.
    Family of utility types worth knowing:
       Omit<T, K>      — T minus the K fields
       Pick<T, K>      — T with ONLY the K fields
       Partial<T>      — every field of T becomes optional
       Required<T>     — every optional field of T becomes required
       Record<K, V>    — an object whose keys are K and values are V
    Memorize these — they appear constantly in real TS codebases.
  - `Promise<AxiosResponse<Employee[]>>`: full return type. Read it
    right-to-left: "a Promise that resolves to an AxiosResponse whose
    `.data` is an Employee array." Spelling it out at the function
    signature is enterprise-style; TS could infer it, but explicit is
    clearer at API boundaries.

  TASK:
  1. Rename api.js → api.ts.
  2. Import Employee, LoginRequest, LoginResponse from '../types/models'.
  3. Type each export. Examples:

       import axios, { AxiosResponse } from 'axios';
       import { Employee, LoginRequest, LoginResponse } from '../types/models';

       const api = axios.create({ baseURL: '/api' });
       // ... existing interceptor unchanged

       export const getEmployees = (): Promise<AxiosResponse<Employee[]>> =>
         api.get<Employee[]>('/employee');

       export const getEmployee = (id: number): Promise<AxiosResponse<Employee>> =>
         api.get<Employee>(`/employee/${id}`);

       export const createEmployee = (data: Omit<Employee, 'id'>) =>
         api.post<Employee>('/employee', data);

       export const updateEmployee = (id: number, data: Omit<Employee, 'id'>) =>
         api.put<Employee>(`/employee/${id}`, data);

       export const deleteEmployee = (id: number) =>
         api.delete(`/employee/${id}`);

       export const login = (creds: LoginRequest) =>
         api.post<LoginResponse>('/auth/login', creds);

  RULES:
  - `Omit<Employee, 'id'>` is the right shape for create — the API
    assigns the id. Utility types like Omit / Pick / Partial / Required
    are essential — learn these names.
  - Axios's generic `get<T>` types the `.data` field automatically.

  WHAT YOU JUST LEARNED:
  Generics on the HTTP boundary turn axios into a typed RPC client. The
  same idea as Refit / HttpClient.GetFromJsonAsync<T> in .NET — the type
  is the contract.


CHALLENGE 15.2 — Type useEmployees fully                    Target: 40 min
--------------------------------------------------------------------------
YOUR TIME: ~7-8 min — took help from Gemini when stuck.

Convert useEmployees.js → useEmployees.ts. Type the state, the reducer
(if you did 13.1), and the return value. This is the hook that everything
else depends on — getting its types right unlocks the rest.

  NEW HERE — read this before TASK:
  - `type` vs `interface`: in TS, `type` and `interface` are mostly
    interchangeable for object shapes. The split:
       interface  — preferred for object shapes you'll extend / implement.
                    Closer to a C# interface.
       type       — required for unions, intersections, primitives,
                    tuples, mapped types. The "everything else" keyword.
    Rule of thumb: `interface` for component props / domain models;
    `type` for unions and computed types.
  - DISCRIMINATED UNION (the big concept here):
       type ConfirmAction =
         | { type: 'open'; id: number; name: string }
         | { type: 'close' };
    This is "ConfirmAction is EITHER an open-action OR a close-action."
    The shared `type` field is the DISCRIMINATOR — TS uses it to know
    which branch you're in. Inside a switch:
       case 'open':   // here TS KNOWS action has id and name
       case 'close':  // here TS KNOWS action only has type
    C# analogy: closest thing is pattern-matched records / a sealed
    class hierarchy with `switch` expressions. F# / Rust call this an
    "algebraic data type" — that's the same idea.
  - EXHAUSTIVENESS: if you add a third action type later and forget to
    handle it in the switch, TS warns (when `strict` is on). That's the
    safety — your state machine cannot drift. Compare to a C# switch
    that silently runs no branch and falls through.
  - `useReducer`'s type signature: `useReducer<Reducer<State, Action>>`
    or just let inference work: `useReducer(confirmReducer, initialState)`
    once the reducer's types are pinned, the rest infers.
  - Interface return types on hooks (`function useEmployees(): UseEmployeesReturn`):
    pinning the return type makes the hook a CONTRACT. Consumers can
    rely on it; reordering / renaming fields inside the hook becomes
    a compiler check, not a manual grep. C# analogy: a method that
    returns an interface (IEmployeeService) instead of a concrete class.

  TASK:
  1. Define the action union for the confirm reducer:

       type ConfirmState = { open: boolean; id: number | null; name: string };
       type ConfirmAction =
         | { type: 'open'; id: number; name: string }
         | { type: 'close' };

       function confirmReducer(state: ConfirmState, action: ConfirmAction): ConfirmState {
         switch (action.type) {
           case 'open':  return { open: true, id: action.id, name: action.name };
           case 'close': return { open: false, id: null, name: '' };
         }
       }

  2. Type the hook's return:

       interface UseEmployeesReturn {
         employees: Employee[];
         loading: boolean;
         fetchedAt: string | null;
         confirm: ConfirmState;
         handleDelete: (id: number, name: string) => void;
         onConfirm: () => Promise<void>;
         onCancel: () => void;
       }

       function useEmployees(): UseEmployeesReturn { ... }

  RULES:
  - The discriminated union (`type: 'open' | 'close'`) is the big payoff.
    Inside each case, TS narrows the action type and `.id` / `.name` are
    only accessible when the type allows.
  - No `default` case in the reducer switch — TS will warn if a new action
    type is added and you forget to handle it. That's the safety.

  WHAT YOU JUST LEARNED:
  Discriminated unions = exhaustive state machines. TS proves at compile
  time that you handled every action. The same shape as `match`
  expressions in F# / Rust / modern C#.


CHALLENGE 15.3 — Type the AuthContext                       Target: 35 min
--------------------------------------------------------------------------
YOUR TIME: ~7-8 min — took help from Gemini when stuck.

Convert your AuthContext (from 13.2) to TS. Force consumers to handle
"no provider" cases at compile time — the most common Context bug.

  NEW HERE — read this before TASK:
  - `createContext<T>(defaultValue)`: the `<T>` pins what's stored in the
    Context. `createContext<AuthContextValue | null>(null)` means "the
    Context holds either an AuthContextValue or null." The `| null` is
    intentional — it forces consumers to handle the "no Provider above
    me" case.
  - `ReactNode`: TS type for "anything React can render" — strings,
    numbers, JSX elements, arrays of them, null, undefined. Used for
    the `children` prop. NOT the same as `JSX.Element` (which is just
    one element). For `children`, always `ReactNode`.
  - The narrowing guard pattern:
       const ctx = useContext(AuthContext);
       if (!ctx) throw new Error('...');
       return ctx;   // <-- here TS knows ctx is non-null
    This is TS "narrowing" — after the `if (!ctx) throw`, TS removes
    `null` from the type for the rest of the function. C# analogy:
    `ArgumentNullException.ThrowIfNull(ctx)` + nullable reference
    type tracking — except TS does it automatically.
  - Why throw and not return null: every consumer of useAuth() now
    gets `AuthContextValue` (not nullable) — no more `if (auth?.user)`
    sprinkled everywhere. The Provider boundary IS the contract.

  TASK:
  1. Define the context value shape and create with explicit type:

       import { createContext, useContext, useState, ReactNode } from 'react';
       import { User } from '../types/models';

       interface AuthContextValue {
         user: User | null;
         login: (user: User, token: string) => void;
         logout: () => void;
       }

       const AuthContext = createContext<AuthContextValue | null>(null);

       export function AuthProvider({ children }: { children: ReactNode }) {
         const [user, setUser] = useState<User | null>(() =>
           JSON.parse(localStorage.getItem('user') || 'null')
         );
         // ... rest unchanged
       }

  2. Make useAuth narrow the null-check away so consumers never get null:

       export function useAuth(): AuthContextValue {
         const ctx = useContext(AuthContext);
         if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
         return ctx;
       }

  RULES:
  - Default value of `null` (not undefined, not an empty object) — forces
    the runtime guard.
  - The narrowing throw is the standard pattern. Without it, every
    consumer has to handle `ctx | null`.
  - `ReactNode` is the correct type for `children`. Not React.FC.

  WHAT YOU JUST LEARNED:
  Context with TS forces a discipline JS lets slide — every consumer
  must be inside a Provider, or you get an explicit runtime error
  instead of silently broken null reads. Maps to .NET DI: a service
  that fails to resolve throws fast, not silently.


CHALLENGE 15.4 — Type the form (EmployeeForm)               Target: 45 min
--------------------------------------------------------------------------
YOUR TIME: ~45 min (2026-05-18) — on target. Got the event types
(React.ChangeEvent<HTMLInputElement|HTMLSelectElement> + as HTMLInputElement,
React.FormEvent<HTMLFormElement>), useState<EmployeeFormData> with explicit
generic, and Validate(): FormErrors. FormErrors written as a manual interface
(not the canonical Partial<Record<keyof T, string>>) — works but doesn't scale.

Real learning moment was the salary type chain. Three boundary conversions
clicked: API number → form string (.toString in fetchEmployee), form string
→ API number (parseFloat in submit), form ↔ HTML input both string. Got
there via two TS gotchas in sequence:

  1. Domain type was wrong — Models.ts had `salary: string` while .NET
     returns a number. Symptom was assignment errors that looked like a
     form bug; root cause was the type lying about the wire. Fix: update
     domain type to match reality, let the form override locally.

  2. Intersection ≠ override. First attempt at the form type was
     `Omit<Employee, 'id'> & { salary: string }` — assumed intersection
     would override `salary: number` from Employee. Wrong: TS intersection
     INTERSECTS — `number & string = never`, which surfaced as "Type 'X'
     is not assignable to type 'never'." Canonical pattern is to Omit the
     conflicting key first, then re-add with the new type:
     `Omit<Employee, 'id' | 'salary'> & { salary: string }`.

This is a real C#→TS false friend to lock in: in C# you can override an
inherited property; in TS structural typing, intersection requires ALL
constraints to hold simultaneously. To "override" a field type, you must
Omit the original key first. Same shape as the [[feedback_csharp_ts_interface_false_friend]]
beat — language reflexes from .NET don't translate 1:1.

Also worth noting: tooling told the truth here. `.toString()` on
`emp.salary` in fetchEmployee was a tell that the runtime value was a
number even though the type claimed string. Trust the conversion calls
your past self wrote more than the types when they disagree.

Carryovers to 15.5 / Round 16:
- `Validate` → `validate` (lowercase convention).
- `(error as any).response?.data?.message` → narrow to AxiosError (16.1).
- FormErrors interface → swap to Partial<Record<keyof EmployeeFormData, string>>
  in 16.x — current shape works but won't scale when fields change.
- `id as string` assertions in fetchEmployee/updateEmployee — could
  refactor to a guard but acceptable since isEditMode gates the call.

The form is where TS truly earns its place. Event types, controlled
inputs, errors-as-record types — all the syntax that previously felt
fuzzy snaps into place.

  NEW HERE — read this before TASK:
  - `Partial<T>`: every field of T becomes optional. Useful for "errors
    object where most fields have no error." `Partial<Employee>` =
    `{ id?, firstName?, lastName?, ... }`.
  - `Record<K, V>`: an object whose keys are of type K and values are
    of type V. `Record<string, number>` = `{ [key: string]: number }`.
    Used when you don't know the keys upfront but they're all the
    same shape. C# analogy: `Dictionary<K, V>` but as an object type.
  - `Partial<Record<keyof EmployeeFormData, string>>`: read it inside-
    out: "an object whose keys are the field names of EmployeeFormData,
    values are strings, but every key is optional." Translation: "the
    errors map — keys are field names, values are error messages, and
    most fields have no entry most of the time." This combo (Partial
    + Record + keyof) is the canonical TS form-errors type. Memorize it.
  - `React.FormEvent<HTMLFormElement>`: TS type for the `e` in
    `onSubmit={e => ...}`. The `<HTMLFormElement>` makes `e.target`
    typed as the form element. C# analogy: `EventArgs` subclass with
    a typed sender.
  - `as HTMLInputElement` (type assertion): tells TS "trust me, treat
    this value as type X." Used in `const { name, value, type, checked }
    = e.target as HTMLInputElement` because TS can't infer that the
    event target has a `checked` field. Use SPARINGLY — every cast is
    a compiler bypass. C# analogy: `(MyType)obj` hard-cast.

  TASK:
  1. Convert EmployeeForm.js → EmployeeForm.tsx.
  2. Type the form state:

       type EmployeeFormData = Omit<Employee, 'id'>;
       type FormErrors = Partial<Record<keyof EmployeeFormData, string>>;

       const [formData, setFormData] = useState<EmployeeFormData>({ ... });
       const [errors, setErrors] = useState<FormErrors>({});

  3. Type the change handler:

       const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
         const { name, value, type, checked } = e.target as HTMLInputElement;
         setFormData(prev => ({
           ...prev,
           [name]: type === 'checkbox' ? checked : value,
         }));
       };

  4. Type the submit handler:

       const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
         e.preventDefault();
         // ...
       };

  5. Type the validate function's return:

       const validate = (): FormErrors => { ... };

  RULES:
  - `Partial<Record<K, V>>` is the canonical errors shape. Most fields
    have no error most of the time.
  - Event types vary — ChangeEvent<HTMLInputElement> ≠ ChangeEvent<HTMLSelectElement>.
    Union them when the same handler covers both.
  - `React.FormEvent<HTMLFormElement>` for submit. The `<HTMLFormElement>`
    parameter lets you access form.elements with the right typing.

  WHAT YOU JUST LEARNED:
  Form types are a real skill — getting `Partial<Record<keyof T, string>>`
  into your fingers means every TS form you ever write is faster than
  the last. Maps to the .NET ModelState validation pattern, but
  type-checked.


CHALLENGE 15.5 — Capstone: finish the migration             Target: 45 min
--------------------------------------------------------------------------
YOUR TIME: ~20 min (2026-05-18) — beat target by ~25 min. Took help from
Gemini when stucked. Migration mechanical for most files (rename + add
prop interfaces). Real learning came from one file: EmployeeList.tsx,
which surfaced a long-standing data-shape bug TS was now refusing to
permit — `hideBelow50K` was `useState('')` in the hook (string) but the
FilterBar prop was correctly typed `boolean`, and the on-clear path
called `sethideBelow50K(false)`. JS coercion (`!''` truthy, `!'on'` falsy)
had been making it "work" since Round 11. TS stripped the accident:
fixed the hook to `useState(false)` so the type is boolean end-to-end.

This is the canonical TS-migration moment to remember: **converting
`.js → .tsx` doesn't add bugs, it reveals bugs.** Every place where JS
truthy/falsy coercion silently bridged mismatched types becomes a
compile error. The reflex to fight by relaxing the type (`useState('')`,
`: any`, `as unknown`) is wrong — that hides the bug again. The right
move is to ask "what should this value really be?" and fix the source
of truth. Same pattern as 15.4's salary chain.

Cleanup pass: deleted stray empty `src/Types/Employee.ts` (long-standing
open item); renamed `reportWebVitals.tsx` → `.ts` (no JSX); kept
`App.test.js` as-is (CRA boilerplate, never authored by user, would have
needed @types/jest to compile as .tsx). Fixed all `.JS` / `App.js` /
`api.js` / `Login.js` / `index.js` references in header and body
comments to match the new file extensions. Removed dead commented-out
duplicate `import { Employee }` line in EmployeeList. Minor formatting
nits (trailing whitespace, off-indent on useEmployees return block).
`npx tsc --noEmit` clean.

Still open for Round 16 (TS Hardening):
- `useEmployeeFilter.ts:23` — `emp.salary >= 900` should be `>= 50000`.
  Type-safe now, but the threshold has been wrong since Round 11.
- `Context/AuthContext.tsx` — `user: any` and `userData: any`. Should be
  the actual User shape from Models.ts.
- `Context/RecentActivityContext.tsx` — `export type Activity = any`.
- Multiple `(error as any).response?.data?.message` casts across
  EmployeeForm, useEmployees, Login. Should narrow to AxiosError.
- `EmployeeForm.tsx` — `Validate` capital V (convention is lowercase),
  `FormErrors` should be `Partial<Record<keyof EmployeeFormData, string>>`
  (canonical form-errors idiom, not the hand-rolled interface).
- `id as string` assertions in fetchEmployee/updateEmployee (acceptable
  since isEditMode gates the call, but could be refactored to a guard).

  TASK:
  - Walk each file. Rename. Add types. Resolve red squiggles.
  - When the project compiles cleanly with `npx tsc --noEmit`, you're done.

  RULES:
  - Don't disable `strict` to make a stubborn file compile. Find the
    real type.
  - `any` is a last resort and a flag — note every `any` you wrote in
    YOUR TIME so we can revisit them. Each `any` is a future bug.
  - If a third-party library has no types, install @types/that-lib.

  WHAT YOU JUST LEARNED:
  Full-project TS is what enterprise codebases look like. You will
  have lookup-cycles for several patterns; the lookup list from 14.5
  and this challenge together = your real TS recall snapshot.


================================================================================
ROUND 16 — TYPESCRIPT HARDENING (designed 2026-05-15, redesigned)
================================================================================

Pacing: One challenge per day. After 15.5 the codebase is fully TS but
"loose" — `any` here, an inferred type there, a few `as` casts. This
round eliminates each one. The goal is not to learn new TS; it's
repetition so your fingers stop hesitating on syntax. Muscle-memory
round.


CHALLENGE 16.1 — Eliminate every `any`                      Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: ~10 min (2026-05-18) — beat target by ~20 min. A bit of help
from Gemini. Removed every hard `any` from src/ (only `global.d.ts` CSS
module stub remains — standard CRA pattern, intentionally kept).

Three categories of fix:
  1. AuthContext: `user: any` → `user: LoginResponse | null`, login
     param typed. Defensive try/catch added around the localStorage
     JSON parse on init (good instinct — corrupt JSON would have
     crashed the app).
  2. RecentActivityContext: `Activity = any` → real interface with
     id, action, details, timestamp, userId?. Modal updated to render
     the structured shape (action + details + timestamp). useEmployees
     addActivity calls converted from plain strings to objects.
  3. Error catches in EmployeeForm, useEmployees, Login: cast to
     `AxiosError<{ message?: string }>` (generic types the response
     body shape inside the error). 3 spots, same pattern.

Concept-wise this round drilled the **generic parameter on error
types** — `AxiosError<T>` where T describes the server's response body.
Same idea as `Promise<T>` (T = resolved value) or `Array<T>` (T =
element). The angle brackets are TS's way of parameterizing types.
.NET analogy: `Task<T>` / `List<T>`.

Carryovers (RESOLVED in cleanup pass same session):
- ~~Functional regression~~ FIXED: useEmployees.tsx handleUndo now calls
  toast.error again — user sees undo failures.
- ~~Indentation off~~ FIXED: EmployeeForm.tsx catch block realigned.
- ~~Type assertion vs type guard~~ FIXED: all three error catches now use
  `isAxiosError<{message?: string}>(error)` (true runtime type guard,
  TS narrows the type only when the check actually passes). Same
  concept as `error is X` pattern-matching in C#. The spec was right
  — `as` is a compile-time lie, the guard is a real check.

Still open (deferred to later rounds):
- **Semantic mismatch**: useEmployees:92 stores employee id under
  Activity.id, but the interface comments id as "log entry id."
  Either generate a unique log id (crypto.randomUUID()) and add
  employeeId field, or fix the comment.
- **Style nit**: `export interface ActivityInterface` + `type Activity =
  ActivityInterface` is redundant aliasing. TS idiom is just
  `export interface Activity {...}` — no "Interface" suffix. That's
  a .NET reflex (`IFoo`/`FooInterface` matters in C#, doesn't in TS).
  Same family as the C#-vs-TS interface false-friend rule.

  NEW HERE — read this before TASK:
  - `any` is the TypeScript escape hatch: it disables all type
    checking on that value. Useful for migrations, but every `any`
    left in finished code is a bug waiting to happen.
  - `unknown` is the safe alternative: like `any` but FORCES you to
    narrow the type before using it. Use `unknown` at the boundary
    (API responses, JSON.parse) and narrow inside.

  TASK:
  1. Run `npx tsc --strict --noEmit` and grep for `any` in src/.
  2. For each `any`: find the real type, replace it. If you don't
     know the shape (boundary code), use `unknown` + a type guard.
  3. List in YOUR TIME how many `any`s you removed — that's the
     debt repayment.

  RULES:
  - No `as any` or `@ts-ignore` to "fix" errors. Find the real type.
  - The errors-object in EmployeeForm, the params in axios interceptors,
    and reducer cases are the usual offenders.

  WHAT YOU JUST LEARNED:
  Strict TS forces you to KNOW your types. Loose TS is JS with extra
  syntax. The discipline is the value.


CHALLENGE 16.2 — Branded types for IDs                      Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: ~20 min (2026-05-18) — beat target by ~5 min. Some Gemini help
on initial brand syntax (Gemini gave the `unique symbol` + `declare const`
pattern instead of the string-literal `__brand` pattern in the spec —
more rigorous, unforgeable since the symbol is never exported).

Real learning came in two phases:

  PHASE 1 — UNDERSTANDING THE BRAND. Gemini's Ids.ts used:
    declare const employeeIdBrand: unique symbol;
    type EmployeeId = string & { readonly [employeeIdBrand]: true };
  vs the spec's:
    type EmployeeId = string & { __brand: 'EmployeeId' };
  Both work. unique-symbol version is preferred in production codebases
  (io-ts, effect-ts) because the symbol is module-private — outside code
  literally cannot construct the brand field key, so the type is
  unforgeable. String-literal version is forgeable: any file can write
  `{ __brand: 'EmployeeId' as const }`. NEW CONCEPTS internalised:
  `unique symbol` (a symbol type that refers to one specific symbol value,
  distinguishable at the type level from every other symbol), and
  `declare const` (tells TS something exists, compiles to zero bytes at
  runtime — pure compile-time marker).

  PHASE 2 — THE SUBTYPE DIRECTION GOTCHA. After changing Models.ts to
  use EmployeeId, ran tsc — NO errors. Surprising. The reason:
  `EmployeeId = string & {brand}` makes EmployeeId a SUBTYPE of string.
  Subtypes flow into supertypes silently (`EmployeeId → string` ✅), but
  not the reverse (`string → EmployeeId` ❌). So changing the producer
  (Employee.id) does nothing on its own — the brand widens to string
  every time it enters a function with a `string` parameter. **The brand
  only bites when you also tighten every CONSUMER.**

  Initial wrong move: scattered `as EmployeeId` casts at every call site
  (deleteEmployee, getEmployee, updateEmployee). That made compilation
  work but defeated the entire point — bare `as` is the same lie as
  `as any`. The fix: tighten signatures (handleDelete, ConfirmState.id,
  useCallback types, EmployeeRow prop types, api.ts params) so the brand
  flows naturally up the call chain. Then use `toEmployeeId(...)` (the
  named constructor) ONLY at true boundaries — useParams() in
  EmployeeForm, where URL strings enter the app.

WIN CONDITIONS HIT:
  - `as EmployeeId` / `as UserId` appear ONLY inside Ids.ts (the
    constructor — exactly one place per brand).
  - `toEmployeeId(...)` appears at exactly the two real boundaries
    (EmployeeForm.tsx lines 137 and 249 — getEmployee + updateEmployee
    calls fed by useParams()).
  - `EmployeeId` flows through the rest by type inheritance:
    Employee.id → EmployeeRow callbacks → EmployeeList useCallbacks →
    useEmployees.handleDelete → ConfirmState.id → deleteEmployee.
    Zero casts in that chain.
  - `npx tsc --noEmit` clean.

KEY MEMORY BEAT — "intersection done right":
  In 15.4 I tried `Omit<Employee, 'id'> & { salary: string }` to OVERRIDE
  a primitive — failed because `number & string = never`. In 16.2,
  `string & { brand }` SUCCEEDS because the intersection ADDS a marker
  field, not overrides an existing one. Same `&` operator, two different
  uses: adding constraints (works) vs overriding primitives (fails).
  Different shapes of intersection.

C# ANALOGY THAT FITS BEST: like declaring `record EmployeeId(Guid Value)`
and `record UserId(Guid Value)` in C#. Different type names, identical
underlying data. The brand is TS's hack to fake that nominal distinction
in a structurally-typed language. Same protection — pass UserId where
EmployeeId is expected → compile error. Zero runtime cost in both
languages.

USERID UNUSED: User.id is now typed UserId but nothing reads/writes it
yet (no User CRUD in the app). Brand will activate the moment User
endpoints land. Future-proofed at zero cost today.

  NEW HERE — read this before TASK:
  - Branded type (nominal type): `type EmployeeId = string & { __brand:
    'EmployeeId' }`. At runtime it's just a string; at compile time
    it's distinct from any other string. Pass a UserId where EmployeeId
    is expected → compile error.
  - Constructor function: `const employeeId = (s: string): EmployeeId
    => s as EmployeeId`. Cast once at the API boundary; never elsewhere.

  TASK:
  1. Add `EmployeeId`, `UserId` branded types in src/Types/Ids.ts.
  2. Change Employee.id, User.id to use the branded type.
  3. Walk every function that takes an id — type the parameter as
     EmployeeId / UserId instead of string.
  4. Add the constructor at the API parse boundary.

  RULES:
  - Brands are compile-time only — zero runtime cost.
  - One place that casts (the constructor); everywhere else uses the
    branded type.

  WHAT YOU JUST LEARNED:
  Nominal typing in a structural language. The .NET equivalent is just
  using distinct ID record types — TS has to fake it via brands. Same
  guarantee.


CHALLENGE 16.3 — Discriminated unions for reducers          Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: ~20 min (2026-05-19) — beat target by ~10 min. Took syntax help
from Gemini because Claude's explanation of the union-of-object-types shape
didn't land on first read; Gemini's rephrasing of the same pattern clicked.
Once the syntax was clear, the work itself was small — only one reducer
exists in src/.

SCOPE NOTE: the spec mentions a "recent-activity reducer" but it doesn't
exist — RecentActivityContext uses useState, not useReducer. The whole
challenge collapsed onto confirmReducer in useEmployees.tsx (one file).

THE REAL CONCEPT — UNION OF OBJECTS, not OBJECT WITH UNION FIELD:

  The original ConfirmAction was:
    type ConfirmAction = {
      type: "open" | "close";
      id?: EmployeeId;       // optional on BOTH branches
      name?: string;         // optional on BOTH branches
    }

  This is a SINGLE object type whose `type` field happens to be a string
  union. It is NOT a discriminated union. TS cannot narrow the payload —
  inside `case "open"`, action.id is still `EmployeeId | undefined`, which
  is why the code had defensive `action.id || null` and `action.name || ""`
  juggling.

  A real discriminated union is a UNION OF OBJECT TYPES, each tagged by a
  literal `type`:
    type ConfirmAction =
      | { type: "open"; id: EmployeeId; name: string }   // payload REQUIRED
      | { type: "close" };                                // no payload

  Now inside `switch (action.type)`, TS narrows the entire object to the
  matching variant. Under `case "open"` the compiler KNOWS id and name
  are required — no defensive `|| null` needed. Under `case "close"`,
  trying to read action.id is a compile error (the close variant has no
  id field).

  Same mental model: in the first shape, `{type, id?, name?}` is ONE
  rectangle that can hold any combination. In the second shape, you have
  TWO separate rectangles and the discriminator tells TS which one
  you're holding right now.

EXHAUSTIVENESS — the `never` trick:

  Replaced silent `default: return state` (which hid forgotten cases) with:
    default: {
      const _exhaustive: never = action;
      throw new Error(`unreachable: ${_exhaustive}`);
    }

  After handling "open" and "close", TS narrows `action` in the default
  branch to `never` — because no remaining variant is possible. Assigning
  `action` to `_exhaustive: never` only compiles when `action` is already
  `never`. Add a third variant tomorrow → that line becomes a compile
  error until the new case is handled. Compile-time guarantee that the
  switch handles every variant.

C# / F# ANALOGY:
  - C# closest match: sealed class hierarchy + switch expression on the
    runtime subtype. But C# does NOT enforce exhaustiveness at compile
    time — you can miss a subtype and the compiler stays quiet.
  - F# discriminated unions are the EXACT match — same exhaustiveness
    behaviour, same compiler errors when a case is missing.
  - The `never` trick is TS's way of getting F#-style exhaustiveness in
    a structurally-typed language.

WIN CONDITIONS HIT:
  - ConfirmAction is now a real discriminated union (two distinct object
    variants), not an object with a string-union tag.
  - Defensive `action.id || null` / `action.name || ""` defaults gone.
  - Silent `default: return state` removed; `never` exhaustiveness guard
    in place.
  - All three dispatch call sites (lines 81, 117, 138) compiled unchanged
    — they already passed correct shapes for each variant.
  - npx tsc --noEmit clean.

ONE-LINE TAKEAWAY: a discriminated union is a UNION OF OBJECT TYPES tagged
by a literal field, not a single object with a union-typed field. TS only
narrows the payload in the first shape.

  NEW HERE — read this before TASK:
  - Every useReducer in your codebase should have an action union
    typed as a discriminated union (one `type` field per variant).
    TS will then narrow each case in the switch and warn if you
    forget one.

  TASK:
  1. Walk every reducer (confirm reducer, recent-activity reducer,
     any others). Type the State and Action explicitly.
  2. Remove any `default:` case that swallows unknown actions. Let
     TS warn you if you miss one.
  3. Reducer return type pinned: `function reducer(s: State, a:
     Action): State`.

  RULES:
  - Discriminator name doesn't have to be `type` — but stick to one
    name across the codebase.
  - Use `never` in unreachable branches if you want to enforce
    exhaustiveness explicitly:
       const _: never = action; throw new Error('unreachable');

  WHAT YOU JUST LEARNED:
  Exhaustive state machines. TS proves at compile time that you
  handled every case. Same shape as F#/Rust match on a sum type.


CHALLENGE 16.4 — Tighten event handler types                Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: ~10 min (2026-05-19) — beat target by ~15 min. No Gemini help
needed. This was the round where Claude's task-intro format finally
clicked: concrete-first (file/line lookup table + worked before/after on
a real line + "what NOT to touch" list) instead of abstract-concept-first.
User flagged the format difference explicitly ("why don't you always
explain like this?") — saved as memory.

HYGIENE, NOT BUG FIX: handlers worked before the change because TS uses
CONTEXTUAL TYPING — when an arrow function is written inline in a JSX
attribute, TS reads the attribute's expected signature and silently
applies it to the parameter. So `(e) => e.target.value` was already
typed `React.ChangeEvent<HTMLInputElement>` at compile time. The risk:
the type is INVISIBLE — extract the handler to a const and `e` silently
becomes `any`. Explicit annotations make the type survive extraction.

THE ELEMENT-TYPE RULE — read from the HTML TAG, not the input behaviour:
  <input type="text">        → HTMLInputElement
  <input type="number">      → HTMLInputElement
  <input type="checkbox">    → HTMLInputElement (still! just .checked
                                instead of .value)
  <select>                   → HTMLSelectElement
  <textarea>                 → HTMLTextAreaElement
  <form> (onSubmit)          → HTMLFormElement
  <button> (onClick)         → HTMLButtonElement
  There is no HTMLCheckboxElement — the semantic role doesn't change
  the DOM class.

THE EVENT-TYPE RULE — read from what the user did:
  typed/changed value        → React.ChangeEvent<...>
  clicked a button           → React.MouseEvent<HTMLButtonElement>
  submitted a form           → React.FormEvent<HTMLFormElement>
  pressed a key              → React.KeyboardEvent<...>
  focused/blurred            → React.FocusEvent<...>
For this round, all 7 inline handlers were onChange → ChangeEvent.

THE 7 LINES THAT NEEDED ANNOTATING:
  FilterBar.tsx:60  <select>            → ChangeEvent<HTMLSelectElement>
  FilterBar.tsx:72  <input type=text>   → ChangeEvent<HTMLInputElement>
                    (multi-line body — initially missed this on first
                    pass because the {...} body looked different from
                    the one-liners; Claude flagged it, fixed after)
  FilterBar.tsx:85  <input type=checkbox> → ChangeEvent<HTMLInputElement>
  FilterBar.tsx:87  <input type=number> → ChangeEvent<HTMLInputElement>
  FilterBar.tsx:88  <input type=number> → ChangeEvent<HTMLInputElement>
  Login.tsx:175     <input> (username)  → ChangeEvent<HTMLInputElement>
  Login.tsx:197     <input> (password)  → ChangeEvent<HTMLInputElement>

WHAT NOT TO TOUCH (and why):
  - <button onClick={onConfirm}> — onConfirm is `() => void`, doesn't
    take the event. React handler-signature contravariance: a handler
    that ignores its argument satisfies a richer signature. Idiomatic.
  - <button onClick={() => onEdit(id)}> — arrow ignores the event entirely.
    No annotation needed because no `e` is referenced.
  - EmployeeForm.handleChange, EmployeeForm.handleSubmit — already
    annotated in 15.4.
  - Login.handleSubmit — already annotated in 15.5.
  - All Props interfaces (FilterBar, EmployeeRow, ConfirmModal,
    RecentActivityModal) — they pass plain VALUES (string, boolean,
    EmployeeId) via callbacks, not events. Cleaner than passing event
    objects up — child stays decoupled from DOM event shape.

WIN CONDITIONS HIT:
  - Every `e =>` inside JSX in src/ now has an explicit
    React.ChangeEvent<HTMLXxxElement> annotation.
  - npx tsc --noEmit clean.
  - Runtime behaviour identical — annotations are compile-time only.

C# / .NET MENTAL MODEL: C# event handlers always carry their delegate
signature (`EventHandler<T>`), and the compiler infers parameter types
from that signature on subscription. TS does the same via contextual
typing — BUT only as long as the function stays inline. Extract it and
the contextual link is severed. C# delegates can't be "ripped from
context" in the same way — once you say `EventHandler<MyArgs>`, the
type is bound. TS's annotation step is what we'd get for free in C#.

ONE-LINE TAKEAWAY: element type comes from the HTML TAG (not the input
behaviour), event type comes from the USER ACTION (not the handler name).
Annotations are hygiene that survives refactors.

  TASK:
  1. Find every onClick / onChange / onSubmit with an untyped
     parameter (`e` defaults to `any` in some setups).
  2. Replace with the specific event type:
       `React.MouseEvent<HTMLButtonElement>`,
       `React.ChangeEvent<HTMLInputElement>`,
       `React.FormEvent<HTMLFormElement>`.
  3. For handlers passed as props, type the callback shape:
       `onClick: (e: React.MouseEvent<HTMLButtonElement>) => void`.

  RULES:
  - Don't use the generic `Event` — use the React event type.
  - For handlers that don't need the event, type as `() => void`.

  WHAT YOU JUST LEARNED:
  Specific event types mean autocomplete works inside the handler.
  No more `e.target.value` returning `any`.


CHALLENGE 16.5 — Strict-mode pass                           Target: 20 min
--------------------------------------------------------------------------
YOUR TIME: ~5 min (2026-05-19) — beat target by ~15 min. Fastest round in
Round 16 by a wide margin. No Gemini help. Codebase was already
near-strict-clean from Rounds 15.x and 16.1-16.4, so enabling all 5 sub-
flags only surfaced 4 real issues (1 reducer + 3 stale imports).

ALL 5 STRICT FLAGS ENABLED in tsconfig.json:
  - noUnusedLocals
  - noUnusedParameters
  - noImplicitReturns
  - noFallthroughCasesInSwitch
  - exactOptionalPropertyTypes
None disabled. exactOptionalPropertyTypes worked first try because no
third-party type collisions surfaced in this codebase.

INITIAL ERRORS AFTER ENABLING FLAGS:
  1. useEmployees.tsx:26 — noUnusedParameters on confirmReducer's `state`
     parameter. The reducer never reads state (both branches build a
     fresh ConfirmState from action). True positive — flag was right.
  3 x stale `import React from 'react'`:
  2. App.tsx:31, EmployeeList.tsx:10, ProtectedRoute.tsx:28 — React 17+
     JSX transform makes the bare `import React` unnecessary (JSX gets
     auto-transformed without needing React in scope). These imports
     were leftover from when the files were .js (CRA's default JSX
     transform back then needed React in scope). With strict-mode's
     noUnusedLocals on, they finally got flagged. Deleted all three.

THE WRONG-FIRST-FIX MOMENT (key learning beat):

  Tried to silence the unused-state warning by DELETING the parameter:
    function confirmReducer(action: ConfirmAction): ConfirmState { ... }

  This compiled the reducer body fine — but broke the useReducer
  CONTRACT. useReducer expects `(state, action) => state`. With the
  parameter removed, TS inferred the reducer as `(action) => ConfirmState`,
  so:
    const [confirm, dispatch] = useReducer(confirmReducer, initialState);
  TS now thinks `confirm` is `ConfirmAction` (not ConfirmState) because
  it's reading the FIRST parameter type as the state type. Cascade: 10
  errors across the file — every `confirm.id`, every `dispatch({type:...})`,
  every `confirm.name` lost type narrowing because the entire signature
  was wrong.

  THE REAL FIX — underscore-prefix convention:
    function confirmReducer(_state: ConfirmState, action: ConfirmAction): ConfirmState {
  noUnusedParameters recognises a leading underscore as "intentionally
  unused, do not warn." The parameter STAYS — preserving the useReducer
  contract — but the lint rule is satisfied. Same convention exists in
  Rust (`_state`), Go (`_`), Python (`_state`). Cross-language idiom for
  "I know this is unused; it's required by the signature."

CONCEPT LOCKED IN — FIXED-SIGNATURE CONTRACTS:
  When a function's shape is dictated by an external contract (useReducer
  callback, event handler signature, React.FC<P>, library API), you
  CANNOT drop a parameter to satisfy a lint rule — the contract requires
  it. The right move is to mark it intentionally unused. This came up
  here for state; it'll come up again for any handler that ignores the
  event object, any React.FC that ignores props, any Context.Provider
  callback that ignores one of its args.

C# / .NET ANALOGY:
  C# 9+ has DISCARD patterns (`_`) but only in tuple deconstruction,
  switch arms, and pattern matching — NOT in function parameters. C#
  closest equivalents:
    - Name the parameter `unused` or `_` (compiles but no lint
      enforcement of intent).
    - `[SuppressMessage("Style", "IDE0060:Remove unused parameter")]`
      attribute — verbose but explicit.
    - Just leave it; C# doesn't warn on unused parameters by default
      unless an analyzer is configured.
  TS's `_param` underscore convention is more lightweight than the
  attribute and more enforced than just naming. Best-of-both.

WIN CONDITIONS HIT:
  - All 5 strict sub-flags enabled, none disabled.
  - All errors fixed via REAL fixes (no flag disabling, no `// @ts-ignore`,
    no `any` casts).
  - useReducer contract preserved (signature intact, parameter marked
    intentionally unused).
  - 3 stale React imports removed — codebase now consistent with
    React 17+ JSX transform.
  - npx tsc --noEmit clean.

ROUND 16 COMPLETE — TS HARDENING ARC DONE:
  16.1 any-removal | 16.2 branded IDs | 16.3 discriminated unions |
  16.4 event handler types | 16.5 strict-mode pass.
  Total: ~65 min vs 135 min planned. Codebase is now fully strict-typed
  with zero any, branded IDs, exhaustive reducers, explicit event types,
  and all strict sub-flags on. Ready for Round 17 (React Query migration).

ONE-LINE TAKEAWAY: when a function signature is fixed by an external
contract, mark unused params with `_` — don't drop them. Same idiom
across Rust/Go/Python; C# doesn't have it for parameters.

  NEW HERE — read this before TASK:
  - tsconfig.json `strict: true` is an UMBRELLA flag enabling 7+
    individual strict flags. Some projects enable strict but disable
    one sub-flag — defeats the purpose.
  - Key strict sub-flags:
    * `strictNullChecks` — null and undefined are separate types.
    * `noImplicitAny` — variables without a type default to error.
    * `strictFunctionTypes` — function parameter variance is checked.
    * `noImplicitReturns` — every branch must return.
    * `noUnusedLocals`, `noUnusedParameters` — flags dead code.

  TASK:
  1. Add to tsconfig.json compilerOptions:
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noImplicitReturns": true,
       "noFallthroughCasesInSwitch": true,
       "exactOptionalPropertyTypes": true
  2. Run `npx tsc --noEmit`. Fix every new error.
  3. Commit.

  RULES:
  - Don't disable a strict flag to pass. Find the real fix.
  - `exactOptionalPropertyTypes` is the strictest; turn off if it's
    too noisy on third-party types, but try it first.

  WHAT YOU JUST LEARNED:
  Strict TS is a spectrum. The default `strict: true` is good; the
  extra flags catch more. Each one is one less class of bug.


================================================================================
ROUND 17 — REACT QUERY / SERVER STATE (designed 2026-05-15, redesigned)
================================================================================

Pacing: One challenge per day. Server state ≠ client state. React
Query (TanStack Query) is the standard tool. You'll use it in EVERY
feature from Round 23 onwards — internalising it now pays compound
interest.

.NET analogy: IMemoryCache + a DelegatingHandler pipeline, but with
deduplication, automatic refetch on focus, optimistic updates, and
mutation state baked in.


CHALLENGE 17.1 — Install + QueryClientProvider              Target: 20 min
--------------------------------------------------------------------------
YOUR TIME: ~7 min (2026-05-19) — beat target by ~13 min. Took syntax help
from Gemini, but the root cause was a PROCESS FAILURE on Claude's side,
not a concept gap: Claude closed Round 16 with "Ready when you are" for
17.1 instead of proactively pushing the v2 concrete-first breakdown.
User flagged it explicitly — memory feedback_concrete_first_task_format
updated with a "no passive cliffhangers between rounds" rule.

WHAT WAS DONE:
  Installed:  @tanstack/react-query@5.100.11
              @tanstack/react-query-devtools@5.100.11
  Wired in:   src/index.tsx (NOT App.tsx — single QueryClient instance
              for the whole app, wired at the root render tree).
  Configured: staleTime: 30000 (30 s window where cached data is "fresh"
              and won't re-trigger network calls), refetchOnWindowFocus:
              false (disables the default tab-back refetch behaviour —
              fine in dev, would re-enable in prod for liveness).
  Devtools:   <ReactQueryDevtools initialIsOpen={false} /> — adds the
              overlay button bottom-left of the page in dev mode. Click
              to see every active query, cache state, fetch status.

PROVIDER LAYERING (the architectural call that matters):
    <React.StrictMode>
      <RecentActivityProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </AuthProvider>
      </RecentActivityProvider>
    </React.StrictMode>

  QueryClientProvider sits INSIDE AuthProvider — correct. Reasoning:
  every query useEmployees etc. will issue eventually needs the JWT in
  the Axios interceptor (set up in services/api.ts), and the JWT lives
  in AuthContext. Putting QueryClient OUTSIDE Auth would mean queries
  could fire before the token is loaded → 401s. Inside means Auth's
  state is already available when queries mount. Same pattern: outer
  providers expose state the inner ones may need.

NEW CONCEPTS LOCKED IN:
  - QueryClient — the cache OBJECT. One instance per app. Holds every
    query result keyed by its queryKey (the cache key — covered in
    17.5).
  - QueryClientProvider — a React Context provider that hands the
    QueryClient down to every useQuery/useMutation hook in the tree.
    Same Context pattern AuthProvider uses; QueryClient just happens
    to be the value.
  - staleTime — duration where cached data is considered FRESH. While
    fresh: subsequent useQuery calls return cache without a fetch.
    After staleTime expires: data becomes STALE — still served from
    cache but a background refetch fires. Default is 0 (always stale,
    always refetches on remount). 30s here = mild caching.
  - refetchOnWindowFocus — defaults to true. Browsers tabbing back
    triggers a refetch (useful for "see latest" UX). Turned off here
    to keep dev quiet; would re-enable in production.

.NET MENTAL MODEL:
  QueryClient ≈ IMemoryCache instance (the singleton cache store).
  QueryClientProvider ≈ adding IMemoryCache to the DI container — once
  registered, every controller/service can ask for it.
  staleTime ≈ AbsoluteExpiration on a MemoryCacheEntryOptions.
  refetchOnWindowFocus ≈ a custom DelegatingHandler that revalidates
  on a trigger — except React Query has it built in.
  useQuery (next round) ≈ a service method that wraps IMemoryCache.GetOrCreateAsync
  with retry, dedup, and background refresh. The killer feature React
  Query has over IMemoryCache: REQUEST DEDUPLICATION — two components
  calling the same query at the same time fire ONE network request.
  IMemoryCache won't do that for you.

WIN CONDITIONS HIT:
  - Both packages installed at v5.100.11 (current major).
  - QueryClientProvider wired at root in index.tsx, not App.tsx.
  - QueryClient configured with the two spec-defined defaults.
  - Devtools mounted with initialIsOpen={false}.
  - Layered inside AuthProvider (correct for JWT-dependent queries).
  - npm start works, devtools button visible in dev.
  - npx tsc --noEmit clean.

NOT YET WIRED (intentional — comes in 17.2):
  useEmployees still uses useState + useEffect + manual fetch in
  hooks/useEmployees.tsx. Round 17.2 replaces that with useQuery and
  THIS is where the win actually shows up — automatic refetch, loading
  state, error state, dedup, caching. 17.1 is plumbing only.

ONE-LINE TAKEAWAY: QueryClient is a cache instance; QueryClientProvider
hands it down via Context. Layer it INSIDE any provider whose state
queries will depend on (auth/JWT here). 17.1 is plumbing — the payoff
is 17.2.

  NEW HERE — read this before TASK:
  - `QueryClient`: the cache object that holds every cached query
    result. One instance per app.
  - `QueryClientProvider`: a React Context provider that hands the
    QueryClient to every component.
  - `staleTime`: how long cached data is considered "fresh."
    `staleTime: 30_000` = 30 seconds. Underscore in numbers is JS
    separator syntax — same as `30000`.
  - `refetchOnWindowFocus`: by default React Query refetches when you
    tab back. Useful in prod, noisy in dev — turn off here.

  TASK:
  1. npm install @tanstack/react-query @tanstack/react-query-devtools
  2. In src/index.tsx, wrap <App /> in QueryClientProvider with a
     QueryClient configured: staleTime 30_000, refetchOnWindowFocus
     false.
  3. Add <ReactQueryDevtools /> inside the provider.

  RULES:
  - QueryClient created ONCE at the top level. Never inside a
    component (would reset the cache on every render).
  - Devtools is dev-only by default.

  WHAT YOU JUST LEARNED:
  Cache scope is set by the Provider boundary. Same idea as a DI
  scope in .NET.


CHALLENGE 17.2 — Convert useEmployees to useQuery           Target: 35 min
--------------------------------------------------------------------------
YOUR TIME: ~15 min (2026-05-19) — beat target by ~20 min. First real win
from React Query plumbing: ~12 lines of useState + useEffect + try/catch
collapsed into a single useQuery call. Required two iteration passes
because Claude's first breakdown had THREE inconsistencies the user
caught while typing it up:

CLAUDE-SIDE ERRORS IN THE INITIAL BREAKDOWN (all caught and fixed):
  1. Told user to drop useEffect from imports, then immediately asked
     them to add `useEffect` for the error toast. Contradictory — had
     to add it back.
  2. Wrote `query.isError` / `query.error` in the error-toast snippet,
     but the worked example destructured useQuery as
     `{ data, isLoading, dataUpdatedAt }` — no `query` alias bound.
     Wrong identifier. Fix: destructure `isError` directly.
  3. Listed "add `const queryClient = useQueryClient();`" inside prose
     instead of as a numbered run-order step. User skipped it. Fix:
     every prereq line becomes its own numbered step going forward.

USER-SIDE COPY-PASTE BUGS (both two-sided refactor pattern — known issue
from feedback_two_sided_refactor):
  - PASS 1: pasted the UNDO updater `[...old, employee]` into the
    DELETE slot. Caught by tsc.
  - PASS 2 (after fix): pasted the DELETE filter
    `old.filter(e => e.id !== confirm.id)` into the UNDO slot. Caught
    by Claude on cleanup pass — tsc passed but runtime would have
    silently broken undo (cache stayed empty after re-create). Fixed
    during the comment/formatting cleanup.

The recurring shape: setQueryData calls in delete and undo are
SYMMETRIC INVERSES — one filters out, one appends in. Both have the
same type signature, so the compiler doesn't catch a swap. Same
two-sided refactor failure mode as past PR cleanups; new instance for
the on-file count.

WHAT FINAL STATE LOOKS LIKE (useEmployees.tsx):
  - No useState for the employee list (reducer for the modal stays).
  - One useQuery({queryKey:['employees'], queryFn}) call replaces three
    useStates + useEffect + fetchEmployees.
  - `loading` aliased from `isLoading`; `fetchedAt` derived from
    `dataUpdatedAt`. No manual timestamp tracking.
  - One useEffect remains — error-toast bridge (React Query doesn't
    toast on its own; the side-effect-on-error wiring stays manual).
  - Delete and Undo both write to the cache via
    `queryClient.setQueryData<Employee[]>(['employees'], updater)`:
        DELETE → (old = []) => old.filter(e => e.id !== confirm.id)
        UNDO   → (old = []) => [...old, employee]
  - UseEmployeesReturn shape unchanged — EmployeeList consumes the
    same props it did before. Round 17.2 is an internal refactor, not
    an API change.

NEW CONCEPTS LOCKED IN:
  - useQuery — the read-side hook. queryKey is the cache key (array);
    queryFn is the async fetcher. On mount: fires queryFn, caches by
    key. Returns { data, isLoading, isError, error, dataUpdatedAt,
    refetch }. Multiple components calling the same queryKey share
    one cache slot — REQUEST DEDUPLICATION at the hook level.
  - useQueryClient — accessor for the QueryClient instance (wired in
    17.1). Used to imperatively patch the cache after a mutation.
  - setQueryData — direct cache write, synchronous, no refetch. Takes
    queryKey + an updater function. Updater receives the old value
    (defaulted to [] here to handle the "never fetched" case) and
    returns the new value. Use when YOU know the new state locally
    (delete/undo). Alternative: invalidateQueries — marks stale,
    triggers refetch — used when you want server confirmation
    (covered in 17.3).
  - dataUpdatedAt — millisecond timestamp React Query maintains for
    the last successful fetch. Replaces manual `setFetchedAt(...)` in
    the catch-and-set pattern.

.NET MENTAL MODEL — the big shift:
  Before: manual `_cache.GetOrCreateAsync("employees", ...)` in a service
  method, with hand-rolled loading flag and error try/catch. After:
  useQuery is the whole pattern — cache key + fetch fn + auto-managed
  state. Equivalent .NET-flavoured contract:

    interface ICache<T> {
      T? Data { get; }
      bool IsLoading { get; }
      bool IsError { get; }
      DateTime? UpdatedAt { get; }
    }

  useQuery returns that shape, and additionally:
   - DEDUP: two callers, one network request (IMemoryCache won't do
     this for you; you'd need a SemaphoreSlim or polly cache-stale-while-
     revalidate dance).
   - BACKGROUND REVALIDATION: stale data is served from cache while
     a fresh fetch runs in the background. Default IMemoryCache is
     binary (in or out).
   - CACHE-KEY-AS-IDENTITY: queryKey is the lookup. setQueryData
     with the same key updates THE cache slot; readers re-render
     automatically.

WIN CONDITIONS HIT:
  - All three useStates for the list/loading/timestamp removed.
  - fetchEmployees + manual useEffect removed.
  - Delete and Undo both write to the cache (after bug fix).
  - UseEmployeesReturn shape unchanged.
  - npx tsc --noEmit clean.
  - Code shrank ~15 lines net; behaviour now includes dedup, background
    refetch, and a free devtools view of the cache.

CLEANUP PASS (done during the same round):
  - Header comment rewritten to reflect React Query architecture
    (IMemoryCache analog called out).
  - Stale comments about fetchEmployees / mount-useEffect / "setEmployees
    stays private" deleted.
  - Indentation fixed (queryClient line was unindented; setQueryData
    blocks had ragged spacing).
  - Object literals formatted to multi-line where they spanned past
    100 cols.

ONE-LINE TAKEAWAY: useQuery is the read-side cache layer; setQueryData
is the imperative write. Delete and undo are symmetric inverses on the
same key — keep filter-vs-append straight or runtime breaks silently.

  NEW HERE — read this before TASK:
  - `useQuery({ queryKey, queryFn })`: the read-side hook. Returns
    `.data`, `.isLoading`, `.isFetching`, `.error`.
  - `queryKey`: a UNIQUE identifier (array convention). Two components
    using the same key share one cached result.
  - `queryFn`: an async function returning the data. Convention:
    `async () => (await api.get(...)).data`.
  - `isLoading` vs `isFetching`: isLoading is true only on the first
    fetch; isFetching includes background refetches. Use isLoading
    for full-page spinners.
  - `?? []`: nullish-coalescing. Use because `data` is undefined while
    loading.

  TASK:
  1. In useEmployees.ts, replace the manual useState + useEffect fetch
     with:
       const employeesQuery = useQuery({
         queryKey: ['employees'],
         queryFn: async () => (await getEmployees()).data,
       });
  2. Derived values:
       const employees = employeesQuery.data ?? [];
       const loading = employeesQuery.isLoading;
  3. Delete the manual state and the useEffect.

  RULES:
  - Never wrap useQuery in a useEffect.
  - Default `data` with `?? []` to keep call-sites simple.

  WHAT YOU JUST LEARNED:
  useQuery replaces ~80% of data-fetching code with one hook. The
  cache shares state across components automatically.


CHALLENGE 17.3 — Convert delete to useMutation (optimistic) Target: 40 min
--------------------------------------------------------------------------
YOUR TIME: 35 min — took help from Gemini. Claude's challenge spec did
not actually state what needed to be done — TASK step 1 just pointed
at "the canonical pattern in the existing spec from earlier 16.3 (now
17.3)" which doesn't exist anywhere in this file. Empty pointer, no
worked example, no before/after. Concrete-first format failed again.
Going forward I'll ask Gemini only for the help.

  NEW HERE — read this before TASK:
  - `useMutation`: the write-side hook. Returns `.mutate(args)`,
    `.isPending`, `.isError`. You CALL .mutate on the click.
  - `onMutate(args)`: fires BEFORE the request — optimistic update
    goes here. Returns a context object passed to onError for rollback.
  - `onError(err, args, context)`: fires on failure. Roll back using
    `context.prev`.
  - `onSettled`: fires on success OR failure. Use it to
    `invalidateQueries` — forces a refetch.
  - `queryClient.cancelQueries`: stops in-flight refetches from
    overwriting your optimistic update.
  - `queryClient.setQueryData(key, updater)`: writes to cache directly,
    no HTTP call.
  - `queryClient.invalidateQueries({ queryKey })`: marks stale,
    triggers refetch.

  TASK:
  1. Add useMutation for delete with optimistic update + rollback +
     onSettled invalidation. See the canonical pattern in the existing
     spec from earlier 16.3 (now 17.3).
  2. Wire onConfirm to call deleteMutation.mutate(confirm.id).

  RULES:
  - Optimistic update for delete is safe (remove from cache before
    the server confirms).
  - Optimistic update for create is NOT safe (server-assigned id is
    unknown) — skip it for create.

  WHAT YOU JUST LEARNED:
  Gold-standard write pattern: optimistic → mutate → rollback on
  error → invalidate on settled. Reapply this in every feature.


CHALLENGE 17.4 — Create + Edit mutations                    Target: 35 min
--------------------------------------------------------------------------
YOUR TIME: 20 min — took help from Gemini again. Same story as 17.3:
don't know the useMutation syntax well enough yet, Claude's spec listed
WHAT to do but no syntax example to anchor the HOW.

  TASK:
  1. Add useCreateEmployee + useUpdateEmployee mutations.
  2. EmployeeForm uses them — submit calls mutation.mutate(formData).
  3. mutation.isPending replaces your hand-rolled isSubmitting.
  4. On success: invalidateQueries(['employees']), navigate back.

  RULES:
  - Optimistic update IS worth it for edit (data is in cache; patch it).
  - Skip optimistic for create.

  WHAT YOU JUST LEARNED:
  All the fetch+useState+useEffect+isSubmitting collapses into one
  mutation hook. Component code becomes UI, not plumbing.


CHALLENGE 17.5 — Query keys hierarchy + capstone            Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: 15 min — understood the concept (query keys are the cache's
public API, centralize like route strings). Took Gemini's help for the
implementation in EmployeeForm and useEmployee. Understood WHY we use
the key builders.

  NEW HERE — read this before TASK:
  - Query key hierarchy: `['employees']` (list), `['employees', id]`
    (one item). `invalidateQueries({ queryKey: ['employees'] })` matches
    both because of the array prefix match.
  - Centralize key builders to avoid typos:
       export const employeeKeys = {
         all: ['employees'] as const,
         detail: (id: EmployeeId) => ['employees', id] as const,
       };

  TASK:
  1. Create src/queries/employeeKeys.ts.
  2. Refactor every queryKey in the codebase to use the builders.
  3. Add useEmployee(id) for the detail view.

  RULES:
  - `as const` on the array makes TS infer a tuple literal type.
  - Key shape consistency across features is what makes invalidation
    predictable.

  WHAT YOU JUST LEARNED:
  Query keys are the public API of your cache. Centralize them like
  you centralize route strings.


================================================================================
ROUND 18 — REACT ROUTER DEEPER (designed 2026-05-15, redesigned)
================================================================================

Pacing: One challenge per day. From Round 22 onwards every feature
adds 1-2 new routes. The patterns here become rote — that's the goal.


CHALLENGE 18.1 — createBrowserRouter config                 Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: ~8 min. Took Gemini's help for syntax.

  NEW HERE — read this before TASK:
  - `createBrowserRouter([...])`: the v6.4+ way to declare routes as
    a config array. Each entry: `{ path, element, children? }`.
  - `RouterProvider router={router}`: replaces <BrowserRouter> +
    <Routes>. Sits at the app top.
  - Move providers ABOVE RouterProvider — routing depends on Auth/
    QueryClient, not the other way around.

  TASK:
  1. In App.tsx, replace the existing <Routes> with a router config.
  2. Move QueryClientProvider / AuthProvider above RouterProvider.
  3. Confirm all current routes still work.

  RULES:
  - Routes as data are easier to test and to generate (e.g. from
    user roles).

  WHAT YOU JUST LEARNED:
  Routes are config, not JSX. Same shape as enumerating endpoints in
  an ASP.NET Core startup.


CHALLENGE 18.2 — URL params with useParams                  Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: ~30 min. Took Gemini's help for syntax.

  NEW HERE — read this before TASK:
  - `useParams<{ id: string }>()`: returns the URL params object. For
    path `/employees/:id/edit`, returns `{ id: '...' }`.
  - URL params are always STRINGS. Parse to numbers if needed; for
    GUIDs/branded types, cast through the constructor (Round 16.2).

  TASK:
  1. EmployeeForm reads the id from useParams. If id present, fetch
     via useEmployee(id) and prefill via reset(employee).
  2. EmployeeList navigates to edit with
     `navigate(`/employees/${employee.id}/edit`)`.

  RULES:
  - Single source of truth — don't also keep id in state.
  - id === undefined ⇒ create mode.

  WHAT YOU JUST LEARNED:
  URL params let you bookmark / refresh / share state-bearing URLs.


CHALLENGE 18.3 — Nested routes + Outlet (AuthLayout)        Target: 30 min
--------------------------------------------------------------------------
YOUR TIME: ~20 min. Took Gemini's help for syntax. Gemini suggested
localStorage for the user-name in the header; rejected that and read it
straight from AuthContext instead. Removed the nav block from
EmployeeList — the user name now lives top-right in the AuthLayout
header.

  NEW HERE — read this before TASK:
  - Nested route: parent route's `element` is a layout containing
    `<Outlet />` — the placeholder for the child route's element.
  - Reusable chrome (header, nav, footer) goes in the layout once.

  TASK:
  1. Create AuthLayout.tsx with a header (user menu, logout) + <Outlet />.
  2. Restructure the router: protected branch with AuthLayout as the
     parent element and the existing routes as children.
  3. Confirm header appears on every authenticated page.

  RULES:
  - Exactly one <main> per page. Put it in the layout.
  - Multiple layouts can coexist later (PublicLayout, AdminLayout).

  WHAT YOU JUST LEARNED:
  Layouts via nested routes = DRY chrome. Same idea as MVC layouts.


CHALLENGE 18.4 — Search params via useSearchParams          Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: ~10 min. Took Gemini's help for syntax. After implementing,
filter clearing wasn't working — Gemini's fix was to replace the
key-by-key delete pattern with a single
`setSearchParams(new URLSearchParams(), { replace: true })` + keep
`setView(0)` since `view` is still local state. Works now.

  NEW HERE — read this before TASK:
  - `useSearchParams()`: returns `[searchParams, setSearchParams]`.
    `URLSearchParams` API: `.get('key')`, `.set('key', value)`.
  - URL example: `/employees?search=alice&dept=Engineering`.
  - Search params persist across reload + are shareable as links.

  TASK:
  1. EmployeeList replaces the local search/department/hideBelow50K
     useState with searchParams.
  2. Setters update params with `{ replace: true }` (don't push
     history on each keystroke).
  3. Empty values delete the key (no `?search=`).

  RULES:
  - One source of truth. Drop the local state.

  WHAT YOU JUST LEARNED:
  Query strings = bookmarkable filter state. Standard pattern in
  enterprise apps.


CHALLENGE 18.5 — Typed route helpers                        Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: ~5 min. Beat target by ~20 min. Concrete-first lookup-table
breakdown worked — every literal route string swapped in one pass, no
Gemini needed.

  TASK:
  1. src/routes.ts:
       export const routes = {
         login: () => '/login' as const,
         employees: () => '/employees' as const,
         newEmployee: () => '/employees/new' as const,
         editEmployee: (id: EmployeeId) => `/employees/${id}/edit` as const,
       };
  2. Replace every literal route string in the codebase.

  RULES:
  - One file owns route shape. Every navigator/link imports from it.

  WHAT YOU JUST LEARNED:
  Route helpers turn typo bugs into compile errors. Same idea as
  `nameof()` in C#.


================================================================================
ROUND 19 — RHF + ZOD (designed 2026-05-15, redesigned)
================================================================================

Pacing: One challenge per day. Every feature from Round 22+ has a form.
Internalize the RHF + Zod combo NOW — you'll write it 8+ more times.


CHALLENGE 19.1 — Install RHF + first form                   Target: 25 min
--------------------------------------------------------------------------
YOUR TIME: ~20 min. Took Gemini's help on the TestForm wiring (useForm
+ register + handleSubmit shape — first contact with RHF). Side detour:
tried routing the login redirect to TestForm by hijacking the
`employees: () => "/employees"` helper to return "/TestForm" — it
"worked" only because the helper is the single source of truth for both
`navigate(routes.employees())` and `path: routes.employees()`, so both
sides flipped together. Hijacking would have silently broken every
other site that calls routes.employees() (EmployeeForm post-save,
AuthLayout brand link, App.tsx catch-all). Restored employees helper to
"/employees"; right pattern is add testForm helper + register a new
route, not rewrite an existing one.

  NEW HERE — read this before TASK:
  - React Hook Form (RHF): a 3rd-party library that manages form state
    via refs (uncontrolled inputs). Much less re-rendering than the
    controlled-input pattern you wrote in Round 10.
  - `useForm<T>()`: main hook. Returns `{ register, handleSubmit,
    formState, watch, setValue, reset }`.
  - `register('fieldName')`: returns props you spread onto an <input>.
    Wires the input to RHF's internal state.
  - `handleSubmit(onValid, onInvalid?)`: wraps your submit. Runs
    validation first, calls onValid with typed data on success.

  TASK:
  1. npm install react-hook-form
  2. Create a throwaway TestForm.tsx with one field + register +
     handleSubmit, log the submitted data.
  3. Confirm it logs.

  RULES:
  - `useForm<T>()` where T = form-data shape.
  - Don't mix RHF with controlled `value=`. Pick one model per form.

  WHAT YOU JUST LEARNED:
  RHF replaces hand-rolled form state. Faster, less code, fewer
  re-renders.


CHALLENGE 19.2 — Refactor EmployeeForm to RHF               Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Replace useState + handleChange + validate in EmployeeForm with:
       const { register, handleSubmit, reset, formState: { errors, isSubmitting } }
         = useForm<EmployeeFormData>({ defaultValues: {...} });
  2. Each input: `<input {...register('firstName', { required: true })} />`.
  3. Edit mode: `reset(employee)` after the data loads.

  RULES:
  - Don't keep old useState alongside RHF.
  - `defaultValues` runs once on mount. Use `reset()` for later.
  - `formState.isSubmitting` replaces hand-rolled isSubmitting.

  WHAT YOU JUST LEARNED:
  ~50% less code, fewer re-renders. The pattern you'll repeat in every
  feature form.


CHALLENGE 19.3 — Zod schema validation                      Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Zod: a SCHEMA validation library. Declare shape + rules once;
    get a runtime validator AND an inferred TS type.
  - `z.object({ ... })`: object schema. Field rules: `.min(1)`,
    `.email()`, `.regex(...)`, `.optional()`, `.positive()`.
  - `z.infer<typeof schema>`: derives the TS type from the schema.
    One source of truth for shape + rules.
  - C# analogy: FluentValidation + an inferred DTO type.

  TASK:
  1. npm install zod
  2. Create src/schemas/employeeSchema.ts with z.object + .min/.email
     rules + error messages.
  3. Export `type EmployeeFormData = z.infer<typeof employeeSchema>`.

  RULES:
  - Error message lives INSIDE the rule: `.email('Invalid email')`.
  - `z.coerce.number()` if the input is a string-typed number.

  WHAT YOU JUST LEARNED:
  Schema-first. Type AND rules in one place — change one, both update.


CHALLENGE 19.4 — Wire Zod into RHF (resolver)               Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - "Resolver": adapter connecting a validation library to RHF.
    `@hookform/resolvers/zod` exports `zodResolver(schema)`.
  - With a resolver, RHF validates the WHOLE FORM against the schema
    instead of using per-field inline rules.

  TASK:
  1. npm install @hookform/resolvers
  2. useForm({ resolver: zodResolver(employeeSchema), defaultValues:
     {...} }).
  3. Remove inline { required: true } from register calls — Zod owns
     rules.

  RULES:
  - One source of truth: rules in the schema, not in register.

  WHAT YOU JUST LEARNED:
  Schema-driven validation. Change the schema, type AND rules update,
  components untouched.


CHALLENGE 19.5 — Field UX polish                            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `formState.touchedFields`: map of `{ field: true }` for fields
    the user has blurred.
  - `mode: 'onTouched'`: validate when first blurred, then on every
    change.
  - `setError('root', { message })`: form-level error (server-side
    "email already in use").

  TASK:
  1. mode: 'onTouched'.
  2. Show errors only when `touchedFields[field]` is true.
  3. Disable Submit until `formState.isValid && !isSubmitting`.
  4. On server error: setError('root', { message }) + render
     errors.root?.message at the top.

  RULES:
  - Eager error display is bad UX. Touch-aware is the bar.

  WHAT YOU JUST LEARNED:
  Form polish: touched-aware errors, disabled-until-valid, root errors.
  Use this pattern in every feature form.


================================================================================
ROUND 20 — AUTH DEEPER + FIRST-LOGIN PASSWORD (designed 2026-05-15, redesigned)
================================================================================

Pacing: One challenge per day. Builds on Round 13.2 (Context) + the
existing JWT login. Adds refresh tokens, role-based guards, and the
key feature for later: forced password change on first login.

This round directly enables Phase 3 features that need role checks.


CHALLENGE 20.1 — Refresh token endpoint (.NET)              Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - REFRESH TOKEN PATTERN: short-lived access token (15 min) + long-
    lived refresh token (7 days). When access expires, client silently
    exchanges refresh → new access. User never re-logs in. Standard
    OAuth2 refresh-grant flow.
  - Storage: access in memory or short-lived storage; refresh in an
    httpOnly Secure cookie (JS can't read it — XSS-safe).
  - Token rotation: every refresh issues a NEW refresh token,
    invalidates the old one. Anti-replay.

  TASK:
  1. AuthController.Login returns `{ accessToken, expiresIn: 900 }` in
     body + sets refresh as httpOnly Secure SameSite=Strict cookie.
  2. AuthController.Refresh reads the cookie, validates against a
     simple in-memory store, returns a new access token + rotates the
     cookie.
  3. AuthController.Logout invalidates the refresh in the store.

  RULES:
  - Refresh tokens must rotate. Never reuse.
  - Cookie flags: HttpOnly + Secure + SameSite=Strict + Path=/api/auth.

  WHAT YOU JUST LEARNED:
  Standard auth shape. Access in JS-accessible storage; refresh in
  cookie. Backend-side.


CHALLENGE 20.2 — Refresh interceptor on axios               Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Axios response interceptor with silent retry: on 401, call
    /auth/refresh, retry the original request with the new token.
    Transparent to component code.
  - Single-flight: 3 concurrent 401s must call refresh ONCE; the
    other two wait for the same promise. Use a module-level promise.

  TASK:
  1. In api.ts, extend the response interceptor:
     - On 401 (not already retried): set _retry flag, await a shared
       refreshPromise, retry the original request with the new token.
     - On 401 after retry: clear localStorage, redirect /login.
  2. Test by shortening access expiry to 30s; watch silent refresh
     happen.

  RULES:
  - `original._retry` flag prevents loops.
  - `??=` (nullish-coalescing assignment) — share one in-flight
    promise.

  WHAT YOU JUST LEARNED:
  Silent refresh is invisible UX. Same shape as a .NET DelegatingHandler
  that re-attempts on 401.


CHALLENGE 20.3 — First-login forced password change         Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - First-login pattern: when an admin creates a user, they set a
    DEFAULT password (e.g. "user123") and a `mustChangePassword:
    true` flag on the user record. On first login, the API includes
    this flag in the response. The client redirects to a forced
    change-password page and DOESN'T let the user navigate anywhere
    else until they change it.

  TASK:
  1. .NET side: User model gains `MustChangePassword: bool`. Login
     response includes it: `{ accessToken, user: { ..., mustChangePassword } }`.
  2. Add POST /api/auth/change-password — body `{ oldPassword,
     newPassword }`. On success: clears `MustChangePassword`.
  3. Client: store `user.mustChangePassword` in AuthContext.
  4. Add /auth/force-change-password route — a stripped-down page
     with only the change-password form.
  5. App-level redirect: if user.mustChangePassword AND current path
     ≠ /auth/force-change-password, redirect there. Block all other
     navigation.

  RULES:
  - The forced page must NOT have logout-as-cancel — user can't
    bypass it.
  - Old password is required even on forced change (defense against
    session hijack).

  WHAT YOU JUST LEARNED:
  Forced workflows. The pattern: a server flag + a client redirect
  guard + a single-purpose page. Reused in many enterprise flows
  (TOS acceptance, profile completion, etc.).


CHALLENGE 20.4 — Role-based route guards                    Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Extend ProtectedRoute to accept `roles?: ('Admin' | 'Manager' |
     'Employee')[]`.
  2. Inside: if useAuth().user?.role not in allowed list → redirect
     /forbidden.
  3. Add /forbidden page.
  4. UI hiding: `{user?.role === 'Admin' && <button>Delete</button>}`.

  RULES:
  - Server-side authorization is the SOURCE OF TRUTH. Client hiding is
    UX, not security.
  - Pull roles from useAuth() everywhere — never hard-code role
    strings inline.

  WHAT YOU JUST LEARNED:
  Two layers: route guard + UI hide. Reused in every feature that has
  manager/admin views.


CHALLENGE 20.5 — useAuth narrowing + capstone               Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - The narrowing guard: `if (!ctx) throw new Error(...)` — after this
    line, TS removes null from the type. Every consumer of useAuth()
    gets a non-null AuthContextValue, no more `auth?.user`.

  TASK:
  1. Refactor AuthContext: `createContext<AuthContextValue | null>(null)`.
  2. useAuth throws if outside a Provider.
  3. Walk every consumer and remove optional-chaining on auth.

  RULES:
  - Default value of null (not {}) — forces the runtime guard.

  WHAT YOU JUST LEARNED:
  Context with TS forces a discipline JS lets slide. Same as DI in
  .NET that fails fast on missing registration.


================================================================================
ROUND 21 — TAILWIND CSS (designed 2026-05-15, redesigned)
================================================================================

Pacing: One challenge per day. Refactor existing components to Tailwind
BEFORE features start — every new feature uses Tailwind from day one.
Tailwind muscle memory builds through this round + every future feature.


CHALLENGE 21.1 — Install + config                           Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Tailwind: a UTILITY-first CSS framework. Instead of `.btn { ... }`,
    you write `<button className="px-2 py-1 bg-blue-500">`.
  - Generates a small final CSS containing only the utility classes
    you actually used (PURGE step). Empty class? Doesn't ship.
  - `tailwind.config.js` `content:` array MUST include every file
    with Tailwind classes.

  TASK:
  1. Follow Tailwind's CRA/Vite install: 3 steps (npm install,
     postcss config, @tailwind directives in index.css).
  2. Restart dev server.
  3. Test class on a heading.

  RULES:
  - content paths matter — wrong glob = purged classes don't ship.

  WHAT YOU JUST LEARNED:
  Utility CSS lives next to JSX. The mental shift takes 1-2 components.


CHALLENGE 21.2 — Refactor StatusBadge + EmployeeRow         Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `clsx`: tiny utility for composing conditional class strings.
    `clsx('px-2', isActive && 'bg-green-500', isDisabled && 'opacity-50')`
    builds a clean className.
  - Use clsx the moment you have 2+ conditional class fragments.

  TASK:
  1. npm install clsx
  2. Replace StatusBadge's inline `style` with Tailwind utilities.
  3. Replace EmployeeRow's inline `style` (selected highlight, cursor)
     with Tailwind classes.

  RULES:
  - Don't extract to a CSS class yet. The co-location is the point.

  WHAT YOU JUST LEARNED:
  Inline-style refactor pattern. Repeat in every component.


CHALLENGE 21.3 — Refactor EmployeeList + EmployeeForm       Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Replace every inline style and ad-hoc className in EmployeeList
     and EmployeeForm with Tailwind utilities.
  2. Tables get `min-w-full divide-y` patterns; forms get `space-y-4
     max-w-md mx-auto` patterns.
  3. Buttons get a consistent shape — `px-4 py-2 rounded bg-blue-600
     text-white hover:bg-blue-700`.

  RULES:
  - Repetition is FINE. We extract via @apply only after 5+ repeats
    (see 21.5).

  WHAT YOU JUST LEARNED:
  More repetition. Tailwind muscle memory builds here.


CHALLENGE 21.4 — Design tokens + dark mode                  Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Design tokens: named values (colors, spacing, radii) in
    `theme.extend`. `colors.brand.500 = '#1976d2'` becomes utility
    classes `bg-brand-500`, `text-brand-500`, etc.
  - `darkMode: 'class'`: add `.dark` on `<html>` → `dark:bg-gray-900`
    utilities apply. Toggle via state or system preference.

  TASK:
  1. tailwind.config.js: add `theme.extend.colors.brand`,
     `darkMode: 'class'`.
  2. Use `bg-brand-*` for buttons / accents throughout.
  3. Add a dark mode toggle (simple state for now; refactor to
     Zustand in Round 22).
  4. Add `dark:` variants on the main palette.

  RULES:
  - Dark palette must also pass contrast — test in Lighthouse.

  WHAT YOU JUST LEARNED:
  Design system as config. Same idea as a tokens JSON, but built into
  the build pipeline.


CHALLENGE 21.5 — @apply for repeated patterns               Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `@apply`: extract a utility bundle into a CSS class. Use sparingly.
  - Right time: when a pattern appears 5+ places AND it's a real
    design-system component (button, card, input).

  TASK:
  1. Identify your most-repeated utility bundle (probably button).
  2. @layer components { .btn-primary { @apply px-4 py-2 ...; } }
  3. Replace inline usages with `<button className="btn-primary">`.

  RULES:
  - Default to inline utilities. @apply is an escape hatch, not a
    starting point.

  WHAT YOU JUST LEARNED:
  Right level of abstraction — repeated 5+ times AND named component.


================================================================================
ROUND 22 — ZUSTAND (designed 2026-05-15, redesigned)
================================================================================

Pacing: One challenge per day. Context works but re-renders every
consumer on every change. Zustand is "Context done right" — selective
subscriptions, no provider, ~1KB. You'll use it for theme, recent
activity, notifications, draft form state, etc.


CHALLENGE 22.1 — Install + first store                      Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Zustand (German for "state"): a state-management library.
    A "store" is a hook (`useThemeStore`) that components call to read
    and update state. No Provider needed.
  - `create<T>()((set, get) => ({ ... }))`: builds the store.
  - Selective subscriptions: components pass a SELECTOR
    (`s => s.mode`) and only re-render when that slice changes.

  TASK:
  1. npm install zustand
  2. Create src/stores/themeStore.ts with mode + toggle.
  3. Use it in your theme toggle button.

  RULES:
  - Always pass a selector. Without one, the component re-renders on
    every store change.

  WHAT YOU JUST LEARNED:
  Global state without Providers, with fine-grained subscriptions.


CHALLENGE 22.2 — Migrate RecentActivityContext → Zustand    Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Create useRecentActivityStore with the same shape (entries, log,
     clear, cap-at-5).
  2. Drop the Provider wrapper.
  3. Update consumers: useContext → useRecentActivityStore(selector).

  RULES:
  - Test that the entries list still updates after delete/undo.

  WHAT YOU JUST LEARNED:
  Migration pattern: Context → Zustand. Same component surface, less
  boilerplate.


CHALLENGE 22.3 — Shallow equality for combined selectors    Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Combining slices `s => ({ a: s.a, b: s.b })` returns a NEW object
    every render — defeats memoization.
  - `shallow` from zustand/shallow compares object keys/values one
    level deep.

  TASK:
  1. Find multi-slice selectors in your codebase.
  2. Add `shallow` as the second argument:
       const { a, b } = useStore(s => ({ a: s.a, b: s.b }), shallow);

  RULES:
  - Single-slice selectors with primitives don't need shallow.

  WHAT YOU JUST LEARNED:
  Default equality is `===`. Shallow is the fix for object selectors.


CHALLENGE 22.4 — Persist middleware (theme + recent)         Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Zustand middleware: `persist(stateCreator, { name })` saves the
    store to localStorage and rehydrates on load.
  - `partialize` to persist only some fields.

  TASK:
  1. Wrap themeStore + recentActivityStore in persist with unique
     names.
  2. Verify reload: theme + last 5 activities survive.

  RULES:
  - Don't persist sensitive data (tokens, PII) in localStorage.

  WHAT YOU JUST LEARNED:
  Free persistence with zero code in components.


CHALLENGE 22.5 — Devtools + slice pattern                   Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `devtools` middleware: wires to Redux DevTools (browser ext) —
    time-travel debugging, action log.
  - Slice pattern: split a big store into slices and combine.

  TASK:
  1. Wrap with `devtools(persist(...))`.
  2. If any store has 5+ unrelated fields, split into slices.

  RULES:
  - devtools is a no-op in production.

  WHAT YOU JUST LEARNED:
  Production-grade Zustand: persistent, debuggable, composable.


================================================================================
ROUND 23 — FEATURE: MY PROFILE (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. First real feature. Warm-up.

Pattern repetition starts HERE. Every feature from now on hits the same
checklist: types → API → query/mutation hooks → route → page component →
form → validation → role check → tests. You won't write new patterns;
you'll re-write Round 17/18/19/20 in new domains. That's the point.


CHALLENGE 23.1 — Profile types + .NET endpoint              Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Profile is just "the current user's own Employee record." We add
    a GET /api/profile that resolves the current user from the JWT
    and returns their Employee data.

  TASK:
  1. ProfileController.GetMe(): reads sub claim from JWT, returns
     EmployeeService.GetByUserId(...).
  2. (If User doesn't link to Employee yet, add a UserId field on
     Employee and populate.)
  3. src/Types/Profile.ts: `export type Profile = Employee` (alias
     for now; we may diverge later).

  RULES:
  - Don't add /api/profile/:id. Profile is always "me."
  - The server resolves the user — never trust a client-sent id.

  WHAT YOU JUST LEARNED:
  Auth context propagating to the API. The JWT IS the identity.


CHALLENGE 23.2 — useProfile query hook                      Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. src/queries/profileKeys.ts: `export const profileKeys = { me:
     ['profile', 'me'] as const };`
  2. src/queries/useProfile.ts: useQuery wrapping
     api.get<Profile>('/profile').
  3. Default `?? null`.

  RULES:
  - Same query-key hierarchy convention as employees (Round 17.5).
  - Repetition. Same pattern.

  WHAT YOU JUST LEARNED:
  Reapplying Round 17. By Round 30 you'll be writing useX hooks blindly.


CHALLENGE 23.3 — Profile page route + display               Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. routes.ts: `profile: () => '/profile' as const`.
  2. Router config: add /profile inside AuthLayout.
  3. ProfilePage.tsx: render useProfile().data in a card. Fields:
     name, email, dept, position, date of joining.
  4. Header gets a "My Profile" link to /profile.

  RULES:
  - Tailwind throughout (Round 21 muscle memory).
  - Loading state, error state — same shape as EmployeeList.

  WHAT YOU JUST LEARNED:
  Read-only page from a useQuery hook. The simplest possible feature
  page.


CHALLENGE 23.4 — Edit profile (RHF + Zod + mutation)        Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. schemas/profileSchema.ts: Zod schema with editable fields
     (phoneNumber, address — NOT email or department; those are admin-
     owned).
  2. queries/useUpdateProfile.ts: useMutation calling PUT /api/profile.
     On success: queryClient.setQueryData(profileKeys.me, data) +
     toast.
  3. ProfileEditPage.tsx: RHF + zodResolver + reset(profile) on load
     + onSubmit calls updateMutation.mutate(data).
  4. Submit button disabled until isValid + isDirty + !isPending.

  RULES:
  - `isDirty` (RHF formState) prevents wasted submits when nothing
    changed.
  - Optimistic update on profile is fine — single record.

  WHAT YOU JUST LEARNED:
  Edit form = useQuery + reset + useMutation + RHF + zodResolver.
  Same five lines you'll reuse in every feature edit form.


CHALLENGE 23.5 — Avatar upload (small file)                 Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `FormData`: browser type for multipart bodies.
    `fd.append('file', file)`.
  - Axios + FormData: pass the FormData as the body; axios sets
    Content-Type automatically.
  - Image preview: `URL.createObjectURL(file)` returns a temporary
    URL for the selected file before it uploads.

  TASK:
  1. .NET: POST /api/profile/avatar accepting IFormFile, saves under
     wwwroot/avatars/{userId}.{ext}, updates Employee.avatarUrl.
  2. Client: file input with preview + submit-on-change.
  3. Validate size < 2MB and type starts with image/.

  RULES:
  - Show preview BEFORE upload starts.
  - Show progress (Round 28 spec — preview-only here is OK; full
    progress comes back in 28.2).

  WHAT YOU JUST LEARNED:
  First file upload. Preview + multipart + axios = ~30 lines.


================================================================================
ROUND 24 — FEATURE: CHANGE PASSWORD (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Builds on Round 20.3 (forced first-login
flow). This round covers the NORMAL change-password path (already
logged in, voluntary change).


CHALLENGE 24.1 — Change-password endpoint                   Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. POST /api/auth/change-password from Round 20.3 is already there.
     Verify it works when MustChangePassword is false (normal path).
  2. Validate password strength server-side: min 8 chars, contains
     digit + letter + special.
  3. Return 400 with the specific rule that failed.

  RULES:
  - Server validation is the gate. Client validation is UX.
  - Don't return the new password back in any response.

  WHAT YOU JUST LEARNED:
  One endpoint, two callers: forced flow (Round 20.3) and voluntary
  flow (this round). Same endpoint, different UX wrappers.


CHALLENGE 24.2 — Password strength schema (Zod)             Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Zod refinements: `.refine(predicate, { message })` for cross-
    field rules.
  - Match-fields rule example:
       z.object({ newPassword: z.string().min(8), confirm: z.string() })
        .refine(d => d.newPassword === d.confirm, { path: ['confirm'],
           message: 'Passwords do not match' })

  TASK:
  1. schemas/changePasswordSchema.ts:
     - oldPassword: string min 1
     - newPassword: string min 8, regex for letter + digit + special
     - confirm: string min 1
     - refine: newPassword === confirm, error on `confirm` path
  2. Export the inferred type.

  RULES:
  - Put the error on the `confirm` field so it shows next to that input.
  - One rule per refinement — chain them for readability.

  WHAT YOU JUST LEARNED:
  Cross-field validation in Zod. The match-passwords case is one of
  the top 3 form patterns you'll write.


CHALLENGE 24.3 — Change-password form + mutation             Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. queries/useChangePassword.ts: useMutation calling the endpoint.
     On success: logout + redirect /login + toast "Password changed,
     please log in again."
  2. ProfilePage gets a "Change Password" button → opens modal or
     navigates to /profile/change-password.
  3. RHF + zodResolver(changePasswordSchema). Three masked inputs.

  RULES:
  - Force re-login on password change — invalidates other sessions.
  - On error, show server message on errors.root.

  WHAT YOU JUST LEARNED:
  Sensitive mutation + side effect (logout + redirect). Pattern:
  mutate → success callback handles auth state.


CHALLENGE 24.4 — Forced flow re-test                        Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Have an admin create a new user with default password "user123".
  2. Log in as that user; verify forced-change page intercepts.
  3. Change password; verify navigation unblocks.
  4. Log out, log in again — no forced flow second time.

  RULES:
  - The flow tests TWO server states (mustChange = true, false) and
    TWO client interceptions (active, inactive).

  WHAT YOU JUST LEARNED:
  End-to-end verification of a multi-step flow. Build the habit of
  testing both branches.


CHALLENGE 24.5 — Capstone: forgot-password (stubbed)        Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Production forgot-password = email a reset link with a token.
    We won't send email (no SMTP in the learning repo) — stub it:
    the API returns the reset URL in the response (DEV mode only),
    the client navigates there.

  TASK:
  1. POST /api/auth/forgot-password { email } — generates a one-time
     reset token, stores it (in-memory dict), returns the reset URL
     (dev only).
  2. POST /api/auth/reset-password { token, newPassword } — validates
     token, sets new password, deletes token.
  3. Client: /forgot-password page → email input → submit → display
     the reset link (in real life it'd be emailed).
  4. /reset-password/:token page → new password form → submit →
     redirect /login.

  RULES:
  - Tokens are one-shot. Used → deleted.
  - Tokens expire after 15 min. Store the issued-at and check.

  WHAT YOU JUST LEARNED:
  Reset flow pattern: tokenize, expire, one-shot. Same shape as the
  real flow you'd build behind SMTP.


================================================================================
ROUND 25 — FEATURE: DOCUMENTS — FOUNDATION (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Your suggestion. Document upload is a
self-contained feature touching file IO, role-based access, list/detail
views. We split it across 3 rounds (25/26/27) because the upload UX
itself is rich.


CHALLENGE 25.1 — Document model + .NET CRUD                 Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Document model: id, ownerUserId, fileName, contentType, sizeBytes,
    uploadedAt, storagePath (server-relative).
  - Storage: wwwroot/documents/{ownerUserId}/{guid}.{ext}. Filename on
    disk is a GUID (anti-collision + anti-traversal); display name
    comes from the model.

  TASK:
  1. EmployeeManager.Domain/Models/Document.cs: 7 fields above + DateTime
     UploadedAt.
  2. Domain/Interfaces/IDocumentRepository: CRUD signatures.
  3. Infrastructure/DocumentRepository: JsonDataStore<List<Document>>
     at documents.json.
  4. Application/DocumentService: validates size, type; assigns id;
     places file on disk; returns the model.
  5. API/DocumentController: 5 endpoints (list-mine, list-all-admin,
     upload, download, delete) with role checks.

  RULES:
  - Max 5MB, accept only application/pdf, image/*, text/plain.
  - DELETE removes file + record. Always check ownership OR admin.
  - List-all-admin requires Admin role.

  WHAT YOU JUST LEARNED:
  Clean-arch slice with file storage. The repository hides the file IO.


CHALLENGE 25.2 — TS types + query hooks (mine + all)        Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. src/Types/Document.ts: Document interface (camelCase).
  2. src/queries/documentKeys.ts:
       all: ['documents'] as const,
       mine: ['documents', 'mine'] as const,
       allAdmin: ['documents', 'admin'] as const,
  3. queries/useMyDocuments.ts → GET /api/documents/mine.
  4. queries/useAllDocuments.ts → GET /api/documents (admin only —
     guarded inside the hook OR via route).

  RULES:
  - Two separate query keys = two cache entries. An admin user can
    have both populated.

  WHAT YOU JUST LEARNED:
  Multiple read endpoints for the same domain, separate keys for each.


CHALLENGE 25.3 — My Documents page (list + delete)           Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. routes.ts: `myDocuments: () => '/documents' as const`.
  2. MyDocumentsPage.tsx: table of own documents (fileName, size,
     uploadedAt, Delete button).
  3. useDeleteDocument mutation with optimistic remove + rollback.
  4. ConfirmModal reused from Round 12.2.

  RULES:
  - Optimistic delete OK (you know the id).
  - Reuse ConfirmModal — don't write a second one.

  WHAT YOU JUST LEARNED:
  Round 12.2 + 17.3 patterns reapplied. Confirm modal + optimistic
  delete + invalidation.


CHALLENGE 25.4 — Download flow                              Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Authenticated download = fetch + blob + invisible-anchor click.
    Browser navigation (`window.location = url`) doesn't send the
    Authorization header.

  TASK:
  1. api.ts: downloadDocument(id) — axios GET with responseType:
     'blob' + Authorization header (interceptor handles).
  2. On the Download click, call it, get blob, create object URL,
     trigger an <a download={fileName}>.click(), revoke URL.

  RULES:
  - Always revokeObjectURL after click (memory leak otherwise).
  - Filename from the model, not the URL.

  WHAT YOU JUST LEARNED:
  Auth-protected download in 15 lines. Reused for CSV export (28.4).


CHALLENGE 25.5 — Document type/size validation (client)     Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Zod schema for upload form: file (File type), type in [...],
     size < 5_000_000.
  2. Show validation errors BEFORE attempting upload.
  3. Server still validates — defense in depth.

  RULES:
  - Don't waste bandwidth. Client validation = UX. Server = security.

  WHAT YOU JUST LEARNED:
  Two-layer validation. Same pattern in every upload feature.


================================================================================
ROUND 26 — FEATURE: DOCUMENTS — UPLOAD UX (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. The upload UI itself — drag-drop,
progress, errors.


CHALLENGE 26.1 — Upload form (basic file input)             Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. UploadDocumentForm.tsx: <input type="file" /> + selected-file
     preview (name + size).
  2. useUploadDocument mutation: POST FormData to /api/documents.
  3. On success: invalidateQueries(documentKeys.mine) + toast.

  RULES:
  - Disable submit while isPending.
  - Reset file input after upload.

  WHAT YOU JUST LEARNED:
  Round 23.5 again, slightly richer.


CHALLENGE 26.2 — Upload progress bar                        Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Axios `onUploadProgress: (e) => setProgress(e.loaded / e.total)`
    fires repeatedly during upload. Drive a progress bar from it.
  - Mutation `onMutate` receives the same args you passed to .mutate;
    use it to seed a local "uploading file X" state.

  TASK:
  1. Local state `progress` (0-100).
  2. Pass onUploadProgress to axios.post call.
  3. Render a styled progress bar (Tailwind utility classes).

  RULES:
  - On upload fail/reset, set progress back to 0.

  WHAT YOU JUST LEARNED:
  Streaming upload feedback. Same pattern fits any progress UI.


CHALLENGE 26.3 — Drag-and-drop zone                         Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Native drag events on a div: onDragEnter / onDragOver / onDragLeave
    / onDrop. Must `e.preventDefault()` on dragOver or browser won't
    fire drop.
  - `e.dataTransfer.files` is a FileList.

  TASK:
  1. Replace the file input with a drag-drop zone (still has a fallback
     click-to-browse).
  2. Visual states: idle, valid-file-hovering, invalid-file-hovering,
     uploading.
  3. Multi-file: queue them and upload sequentially.

  RULES:
  - Use Tailwind state classes (`border-dashed border-2 hover:bg-...`).
  - Validate type/size on drop, not on upload.

  WHAT YOU JUST LEARNED:
  Drag events + visual feedback. Reused in any uploadable surface.


CHALLENGE 26.4 — Multi-file queue                           Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Queue state: array of `{ file, status: 'pending'|'uploading'|
     'done'|'error', progress }`.
  2. Process one at a time (sequential), update status per item.
  3. Show the queue with per-item progress + retry on error.

  RULES:
  - Don't parallelize uploads — browser concurrent connection limits.
  - Keep failed items in the queue with a Retry button.

  WHAT YOU JUST LEARNED:
  Queue state machines. The pattern fits any batched async operation.


CHALLENGE 26.5 — Capstone: paste-from-clipboard              Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Paste event: `onPaste(e)` on window or on a specific element.
    `e.clipboardData.items` is a list; filter for image/* types and
    call `.getAsFile()`.

  TASK:
  1. On the documents page, add a window-level paste listener.
  2. If user pastes a screenshot (browser converts to a File), add
     it to the upload queue.

  RULES:
  - Clean up the listener in useEffect cleanup.
  - Don't intercept paste on text inputs.

  WHAT YOU JUST LEARNED:
  Clipboard API for files. Polish that good apps have.


================================================================================
ROUND 27 — FEATURE: DOCUMENTS — ADMIN VIEW (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Role-based view + admin delete.


CHALLENGE 27.1 — Admin documents page (list all)            Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. routes.ts: `adminDocuments: () => '/admin/documents' as const`.
  2. AdminDocumentsPage.tsx — guarded by ProtectedRoute roles=['Admin'].
  3. Table columns: owner name, fileName, size, uploadedAt, actions
     (Download, Delete).
  4. useAllDocuments hook from Round 25.2.

  RULES:
  - Server-side authorization is the gate. Route guard is UX.

  WHAT YOU JUST LEARNED:
  Role-based page from existing role-guard infrastructure (Round 20.4).


CHALLENGE 27.2 — Filter by owner (admin)                    Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. searchParams: ownerId (optional).
  2. Filter the list client-side (small dataset) — for prod you'd
     server-paginate.
  3. Dropdown of owners (derive from list) + clear filter.

  RULES:
  - Reapply the search-param-as-state pattern from Round 18.4.

  WHAT YOU JUST LEARNED:
  URL-driven filter on a new domain. Same pattern as employee filter.


CHALLENGE 27.3 — Admin delete with reason                   Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Audit-friendly admin actions need a REASON. Add a `reason: string`
    parameter to the delete endpoint when called by admin.
  - We'll wire actual audit logging in Round 34. For now, just
    capture and store the reason.

  TASK:
  1. Extend DELETE /api/documents/{id} to accept `{ reason: string }`
     in the body when caller != owner.
  2. Server validates: reason required if deleting someone else's doc.
  3. Client: ConfirmModal variant that includes a reason textarea.

  RULES:
  - Don't break the existing own-document delete (no reason needed).

  WHAT YOU JUST LEARNED:
  Same endpoint, branching by caller identity. Common pattern in
  multi-role APIs.


CHALLENGE 27.4 — Bulk download as zip (server)              Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. POST /api/documents/zip { ids: string[] } — streams a ZIP of
     selected files.
  2. Use System.IO.Compression.ZipArchive into the response stream.
  3. Client: select multiple docs (checkboxes), Download Zip button.

  RULES:
  - Stream, don't buffer. A user could zip 100 files.

  WHAT YOU JUST LEARNED:
  Server streaming for batch downloads. Memory-safe pattern.


CHALLENGE 27.5 — Stats panel (admin)                         Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Top of AdminDocumentsPage: cards showing
     - Total documents
     - Total size (formatted MB/GB)
     - Documents added this week
  2. Compute client-side from useAllDocuments().data.

  RULES:
  - Use the same Card component you build for the dashboard in
    Round 36.2 — extract it now or there.

  WHAT YOU JUST LEARNED:
  Aggregations from client cache. Same pattern fits any dashboard.


================================================================================
ROUND 28 — FEATURE: LEAVE — BALANCE FOUNDATION (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Your big suggestion. Split across 4
rounds (28/29/30/31) because the state machine (request → approve →
reject → cancel → request-rollback) is rich and worth practising.


CHALLENGE 28.1 — Leave domain model                         Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Two records:
    * LeaveRequest: id, employeeId, startDate, endDate, days, type
      ('Annual'|'Sick'|'Unpaid'), reason, status ('Pending'|
      'Approved'|'Rejected'|'Cancelled'|'RollbackRequested'|
      'RolledBack'), createdAt, decidedAt?, decidedByUserId?,
      decisionNote?, rollbackNote?
    * LeaveBalance: derived per employee per year — totalAllowance
      (25), used, pending, remaining.
  - Balance is COMPUTED from approved+pending requests, not stored.
    Stored balance gets stale.

  TASK:
  1. Domain/Models/LeaveRequest.cs + LeaveType enum + LeaveStatus enum.
  2. Domain/Models/LeaveBalance.cs (DTO, not persisted).
  3. Repository: LeaveRequestRepository (JSON store).
  4. Service: LeaveService with GetBalance(employeeId, year) that
     reads approved+pending for the year and computes.

  RULES:
  - Status is a discriminated union on the client side — write it
    as a TS literal union to mirror.
  - Balance computation: used = sum(days where status=Approved AND
    year matches); pending = sum where status=Pending.

  WHAT YOU JUST LEARNED:
  Domain modeling for a status-machine feature. Status drives UI.


CHALLENGE 28.2 — TS types + status union                    Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Discriminated union for status:
       type LeaveStatus =
         | 'Pending' | 'Approved' | 'Rejected'
         | 'Cancelled' | 'RollbackRequested' | 'RolledBack';
  - Helper sets of statuses that share UI treatment:
       const closed: LeaveStatus[] = ['Approved', 'Rejected',
         'Cancelled', 'RolledBack'];

  TASK:
  1. src/Types/Leave.ts: LeaveRequest, LeaveBalance, LeaveType,
     LeaveStatus.
  2. Helper functions: isClosed(status), isPending(status),
     canCancel(status), canRequestRollback(status).

  RULES:
  - Logic lives in helpers, not inline in components. Reused in
     multiple pages.

  WHAT YOU JUST LEARNED:
  State machine helpers. Componentry stays declarative.


CHALLENGE 28.3 — Balance endpoint + hook                    Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. GET /api/leave/balance?year=2026 → returns LeaveBalance for the
     calling user.
  2. Same endpoint with ?employeeId=... for Admin/Manager.
  3. queries/leaveKeys.ts hierarchy.
  4. useLeaveBalance(year?) hook.

  RULES:
  - Default year = current year (server-side; new DateTime.UtcNow.Year).
  - Authorization: own balance OR Manager/Admin role.

  WHAT YOU JUST LEARNED:
  Server resolves "current year" — don't trust client clocks for
  business logic.


CHALLENGE 28.4 — My Leaves page (balance + list)            Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. routes.ts: `myLeaves: () => '/leaves' as const`.
  2. MyLeavesPage.tsx:
     - Top: 3 balance cards (Used / Pending / Remaining of 25).
     - Below: list of own leave requests with status badge.
  3. StatusBadge generalized for leave statuses (6 colors).

  RULES:
  - StatusBadge becomes a generic `<StatusBadge status={...} kind="leave"
    />`. Or per-feature components. Pick one and stick to it.

  WHAT YOU JUST LEARNED:
  Reusable badge for a multi-state status. UI mirrors the union.


CHALLENGE 28.5 — Year selector                              Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Year dropdown on MyLeavesPage (current and previous 2 years).
  2. searchParams `year=2024`.
  3. useLeaveBalance(year) + filter list by year.

  RULES:
  - Default to current year. Allow viewing past years (history).

  WHAT YOU JUST LEARNED:
  Year scoping = URL param. Same pattern as filter in Round 18.4.


================================================================================
ROUND 29 — FEATURE: LEAVE — REQUEST SUBMISSION (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. The employee's request flow.


CHALLENGE 29.1 — Leave request schema                       Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. schemas/leaveRequestSchema.ts:
       - startDate, endDate (both ISO date strings)
       - type: z.enum(['Annual','Sick','Unpaid'])
       - reason: min 5
       - refine: endDate >= startDate
       - refine: business days ≥ 1 (no leave for 0 days)
  2. Export z.infer type.

  RULES:
  - All date logic in helpers — don't sprinkle Date math.

  WHAT YOU JUST LEARNED:
  Cross-field date validation. Same shape as match-passwords (Round
  24.2).


CHALLENGE 29.2 — Request endpoint + balance guard           Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. POST /api/leave { startDate, endDate, type, reason }.
  2. Server-side guard: balance.remaining >= requested days OR type ==
     'Unpaid'. Otherwise 400.
  3. Server-side guard: no overlap with existing Pending/Approved
     requests for the same user.

  RULES:
  - Days calculation: exclude weekends. (Skip holidays for now;
    simple business-days = Mon-Fri).
  - Server is the source of truth for balance + overlap. Client
    estimates only.

  WHAT YOU JUST LEARNED:
  Domain rules ALWAYS live server-side. Client checks for UX.


CHALLENGE 29.3 — Request form                                Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. /leaves/new route + page.
  2. RHF + zodResolver(leaveRequestSchema).
  3. Live computed "days" display (uses business-day helper).
  4. Live remaining-after-this-request preview.
  5. useCreateLeaveRequest mutation; on success: navigate /leaves +
     invalidate balance + list.

  RULES:
  - Don't submit if computed days > remaining (UX gate).
  - Server still gates (defense in depth).

  WHAT YOU JUST LEARNED:
  Live-computed form values (`watch()` in RHF). Lights up the form
  intelligently.


CHALLENGE 29.4 — Date pickers + react-day-picker             Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Native <input type="date"> works but is browser-dependent and
    can't disable weekends. For ranges + business-day disabling, a
    library is needed.
  - `react-day-picker`: small, headless, integrates with RHF via
    Controller (next challenge teaches that).

  TASK:
  1. npm install react-day-picker
  2. Replace start/end date inputs with day pickers.
  3. Disable Saturdays + Sundays.

  RULES:
  - Keep the underlying value as an ISO string. Convert at the picker
    boundary.

  WHAT YOU JUST LEARNED:
  Date pickers are non-trivial. Reach for a library; don't build one.


CHALLENGE 29.5 — RHF Controller for custom inputs            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - RHF `register` only works on uncontrolled native inputs. Custom
    components (react-day-picker, react-select) need the `Controller`
    wrapper:
       <Controller name="startDate" control={control} render={({ field }) => <DayPicker {...field} />} />
  - `field` provides value + onChange. The custom component uses them.

  TASK:
  1. Wrap your day-picker with Controller.
  2. Same for the type dropdown (if you used a styled <select>).

  RULES:
  - Use register for native inputs, Controller for custom components.

  WHAT YOU JUST LEARNED:
  Controller is the "any custom input" escape hatch in RHF. Used in
  most real-world forms.


================================================================================
ROUND 30 — FEATURE: LEAVE — APPROVAL FLOW (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. The manager view.


CHALLENGE 30.1 — Manager role + pending queue endpoint      Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Add 'Manager' role. Seed one user with role=Manager.
  2. GET /api/leave/pending — returns all Pending requests across
     direct reports. (For simplicity: Manager sees everyone's pending
     for now; team-scoping is a later refinement.)
  3. queries/usePendingLeaveRequests.ts.

  RULES:
  - Admin can also approve. Authorization: roles in ['Manager',
    'Admin'].

  WHAT YOU JUST LEARNED:
  Role-scoped read endpoint. Same shape as admin documents.


CHALLENGE 30.2 — Pending queue page                          Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. /manager/leaves/pending route — guarded.
  2. Table: requester, dates, days, type, reason, actions.
  3. Empty state: "No pending requests."

  RULES:
  - Sort by createdAt asc (oldest first).
  - Reuse Tailwind table patterns from Round 21.3.

  WHAT YOU JUST LEARNED:
  Another role-gated page. By now this is rote.


CHALLENGE 30.3 — Approve + reject endpoints                  Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. POST /api/leave/{id}/approve { note? }.
  2. POST /api/leave/{id}/reject { note: string (required) }.
  3. Server checks: caller is Manager/Admin, status is currently
     Pending, updates status + decidedBy + decidedAt + decisionNote.

  RULES:
  - Rejection note REQUIRED (it's the reason the employee gets).
  - Approval note optional.

  WHAT YOU JUST LEARNED:
  Two endpoints for two outcomes — vs. a generic /decide endpoint
  with action in body. Explicit > clever.


CHALLENGE 30.4 — Approve/reject UI + mutations              Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. useApproveLeaveRequest, useRejectLeaveRequest mutations.
  2. Approve = inline button + confirm modal (optional note).
  3. Reject = button → modal with required reason textarea.
  4. On success: invalidate pending list + the requester's balance +
     their leave list.

  RULES:
  - Optimistic? Skip — the row vanishes from "pending" after; let
    the refetch happen.
  - Invalidate MULTIPLE keys (pending list + per-user balance/list).

  WHAT YOU JUST LEARNED:
  Multi-key invalidation. One write, several caches go stale.


CHALLENGE 30.5 — Notification to requester (toast/in-app)    Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. When manager approves/rejects, add an entry to the
     RecentActivityStore (Round 22.2) for the requester. (Real
     real-time push comes in Round 32 / 46.)
  2. Requester sees the entry on next page load.

  RULES:
  - Don't try real-time yet. Reactive load is enough until SignalR
    (Round 46).

  WHAT YOU JUST LEARNED:
  The poor-man's notification — stash in a shared store; let the
  consumer read on refresh. Bridges to real-time later.


================================================================================
ROUND 31 — FEATURE: LEAVE — ROLLBACK FLOWS (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. The rich part of your suggestion. Two
distinct flows depending on whether the request was already approved.


CHALLENGE 31.1 — Cancel (pre-approval) endpoint              Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. POST /api/leave/{id}/cancel — owner only, status must be Pending.
  2. Sets status = 'Cancelled' + decidedAt = now.
  3. Server returns 409 if status is not Pending.

  RULES:
  - Owner-only. Manager can't "cancel" — they can only reject.

  WHAT YOU JUST LEARNED:
  State-machine enforcement server-side. The status transition is
  the rule.


CHALLENGE 31.2 — Cancel UI                                   Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. On MyLeavesPage, show "Cancel" button only when
     `canCancel(status)` = true (Pending).
  2. Confirm modal, then useCancelLeaveRequest mutation.
  3. On success: invalidate own list + balance.

  RULES:
  - Helper from Round 28.2 (`canCancel`) drives the button visibility.

  WHAT YOU JUST LEARNED:
  Status helpers + JSX = declarative state machine UI.


CHALLENGE 31.3 — Request rollback (post-approval) endpoint   Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Post-approval rollback: once a leave is Approved, the employee
    can't unilaterally cancel — they REQUEST a rollback with a note.
    Status transitions Approved → RollbackRequested. Manager then
    decides:
      Approve rollback → status becomes RolledBack (balance refunded).
      Reject rollback → status returns to Approved.
  - The note is REQUIRED on the rollback request — it's the
    justification.

  TASK:
  1. POST /api/leave/{id}/request-rollback { note: string }
     - Owner only.
     - Status must be Approved.
     - Sets status=RollbackRequested + rollbackNote=note.
  2. POST /api/leave/{id}/rollback-approve { managerNote? }
     - Manager only.
     - Status must be RollbackRequested.
     - Sets status=RolledBack.
  3. POST /api/leave/{id}/rollback-reject { managerNote: string }
     - Manager only.
     - Status must be RollbackRequested.
     - Reverts status to Approved + stores managerNote.

  RULES:
  - Balance computation in Round 28.3 must treat 'RolledBack' as not
    counting toward `used`. Verify.
  - Audit trail: don't lose the original rollbackNote on reject.
    Maybe add a separate history field (Round 34 covers full audit).

  WHAT YOU JUST LEARNED:
  Multi-step state machine. Each transition is its own endpoint with
  its own preconditions. Same shape as a workflow engine.


CHALLENGE 31.4 — Rollback request UI (employee side)         Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. MyLeavesPage: when `status === 'Approved'`, show "Request
     Rollback" button.
  2. Click → modal with required reason textarea.
  3. useRequestLeaveRollback mutation.
  4. After submit, status shows as "Rollback Pending" (UI label).
  5. Cannot re-request while RollbackRequested.

  RULES:
  - Show the rollback note clearly on the row after submission.
  - Disable the action button while RollbackRequested.

  WHAT YOU JUST LEARNED:
  Status-aware UI. The button set on each row changes by status.


CHALLENGE 31.5 — Rollback decision UI (manager side)         Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. ManagerLeavesPage gets a new tab/section: "Rollback Requests."
  2. GET /api/leave/rollback-requested (new endpoint OR reuse
     pending with status filter).
  3. Each row shows: original leave dates, original reason, rollback
     note (the employee's justification).
  4. Two actions: Approve Rollback (optional manager note) / Reject
     Rollback (required note).
  5. After decision: invalidate pending-rollback list + the
     requester's leave list + balance.

  RULES:
  - The manager sees BOTH the original request context AND the new
    rollback note. Make it scannable.
  - Approving rollback REFUNDS days into balance.remaining.

  WHAT YOU JUST LEARNED:
  Two-stage approval. Same shape as expense reports, change requests,
  any workflow where the org wants a second eye.


================================================================================
ROUND 32 — FEATURE: NOTIFICATIONS (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Bell icon + dropdown + mark-read +
auto-poll. SignalR real-time push comes in Round 46.


CHALLENGE 32.1 — Notification model + create on events      Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Notification model: id, recipientUserId, title, body, link?, read,
    createdAt.
  - "Side effect" pattern: when a domain event happens (leave approved,
    document uploaded), CREATE a notification for the relevant user(s).

  TASK:
  1. Domain/Models/Notification.cs.
  2. INotificationRepository / NotificationRepository (JSON store).
  3. NotificationService.Create(userId, title, body, link).
  4. Call from existing services:
     - LeaveService.Approve / Reject → notify requester
     - DocumentService.Upload → notify all Admins
  5. GET /api/notifications — current user's notifications, newest first.
  6. POST /api/notifications/{id}/read.
  7. POST /api/notifications/read-all.

  RULES:
  - Don't notify the actor (manager who approved doesn't get their own
    notification).

  WHAT YOU JUST LEARNED:
  Services calling each other through interfaces — clean cross-feature
  side effects.


CHALLENGE 32.2 — useNotifications hook (with polling)        Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - React Query `refetchInterval`: a useQuery option that auto-refetches
    every N ms. Cheap real-time approximation.
       useQuery({ queryKey, queryFn, refetchInterval: 30_000 });

  TASK:
  1. notificationKeys.ts + useNotifications hook with refetchInterval 30s.
  2. useUnreadCount = derive from notifications data length where !read.
  3. useMarkRead + useMarkAllRead mutations with optimistic update.

  RULES:
  - Disable polling when user is on the notifications page (they
    interact with it directly).
  - 30s feels live without hammering the server.

  WHAT YOU JUST LEARNED:
  Polling as a first-pass for "real-time." Trade-off: simple, but the
  delay is visible. Replaced with SignalR in Round 46.


CHALLENGE 32.3 — Bell + badge in header                      Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Bell icon in AuthLayout header.
  2. Badge with unread count (hidden if 0).
  3. Click → dropdown panel showing last 10 notifications.
  4. Each notification: title, body, time-ago, link.

  RULES:
  - Use a simple time-ago helper (no library): "5m ago", "2h ago",
    "3d ago".
  - Close dropdown on outside click + on Esc.

  WHAT YOU JUST LEARNED:
  Dropdown with outside-click. Pattern reused for user menu, filters.


CHALLENGE 32.4 — Notifications page (full history)           Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. /notifications route.
  2. Full list with filters: all / unread / by date range.
  3. Mark-read on hover / click. Mark-all-read button.
  4. Empty state.

  RULES:
  - Reuse Tailwind table patterns + searchParams filter pattern.

  WHAT YOU JUST LEARNED:
  Same archetype as documents/leaves list. By now the page assembly
  is rote.


CHALLENGE 32.5 — Notification preferences (stub)              Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Add a `notificationPrefs: { email: bool, inApp: bool }` field on
     User.
  2. /profile/notifications page with two checkboxes.
  3. PUT /api/profile/notification-prefs.
  4. Service-side, just store; we don't wire email yet (no SMTP).

  RULES:
  - Stub the email path — log it server-side. Real SMTP is a separate
    Round (skipped here; future scope).

  WHAT YOU JUST LEARNED:
  Preferences-as-data. Same shape as feature flags.


================================================================================
ROUND 33 — FEATURE: AUDIT LOG (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Every state-changing action is recorded,
filterable, exportable. Foundation for compliance + debugging.


CHALLENGE 33.1 — Audit model + middleware                   Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - AuditEntry: id, actorUserId, actorName, action (string enum),
    entityType (string), entityId (string), before? (JSON), after?
    (JSON), at (DateTime).
  - Capture strategy: an ASP.NET Core action filter that intercepts
    POST/PUT/DELETE on controllers, captures the before-state if
    available, records on success.

  TASK:
  1. Domain/Models/AuditEntry.cs.
  2. IAuditRepository / AuditRepository.
  3. AuditService.Record(...).
  4. AuditActionFilter : IAsyncActionFilter — captures actor (from
     JWT), action name, entity from route. Calls AuditService.
  5. Register in Program.cs as a global filter.

  RULES:
  - Sensitive fields (passwords, tokens) NEVER stored in before/after.
  - JSON-serialize the entity for human readability.

  WHAT YOU JUST LEARNED:
  Cross-cutting via filters. Same shape as ASP.NET filters you've
  used before, applied to audit.


CHALLENGE 33.2 — Audit endpoints + role guard                Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. GET /api/audit — Admin only. Optional query: actorId, entityType,
     entityId, from, to.
  2. Server-side pagination: ?page=1&pageSize=50.
  3. Sort by `at` desc.

  RULES:
  - Admin-only. Audit is sensitive.

  WHAT YOU JUST LEARNED:
  Pagination on the server. Same shape as the client pagination from
  Round 12.1, but in SQL/JSON.


CHALLENGE 33.3 — useAuditLog hook + page                     Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - React Query `keepPreviousData: true`: while fetching a new page,
    keep the previous page's data visible. No "loading…" flicker
    between pages.
  - Page state in URL: ?page=2 — survives reload, shareable.

  TASK:
  1. useAuditLog(filters): useQuery with the filters in the queryKey.
  2. /admin/audit route.
  3. Filter bar: actor dropdown, entityType dropdown, date range.
  4. Table with prev/next pagination.

  RULES:
  - Pagination + filter combine into the queryKey — every combo gets
    its own cache slot.

  WHAT YOU JUST LEARNED:
  Server-side paginated list with filters. Same pattern in any
  enterprise admin tool.


CHALLENGE 33.4 — Diff viewer (before/after)                  Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Click an audit row → side-drawer or modal showing before/after
     JSON.
  2. Simple diff highlighting: bold/colored keys that changed.
     (No need for a full diff library; loop the keys, compare.)

  RULES:
  - Pretty-print JSON.
  - Show "(unchanged)" rather than empty for no-change views.

  WHAT YOU JUST LEARNED:
  Object diff rendering. Useful in any "before/after" surface.


CHALLENGE 33.5 — CSV export                                  Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. "Export CSV" button on audit page.
  2. Build CSV client-side from currently visible filters (last 1000
     entries server-side cap).
  3. Reuse the blob-download helper from Round 25.4.

  RULES:
  - Cap at 1000 client-side. Larger exports go via a server-side
    streamed endpoint — defer.

  WHAT YOU JUST LEARNED:
  Same blob-download pattern as document download. Reused.


================================================================================
ROUND 34 — FEATURE: MANAGER DASHBOARD (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Aggregated views, charts, KPI cards.
Charts are introduced here.


CHALLENGE 34.1 — KPI endpoints + types                       Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. GET /api/dashboard/kpis — aggregates server-side:
     - employeeCount, activeCount
     - pendingLeavesCount
     - documentsThisWeek
     - rollbackRequestsCount
  2. Types: src/Types/Dashboard.ts (Kpis interface).
  3. queries/useDashboardKpis.ts.

  RULES:
  - Manager/Admin only.
  - Aggregate server-side — don't ship the whole employee list to
    derive a count client-side.

  WHAT YOU JUST LEARNED:
  Aggregation endpoint vs list endpoint. Big perf difference at scale.


CHALLENGE 34.2 — KPI cards UI                                 Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - "Card" component: a reusable styled container (title, big number,
    subtitle). Extract once, use everywhere.

  TASK:
  1. components/Card.tsx — title, value, optional trend (% change),
     optional link.
  2. /dashboard route.
  3. Dashboard renders 4-6 cards in a grid.

  RULES:
  - Tailwind grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`.
  - Cards link to the relevant page (pendingLeavesCount → manager
    leaves).

  WHAT YOU JUST LEARNED:
  Composable cards from a typed KPI object. Same shape in any admin
  dashboard.


CHALLENGE 34.3 — Install Recharts + first chart              Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Recharts: declarative React charts wrapping D3.
    `<BarChart><Bar dataKey="count" /></BarChart>`.
  - Data shape: an array of objects, one per X-axis tick. Each Bar
    references a key on those objects.

  TASK:
  1. npm install recharts
  2. GET /api/dashboard/employees-by-department.
  3. BarChart on dashboard for the result.

  RULES:
  - Data must be sorted and complete (zero rows for empty buckets).

  WHAT YOU JUST LEARNED:
  Charts as components. The library is small; the data prep is the
  work.


CHALLENGE 34.4 — Time-series chart (hires by month)          Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. GET /api/dashboard/hires-by-month?year=2026.
  2. LineChart with monotone curve.
  3. Empty months show 0, not missing.

  RULES:
  - X-axis labels formatted: "Jan", "Feb" (3-char month).
  - Tooltip with full date + count.

  WHAT YOU JUST LEARNED:
  Line vs bar. Use line for trends over time; bar for category compare.


CHALLENGE 34.5 — Responsive container + a11y                 Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `<ResponsiveContainer>` wraps a chart and gives it parent
    width/height — chart reflows on resize.
  - Charts are SVG → invisible to screen readers. Provide an
    aria-label + an accessible data table somewhere.

  TASK:
  1. Wrap every chart in <ResponsiveContainer width="100%" height={300}>.
  2. Add aria-label describing each chart.
  3. Below each chart, render a <details><summary>Show data</summary>
     <table>...</table></details>.

  RULES:
  - <details>/<summary> is native disclosure — accessible by default.

  WHAT YOU JUST LEARNED:
  Responsive + accessible charts. Necessary, not optional.


================================================================================
ROUND 35 — FEATURE: MANAGER DASHBOARD POLISH (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Pending-approvals quick view + team
list + date range filter.


CHALLENGE 35.1 — Pending approvals widget                    Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Dashboard widget: list of 5 most-recent pending leave requests
     with quick Approve/Reject buttons.
  2. Reuse the mutations from Round 30.4.
  3. After action: invalidate.

  RULES:
  - Don't duplicate the manager-leaves page logic. Reuse hooks +
    mutations. Different UI shell only.

  WHAT YOU JUST LEARNED:
  Composition: the same mutations driving two different UIs.


CHALLENGE 35.2 — Team list widget                            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Widget: list of direct reports (placeholder: all employees if
     no team relationship modeled — simplify).
  2. Each card: name, position, current leave status (On Leave /
     Working / On Sick).

  RULES:
  - Compute "currently on leave" client-side from leave list.

  WHAT YOU JUST LEARNED:
  Cross-data derivation. Pull from multiple queries, render one view.


CHALLENGE 35.3 — Date range filter                           Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Date-range picker at the top of dashboard (this week, this month,
     this quarter, custom).
  2. searchParams: from, to (ISO).
  3. All KPI endpoints accept ?from&to; re-query when range changes.

  RULES:
  - Default to "this month."
  - Server applies the range to all aggregations.

  WHAT YOU JUST LEARNED:
  Global filter binding. Affects multiple widgets uniformly.


CHALLENGE 35.4 — Export dashboard as CSV (each chart)        Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Each chart gets an Export button → CSV of its underlying data.
  2. Reuse blob-download helper.

  RULES:
  - Don't export the rendered chart image — export the data. Easier,
    more useful.

  WHAT YOU JUST LEARNED:
  Data is the asset; the chart is one rendering of it. Export the
  asset.


CHALLENGE 35.5 — Dashboard preferences (saved layout)        Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Add a Zustand store `dashboardPrefs` (persist middleware).
  2. Let user toggle widgets on/off via a "Customize" menu.
  3. State survives reload.

  RULES:
  - Default: all widgets on.

  WHAT YOU JUST LEARNED:
  User customization as state. Same shape as collapsed-sidebar pref.


================================================================================
ROUND 36 — FEATURE: TIME TRACKING — CLOCK IN/OUT (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Clock-in/out workflow + duration math.


CHALLENGE 36.1 — TimeEntry model + endpoints                Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - TimeEntry: id, employeeId, clockInAt (UTC ISO), clockOutAt? (UTC
    ISO), durationMinutes (derived on clock-out), date (the local
    business day this entry belongs to), note?, status ('Open'|
    'Closed'|'Submitted'|'Approved'|'Rejected').
  - All timestamps stored UTC. Display localized.

  TASK:
  1. Domain + repo + service for TimeEntry.
  2. POST /api/time/clock-in — fails if there's an Open entry for
     today.
  3. POST /api/time/clock-out — closes the open entry, computes
     duration.
  4. GET /api/time?from&to — list own entries.

  RULES:
  - UTC server-side. ALWAYS.
  - One open entry at a time per employee.

  WHAT YOU JUST LEARNED:
  Time data discipline. UTC everywhere, except at the edge.


CHALLENGE 36.2 — Clock-in/out UI                              Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Live timer: `useEffect` + setInterval(1000) updating a "minutes
    elapsed" counter. Clean up on unmount.

  TASK:
  1. /time route.
  2. Big card showing current state:
     - If clocked in: live timer + Clock Out button.
     - If clocked out: Clock In button + today's total.
  3. useClockIn / useClockOut mutations.

  RULES:
  - setInterval cleanup in useEffect — leaked timers cause re-render
    bugs.
  - Format duration: "2h 14m."

  WHAT YOU JUST LEARNED:
  Live UI driven by setInterval. Same pattern in any timer-based
  feature.


CHALLENGE 36.3 — Today's entries list + edit                 Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Below the big card: today's entries (closed + open).
  2. Edit modal for each: change times, add note.
  3. PUT /api/time/{id} — server enforces same-day, no overlap.

  RULES:
  - Editing reduces honesty. Production apps log edits. For now, log
    via the audit filter (Round 33).

  WHAT YOU JUST LEARNED:
  Edit-after-the-fact pattern. Audit captures the change.


CHALLENGE 36.4 — Daily/weekly aggregation                    Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. GET /api/time/summary?week=2026-W20 — returns 7 daily totals.
  2. queries/useWeekSummary.
  3. Render under today's entries: a 7-day strip with hours per day.

  RULES:
  - Use ISO week numbers server-side.

  WHAT YOU JUST LEARNED:
  Aggregation at the right layer. Server computes; client renders.


CHALLENGE 36.5 — Today's blockers + missing entries          Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. If user has an Open entry from yesterday: banner "You forgot
     to clock out yesterday at X. [Close it now]."
  2. Quick-close modal — pick the actual time, optional note.

  RULES:
  - Default the close time to "end of business yesterday" (5pm). User
    can change.

  WHAT YOU JUST LEARNED:
  Defensive UX for human errors. Find the foot-guns, defuse them.


================================================================================
ROUND 37 — FEATURE: TIME TRACKING — TIMESHEETS (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Submit-for-approval workflow + manager
view.


CHALLENGE 37.1 — Timesheet model + submission                Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Timesheet: id, employeeId, weekStart (Mon ISO date), entries
     (list of TimeEntry ids), totalMinutes, status ('Draft'|
     'Submitted'|'Approved'|'Rejected'), submittedAt?, decidedAt?,
     decisionNote?
  2. POST /api/timesheet/submit { weekStart } — bundles open Closed
     entries from that week, marks them Submitted.
  3. Service rejects if any entry is Open (still ongoing).

  RULES:
  - A submitted timesheet locks its entries — no more edits without
    rejection + re-submit.

  WHAT YOU JUST LEARNED:
  Container-of-things pattern. The Timesheet groups TimeEntries for
  approval.


CHALLENGE 37.2 — Submission UI                               Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. /time/week/:weekStart route.
  2. Full grid: 7 columns (days), entries per day.
  3. "Submit this week" button — disabled if any entry is Open.

  RULES:
  - Show total at the top.
  - Block submit if total < 30h (configurable) and show a warning?
    Soft check only.

  WHAT YOU JUST LEARNED:
  Pre-submit checks. Soft warnings let user proceed; hard checks
  block.


CHALLENGE 37.3 — Manager approval (timesheets)                Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. /manager/timesheets route — pending submissions.
  2. Approve / Reject mutations.
  3. Reject requires note → returns timesheet to Draft.
  4. Notification to submitter (Round 32).

  RULES:
  - Same flow shape as leave approval. Pattern repeated.

  WHAT YOU JUST LEARNED:
  This is the 3rd approval flow you've built (Documents admin
  delete-with-reason, Leave approve/reject, Timesheet approve/reject).
  Pattern internalized.


CHALLENGE 37.4 — Reopen + re-submit (after reject)           Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. On Rejected timesheet: show manager note + "Reopen" button.
  2. Reopen returns status to Draft, unlocks entries for edit.
  3. Re-submit clears the rejection.

  RULES:
  - Preserve the rejection note for audit (Round 33 captures it).

  WHAT YOU JUST LEARNED:
  Loops in state machines. Workflow can cycle Draft → Submitted →
  Rejected → Draft.


CHALLENGE 37.5 — Weekly digest email (stubbed)               Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Background hosted service or cron-ish — every Sunday: enumerate
     employees without a submitted timesheet for last week, log
     "would email" entries.
  2. No real SMTP — just log the intended emails.

  RULES:
  - Schedule via IHostedService + Timer for the learning repo.
  - Real production uses Hangfire / Quartz / a cron job.

  WHAT YOU JUST LEARNED:
  Background tasks for periodic work. Stubbed dispatch isolates the
  scheduling concern.


================================================================================
ROUND 38 — FEATURE: PERFORMANCE REVIEW (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Lightweight 1:1 review form.


CHALLENGE 38.1 — Review model                                 Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Review: id, employeeId, reviewerId, period ('2026-Q2', etc.),
     ratings: { delivery, collaboration, growth } (1-5), strengths
     (text), improvements (text), goalsNext (text), status ('Draft'|
     'Shared'|'Acknowledged'), createdAt, sharedAt?, acknowledgedAt?
  2. Endpoints: create, get, list (manager sees their team, employee
     sees their own), share, acknowledge.

  RULES:
  - Manager creates as Draft, edits freely, then Shares.
  - Once Shared, employee can read; manager can no longer edit.
  - Employee Acknowledges to confirm they read it.

  WHAT YOU JUST LEARNED:
  Two-party state machine: manager → employee handoff.


CHALLENGE 38.2 — Review form (manager side)                  Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. /manager/reviews/new?employeeId=...
  2. RHF + Zod with: 3 ratings (1-5 select), 3 text areas (each
     min 20 chars).
  3. Save Draft / Share buttons.

  RULES:
  - Min text length forces real content, not "good."
  - Auto-save Draft every 30s (Round 39 covers this — for now manual).

  WHAT YOU JUST LEARNED:
  Sizable form with mixed input types. Same RHF+Zod pattern, more
  fields.


CHALLENGE 38.3 — Review viewer (employee side)               Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. /reviews route — list of own reviews.
  2. Click → /reviews/:id — read-only display + Acknowledge button.
  3. Once acknowledged, button replaced with timestamp.

  RULES:
  - Don't show Draft reviews to the employee. Server enforces.

  WHAT YOU JUST LEARNED:
  Read-only view of a write-restricted resource. Server is the gate;
  client renders.


CHALLENGE 38.4 — Auto-save drafts                            Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - RHF `watch()` returns the current form values (subscription).
  - Debounce the watch updates → call save endpoint.
  - Show "Saved at HH:MM" indicator.

  TASK:
  1. useEffect + useDebouncedValue (Round … or write inline) +
     watch() → mutation.
  2. Status indicator near the Save button.

  RULES:
  - Don't save on every keystroke. 2s debounce is the sweet spot.

  WHAT YOU JUST LEARNED:
  Auto-save with debounce. Sized-up form UX.


CHALLENGE 38.5 — Manager dashboard review widget             Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Dashboard widget: "Reviews due this quarter" — employees in your
     team without a Shared review for the current period.
  2. Click an employee → start review.

  RULES:
  - "Due" definition: period rolled over and no review created.

  WHAT YOU JUST LEARNED:
  Negative-data lists ("things NOT done") are valuable dashboard
  fixtures.


================================================================================
ROUND 39 — FEATURE: ONBOARDING WIZARD (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. HR creates a new employee via a multi-
step form. Includes the default password + first-login flag from
Round 20.3.


CHALLENGE 39.1 — Wizard state machine                        Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Multi-step form: each step has its own subset of fields. State
    persists across steps until final submit.
  - Two valid patterns:
    (a) One big useForm; each step renders a different subset of
        fields.
    (b) One useForm per step; combine on final submit.
  - (a) is simpler and what we'll do. Use `trigger(['fieldA',
    'fieldB'])` to validate just current-step fields before going next.

  TASK:
  1. /admin/onboard route.
  2. Wizard: 3 steps — Personal, Job, Account.
  3. Step navigation: Next disabled until current step's fields
     pass validation.
  4. Step state in URL: ?step=1.

  RULES:
  - URL step state survives reload.
  - Don't lose form data on Back.

  WHAT YOU JUST LEARNED:
  Multi-step form state. Same RHF pattern, segmented UI.


CHALLENGE 39.2 — Per-step validation with trigger()          Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `trigger(fields?)`: forces validation NOW. With an array of field
    names, only those are validated. Returns boolean.

  TASK:
  1. On Next click: `const ok = await trigger(['firstName',
     'lastName', 'email']); if (ok) goNextStep();`.
  2. Repeat per step.

  RULES:
  - Don't try to read errors[] before trigger() — they're not there
    yet.

  WHAT YOU JUST LEARNED:
  Forcing validation at the right moment. Wizard-specific pattern.


CHALLENGE 39.3 — Account step (default password + flag)      Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Account step: username, default password (defaults to "user123",
     editable), role select.
  2. Final submit: POST /api/admin/onboard — creates Employee + User
     in one transaction with `mustChangePassword: true`.
  3. Success: navigate /admin/employees, toast with credentials shown
     (HR copies + delivers to user).

  RULES:
  - Default password is shown clearly. HR must pass it to the user.
  - `mustChangePassword: true` is implicit on this endpoint.

  WHAT YOU JUST LEARNED:
  Multi-entity creation. One server call, transactional.


CHALLENGE 39.4 — Confirmation step                            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Step 4: review screen showing all entered data + the default
     password.
  2. Edit buttons jump back to that step.
  3. Final "Create employee" button.

  RULES:
  - Confirmation step prevents accidental submission with typos.

  WHAT YOU JUST LEARNED:
  Confirmation patterns. The same as multi-step checkout flows.


CHALLENGE 39.5 — Capstone: bulk onboard from CSV              Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. /admin/onboard/bulk route.
  2. Upload a CSV (firstName, lastName, email, dept, role).
  3. Client parses + validates each row against the same Zod schema.
  4. Show preview table with per-row pass/fail.
  5. "Create all valid" submits each via the onboard endpoint.

  RULES:
  - Use Papa Parse (npm install papaparse) to avoid hand-parsing CSV.
  - Show real-time progress.

  WHAT YOU JUST LEARNED:
  Bulk creation pattern. Same shape any "import from spreadsheet"
  feature.


================================================================================
ROUND 40 — FEATURE: BULK OPERATIONS (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Multi-select + bulk actions on the
employee table.


CHALLENGE 40.1 — Selection state                             Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Selection state: a Set<EmployeeId> of currently-selected rows.
    Set, not Array — O(1) lookup, no dupes.
  - Compute "all selected" from set.size === employees.length.

  TASK:
  1. useState<Set<EmployeeId>>(new Set()).
  2. Checkbox per row, header checkbox for select-all.
  3. Selection survives filter changes? Reset when filters change.
     (Behaviour to pick — make it explicit.)

  RULES:
  - Immutable updates: `new Set(prev).add(id)`. Set mutates in place,
    React won't re-render without a new reference.

  WHAT YOU JUST LEARNED:
  Set as state. Same shape in any multi-select UI.


CHALLENGE 40.2 — Action bar                                  Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. When `selected.size > 0`, slide-in action bar at top: "3 selected
     — Activate / Deactivate / Delete / Cancel".
  2. Buttons disabled if role doesn't permit (Admin only for delete).

  RULES:
  - Animate the action bar (Tailwind transition utilities) — slides
    are nicer than pops.

  WHAT YOU JUST LEARNED:
  Conditional UI from state. Common pattern in admin tools.


CHALLENGE 40.3 — Bulk endpoints                               Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. POST /api/employee/bulk/activate { ids: EmployeeId[] }.
  2. POST /api/employee/bulk/deactivate { ids: EmployeeId[] }.
  3. POST /api/employee/bulk/delete { ids: EmployeeId[] } — Admin only.
  4. Each returns per-id success/error array.

  RULES:
  - Partial success is real. Don't rollback on first failure unless
    transactional semantics matter.

  WHAT YOU JUST LEARNED:
  Bulk endpoint contract. Returns per-id outcome so the client can
  render details.


CHALLENGE 40.4 — Bulk mutations + UX                          Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. useBulkActivate / useBulkDeactivate / useBulkDelete mutations.
  2. Show progress: "Processing 3 employees…".
  3. After: toast "2 activated, 1 failed (Anna — already active)."
  4. Invalidate ['employees'] + per-employee details.

  RULES:
  - Confirm before bulk delete with a "type DELETE to confirm" gate.

  WHAT YOU JUST LEARNED:
  Bulk write feedback. Same idea as multi-file upload from Round 26.4.


CHALLENGE 40.5 — Capstone: bulk department reassign           Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Action: "Move to department…" — opens a dropdown.
  2. POST /api/employee/bulk/department { ids, department }.
  3. Optimistic update of every selected row's department in cache.

  RULES:
  - Validate department exists.
  - Optimistic + rollback on per-id error.

  WHAT YOU JUST LEARNED:
  Combined patterns: selection + bulk endpoint + optimistic update +
  per-id outcome. The cap of Phase 3.


================================================================================
ROUND 41 — REAL-TIME WITH SIGNALR (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Replace the 30s polling on notifications
(Round 32.2) with server push. Also push leave-approval events live.


CHALLENGE 41.1 — SignalR Hub on .NET                         Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - SignalR: WebSockets with fallbacks. .NET server + JS client speak
    one protocol.
  - `Hub`: server class pushing messages. `Clients.User(userId).
    SendAsync("EventName", args)` pushes to a specific user.
  - `MapHub<MyHub>("/path")`: routes WS handshakes to the hub.

  TASK:
  1. NotificationHub : Hub. Empty (no client-callable methods —
     server-push only).
  2. Map at /hubs/notifications.
  3. Inject IHubContext<NotificationHub> into NotificationService.
  4. After every Create(...): hubContext.Clients.User(recipientUserId).
     SendAsync("Notification", notification).

  RULES:
  - `Clients.User` uses the JWT's sub claim (configured via
    IUserIdProvider).
  - Authorize the hub: [Authorize] on the Hub class.

  WHAT YOU JUST LEARNED:
  Hub-driven notifications. The service stays oblivious — DI gives
  it the push channel.


CHALLENGE 41.2 — Client connect + subscribe                   Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `@microsoft/signalr`: JS client. HubConnectionBuilder().
     withUrl(url, { accessTokenFactory }).withAutomaticReconnect().
     build().
  - `connection.start()`: opens.
  - `connection.on(event, handler)`: subscribe. `.off(event)`:
    unsubscribe (critical for cleanup).

  TASK:
  1. npm install @microsoft/signalr
  2. services/notificationHub.ts: build + export the connection.
  3. AuthLayout useEffect: start on mount, stop on unmount.
  4. On "Notification" event → queryClient.setQueryData(
     notificationKeys.list, prev => [new, ...prev]).

  RULES:
  - Always cleanup .off in useEffect return.
  - Pass auth via accessTokenFactory.

  WHAT YOU JUST LEARNED:
  Push-driven cache updates. No polling, instant UX.


CHALLENGE 41.3 — Replace leave polling with push              Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. LeaveHub on the .NET side. Pushes "LeaveStatusChanged" to the
     requester after approve/reject/rollback decisions.
  2. Client subscribes and invalidates the leave list + balance.

  RULES:
  - Each domain gets its own hub OR one hub with topics — pick one
    convention.

  WHAT YOU JUST LEARNED:
  Domain-event-driven UI. The server tells the client what to refresh.


CHALLENGE 41.4 — Connection lifecycle UX                      Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `connection.onreconnecting(cb)`, `onreconnected(cb)`, `onclose(cb)`.

  TASK:
  1. Small green/yellow/red dot in the header.
  2. Banner if disconnected > 30s.
  3. Manual reconnect button.

  RULES:
  - Don't flash UI on every reconnect — debounce visible states.

  WHAT YOU JUST LEARNED:
  Network UX. The difference between "appears OK silently broken"
  and "user knows."


CHALLENGE 41.5 — Online indicators (presence stub)            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Hub tracks connected userIds in a static set (OK for the
     learning repo).
  2. GET /api/presence — returns the set.
  3. Show a green dot next to online users in EmployeeList /
     dashboard.

  RULES:
  - Real presence uses a distributed store (Redis). Static set is
    fine for one-process learning.

  WHAT YOU JUST LEARNED:
  Presence pattern. Same shape as Slack/Teams indicators.


================================================================================
ROUND 42 — TESTING: COMPONENT + HOOK (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Tests for the features built in
Rounds 23-40.


CHALLENGE 42.1 — Vitest + RTL setup                          Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Vitest: test runner. Same API as Jest, faster.
  - React Testing Library (RTL): renders components, queries DOM the
    way a user would. `render(<C />)`, `screen.getByRole('button',
    { name: /save/i })`.
  - `@testing-library/jest-dom`: extra matchers (toBeInTheDocument,
    toHaveClass).
  - jsdom: fake DOM for Node so tests don't need a real browser.

  TASK:
  1. Install vitest, @testing-library/* packages, jsdom.
  2. vitest.config.ts with `environment: 'jsdom'`, setupFiles for
     jest-dom.
  3. Write one trivial StatusBadge test.

  RULES:
  - Query priority: getByRole > getByLabelText > getByText >
    getByTestId.

  WHAT YOU JUST LEARNED:
  Test infrastructure once. Every test you write uses this.


CHALLENGE 42.2 — Test EmployeeRow + ProfilePage              Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `userEvent`: simulates real interactions. Always await it.
  - `vi.fn()`: mock function. `toHaveBeenCalledWith(...)`.

  TASK:
  1. EmployeeRow tests:
     - renders name
     - calls onEdit when Edit clicked
     - calls onDelete when Delete clicked
  2. ProfilePage tests:
     - shows loading initially
     - shows employee data after fetch (mock useProfile)

  RULES:
  - Test user-visible behavior, not implementation details.

  WHAT YOU JUST LEARNED:
  The component test pattern, applied. Reuse the shape for every
  future component test.


CHALLENGE 42.3 — Test custom hooks                            Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `renderHook(() => useFoo())` from RTL. `result.current` is the
    return.
  - `act(() => {...})` wraps state-changing calls.
  - `wrapper` option provides Context (QueryClientProvider).

  TASK:
  1. useEmployeeFilter tests: renders defaults, filters by search,
     filters by department.
  2. useLeaveBalance test with a mock fetch — verify computation.

  RULES:
  - Wrap query-dependent hooks in a fresh QueryClient per test.

  WHAT YOU JUST LEARNED:
  Hooks as testable units. Easier than testing through a component.


CHALLENGE 42.4 — Mock API at module boundary                  Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `vi.mock('../services/api', () => ({ getEmployees: vi.fn(...) }))`.
    Replaces the module for the test file.

  TASK:
  1. Integration test: <EmployeeList />.
  2. Mock api.getEmployees → returns 2 mock employees.
  3. Assert table renders 2 rows.
  4. Click Delete → modal → confirm → assert row gone.

  RULES:
  - Fresh QueryClient per test.
  - findBy* (async) when waiting for fetch completion.

  WHAT YOU JUST LEARNED:
  Integration test — render a slice, mock edges, assert behavior.
  Catches more bugs than unit tests.


CHALLENGE 42.5 — Test the leave approval flow                Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Render ManagerLeavesPage with mocked auth (Manager role) +
     mocked api.
  2. Assert pending requests visible.
  3. Click Approve → confirm.
  4. Assert mutation called with correct args + row removed.

  RULES:
  - Bigger test = more setup. Keep mock factories DRY across tests.

  WHAT YOU JUST LEARNED:
  Feature-level test. Real-world test pyramid bottom-mid.


================================================================================
ROUND 43 — E2E TESTING (PLAYWRIGHT) (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Real-browser flows. Slow but high-
signal — catches the integration bugs unit tests miss.


CHALLENGE 43.1 — Install + first test                        Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Playwright: Microsoft's browser automation. Drives real Chromium/
    Firefox/WebKit. Replaces Selenium for most React apps.

  TASK:
  1. npm init playwright@latest
  2. Accept defaults.
  3. Replace sample test with one that loads /login and asserts the
     heading.

  RULES:
  - Pin Playwright version in CI.
  - Use page.getByRole — same RTL philosophy.

  WHAT YOU JUST LEARNED:
  Real-browser test setup. Same query philosophy as RTL.


CHALLENGE 43.2 — Login + table E2E                            Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Test: fill login, click submit, assert /employees opens, assert
     at least one row.
  2. beforeEach to log in for subsequent tests.

  RULES:
  - Seed the DB / use known fixtures. Don't depend on prod data.

  WHAT YOU JUST LEARNED:
  Auth + nav + data assertion. The smoke test that catches most
  regressions.


CHALLENGE 43.3 — Full leave request flow                      Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. As Employee: navigate to /leaves/new, submit a request, assert
     it appears in the list.
  2. Switch user to Manager (different login fixture).
  3. Navigate to pending, approve, assert it shows Approved.
  4. Switch back to Employee, request rollback.
  5. Switch to Manager, approve rollback.
  6. Switch to Employee, assert balance is refunded.

  RULES:
  - Multi-user tests use storage states for fast user switching.

  WHAT YOU JUST LEARNED:
  End-to-end the rollback flow you built. Catches integration bugs
  no unit test would.


CHALLENGE 43.4 — Document upload + download flow              Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Upload a known fixture file.
  2. Assert it appears in the list.
  3. Download it; verify the response.
  4. Delete it; verify removed.

  RULES:
  - File handling in Playwright: page.setInputFiles for upload,
    page.waitForEvent('download') for download.

  WHAT YOU JUST LEARNED:
  File flows in E2E. Tricky but covered by built-in helpers.


CHALLENGE 43.5 — CI integration + traces                      Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Playwright trace: screenshots + DOM + network for each step.
    Captured on failure, opened with `npx playwright show-trace`.

  TASK:
  1. GitHub Actions job for Playwright (Round 51 covers GH Actions
     basics).
  2. Upload trace artifacts on failure.
  3. Force a failure, download the trace, debug locally.

  RULES:
  - Run E2E nightly + on main, not every PR (too slow).

  WHAT YOU JUST LEARNED:
  Reproducible CI test failures. The trace is gold.


================================================================================
ROUND 44 — ACCESSIBILITY AUDIT (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Apply the a11y patterns across all
features built.


CHALLENGE 44.1 — jsx-a11y ESLint pass                        Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Install eslint-plugin-jsx-a11y; enable recommended ruleset.
  2. Run lint; fix every error (missing alt, click handlers on divs,
     etc.).
  3. Set max-warnings=0.

  RULES:
  - Don't suppress with eslint-disable. Fix the real issue.

  WHAT YOU JUST LEARNED:
  Static a11y catches the easy 30%. Run + fix once.


CHALLENGE 44.2 — Focus management                             Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. On route change: move focus to <main> (with tabIndex={-1}).
  2. After form submit success: move focus to the success message
     OR confirmation route.
  3. After modal close: restore focus to the trigger element.

  RULES:
  - Track the trigger element via ref before opening modal.

  WHAT YOU JUST LEARNED:
  Focus is part of navigation UX in SPAs. Restoring it is the bar.


CHALLENGE 44.3 — Live regions for async UX                    Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Global aria-live="polite" container at end of body.
  2. announce(text) helper writes to it.
  3. Call announce() on every toast, count update, validation
     summary.

  RULES:
  - aria-atomic="true" for "read the whole thing on update."
  - polite for almost everything; assertive only for errors.

  WHAT YOU JUST LEARNED:
  Screen-reader UX. Async events are invisible without this.


CHALLENGE 44.4 — Modals + keyboard                            Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Every modal: role="dialog", aria-modal, aria-labelledby.
  2. Focus trap (react-focus-lock or hand-rolled).
  3. Esc closes; outside click closes; Cancel button closes.
  4. Restore focus on close.

  RULES:
  - Touch every modal in the app — ConfirmModal, RecentActivityModal,
    rollback note modals, etc.

  WHAT YOU JUST LEARNED:
  Modal a11y is mechanical but unforgiving. Do it once, copy across.


CHALLENGE 44.5 — Lighthouse to 100                            Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Run Lighthouse on every key page.
  2. Fix every issue.
  3. Aim 100 on Accessibility.
  4. Note in YOUR TIME the 3 trickiest fixes.

  RULES:
  - 100 is necessary, not sufficient. Real screen-reader testing
    catches what Lighthouse can't.

  WHAT YOU JUST LEARNED:
  Lighthouse is the floor. 100 across the app is a respectable bar.


================================================================================
ROUND 45 — PERFORMANCE PASS (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Measure → fix worst offender → measure
again.


CHALLENGE 45.1 — Profiler baseline                           Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - React DevTools → Profiler tab. Record an interaction. Inspect
    flame graph. "Why did this render?" lists the cause per render.

  TASK:
  1. Profile typing in search filter. Note offenders.
  2. Profile opening the leave list (server data load).
  3. Profile navigating between dashboard widgets.
  4. Document the 3 worst (component + ms + why).

  RULES:
  - Don't optimize speculatively. Measure first.

  WHAT YOU JUST LEARNED:
  Perf-discipline = measure-fix-measure. No guessing.


CHALLENGE 45.2 — Memo + useCallback pass                      Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Wrap heavy children in React.memo.
  2. Stabilize callback identities with useCallback where needed.
  3. Re-profile; confirm reduced re-renders.

  RULES:
  - Don't memo everything. memo when parent re-renders frequently
    AND child render is expensive.

  WHAT YOU JUST LEARNED:
  Targeted memoization. The 80/20 of React perf.


CHALLENGE 45.3 — Virtualize big tables                        Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - react-window: tiny virtualization library. Renders only visible
    rows; reuses DOM nodes on scroll.

  TASK:
  1. npm install react-window
  2. Apply to AuditLog page (large dataset).
  3. Verify smooth scroll with 5000 mock rows.

  RULES:
  - Table virtualization with <table> is fiddly. Many teams switch
    to div-grid.

  WHAT YOU JUST LEARNED:
  Virtualization above 100 rows is mandatory.


CHALLENGE 45.4 — Bundle analyzer + tree-shake                Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - source-map-explorer (or rollup-plugin-visualizer for Vite) shows
    which packages take which % of the bundle.

  TASK:
  1. Run analyzer.
  2. Find one unexpectedly large dep.
  3. Replace or import-narrow (e.g. `import debounce from 'lodash-
     es/debounce'` instead of `import _ from 'lodash'`).
  4. Re-run; confirm shrinkage.

  RULES:
  - Tree-shake only works with ESM imports.

  WHAT YOU JUST LEARNED:
  Bundle treemap reveals fat deps. Every senior frontend has done
  this audit.


CHALLENGE 45.5 — useDeferredValue + Suspense pass             Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `useDeferredValue(value)`: deferred update — React keeps input
    responsive even if rendering with the new value is slow.
  - `useTransition()`: marks a state update as low-priority.

  TASK:
  1. Replace any debounce hacks with useDeferredValue where the
     bottleneck is render time, not API calls.
  2. Wrap heavy state updates in startTransition.

  RULES:
  - useDeferredValue for VALUES; useTransition for ACTIONS.

  WHAT YOU JUST LEARNED:
  Concurrent rendering features. React 18 can interrupt slow renders.


================================================================================
ROUND 46 — INTERNATIONALIZATION (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Even if you ship in English only, the
DISCIPLINE of i18n catches hardcoded strings and date/number bugs.


CHALLENGE 46.1 — react-i18next setup                          Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - i18n: internationalization. Strings → JSON dictionary, looked up
    at render via `t('key')`.
  - `react-i18next`: the standard library. `useTranslation()` hook.

  TASK:
  1. npm install react-i18next i18next i18next-browser-languagedetector
  2. src/i18n/index.ts: init with one en bundle.
  3. Test: replace one heading with t('employees.title').

  RULES:
  - Namespace keys by feature ('leaves.balance.remaining').

  WHAT YOU JUST LEARNED:
  i18n infrastructure once. Every t() is a lookup.


CHALLENGE 46.2 — Extract strings (Phase 3 features)          Target: 50 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Walk EVERY feature page (profile, documents, leaves, time,
     reviews, etc.).
  2. Replace user-visible literal strings with t() calls.
  3. Build out en.json by feature namespace.

  RULES:
  - Keys must be stable. Pick well.
  - Don't extract debug strings.

  WHAT YOU JUST LEARNED:
  Extraction is mechanical work. The DISCIPLINE is the value.


CHALLENGE 46.3 — Add a second language                        Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Copy en.json → hi.json. Translate (or use placeholder text —
     "EN_X" pattern proves it works).
  2. Language switcher in header.
  3. Persist user choice in localStorage.

  RULES:
  - Translation is content work — placeholder OK for learning repo.

  WHAT YOU JUST LEARNED:
  Switching languages reveals missed strings. Painful but valuable
  QA step.


CHALLENGE 46.4 — Pluralization + interpolation                Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Interpolate: t('greeting', { name }) → "Hello, {{name}}".
  2. Plurals: `notifications_count_one` + `notifications_count_other`.
  3. Apply to count-y strings (employees count, leave days).

  RULES:
  - Always use `{{count}}` — i18next selects plural form from it.

  WHAT YOU JUST LEARNED:
  Real i18n handles plural rules. The library knows the languages.


CHALLENGE 46.5 — Locale dates/numbers                         Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Intl.NumberFormat / Intl.DateTimeFormat — browser-built-in,
    locale-aware. No library.

  TASK:
  1. Wrap currency formatting through Intl.NumberFormat(i18n.language,
     {...}).
  2. Same for dates — Intl.DateTimeFormat(i18n.language, {...}).
  3. Apply across the app.

  RULES:
  - Currency code stays (USD); only locale changes (commas/periods).
  - One util function; not inline at every call.

  WHAT YOU JUST LEARNED:
  Locale awareness is separate from translation. Numbers/dates need
  it independently.


================================================================================
ROUND 47 — PWA + OFFLINE (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Installable + offline reads + queued
writes.


CHALLENGE 47.1 — Web manifest + install prompt                Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Web manifest: JSON declaring name, icons, theme color. Browsers
    use it for the "install" prompt and home-screen icon.
  - `beforeinstallprompt` event: fires when manifest+SW are valid.
    Stash, call .prompt() on user gesture.

  TASK:
  1. Tune public/manifest.json — name, theme_color, icons.
  2. useInstallPrompt hook — captures the event, exposes promptInstall.
  3. "Install app" button in header (shows only when available).

  RULES:
  - The event fires once. Stash it.

  WHAT YOU JUST LEARNED:
  Installable apps are mostly metadata.


CHALLENGE 47.2 — Service worker (Workbox)                     Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Service worker (SW): background script in the browser; intercepts
    fetches, caches, can do push notifications.
  - Workbox: Google's library that simplifies SW (precache + runtime
    caching strategies).

  TASK:
  1. Register the SW (if CRA: switch from noop to real registration;
     if Vite: use vite-plugin-pwa).
  2. Verify a SW is active in DevTools.
  3. Reload offline; confirm app shell loads.

  RULES:
  - HTTPS or localhost only.

  WHAT YOU JUST LEARNED:
  The SW is your offline runtime. Setup once.


CHALLENGE 47.3 — Cache strategies per route                   Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - cache-first (static assets), network-first (HTML), stale-while-
    revalidate (API GETs).

  TASK:
  1. SW routes:
     - /static/* → cache-first
     - /api/* GET → stale-while-revalidate
     - /api/* writes → network-only

  RULES:
  - Never cache writes.
  - Set max-entries + max-age on every cache.

  WHAT YOU JUST LEARNED:
  Cache strategy is per-route. One size doesn't fit all.


CHALLENGE 47.4 — Offline indicator                            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `window.addEventListener('online'/'offline')`: connection
    transition events.
  - `navigator.onLine`: current state. Unreliable on some platforms;
    a 5s ping to /api/health is more accurate.

  TASK:
  1. Hook useOnlineStatus().
  2. Banner if offline: "Offline. Read-only mode."
  3. Disable write buttons when offline.

  RULES:
  - online/offline events are not always accurate; verify with a
    health ping in parallel.

  WHAT YOU JUST LEARNED:
  Connection state in the UI. The minimum useful offline UX.


CHALLENGE 47.5 — Background sync for writes                   Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Background Sync API: queue writes while offline; SW replays them
    when connection returns. Workbox's BackgroundSyncPlugin handles
    the queue.

  TASK:
  1. Wrap POST/PUT/DELETE routes in BackgroundSyncPlugin.
  2. Test: throttle DevTools offline, submit a leave request, come
     online, verify it replays.

  RULES:
  - Show "Queued for sync" indicator. Don't pretend it succeeded.
  - Cap retries.

  WHAT YOU JUST LEARNED:
  True offline UX. The pattern (queue intents, replay) fits anywhere.


================================================================================
ROUND 48 — MIGRATE CRA → VITE (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. CRA is in maintenance mode; Vite is
the standard. Migration is mechanical.


CHALLENGE 48.1 — Side-by-side Vite scaffold                  Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Vite: dev tool. Native ESM in dev (no bundling, < 200ms start).
    Rollup for prod.

  TASK:
  1. `npm create vite@latest EmployeeManager.Client.Vite -- --template
     react-ts`.
  2. Run npm run dev; verify the welcome page.

  RULES:
  - Don't delete CRA yet. Migrate incrementally.

  WHAT YOU JUST LEARNED:
  Vite scaffold is 30s. The migration is one part at a time.


CHALLENGE 48.2 — Env vars (REACT_APP_ → VITE_)                Target: 15 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Vite uses `import.meta.env.VITE_X` (not `process.env.REACT_APP_X`).
  - Prefix and access pattern both change.

  TASK:
  1. Rename every REACT_APP_ var to VITE_.
  2. Replace process.env access.
  3. Update .env files.

  RULES:
  - vite-env.d.ts declares the env interface for autocomplete.

  WHAT YOU JUST LEARNED:
  Bundler-specific bits change; app code mostly doesn't.


CHALLENGE 48.3 — Port routing + entrypoint                    Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Vite's index.html lives at PROJECT ROOT (not public/).
  - vite.config.ts server.proxy maps /api → backend.
  - SVG imports differ — `?react` query or @svgr/rollup.

  TASK:
  1. Copy src/ from CRA to Vite project.
  2. Move index.html to root, point to /src/main.tsx.
  3. Configure proxy.
  4. Run npm run dev; fix import errors.

  RULES:
  - process.env outside env vars breaks. Replace with import.meta.env.

  WHAT YOU JUST LEARNED:
  90% portable, 10% bundler glue.


CHALLENGE 48.4 — Port tests                                  Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Vitest is already installed via Vite scaffold.
  2. Move test files; most pass unchanged.
  3. Fix process.env.NODE_ENV refs → import.meta.env.MODE.

  RULES:
  - Vitest mirrors Jest's API.

  WHAT YOU JUST LEARNED:
  Test runner follows the build tool.


CHALLENGE 48.5 — Swap + delete CRA                            Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Rename folders: Client → Client.Cra (archive), Client.Vite →
     Client.
  2. Update .NET API proxy port if changed.
  3. Run end-to-end; if green, delete the CRA archive in a week.

  RULES:
  - Keep rollback path for a week.

  WHAT YOU JUST LEARNED:
  Migrations succeed in small steps with rollback paths.


================================================================================
ROUND 49 — STORYBOOK (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Component dev workshop. Worth it once
you have ~20+ components.


CHALLENGE 49.1 — Install + first story                       Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Storybook: separate dev server (:6006). Renders ONE component at
    a time with controlled props. Visual unit-test workbench.
  - "Stories" = named variants of a component.

  TASK:
  1. npx storybook@latest init.
  2. Verify :6006.
  3. Write StatusBadge.stories.tsx (Active/Inactive).

  RULES:
  - Stories live next to component.
  - One story per meaningful STATE, not per prop combo.

  WHAT YOU JUST LEARNED:
  Component dev in isolation. Save time tweaking small components.


CHALLENGE 49.2 — Stories for cards + form fields             Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Card stories: Default, WithTrend, Link.
  2. Input field stories: Default, Disabled, Error.
  3. Button stories: Primary, Secondary, Disabled, Loading.

  RULES:
  - Mock data in a fixtures file, not inline.

  WHAT YOU JUST LEARNED:
  Story-per-state covers your edge cases explicitly.


CHALLENGE 49.3 — Args + controls                              Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Args = the props the story renders with. Storybook generates a
    Controls panel from them.
  - argTypes config picks the right control per prop (range, color,
    select).

  TASK:
  1. For Button, define argTypes: variant (select), disabled (toggle),
     size (radio).
  2. Try the controls; watch the canvas update live.

  RULES:
  - Expose only the props that matter for design review.

  WHAT YOU JUST LEARNED:
  Live playground. Designers and PMs love it.


CHALLENGE 49.4 — Decorators (Providers in stories)           Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Decorators wrap every story. Use them to provide QueryClient,
    Auth, Router — without re-wrapping each story.

  TASK:
  1. .storybook/preview.tsx: decorators wrapping stories in
     QueryClientProvider + AuthProvider with mock user + Router.
  2. Stories for connected components (notifications bell, etc.).

  RULES:
  - Fresh QueryClient per story — cache must not leak.

  WHAT YOU JUST LEARNED:
  Decorators inject the Providers Storybook needs.


CHALLENGE 49.5 — Chromatic (visual regression)               Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Chromatic: hosted service that diffs screenshots of each story
    against the last approved baseline.

  TASK:
  1. Sign up; grab the project token.
  2. `npx chromatic --project-token=XXX`.
  3. On the next branch, tweak a button padding; verify Chromatic
    flags the diff.

  RULES:
  - Treat snapshot approvals like code review.

  WHAT YOU JUST LEARNED:
  Visual regression bar. Production teams hit it before deploys.


================================================================================
ROUND 50 — ADVANCED TYPESCRIPT (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Deeper TS — opens up library type
reading.


CHALLENGE 50.1 — Conditional types                           Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Conditional: `T extends U ? X : Y`. Type-level if.
  - `infer`: introduces a named type variable inside conditional.
    `T extends (...args: any) => infer R ? R : never` extracts the
    return.

  TASK:
  1. Implement ReturnType<T> from scratch.
  2. Implement Awaited<T> (unwrap Promise<X> → X).
  3. Write IsArray<T>: true if T extends any[], else false.

  RULES:
  - Read lib.es5.d.ts in node_modules — every utility type is in there.

  WHAT YOU JUST LEARNED:
  TS type system is Turing-complete. Conditionals + infer = type-
  level functions.


CHALLENGE 50.2 — Mapped types                                Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `{ [K in keyof T]: ... }` iterates T's keys, produces a new prop
    type. Same shape as Partial/Required/Readonly.
  - Modifiers: +?/−?/+readonly/−readonly.

  TASK:
  1. Implement MyPartial, MyRequired, Mutable from scratch.
  2. Compose: Mutable<Required<T>>.

  RULES:
  - keyof T is the union of T's keys.

  WHAT YOU JUST LEARNED:
  Most utility types are mapped types. Demystified.


CHALLENGE 50.3 — Template literal types                      Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `\`/users/${string}\`` — string type with a placeholder. Useful
    for typed routes, event names.

  TASK:
  1. Build a Route type union for your app.
  2. Constrain navigate(): function navigate(r: Route).
  3. Test: typo'd routes fail to compile.

  RULES:
  - Use sparingly; can explode compile time.

  WHAT YOU JUST LEARNED:
  String types. The compiler enforces URL shapes at compile time.


CHALLENGE 50.4 — Type guards + runtime validation             Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Type guard: `(x: unknown): x is Employee`. TS narrows after the
    call.

  TASK:
  1. Write isEmployee, isUser hand-rolled guards.
  2. Replace with Zod-based runtime validators at the API boundary.
  3. Use them after JSON.parse from localStorage.

  RULES:
  - Hand-rolled drifts from type. Prefer Zod for real code.

  WHAT YOU JUST LEARNED:
  Boundaries need runtime validation. Types are claims; guards
  enforce.


CHALLENGE 50.5 — Branded types (consolidation)                Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Audit every "id: string" in the codebase — replace with the
     proper branded type (Round 16.2).
  2. Add new brands: LeaveRequestId, DocumentId, NotificationId.
  3. Constructor functions at API boundaries.

  RULES:
  - Brands compile-time only. No runtime cost.

  WHAT YOU JUST LEARNED:
  Nominal typing pays off as the codebase grows. Bigger app = more
  brand value.


================================================================================
ROUND 51 — ANIMATION (FRAMER MOTION) (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Selective animation — page transitions,
list enter/exit, modal flourishes. Polish-tier work.


CHALLENGE 51.1 — Install + first animate                     Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Framer Motion: declarative animation. `<motion.div>` instead of
    `<div>`, animate `initial` / `animate` / `exit` props.

  TASK:
  1. npm install framer-motion.
  2. Wrap a toast or modal in motion.div with opacity in/out.
  3. Confirm smooth fade.

  RULES:
  - Animate transforms (translate, scale) and opacity. Not width/
    height — causes layout thrash.

  WHAT YOU JUST LEARNED:
  Declarative animation. State → animated transition.


CHALLENGE 51.2 — Page transitions                            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - <AnimatePresence>: detects children being removed; gives them
    time to animate OUT.
  - `mode="wait"`: outgoing finishes before incoming starts.

  TASK:
  1. Wrap <Outlet /> in <AnimatePresence mode="wait">.
  2. Each page = motion.div with key={pathname}.
  3. variants object for initial/animate/exit.

  RULES:
  - Unique `key` on AnimatePresence children — that's how it detects
    enter/exit.

  WHAT YOU JUST LEARNED:
  Route transitions = AnimatePresence + motion + exit variants.


CHALLENGE 51.3 — List enter/exit (employees, leaves)          Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `layout` prop: automatic FLIP animation when an item's position
    changes (sort, filter, reorder). Magic for sortable lists.

  TASK:
  1. Wrap employee rows in AnimatePresence + motion.tr.
  2. Each row gets `layout` + enter/exit props.
  3. Sort/delete/insert and watch them animate.

  RULES:
  - Always set `key={item.id}` on list items in AnimatePresence.

  WHAT YOU JUST LEARNED:
  Layout animation is what makes UIs feel polished.


CHALLENGE 51.4 — Modal flourishes                            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. ConfirmModal: backdrop fade-in, panel scale-in (0.95 → 1).
  2. On close: reverse.
  3. Apply to every modal in the app.

  RULES:
  - Keep timing fast (150-200ms). Long animations feel sluggish.

  WHAT YOU JUST LEARNED:
  Polish defaults across the app. Same animation, applied everywhere.


CHALLENGE 51.5 — Reduced motion respect                      Target: 15 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - `useReducedMotion()` from framer-motion reads the OS "Reduce
    Motion" setting.

  TASK:
  1. Detect; if true, set transition duration to 0 (skip, don't speed
     up).
  2. Test by enabling OS reduce-motion.

  RULES:
  - Some users get motion sickness. Skip transitions entirely; don't
    just shorten.

  WHAT YOU JUST LEARNED:
  Motion is an accessibility dimension.


================================================================================
ROUND 52 — CI / GITHUB ACTIONS (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. CI catches regressions before merge.
Standard pattern transfers to Azure Pipelines / GitLab CI.


CHALLENGE 52.1 — First workflow                              Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - GitHub Actions: YAML workflows in .github/workflows/. Triggers
    (`on: pull_request`), jobs, steps.

  TASK:
  1. .github/workflows/ci.yml: build + test on pull_request.
  2. setup-node@v4 with cache: 'npm'.
  3. Run `npm ci && npm run build && npm test -- --run` in the client
    dir.
  4. Open a PR; verify checks run.

  RULES:
  - Pin action versions.
  - `npm ci` in CI, not `npm install`.

  WHAT YOU JUST LEARNED:
  CI = build + test on every PR.


CHALLENGE 52.2 — Parallel jobs (typecheck/lint/test)         Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Three separate jobs (different `jobs:` keys, run in parallel):
     - typecheck: `npx tsc --noEmit`
     - lint: `npx eslint src --max-warnings=0`
     - test: `npm test -- --run`
  2. Backend .NET job: `dotnet build && dotnet test`.

  RULES:
  - Parallelism is free. Don't sequence jobs that don't depend on
    each other.

  WHAT YOU JUST LEARNED:
  Tighter feedback per check.


CHALLENGE 52.3 — Caching                                     Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - actions/cache or setup-node's cache option saves npm/nuget caches
    between runs.
  - Cache key = OS + tool + lockfile hash. Wrong key = stale.

  TASK:
  1. Verify npm cache is enabled via setup-node `cache: 'npm'`.
  2. Add actions/cache for ~/.nuget/packages.
  3. Time the run before/after.

  RULES:
  - Cache key includes the lockfile hash — new deps invalidate.

  WHAT YOU JUST LEARNED:
  Caching halves CI time. Watch the cache key.


CHALLENGE 52.4 — Coverage upload                             Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - lcov: standard coverage file format. Vitest outputs via
    `--coverage.reporter=lcov`.
  - Codecov: free hosted service that ingests lcov, shows coverage
    per PR.

  TASK:
  1. Run vitest --coverage in CI.
  2. codecov/codecov-action@v4 to upload.
  3. README badge.

  RULES:
  - Coverage is signal, not goal. Don't gate PRs on "coverage must
    increase."

  WHAT YOU JUST LEARNED:
  Coverage as a code-review aid. Where tests aren't.


CHALLENGE 52.5 — Preview deployment                          Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Job that builds the client and deploys to Vercel/Netlify on PR.
  2. Comment the preview URL on the PR.

  RULES:
  - Preview deploys make design review possible. Worth the setup.

  WHAT YOU JUST LEARNED:
  Per-PR previews. Enterprise-tier reviewer UX.


================================================================================
ROUND 53 — DOCKER (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Containerize both halves. Portable
deploys.


CHALLENGE 53.1 — Dockerfile for .NET API                     Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Dockerfile: recipe for an image. Each line = a cacheable layer.
  - Multi-stage build: build stage compiles; runtime stage copies
    artifacts only. No compiler in prod.

  TASK:
  1. Multi-stage Dockerfile for the API:
     - mcr.microsoft.com/dotnet/sdk:10.0 AS build
     - dotnet restore + publish
     - mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
     - COPY --from=build /app .
  2. docker build; docker run; verify endpoint.

  RULES:
  - Copy csproj first, restore, THEN copy source — caches restore
    on source-only changes.

  WHAT YOU JUST LEARNED:
  Multi-stage = small images. Standard for compiled languages.


CHALLENGE 53.2 — Dockerfile for the client                   Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Final image = nginx + static build. No Node in prod.
  - SPA nginx config: `try_files $uri $uri/ /index.html;` — all
    routes fallback to index.html so the SPA router handles them.

  TASK:
  1. Multi-stage Dockerfile:
     - node:20-alpine AS build → npm ci → npm run build
     - nginx:alpine → COPY --from=build /app/dist /usr/share/nginx/html
  2. Custom nginx.conf with SPA fallback + /api proxy.

  RULES:
  - alpine images = ~25MB. Use them.

  WHAT YOU JUST LEARNED:
  Static SPA on nginx. The standard prod shape.


CHALLENGE 53.3 — docker-compose for local                    Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - compose orchestrates multi-container apps via one YAML. Dev only;
    prod uses k8s / ECS.

  TASK:
  1. docker-compose.yml with api + client services.
  2. depends_on, ports, volumes.
  3. `docker compose up` — whole stack from one command.

  RULES:
  - compose is dev convenience. Don't use it in prod.

  WHAT YOU JUST LEARNED:
  Stack-in-one-command onboarding. Great for new contributors.


CHALLENGE 53.4 — Healthchecks                                Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Healthcheck: an endpoint that returns 200 when ready. Orchestrators
    poll it.
  - Dockerfile HEALTHCHECK CMD; compose `condition: service_healthy`
    for ordering.

  TASK:
  1. /health on .NET (AddHealthChecks + MapHealthChecks).
  2. HEALTHCHECK in Dockerfile (curl -f http://localhost:5000/health).
  3. compose dep on health.

  RULES:
  - Real healthchecks verify dependencies (DB), not just "process up."

  WHAT YOU JUST LEARNED:
  Healthchecks make orchestration possible.


CHALLENGE 53.5 — Image size + .dockerignore                  Target: 15 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - .dockerignore: like .gitignore, but for `docker build` context.

  TASK:
  1. `.dockerignore`: bin/, obj/, node_modules/, .git/, *.log.
  2. Rebuild; compare image size and build speed.

  RULES:
  - Smaller context = faster builds, no leaked artifacts.

  WHAT YOU JUST LEARNED:
  Context matters. Strip what you don't need.


================================================================================
ROUND 54 — MONOREPO (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Workspaces + shared packages + Turborepo.
Optional but how enterprise frontends grow.


CHALLENGE 54.1 — pnpm workspaces                             Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Workspace: multiple packages, one node_modules via symlinks.
  - pnpm-workspace.yaml lists package globs.

  TASK:
  1. npm install -g pnpm.
  2. pnpm-workspace.yaml at repo root: apps/*, packages/*.
  3. Move EmployeeManager.Client → apps/client.
  4. pnpm install at root.

  RULES:
  - Don't mix npm and pnpm in the same repo.

  WHAT YOU JUST LEARNED:
  Workspaces — multiple packages, one install.


CHALLENGE 54.2 — Shared types package                        Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Scoped npm names: `@employee/types`, `@employee/ui`. Keeps your
    packages grouped.

  TASK:
  1. Create packages/types/ with src/Models.ts.
  2. package.json: name `@employee/types`, `"types": "./src/index.ts"`.
  3. apps/client imports from `@employee/types`.

  RULES:
  - TS-only packages need no build step if the consumer also runs TS.

  WHAT YOU JUST LEARNED:
  One source of truth for shared types.


CHALLENGE 54.3 — Shared UI package                            Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Vite library mode OR tsup: produces distributable ESM+CJS+.d.ts.
  - peerDependencies: list React/ReactDOM as peerDeps so the consumer's
    React is used.

  TASK:
  1. packages/ui/ with Button, StatusBadge, Card.
  2. Build with tsup.
  3. apps/client imports from `@employee/ui`.

  RULES:
  - Style imports work via Tailwind config sharing (include the UI
    package in the consumer's tailwind content paths).

  WHAT YOU JUST LEARNED:
  Reusable component library. Same shape as a .NET class library.


CHALLENGE 54.4 — Turborepo                                    Target: 20 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Turborepo: a task runner that knows the dep graph. Builds in
    order, caches outputs, parallelizes.

  TASK:
  1. npm install -g turbo.
  2. turbo.json with build / test / dev pipelines.
  3. `turbo run build` — observe ordering.

  RULES:
  - Local cache is on by default.

  WHAT YOU JUST LEARNED:
  Only rebuild what changed. Speeds up CI massively.


CHALLENGE 54.5 — Changesets                                  Target: 15 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Changesets: tool for versioning monorepo packages independently.
    PR includes a "changeset" describing the change.

  TASK:
  1. npx @changesets/cli init.
  2. Create one changeset.
  3. `pnpm changeset version` — observe version bumps.

  RULES:
  - Independent versioning > fixed. Each package at its own pace.

  WHAT YOU JUST LEARNED:
  Monorepo publishing. Industry-standard pattern.


================================================================================
ROUND 55 — SSR / NEXT.JS INTRO (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Awareness round — when SSR matters,
how Next.js changes the shape.


CHALLENGE 55.1 — Why SSR, when, trade-offs                    Target: 15 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this:
  - CSR (today): browser downloads JS → builds DOM → fetches data.
    Slow first paint; great for app-like UIs.
  - SSR: server renders HTML → client hydrates. Fast first paint;
    SEO-friendly.
  - SSG: SSR done at BUILD time. Even faster.
  - When SSR: public content + SEO. Internal tools = stick with CSR.

  TASK:
  - Read the above. Open Next.js docs. Decide whether the rest of
    the round is worth it for YOUR career path.

  WHAT YOU JUST LEARNED:
  Rendering strategy is architectural. CSR ≠ wrong; just different.


CHALLENGE 55.2 — create-next-app + walkthrough               Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. npx create-next-app@latest employee-next — accept App Router, TS,
     Tailwind.
  2. npm run dev — welcome page at :3000.
  3. Read the generated app/ folder structure.

  RULES:
  - Separate project, not a migration target yet.

  WHAT YOU JUST LEARNED:
  Next mental model: file-based routing, server-by-default.


CHALLENGE 55.3 — Port one route as Server Component           Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Server Components run on the server. No hooks. Fetch data
    directly with `await`.
  - Client Components: 'use client' directive. Use for interactivity.

  TASK:
  1. app/employees/page.tsx as async Server Component.
  2. await fetch the employee list.
  3. Render server-side.
  4. Add a client subcomponent for interactivity (a search box).

  RULES:
  - Server Components can't use useState/useEffect/Context.
  - Async components are the new normal.

  WHAT YOU JUST LEARNED:
  Data fetching at the component. The Round-13 useEffect/useState
  dance disappears.


CHALLENGE 55.4 — Server Actions for delete                   Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Server Action: function marked `'use server'` callable from the
    client. No API route boilerplate.

  TASK:
  1. app/actions.ts: deleteEmployee(id) marked 'use server'.
  2. Form action: `<form action={deleteEmployee.bind(null, id)}>`.
  3. revalidatePath('/employees') after.

  RULES:
  - Server Actions can be form actions OR called via useFormState.
  - Revalidate touched paths/tags after writes.

  WHAT YOU JUST LEARNED:
  Mutations without API routes. The client/server boundary blurs.


CHALLENGE 55.5 — Hybrid auth (cookies + middleware)           Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - middleware.ts runs BEFORE every request, on the edge. Auth checks,
    redirects, header rewriting.
  - SSR can read cookies but NOT localStorage — auth must go in
    cookies.

  TASK:
  1. Set the JWT in an httpOnly cookie on login (Round 20 already
     covered this).
  2. middleware.ts: redirect unauthenticated to /login.
  3. Read user in Server Components via cookies().

  RULES:
  - Cookie flags: HttpOnly + Secure + SameSite=Strict.

  WHAT YOU JUST LEARNED:
  SSR forces cookie-based auth. The cleaner option anyway.


================================================================================
ROUND 56 — SECURITY PASS (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Apply security hygiene to the app
built so far. Not exhaustive — the basics every dev should know.


CHALLENGE 56.1 — Content Security Policy                     Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - CSP: HTTP header telling browsers which sources are allowed for
    scripts/styles/images. Defense against XSS.
  - Strict CSP example: `default-src 'self'; script-src 'self';
    img-src 'self' data:; ...`.

  TASK:
  1. Add CSP middleware in .NET API.
  2. Set strict policy. Watch the console; relax SPECIFIC rules as
     needed.
  3. Use `Report-Only` first to find violations before enforcing.

  RULES:
  - Avoid `unsafe-inline`/`unsafe-eval`. Use nonces if you must.

  WHAT YOU JUST LEARNED:
  CSP is your XSS safety net.


CHALLENGE 56.2 — Rate limiting                                Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Rate limiting: cap requests per identity per window. Defense
    against brute force, scraping.
  - .NET 7+ ships built-in Microsoft.AspNetCore.RateLimiting.

  TASK:
  1. AddRateLimiter with a fixed-window policy: 100 req/min per IP.
  2. Stricter policy on /api/auth/login: 5 req/min per IP.
  3. Test by hammering.

  RULES:
  - Different policies for different endpoints. Auth needs stricter.

  WHAT YOU JUST LEARNED:
  Production must rate-limit. Built-in in modern .NET.


CHALLENGE 56.3 — Input sanitization                          Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Audit every user-input field that gets RENDERED back (notes,
     reasons, etc.).
  2. Confirm React's default escaping handles them (it does for
     text — confirm by inserting `<script>` and watching it render
     as text).
  3. NEVER use dangerouslySetInnerHTML on user input.
  4. If rendering markdown/rich text, use a sanitizer (DOMPurify).

  RULES:
  - React's text rendering is XSS-safe by default. dangerouslySetInnerHTML
    is the only escape.

  WHAT YOU JUST LEARNED:
  React's default IS the defense. Don't override it unless
  necessary + sanitized.


CHALLENGE 56.4 — Secrets management                          Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Secrets (JWT keys, DB passwords, API keys) NEVER in source.
    .NET: user-secrets in dev; Azure Key Vault / AWS Secrets Manager
    in prod.

  TASK:
  1. Move JWT signing key out of appsettings.json into User Secrets.
  2. Verify .gitignore covers .env and appsettings.Development.json.
  3. Document a SECRETS.md describing each secret and where it
     belongs.

  RULES:
  - If a secret appears in git history, ROTATE it. Even after deletion.

  WHAT YOU JUST LEARNED:
  Secrets discipline is process. Tools help but humans break it.


CHALLENGE 56.5 — Dependency audit                            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. `npm audit` and `dotnet list package --vulnerable`.
  2. Categorize: fix now / accept (with reason) / defer.
  3. Pin Dependabot in the GH repo settings.

  RULES:
  - Don't blindly `npm audit fix --force`. Read each.

  WHAT YOU JUST LEARNED:
  Vulnerabilities accumulate. A monthly audit catches the worst.


================================================================================
ROUND 57 — MOBILE / RESPONSIVE PASS (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Make every page work on mobile.
Tailwind's responsive utilities + thoughtful layout choices.


CHALLENGE 57.1 — Audit on real devices                        Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - DevTools device emulation is OK; real device is better.
  - Common breakpoints: 320px (small mobile), 640px (mobile), 768px
    (tablet), 1024px (desktop). Tailwind defaults map to these.

  TASK:
  1. Walk every page at 320px / 768px / 1280px.
  2. Document broken layouts.
  3. Prioritize: tables, modals, navigation.

  RULES:
  - Real device > DevTools emulation when finalizing.

  WHAT YOU JUST LEARNED:
  Mobile-first audits. The bar is "does it work at 320px?"


CHALLENGE 57.2 — Tables → cards on mobile                    Target: 40 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Wide tables can't shrink to 320px. Pattern: render as cards
    below md breakpoint, table above.

  TASK:
  1. EmployeeList: below md, render each employee as a card.
  2. Same for LeaveList, AuditLog.
  3. Conditional rendering with Tailwind's hidden/block + md:
     classes.

  RULES:
  - Maintain feature parity in the card view (Edit, Delete buttons).

  WHAT YOU JUST LEARNED:
  Pattern: table on desktop, card on mobile. Common solution.


CHALLENGE 57.3 — Mobile navigation                            Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Below md: hamburger menu collapsing the header nav into a
     drawer.
  2. Drawer slides in from the side with Framer Motion (Round 51).
  3. Close on outside click + Esc.

  RULES:
  - Always include a logout in the drawer.

  WHAT YOU JUST LEARNED:
  Mobile chrome pattern. Hamburger + drawer.


CHALLENGE 57.4 — Touch targets + spacing                     Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Touch target minimum: 44×44px (Apple) / 48×48px (Material).
    Buttons smaller than this are hard to tap.

  TASK:
  1. Audit every clickable element on mobile.
  2. Add padding to meet 44×44 minimum.
  3. Increase spacing between adjacent buttons.

  RULES:
  - Padding > font-size for tap targets.

  WHAT YOU JUST LEARNED:
  Touch ergonomics. One of the most common mobile UX failures.


CHALLENGE 57.5 — Mobile-specific UX (bottom sheets)          Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  NEW HERE — read this before TASK:
  - Modal on mobile = bottom sheet (slides up from bottom). Easier
    one-handed; standard iOS/Android pattern.

  TASK:
  1. Make ConfirmModal render as a bottom sheet below md.
  2. Drag to dismiss (Framer Motion drag — Round 51).
  3. Modal remains centered above md.

  RULES:
  - One component, two rendering modes by breakpoint.

  WHAT YOU JUST LEARNED:
  Native-feeling mobile UX. Bottom sheets > centered modals on phones.


================================================================================
ROUND 58 — REUSABLE PRIMITIVES + DESIGN SYSTEM (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. Extract the cross-cutting components
into a coherent system. Round 49 (Storybook) becomes the workbench.


CHALLENGE 58.1 — Button primitive                            Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. components/ui/Button.tsx with variant: 'primary' | 'secondary' |
     'danger' | 'ghost'; size: 'sm' | 'md' | 'lg'; loading: boolean.
  2. Forward refs (forwardRef).
  3. Use everywhere — replace inline buttons.

  RULES:
  - Forward refs so consumers can focus the button.

  WHAT YOU JUST LEARNED:
  Polymorphic primitive. Same shape as your existing variants but
  formalized.


CHALLENGE 58.2 — Input + Select primitives                    Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Input.tsx with label, error, helpText props.
  2. Select.tsx with the same.
  3. Wire RHF compatibility (forwardRef + spread register).

  RULES:
  - Inputs control their own error visual + ARIA invalid + describedby.

  WHAT YOU JUST LEARNED:
  Form primitives bundle their own a11y.


CHALLENGE 58.3 — Modal primitive                              Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Modal.tsx with focus trap + Esc + outside click + framer.
  2. Compose ConfirmModal from it.
  3. Compose any other modal in the app from it.

  RULES:
  - Modal does NOT own its content. Children-as-content.

  WHAT YOU JUST LEARNED:
  One modal primitive, many feature modals. Removes duplication.


CHALLENGE 58.4 — Card + EmptyState                            Target: 25 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Card.tsx with title, footer slots.
  2. EmptyState.tsx with icon, message, action.
  3. Apply across every list page.

  RULES:
  - EmptyState always has a CTA. "No data" is not helpful.

  WHAT YOU JUST LEARNED:
  Polish primitives. Same UX shape across features.


CHALLENGE 58.5 — Storybook all primitives                    Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Stories for every primitive.
  2. Args for every variant.
  3. README in /components/ui linking to Storybook.

  RULES:
  - Treat primitives' Storybook as their docs.

  WHAT YOU JUST LEARNED:
  Library-grade primitives. Same shape as material-ui / radix.


================================================================================
ROUND 59 — FINAL POLISH + PORTFOLIO PREP (designed 2026-05-15)
================================================================================

Pacing: One challenge per day. The deltas between "works" and "looks
great on a resume."


CHALLENGE 59.1 — Lighthouse on all pages → 95+               Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Run Lighthouse on every page.
  2. Fix every Performance / SEO / Best Practices issue.
  3. Aim 95+ across the four categories.

  RULES:
  - SEO matters even for internal apps (good titles, descriptions).

  WHAT YOU JUST LEARNED:
  All four Lighthouse categories matter for portfolio quality.


CHALLENGE 59.2 — Empty / error / loading states              Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Every page has: empty state, error state, loading state.
  2. Replace "Loading..." with skeleton screens where appropriate.
  3. Error states show what went wrong + retry.

  RULES:
  - Skeleton > spinner for perceived speed.
  - Error states are visible reminders to handle them in your hooks.

  WHAT YOU JUST LEARNED:
  Polish bar. Every state must be designed, not just the happy path.


CHALLENGE 59.3 — Onboarding tour (Shepherd / Joyride)        Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. npm install react-joyride.
  2. First-login tour: walk through 5 features on the dashboard.
  3. Persist "tour seen" flag in user prefs.

  RULES:
  - Skippable.
  - Don't lock interactions during the tour.

  WHAT YOU JUST LEARNED:
  Onboarding tours = standard enterprise polish.


CHALLENGE 59.4 — README + screenshots + GIFs                 Target: 35 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. README.md at repo root:
     - Tagline + screenshots
     - Tech stack list
     - "Try it" instructions (clone + docker compose up)
     - Feature highlights with GIFs
  2. Record 3-5 short GIFs of key flows (Loom / ScreenToGif / Kap).

  RULES:
  - README sells the project in 30 seconds. Lead with screenshots.

  WHAT YOU JUST LEARNED:
  Communication is half the work. The README is your portfolio
  cover letter.


CHALLENGE 59.5 — Architecture diagram + docs                 Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. ARCHITECTURE.md: high-level component diagram (use draw.io or
     Mermaid in MD).
  2. Layer responsibilities table.
  3. Data flow walkthrough for 1-2 features.

  RULES:
  - Diagrams in code (Mermaid) age better than images.

  WHAT YOU JUST LEARNED:
  Interview-quality artifacts. Senior engineers read the docs first.


================================================================================
ROUND 60 — FINAL CAPSTONE (designed 2026-05-15)
================================================================================

Pacing: Sprint mode. The "you've done it" round.


CHALLENGE 60.1 — Pick the capstone                           Target: 15 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  - Choose ONE:
    (a) Build a NEW small app from scratch (your tech stack, your
        choice of domain).
    (b) Find an open-source project on GitHub with "good first issue"
        labels — pick one, fix it.
    (c) Add a brand-new feature to EmployeeManager with NO reference
        to this file or to the existing code (no copy-paste from your
        own codebase).

  RULES:
  - Scope ~6h total. Smaller scope, polished, > big scope half-done.

  WHAT YOU JUST LEARNED:
  Picking scope is a senior skill.


CHALLENGE 60.2 — Design before building                      Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Write a 1-page design doc:
     - Problem
     - Approach
     - Interfaces (types/endpoints/components)
     - Trade-offs
     - Risks
  2. Sleep on it (literally — overnight if possible). Re-read.

  RULES:
  - One page max. Forces clarity.

  WHAT YOU JUST LEARNED:
  Design before code. Senior reflex.


CHALLENGE 60.3 — Vertical slice                              Target: 90 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Backend: model, repo, service, controller. Tests.
  2. Frontend: types, hooks, page, form. Use every pattern from
     Rounds 16-22 + relevant feature patterns.
  3. End-to-end manual test.

  RULES:
  - Don't grind on perfection. Working slice first.

  WHAT YOU JUST LEARNED:
  Integration. By Round 60 you can spin up a vertical slice without
  thinking about HOW.


CHALLENGE 60.4 — Tests + a11y + responsive                   Target: 60 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Tests at every layer (component, hook, E2E).
  2. Lighthouse a11y pass.
  3. Mobile responsive check.

  RULES:
  - Each layer catches different bugs.

  WHAT YOU JUST LEARNED:
  The cross-cutting routine: tests + a11y + responsive on every
  feature.


CHALLENGE 60.5 — Polish + PR + share                         Target: 30 min
--------------------------------------------------------------------------
YOUR TIME:

  TASK:
  1. Open a PR (or commit to portfolio repo). Write a senior-level
     description: what, why, screenshots, test plan, follow-ups.
  2. Share on LinkedIn / portfolio site / wherever.

  RULES:
  - PR description is for HUMANS. The diff is for machines.

  WHAT YOU JUST LEARNED:
  Code is half the work. Communication about code is the other half.
  After Round 60: you're past the "can ship features" bar. The next
  level (senior) is "can lead features." That's a different journey
  — leadership, design judgment, mentorship — which can't be drilled
  in challenges. Real jobs teach it.


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
  12.1       | 30 min  | ~8 min    | Beat target by ~22 min. Syntax copy-pasted from spec; logic understood solo. Caught spec gap: reset useEffect deps `[search, department, hideBelow50K]` missed minSalary/maxSalary. Refactored to `[filtered.length]` — cleaner, future-filter-safe. 3 minor polish items open at the time (stale comment, totalPages=0 edge case, control placement) — all closed during the 12.3 cleanup pass.
  12.2       | 35 min  | ~22 min   | Beat target by ~13 min. Logic-solo: state shape `{open, id, name}` spec-exact, two-step delete (set confirm → onConfirm reads state), picked option B (handlers in hook, render in parent — same feature-ownership instinct as 11.2). Stuck point: tried to render `<ConfirmModal>` inside the hook body — revealed one concept gap (hooks return data, components render JSX). Clicked instantly after explanation. Minor: `onConfirm(id)` took id as param before seeing the wire-up. Lost time to "use Bootstrap" instinct when modal rendered unstyled — root cause was a pre-existing missing `import './App.css'` in App.js, not user's bug. Sharpening note: when stuck, ask "whose responsibility — hook (state/logic) or component (rendering)?"
  12.3       | 35 min  | ~6-7 min  | Beat target by ~28 min. Syntax copy-referenced from this challenge's TASK block (user's standing pattern — copies syntax from CHALLENGES.md for most challenges, logic remains solo). Logic-solo on capture-before-remove order and Undo button-in-toast. Stuck point: `toast.dismiss(this.toastId)` — .NET/jQuery reflex; `this` is undefined in arrow-fn-inside-hook. Pattern internalised: `const toastId = toast.success(...)` captures the ID; closure reads it at click time (same shape as captured C# delegate). Cleanup pass: added comments + fixed mixed-indent / object-literal spacing across useEmployees, EmployeeList, ConfirmModal. Caught two real bugs during cleanup: (1) leftover `debugger` in ConfirmModal, (2) `oncancel` vs `onCancel` prop mismatch broke Cancel button. Closed all 3 open 12.1 items in the same pass.
  13.1       | 30 min  | ~5 min    | Beat target by 25 min. Pure reducer, switch + default, 3 dispatch sites wired. Pattern (state machine) clicked immediately. Caught: 2nd leftover `debugger` statement in 2 challenges — needs to become a CR reflex.
  13.2       | 45 min  | ~14-15 min| Beat target by ~30 min. Context + Provider + useAuth wired clean. Three syntax/API rust points (treating useAuth as fn, wrong destructure name, name-collision → destructure-rename). Logout crash on null user → fixed with optional chaining in EmployeeList.
  13.3       | 30 min  | ~20 min   | Beat target by 10, but the most friction-heavy of Round 13. Memo concept clicked; 4 syntax/structural pieces slowed things (implicit-return body vs expression, decl placement inside JSX, prop signature id-vs-object, 3rd `debugger`). Captured mental model in Downloads/react-memo-explained.txt. First challenge requiring 3 interlocking pieces to align (memo + useCallback + child prop usage).
  13.4       | 25 min  | ~10 min   | Beat target by 15. Clean class-component impl (getDerivedStateFromError, componentDidCatch, handleRetry). Class-with-lifecycle mental model from .NET carried over with zero friction. Minor indent polish opportunities.
  13.5       | 45 min  | ~75 min   | Over target by ~30 min — first self-designed capstone (no spec). **[Claude — opener]:** Right test of integration. Context + custom hook + Modal + EmployeeList wiring all designed solo before code. Architectural choices were senior-tier; the overrun was syntax-recall and a try/catch logic gap, not unclear thinking. **What was built:** RecentActivity feature — Context (RecentActivityContext.js) + custom hook (useRecentActivity) + Modal (RecentActivityModal.js) + "View Recent Activities" button in EmployeeList; tracks last 5 delete/undo actions, cap-at-5 by dropping oldest. Logic-solo: Context for shared state (mirrored auth pattern), modal visibility state placed in EmployeeList not in the hook (correct ownership), `onClose` callback passed down. Stuck point 1 — inline onClick syntax: found the ConfirmModal mirror but couldn't reconstruct the line without help (AC didn't carry this specific spot; see autocomplete-dependency memory). Stuck point 2 — undo was a soft undo (state-only; record disappeared on refresh): user added POST /api/employee call to persist; first try/catch put success-path (setEmployees, success toast, addActivity) inside `finally` — would have shown contradictory toasts and faked success on failure. Concept reinforced: `finally` always runs; success path belongs in `try` after `await`. Bug caught in review, fixed on second pass. Cleanup: removed 5th leftover `debugger` (habit watch confirmed), dead `{...employee}` shallow copy, duplicate `../services/api` imports, stale "No API call — purely client-side" comment. Backend ID-mismatch bug also surfaced (EmployeeRepository.CreateAsync overwrites incoming Id with Guid.NewGuid) — user noted, deferred fix to a backend pass. **[Claude — closer]:** Logic and architecture were the win; raw recall stalled twice. User affirmed long-term direction: "syntax rust is fine, focus on understanding React" — endorsed as Round 14–18 strategy. AC-off capstones retracted. Counts as 13.5 done.
  14.1       | 30 min  | ~24 min   | Beat target by ~6 min. CRA peer-dep conflict surfaced: react-scripts@5.0.1 caps typescript at ^4, so the default `npm install typescript` (v6.0.3) failed ERESOLVE. Pinned typescript@4.9.5 — correct call (CRA is maintenance-mode; eject/Vite migration is out of scope here). `npm audit fix` skipped (same conflict, 31 CRA-stack vulns are background noise for a learning repo). tsconfig.json clean with strict + isolatedModules + jsx:react-jsx. StatusBadge.js → .tsx verified via `npm start` + `npx tsc --noEmit`. Pattern internalised: TS bolts on file-by-file, .js + .tsx coexist; leaves-first migration order is the right path.
  14.2       | 25 min  | ~15 min   | Beat target by ~10 min. Step 1 (Models.ts: Employee, User, LoginRequest, LoginResponse) — 3 syntax bugs surfaced in review: `Number`→`number` (boxed vs primitive, same as C# Int32 vs int); `userName` vs `username` inconsistency (matched lowercase to ASP.NET Core camelCase JSON output); `user[role]` → `User['role']` (indexed access needs type ref + quoted string, C# equivalent: `nameof(User.Role)`). Concept gap: over-correction loop on case sensitivity — lowercased all four interface declarations after misreading the "cannot find name user, did you mean User?" error as "lowercase is wrong everywhere"; reverted to PascalCase. False-friend reinforced: types are PascalCase, references must match the declaration (don't change the declaration to satisfy a broken consumer). Step 2 (StatusBadge.tsx refactor) — first real cross-file TS dependency; `employee: Employee` intentionally accepted as worse design than `isActive: boolean` (TS practice scaffolding, not a real-code pattern; props minimalism still the rule). Two-sided refactor caller-miss: updated value on EmployeeRow.js but left prop name `isActive=` stale — 2nd incident of this shape (1st was 12.3 oncancel/onCancel); memory saved (feedback_two_sided_refactor). JS-file caller silenced TS; runtime blew up on undefined. Future cue: "prop name first, then value." Stray empty src/Types/Employee.ts still on disk — needs delete to close out fully.
  14.3       | 30 min  | 5 min     |  TypeScript: leaf component
  14.4       | 35 min  | 5 min     |  TypeScript: generic hook
  14.5       | 40 min  | 5 min     |  TypeScript: no-ref capstone
  15.1       | 30 min  | 5 min     |  TypeScript: API service
  15.2       | 40 min  | ~7-8 min  |  TypeScript: useEmployees + discriminated unions (took help from Gemini)
  15.3       | 35 min  | ~7-8 min  |  TypeScript: AuthContext (took help from Gemini)
  15.4       | 45 min  | ~45 min   | On target. Event types (React.ChangeEvent<HTMLInputElement|HTMLSelectElement> + as HTMLInputElement, React.FormEvent<HTMLFormElement>), useState<EmployeeFormData> explicit generic, Validate(): FormErrors — clean. Two TS gotchas surfaced via salary type chain: (1) Models.ts had `salary: string` while .NET returns number — domain type was lying; symptom looked like a form bug. (2) Intersection ≠ override: `Omit<Employee, 'id'> & { salary: string }` produced `never` because `number & string = never`. Canonical fix: Omit the conflicting key first — `Omit<Employee, 'id' | 'salary'> & { salary: string }`. Real C#→TS false friend — inherited-property override doesn't translate to structural typing; intersection requires ALL constraints. Boundary-conversion pattern locked in: API number → form string (.toString fetchEmployee), form string → API number (parseFloat submit), form↔input both string. FormErrors written as manual interface (not Partial<Record<keyof T, string>>) — works, defer scaling to 16.x. Carryovers: `Validate`→`validate`, narrow error casts in 16.1, FormErrors → Partial<Record<...>> swap.
  15.5       | 45 min  | ~20 min   | Beat target by ~25 min. Took help from Gemini when stucked. Migration mostly mechanical (rename + add prop interfaces); real learning came from EmployeeList.tsx surfacing a long-standing data-shape bug TS now refused: `hideBelow50K` was `useState('')` (string) in the hook but FilterBar correctly typed `boolean`, and on-clear called `sethideBelow50K(false)`. JS coercion (`!''` truthy, `!'on'` falsy) had masked the mismatch since Round 11. Fixed hook to `useState(false)` — boolean end-to-end. Canonical TS-migration moment: converting `.js → .tsx` doesn't ADD bugs, it REVEALS bugs JS was coercing past. Wrong reflex: relax the type (`useState('')`, `: any`, `as unknown`) — hides the bug again. Right move: ask "what should this value really be?" and fix the source of truth. Same pattern as 15.4's salary chain. Cleanup pass: deleted stray empty `src/Types/Employee.ts`, renamed `reportWebVitals.tsx`→`.ts` (no JSX), kept `App.test.js` (CRA boilerplate, needs @types/jest to migrate). Fixed `.JS`/`App.js`/`api.js`/`Login.js`/`index.js` references in comments. Removed dead duplicate import in EmployeeList. `npx tsc --noEmit` clean. Carryovers to Round 16: `>= 900` salary threshold bug, `AuthContext.user: any`, `Activity = any`, `error as any` casts, `Validate`→`validate`, FormErrors → `Partial<Record<keyof T, string>>`.
  16.1       | 30 min  | ~10 min   | Beat target by ~20 min. A bit of help from Gemini. Removed every hard `any` from src/ (only `global.d.ts` CSS module stub remains — CRA standard). Three fix categories: (1) AuthContext `user: any` → `LoginResponse | null` + try/catch around localStorage JSON parse; (2) RecentActivity Activity = any → real ActivityInterface{id,action,details,timestamp,userId?}, modal + useEmployees callers updated; (3) error catches in EmployeeForm/useEmployees/Login. Initial pass used `as AxiosError<...>` (compile-time assertion); cleanup pass swapped to `isAxiosError<{message?:string}>(error)` (true runtime type guard — TS narrows only when check passes). Concept drilled: generic parameter on error types (same idea as Promise<T> / Array<T>, .NET analogy Task<T>/List<T>); type assertion vs type guard (`as X` is a compile-time lie, `is X`/guard fn is a real runtime check — same family as `error is X` pattern matching in C#). Cleanup pass also fixed: handleUndo toast.error regression (was console.error — would silently lose data on undo failure), EmployeeForm catch indent at column 1. Open: Activity.id semantic mismatch (stores employee id, commented as log-entry id); `ActivityInterface` redundant naming (TS drops the `Interface` suffix — .NET reflex).
  16.2       | 25 min  | ~20 min   | Beat target by ~5 min. Some Gemini help on initial brand syntax. Gemini gave `unique symbol` + `declare const` pattern instead of the spec's string-literal `__brand` — more rigorous, unforgeable (symbol is module-private, no outside file can construct the key). NEW CONCEPTS: `unique symbol` (a type referring to one specific symbol value, distinguishable at type level), `declare const` (compiles to zero bytes — pure compile-time marker). Real learning was the subtype-direction gotcha: after changing Models.ts to EmployeeId, tsc had NO errors because `EmployeeId = string & {brand}` is a SUBTYPE of string — flows silently into `string` parameters. **The brand only bites when CONSUMERS are also tightened.** Initial wrong move: scattered `as EmployeeId` casts at every call site (defeats the point — bare `as` is `as any` in disguise). Correct fix: tighten signatures (handleDelete, ConfirmState.id, useCallback types, EmployeeRow props, api.ts params) so brand flows naturally; use `toEmployeeId(...)` named constructor ONLY at true boundaries (useParams() in EmployeeForm). Win condition: `as EmployeeId` appears only inside Ids.ts (constructor), `toEmployeeId(...)` at exactly the two URL-param boundaries, zero casts in the propagation chain. INTERSECTION-DONE-RIGHT contrast vs 15.4: `Omit<E,'id'> & {salary:string}` failed because `number & string = never` (override primitive); `string & {brand}` succeeds because intersection ADDS a marker field, doesn't override. Same `&` operator, two different shapes. C# analogy: `record EmployeeId(Guid Value)` vs `record UserId(Guid Value)` — different names, identical data, distinct types. Brand is TS's hack for nominal distinction in a structural language. UserId branded but unused (no User CRUD yet) — future-proofed at zero cost.
  16.3       | 30 min  | ~20 min   | Beat target by ~10 min. Took syntax help from Gemini — Claude's explanation of the discriminated union shape (two object variants with literal `type` field) didn't land on first read; Gemini's rephrasing of the same pattern clicked. Once syntax was clear, the work itself was small. Only one reducer in src/ (confirmReducer in useEmployees.tsx) — the spec's "recent-activity reducer" doesn't exist (Context uses useState, not useReducer). Rewrote ConfirmAction from `{ type: "open"|"close"; id?; name? }` (union ONLY on discriminator, payload optional on both branches → forced `action.id || null` defensive juggling) to a true union of two object types: `{ type: "open"; id: EmployeeId; name: string } | { type: "close" }` — payload REQUIRED on open variant, absent on close. TS now narrows each `case` to the matching object; defensive defaults gone. Replaced silent `default: return state` with `never` exhaustiveness guard: `const _exhaustive: never = action; throw new Error(...)`. Locked-in concept: a discriminated union is a UNION OF OBJECT TYPES (each tagged by a literal), not a single object with a union-typed tag — the latter is what the original code had and is why TS couldn't narrow payload. .NET false friend: closest is sealed class hierarchy + switch expression, but C# doesn't enforce exhaustiveness at compile time; F# DU is the exact match. All three dispatch call sites compiled unchanged — already passed correct shapes. tsc clean.
  16.4       | 25 min  | ~10 min   | Beat target by ~15 min. No Gemini help. Format-shift round: Claude's task-intro switched from abstract-concept-first (16.3) to concrete-first (file/line lookup table + worked before/after on a real line + "what NOT to touch" list); user explicitly validated "why don't you always explain like this" — saved as feedback_concrete_first_task_format memory. Hygiene round, not bug fix: inline JSX handlers ALREADY had correct types via CONTEXTUAL TYPING (TS reads JSX attribute signature, applies to bare `e =>`), but the type is INVISIBLE — extract handler to a const and `e` silently becomes any. Explicit annotations protect against future extraction. Two lookup rules locked in: (1) element type comes from HTML TAG, not input behaviour — `<input type="checkbox">` is still HTMLInputElement, just `.checked` instead of `.value`; there is no HTMLCheckboxElement. (2) event type comes from USER ACTION — onChange→ChangeEvent, onSubmit→FormEvent, onClick→MouseEvent. All 7 inline handlers in src/ annotated: FilterBar.tsx (5: select, text, checkbox, 2x number), Login.tsx (2: username, password). Initially missed FilterBar.tsx:72 (search input with multi-line body) on first pass — multi-line `{...}` body looked different from the one-liners; Claude flagged it via grep, fixed after. WHAT NOT TO TOUCH: `<button onClick={onConfirm}>` style (onConfirm is `() => void`, handler-signature contravariance lets a no-arg fn satisfy a richer signature — idiomatic); arrow handlers that ignore the event entirely (`() => onEdit(id)`); EmployeeForm/Login named handlers (already typed in 15.4/15.5); Props interfaces (pass plain values, not events — child stays decoupled from DOM event shape). C# analogy: EventHandler<T> binds the type permanently on subscription; TS's contextual typing gives the same inference but only while inline — annotations are what we'd get free in C#. tsc clean.
  16.5       | 20 min  | ~5 min    | Beat target by ~15 min. Fastest round in 16 — codebase was already near-strict-clean from 15.x and 16.1-16.4, so enabling all 5 sub-flags only surfaced 4 real issues. ALL 5 STRICT FLAGS ENABLED: noUnusedLocals, noUnusedParameters, noImplicitReturns, noFallthroughCasesInSwitch, exactOptionalPropertyTypes. None disabled. exactOptionalPropertyTypes worked first try (no third-party collisions). Errors split into two groups: (1) confirmReducer's `state` param flagged unused — reducer never reads state since both branches build a fresh ConfirmState from action. WRONG FIRST FIX: deleted the parameter entirely → broke useReducer's `(state, action) => state` contract → 10 cascade errors because TS now inferred `confirm` as ConfirmAction (reading first param as state type). RIGHT FIX: underscore-prefix convention `_state: ConfirmState` — noUnusedParameters recognises leading `_` as "intentionally unused, don't warn." Parameter stays (contract preserved), lint satisfied. Cross-language idiom (Rust/Go/Python all use `_param` the same way). (2) 3x stale `import React from 'react'` in App.tsx, EmployeeList.tsx, ProtectedRoute.tsx — React 17+ JSX transform doesn't need React in scope; these were .js-era leftovers finally flagged by noUnusedLocals. Deleted all three. CONCEPT LOCKED IN — FIXED-SIGNATURE CONTRACTS: when a function shape is dictated externally (useReducer, event handlers, React.FC, library callbacks), you CAN'T drop a parameter to satisfy a lint rule — mark it intentionally unused. Will recur for event handlers that ignore the event, FCs that ignore props, etc. C# has discard patterns (`_`) for tuples/switch arms but NOT for function parameters — closest C# equivalent is [SuppressMessage] attribute or just naming the param `unused`. TS underscore is lighter than the attribute, more enforced than just naming. ROUND 16 COMPLETE — TS HARDENING ARC DONE: 16.1 any-removal | 16.2 branded IDs | 16.3 discriminated unions | 16.4 event handler types | 16.5 strict-mode. Total ~65 min vs 135 min planned. Zero `any`, branded IDs, exhaustive reducers, explicit event types, all strict sub-flags on. Ready for Round 17 (React Query migration).
  17.1       | 20 min  | ~7 min    | Beat target by ~13 min. Took Gemini help, but root cause was PROCESS FAILURE on Claude's side: closed Round 16 with "Ready when you are" for 17.1 instead of proactively pushing the v2 concrete-first breakdown. User flagged it; memory feedback_concrete_first_task_format updated with "no passive cliffhangers between rounds" rule. Installed @tanstack/react-query@5.100.11 + @tanstack/react-query-devtools@5.100.11. Wired in index.tsx (NOT App.tsx — single QueryClient instance for the whole app). Configured staleTime: 30000 (30s window of "fresh" data — subsequent useQuery returns cache without fetch) and refetchOnWindowFocus: false (disables tab-back refetch — fine in dev). Devtools mounted with initialIsOpen={false}. ARCHITECTURAL CALL THAT MATTERS — provider layering: <RecentActivityProvider><AuthProvider><QueryClientProvider><App/></QueryClientProvider></AuthProvider></RecentActivityProvider>. QueryClient INSIDE Auth — correct, because every query will eventually need the JWT in the Axios interceptor, and JWT lives in AuthContext; outside Auth would mean queries could fire before token loads → 401s. NEW CONCEPTS: QueryClient (the cache OBJECT, one per app), QueryClientProvider (Context provider handing it down — same pattern as AuthProvider), staleTime (fresh vs stale window), refetchOnWindowFocus (browser tab-back trigger). .NET MENTAL MODEL: QueryClient ≈ IMemoryCache singleton; QueryClientProvider ≈ DI registration; staleTime ≈ AbsoluteExpiration on MemoryCacheEntryOptions; refetchOnWindowFocus ≈ DelegatingHandler revalidation trigger; useQuery (next round) ≈ IMemoryCache.GetOrCreateAsync with retry/dedup/background refresh. Killer feature over IMemoryCache: REQUEST DEDUPLICATION — two components calling same query at same time fire ONE network request; IMemoryCache won't do that. PLUMBING ONLY — useEmployees still uses useState + useEffect + manual fetch; 17.2 replaces it with useQuery (where the win actually shows up: auto refetch, loading/error states, dedup, caching). tsc clean, devtools button visible in dev.
  17.2       | 35 min  | ~15 min   | Beat target by ~20 min. First real React Query win: ~12 lines of useState + useEffect + try/catch collapsed into one useQuery call. Required iteration because Claude's first breakdown had three inconsistencies (told user to drop useEffect then asked them to use it; wrote `query.isError` referencing an unbound name; buried `const queryClient = useQueryClient()` in prose instead of as a numbered step). All three caught + fixed; new rule baked into feedback_concrete_first_task_format memory: every prereq line is its own numbered step. USER-SIDE PATTERN — two-sided refactor copy-paste bugs (recurring per feedback_two_sided_refactor): PASS 1 pasted UNDO `[...old, employee]` into DELETE slot — tsc caught it. PASS 2 (after fix) pasted DELETE `filter(...)` into UNDO slot — tsc PASSED, runtime would have silently broken undo (cache stayed empty after re-create). Claude caught the second one during cleanup. Symmetric-inverse cache writes have identical type signatures, so the compiler can't help — filter-vs-append must stay straight manually. NEW CONCEPTS: useQuery (read-side hook, queryKey + queryFn, returns data/isLoading/isError/dataUpdatedAt; multiple callers same key = ONE network request via dedup), useQueryClient (imperative cache accessor), setQueryData (direct synchronous write, no refetch — use when new state is known locally; vs invalidateQueries which marks stale + refetches), dataUpdatedAt (auto-tracked timestamp, replaces manual setFetchedAt). FINAL STATE: zero useState for the employee list (reducer for modal stays), one useQuery, one useEffect (error-toast bridge — RQ doesn't toast on its own), setQueryData on delete (filter out) and undo (append back). UseEmployeesReturn shape UNCHANGED — internal refactor, no API change for EmployeeList. .NET MENTAL MODEL: useQuery = ICache<T> contract that bundles data/loading/error/updatedAt — equivalent to IMemoryCache.GetOrCreateAsync + manual flags, PLUS dedup (IMemoryCache won't dedup concurrent gets), PLUS background revalidation (IMemoryCache is binary in/out), PLUS cache-key-as-identity (setQueryData on same key updates THE slot, readers re-render automatically). CLEANUP PASS (same round): header comment rewritten for RQ architecture, stale comments about fetchEmployees/mount-useEffect/private-setEmployees deleted, indentation fixed (unindented queryClient line, ragged setQueryData blocks), multi-line object literals where they spanned past 100 cols. tsc clean.
  17.3       | 40 min  | ~35 min   |  React Query: delete + optimistic. Took Gemini's help — Claude's spec was an empty pointer ("see canonical pattern in earlier 16.3 (now 17.3)") with no actual pattern written out. User: "going forward I'll ask Gemini only for the help."
  17.4       | 35 min  | ~20 min   |  React Query: create + edit mutations. Beat target by ~15 min but took Gemini's help — useMutation syntax not yet held solo. Spec listed WHAT (add hooks, isPending, invalidate, navigate) but no syntax anchor for HOW. Same gap as 17.3.
  17.5       | 30 min  | ~15 min   |  React Query: query-key hierarchy. Beat target by ~15 min. Concept clicked solo (query keys = cache's public API, centralize like route strings); Gemini's help on the implementation in EmployeeForm and useEmployee. Understood WHY, syntax-recall still the gap.
  18.1       | 25 min  | ~8 min    |  Router: createBrowserRouter. Beat target by ~17 min. Took Gemini's help for syntax — pattern of "routes-as-config array" not yet held solo. App.tsx restructured: providers (QueryClientProvider, AuthProvider, RecentActivityProvider) now wrap RouterProvider rather than living inside <Routes>.
  18.2       | 25 min  | ~30 min   |  Router: URL params. Over target by ~5 min. Took Gemini's help for syntax. EmployeeForm now reads `:id` from useParams, fetches via useEmployee(id), and prefills via reset(employee). EmployeeList navigates to `/employees/${id}/edit`. id===undefined ⇒ create mode (single source of truth, no local id state).
  18.3       | 30 min  | ~20 min   |  Router: nested routes + AuthLayout. Beat target by ~10 min. Took Gemini's help for syntax. ARCHITECTURAL CALL OWNED SOLO — Gemini suggested localStorage for the header's user-name; rejected and pulled from AuthContext (single source of truth, no sync bugs on logout). EmployeeList's inline nav deleted; AuthLayout header now owns top-right user name + logout for every authenticated page. <Outlet /> + protected branch wired in router.
  18.4       | 25 min  | ~10 min   |  Router: search params for filters. Beat target by ~15 min. Took Gemini's help for syntax. Replaced local useState for search/department/hideBelow50K with useSearchParams. INTERESTING BUG — clear-filter wasn't working with key-by-key `.delete()` calls; Gemini's fix was to swap in `setSearchParams(new URLSearchParams(), { replace: true })` (wipe all params atomically) + keep `setView(0)` since `view` is still local state, not URL-bound. Filters now bookmarkable.
  18.5       | 25 min  | ~5 min    |  Router: typed route helpers. Beat target by ~20 min. NO Gemini — concrete-first lookup table (file/line/before/after) for all 14 call sites + "NOT TO TOUCH" list for the `:id` pattern and comments worked first try. Created src/routes.ts with 4 helpers (login/employees/newEmployee/editEmployee — last takes EmployeeId). `as const` on every return keeps literal types; functions (not values) for uniform call syntax + param support. Replaced literals in App.tsx, AuthLayout, EmployeeForm (3 sites), EmployeeList (2), Login, ProtectedRoute, api.ts. Round 18 COMPLETE.
  19.1       | 25 min  | ~20 min   |  RHF: install + first form. Beat target by ~5 min. Took Gemini's help on TestForm wiring (useForm/register/handleSubmit). Installed react-hook-form; created throwaway TestForm.tsx with one field + handleSubmit logging the data. SIDE DETOUR — routing experiment: tried sending login redirect to TestForm by changing the `employees` helper to return "/TestForm". Got it working because the helper is single-source-of-truth for BOTH navigate(routes.employees()) AND path: routes.employees() — flipping one literal flips both ends together. But that's hijacking, not adding: every other caller of routes.employees() (EmployeeForm post-save x3, AuthLayout brand link, App.tsx catch-all) would have silently redirected to TestForm. CONCEPT LOCKED IN: React Router doesn't auto-discover routes from navigate() calls — the URL string in navigate() must match a `path` in the route config exactly, char-for-char. .NET parallel: navigate("/x") = Response.Redirect("/x"); route config = [Route] attributes / MapControllerRoute. Restored employees helper to "/employees"; correct add-a-route pattern is helper + route entry + navigate target, three sites updated.
  19.2       | 35 min  |           |  RHF: EmployeeForm refactor
  19.3       | 30 min  |           |  Zod: schema validation
  19.4       | 30 min  |           |  RHF + Zod: zodResolver
  19.5       | 25 min  |           |  RHF: touched-aware + root errors
  20.1       | 35 min  |           |  Auth: refresh token endpoint
  20.2       | 40 min  |           |  Auth: refresh interceptor
  20.3       | 40 min  |           |  Auth: first-login forced password
  20.4       | 25 min  |           |  Auth: role-based route guards
  20.5       | 25 min  |           |  Auth: useAuth narrowing
  21.1       | 20 min  |           |  Tailwind: install + config
  21.2       | 30 min  |           |  Tailwind: refactor StatusBadge/Row
  21.3       | 35 min  |           |  Tailwind: EmployeeList + Form
  21.4       | 30 min  |           |  Tailwind: tokens + dark mode
  21.5       | 20 min  |           |  Tailwind: @apply patterns
  22.1       | 20 min  |           |  Zustand: install + first store
  22.2       | 30 min  |           |  Zustand: migrate RecentActivity
  22.3       | 25 min  |           |  Zustand: shallow equality
  22.4       | 25 min  |           |  Zustand: persist middleware
  22.5       | 20 min  |           |  Zustand: devtools + slices
  23.1       | 30 min  |           |  Feature/Profile: types + endpoint
  23.2       | 25 min  |           |  Feature/Profile: useProfile hook
  23.3       | 30 min  |           |  Feature/Profile: page + display
  23.4       | 40 min  |           |  Feature/Profile: edit (RHF+Zod)
  23.5       | 30 min  |           |  Feature/Profile: avatar upload
  24.1       | 25 min  |           |  Feature/ChangePwd: endpoint
  24.2       | 25 min  |           |  Feature/ChangePwd: strength schema
  24.3       | 35 min  |           |  Feature/ChangePwd: form + logout
  24.4       | 20 min  |           |  Feature/ChangePwd: forced flow test
  24.5       | 30 min  |           |  Feature/ChangePwd: forgot-pwd stub
  25.1       | 40 min  |           |  Feature/Docs: model + .NET CRUD
  25.2       | 30 min  |           |  Feature/Docs: types + query hooks
  25.3       | 35 min  |           |  Feature/Docs: My Documents page
  25.4       | 25 min  |           |  Feature/Docs: download flow
  25.5       | 20 min  |           |  Feature/Docs: type/size validation
  26.1       | 25 min  |           |  Feature/DocsUpload: basic form
  26.2       | 30 min  |           |  Feature/DocsUpload: progress bar
  26.3       | 30 min  |           |  Feature/DocsUpload: drag-drop
  26.4       | 30 min  |           |  Feature/DocsUpload: multi-file queue
  26.5       | 25 min  |           |  Feature/DocsUpload: paste support
  27.1       | 30 min  |           |  Feature/DocsAdmin: list-all page
  27.2       | 30 min  |           |  Feature/DocsAdmin: filter by owner
  27.3       | 35 min  |           |  Feature/DocsAdmin: delete-with-reason
  27.4       | 30 min  |           |  Feature/DocsAdmin: bulk zip download
  27.5       | 30 min  |           |  Feature/DocsAdmin: stats panel
  28.1       | 35 min  |           |  Feature/Leave: domain model
  28.2       | 25 min  |           |  Feature/Leave: TS types + helpers
  28.3       | 30 min  |           |  Feature/Leave: balance endpoint
  28.4       | 35 min  |           |  Feature/Leave: My Leaves page
  28.5       | 20 min  |           |  Feature/Leave: year selector
  29.1       | 25 min  |           |  Feature/LeaveReq: Zod schema
  29.2       | 35 min  |           |  Feature/LeaveReq: request endpoint
  29.3       | 35 min  |           |  Feature/LeaveReq: request form
  29.4       | 30 min  |           |  Feature/LeaveReq: date pickers
  29.5       | 25 min  |           |  Feature/LeaveReq: RHF Controller
  30.1       | 30 min  |           |  Feature/LeaveAppr: Manager + queue
  30.2       | 35 min  |           |  Feature/LeaveAppr: pending page
  30.3       | 30 min  |           |  Feature/LeaveAppr: approve/reject API
  30.4       | 35 min  |           |  Feature/LeaveAppr: approve UI
  30.5       | 25 min  |           |  Feature/LeaveAppr: notify requester
  31.1       | 25 min  |           |  Feature/LeaveRollback: cancel endpoint
  31.2       | 25 min  |           |  Feature/LeaveRollback: cancel UI
  31.3       | 35 min  |           |  Feature/LeaveRollback: request endpoints
  31.4       | 30 min  |           |  Feature/LeaveRollback: request UI
  31.5       | 35 min  |           |  Feature/LeaveRollback: manager UI
  32.1       | 35 min  |           |  Feature/Notif: model + triggers
  32.2       | 25 min  |           |  Feature/Notif: useNotifications poll
  32.3       | 30 min  |           |  Feature/Notif: bell + badge
  32.4       | 30 min  |           |  Feature/Notif: full page
  32.5       | 20 min  |           |  Feature/Notif: preferences stub
  33.1       | 40 min  |           |  Feature/Audit: model + filter
  33.2       | 25 min  |           |  Feature/Audit: endpoints
  33.3       | 35 min  |           |  Feature/Audit: hook + page
  33.4       | 30 min  |           |  Feature/Audit: diff viewer
  33.5       | 25 min  |           |  Feature/Audit: CSV export
  34.1       | 30 min  |           |  Feature/Dashboard: KPI endpoints
  34.2       | 30 min  |           |  Feature/Dashboard: KPI cards
  34.3       | 25 min  |           |  Feature/Dashboard: Recharts intro
  34.4       | 30 min  |           |  Feature/Dashboard: time series
  34.5       | 25 min  |           |  Feature/Dashboard: responsive + a11y
  35.1       | 30 min  |           |  Feature/DashPolish: pending widget
  35.2       | 25 min  |           |  Feature/DashPolish: team list widget
  35.3       | 30 min  |           |  Feature/DashPolish: date range
  35.4       | 25 min  |           |  Feature/DashPolish: CSV export per chart
  35.5       | 30 min  |           |  Feature/DashPolish: saved layout
  36.1       | 35 min  |           |  Feature/Time: model + endpoints
  36.2       | 30 min  |           |  Feature/Time: clock UI
  36.3       | 30 min  |           |  Feature/Time: today's entries + edit
  36.4       | 25 min  |           |  Feature/Time: weekly summary
  36.5       | 25 min  |           |  Feature/Time: missing-entry banner
  37.1       | 30 min  |           |  Feature/Timesheet: model + submit
  37.2       | 30 min  |           |  Feature/Timesheet: submission UI
  37.3       | 30 min  |           |  Feature/Timesheet: approval flow
  37.4       | 25 min  |           |  Feature/Timesheet: reopen + re-submit
  37.5       | 20 min  |           |  Feature/Timesheet: weekly digest stub
  38.1       | 30 min  |           |  Feature/Review: model
  38.2       | 35 min  |           |  Feature/Review: manager form
  38.3       | 25 min  |           |  Feature/Review: viewer + ack
  38.4       | 30 min  |           |  Feature/Review: auto-save drafts
  38.5       | 25 min  |           |  Feature/Review: dashboard widget
  39.1       | 30 min  |           |  Feature/Onboard: wizard state
  39.2       | 25 min  |           |  Feature/Onboard: per-step trigger()
  39.3       | 30 min  |           |  Feature/Onboard: account step
  39.4       | 25 min  |           |  Feature/Onboard: confirmation
  39.5       | 35 min  |           |  Feature/Onboard: bulk CSV import
  40.1       | 25 min  |           |  Feature/Bulk: selection state
  40.2       | 25 min  |           |  Feature/Bulk: action bar
  40.3       | 30 min  |           |  Feature/Bulk: endpoints
  40.4       | 30 min  |           |  Feature/Bulk: mutations + UX
  40.5       | 25 min  |           |  Feature/Bulk: dept reassign capstone
  41.1       | 35 min  |           |  SignalR: Hub + push
  41.2       | 30 min  |           |  SignalR: client connect + subscribe
  41.3       | 30 min  |           |  SignalR: leave status push
  41.4       | 35 min  |           |  SignalR: connection lifecycle UX
  41.5       | 25 min  |           |  SignalR: presence indicator
  42.1       | 25 min  |           |  Testing: Vitest + RTL setup
  42.2       | 35 min  |           |  Testing: EmployeeRow + ProfilePage
  42.3       | 30 min  |           |  Testing: custom hooks
  42.4       | 35 min  |           |  Testing: mock API integration
  42.5       | 40 min  |           |  Testing: leave approval flow
  43.1       | 25 min  |           |  Playwright: install + first
  43.2       | 35 min  |           |  Playwright: login + table flow
  43.3       | 40 min  |           |  Playwright: full leave rollback E2E
  43.4       | 30 min  |           |  Playwright: document upload E2E
  43.5       | 30 min  |           |  Playwright: CI + traces
  44.1       | 25 min  |           |  A11y: jsx-a11y ESLint
  44.2       | 30 min  |           |  A11y: focus management
  44.3       | 30 min  |           |  A11y: live regions
  44.4       | 30 min  |           |  A11y: modals keyboard
  44.5       | 40 min  |           |  A11y: Lighthouse to 100
  45.1       | 25 min  |           |  Perf: Profiler baseline
  45.2       | 35 min  |           |  Perf: memo + useCallback pass
  45.3       | 35 min  |           |  Perf: virtualize tables
  45.4       | 30 min  |           |  Perf: bundle analyzer + tree-shake
  45.5       | 25 min  |           |  Perf: useDeferredValue + Suspense
  46.1       | 25 min  |           |  i18n: react-i18next setup
  46.2       | 50 min  |           |  i18n: extract strings (all features)
  46.3       | 30 min  |           |  i18n: add second language
  46.4       | 25 min  |           |  i18n: plural + interpolation
  46.5       | 25 min  |           |  i18n: locale dates/numbers
  47.1       | 25 min  |           |  PWA: manifest + install
  47.2       | 35 min  |           |  PWA: service worker (Workbox)
  47.3       | 30 min  |           |  PWA: cache strategies
  47.4       | 25 min  |           |  PWA: offline indicator
  47.5       | 30 min  |           |  PWA: background sync writes
  48.1       | 30 min  |           |  Vite: side-by-side scaffold
  48.2       | 15 min  |           |  Vite: env var migration
  48.3       | 40 min  |           |  Vite: port routing + entry
  48.4       | 25 min  |           |  Vite: port tests
  48.5       | 20 min  |           |  Vite: swap + delete CRA
  49.1       | 20 min  |           |  Storybook: install + first
  49.2       | 30 min  |           |  Storybook: cards + fields
  49.3       | 25 min  |           |  Storybook: args + controls
  49.4       | 35 min  |           |  Storybook: Provider decorators
  49.5       | 25 min  |           |  Storybook: Chromatic visual reg
  50.1       | 35 min  |           |  Adv TS: conditional types
  50.2       | 30 min  |           |  Adv TS: mapped types
  50.3       | 25 min  |           |  Adv TS: template literal types
  50.4       | 30 min  |           |  Adv TS: type guards + Zod boundary
  50.5       | 25 min  |           |  Adv TS: branded consolidation
  51.1       | 20 min  |           |  Framer: install + first
  51.2       | 25 min  |           |  Framer: page transitions
  51.3       | 25 min  |           |  Framer: list enter/exit
  51.4       | 25 min  |           |  Framer: modal flourishes
  51.5       | 15 min  |           |  Framer: reduced motion
  52.1       | 25 min  |           |  CI: first workflow (build+test)
  52.2       | 20 min  |           |  CI: parallel typecheck/lint/test
  52.3       | 20 min  |           |  CI: caching npm + nuget
  52.4       | 25 min  |           |  CI: coverage upload
  52.5       | 25 min  |           |  CI: preview deployment
  53.1       | 30 min  |           |  Docker: API Dockerfile
  53.2       | 30 min  |           |  Docker: client Dockerfile + nginx
  53.3       | 25 min  |           |  Docker: compose for local
  53.4       | 20 min  |           |  Docker: healthchecks
  53.5       | 15 min  |           |  Docker: image size + ignore
  54.1       | 25 min  |           |  Monorepo: pnpm workspaces
  54.2       | 25 min  |           |  Monorepo: shared types pkg
  54.3       | 30 min  |           |  Monorepo: shared UI pkg
  54.4       | 20 min  |           |  Monorepo: Turborepo
  54.5       | 15 min  |           |  Monorepo: changesets
  55.1       | 15 min  |           |  SSR: why + trade-offs
  55.2       | 25 min  |           |  SSR: create-next-app
  55.3       | 40 min  |           |  SSR: port Server Component
  55.4       | 30 min  |           |  SSR: Server Actions
  55.5       | 30 min  |           |  SSR: hybrid auth (cookies)
  56.1       | 30 min  |           |  Security: CSP
  56.2       | 25 min  |           |  Security: rate limiting
  56.3       | 30 min  |           |  Security: input sanitization
  56.4       | 25 min  |           |  Security: secrets management
  56.5       | 25 min  |           |  Security: dependency audit
  57.1       | 25 min  |           |  Mobile: audit on real devices
  57.2       | 40 min  |           |  Mobile: tables → cards pattern
  57.3       | 30 min  |           |  Mobile: hamburger nav drawer
  57.4       | 25 min  |           |  Mobile: touch targets
  57.5       | 30 min  |           |  Mobile: bottom sheets
  58.1       | 30 min  |           |  Design system: Button
  58.2       | 35 min  |           |  Design system: Input + Select
  58.3       | 35 min  |           |  Design system: Modal
  58.4       | 25 min  |           |  Design system: Card + EmptyState
  58.5       | 30 min  |           |  Design system: Storybook docs
  59.1       | 35 min  |           |  Polish: Lighthouse all pages 95+
  59.2       | 30 min  |           |  Polish: empty/error/loading states
  59.3       | 30 min  |           |  Polish: onboarding tour
  59.4       | 35 min  |           |  Polish: README + screenshots/GIFs
  59.5       | 30 min  |           |  Polish: architecture diagram + docs
  60.1       | 15 min  |           |  Capstone: pick scope
  60.2       | 30 min  |           |  Capstone: design doc
  60.3       | 90 min  |           |  Capstone: vertical slice
  60.4       | 60 min  |           |  Capstone: tests/a11y/responsive
  60.5       | 30 min  |           |  Capstone: PR + share

  Total target time: ~110h across 60 rounds (~22 weeks at 1 round/week).
                     Rounds 1-15 (~13h)  : Original CRUD + advanced JS React + TS migration.
                     Rounds 16-22 (~13h) : TS hardening + pattern foundations.
                     Rounds 23-40 (~46h) : Feature modules. THE muscle-memory rounds —
                                           every feature reapplies React Query + RHF + Zod +
                                           TS interfaces + Router + Tailwind + role checks.
                     Rounds 41-50 (~26h) : Cross-cutting polish — real-time, testing, E2E,
                                           a11y, perf, i18n, PWA, Vite, Storybook, Advanced TS.
                     Rounds 51-60 (~30h) : Production extras + polish + final capstone.

  Your total time:   ~4h 37m through 12.3, +~75m for Round 13, +~24m for 14.1, +~15m for 14.2,
                     +5m each for 14.3, 14.4, 14.5, 15.1 (logged 2026-05-14/15).
                     Round 13 complete; Round 14 complete; 15.1 done; 15.2 in progress.

                     Curriculum redesigned 2026-05-15 to feature-first approach. Rounds 16-60
                     prioritize REPEATED application of patterns across enterprise features:
                     Profile, Documents, Leave Mgmt, Notifications, Audit Log, Manager
                     Dashboard, Time Tracking, Performance Review, Onboarding Wizard, Bulk Ops.

                     Path: 16-22 patterns → 23-40 features (repetition for muscle memory) →
                           41-50 cross-cutting polish → 51-60 production extras + capstone.

                     Pacing: ~1 round/week. No rush. Round 40 = "feature-builder" bar;
                     Round 50 = "production-ready"; Round 60 = "interview-ready portfolio."

After you finish all challenges, you will understand:
  - How .NET Clean Architecture works (layers, DI, interfaces)
  - How React components, state, and effects work
  - How React and .NET communicate over HTTP
  - How to add full-stack features (model → service → controller → form → table)
  - How to extract reusable logic into custom hooks
  - How to build production-quality forms with validation
  - How to manage advanced UI patterns (pagination, modals, undo)
