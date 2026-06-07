# Study Guide - How to Learn This Project in VS Code

You know .NET Core basics. You've never touched React. This guide tells you
exactly what to open, what to read, and in what order.


================================================================================
VS CODE ESSENTIALS (Learn These First)
================================================================================

You don't need to memorize everything. Just these shortcuts:

  Ctrl+P              Quick Open — type a filename to jump to it instantly
                      Try it now: Ctrl+P, type "Program.cs", press Enter

  Ctrl+Shift+F        Search across ALL files (like Find in Solution)
                      Try it: search for "GetAllAsync" to see it everywhere

  Ctrl+`              Toggle the built-in terminal (the backtick key, left of 1)
                      You'll run "dotnet run" and "npm start" here

  Ctrl+Click          Click on any function/class name to jump to its definition
                      Try it: open Program.cs, Ctrl+Click on "EmployeeService"

  Alt+Left Arrow      Go back to where you were (like browser Back button)
                      Use this after Ctrl+Click to jump back

  F12                 Go to Definition (same as Ctrl+Click)
  Shift+F12          Find All References — shows everywhere something is used

  Ctrl+Shift+E        Open the File Explorer sidebar
  Ctrl+Shift+B        Build the .NET project (runs "dotnet build")
  F5                  Start Debugging (runs the .NET API with breakpoints)

  Ctrl+B              Toggle the sidebar (hide it to get more editor space)
  Ctrl+\              Split the editor — put two files side by side
                      Great for reading .cs and .js files together


================================================================================
STEP 0: RUN THE APP FIRST (15 minutes)
================================================================================

Before reading any code, get the app running so you can see what it does.

  TERMINAL 1 (Backend):
    cd EmployeeManager.API
    dotnet run

  TERMINAL 2 (Frontend — open a second terminal with Ctrl+Shift+`):
    cd EmployeeManager.Client
    npm install          (takes a minute the first time — downloads packages)
    npm start            (opens browser automatically)

  IN THE BROWSER:
    1. You'll see a login page
    2. Login with: admin / admin123
    3. You'll see an empty employee list
    4. Click "Add Employee" and create a few employees
    5. Try editing one, deleting one
    6. Open browser DevTools (F12) → Network tab → watch the API calls happen

  WHY DO THIS FIRST?
  You need a mental picture of what the code DOES before reading HOW it does it.
  Otherwise the code is just abstract text.


================================================================================
STEP 1: STUDY THE BACKEND (.NET) — You Already Know This (1-2 hours)
================================================================================

Start with what you know. Read in this order:

  FILE 1: EmployeeManager.Domain/Models/Employee.cs
  -------
  This is just a class with properties. Nothing new.
  Notice: no [Required] attributes, no EF annotations — it's a pure domain model.

  FILE 2: EmployeeManager.Domain/Repositories/IEmployeeRepository.cs
  -------
  Just an interface. Read the method signatures — they tell you what data
  operations are available. Notice they all return Task<T> (async).

  FILE 3: EmployeeManager.Infrastructure/Repositories/EmployeeRepository.cs
  -------
  The implementation. Instead of Entity Framework, it reads/writes JSON files.
  The logic is simple: read all → find/add/remove → write all back.

  FILE 4: EmployeeManager.Application/Services/EmployeeService.cs
  -------
  Business rules live here. Read CreateEmployeeAsync carefully:
  - It checks for duplicate emails BEFORE saving
  - It checks salary is not negative
  - It returns a tuple (Employee?, string?) — the error pattern

  FILE 5: EmployeeManager.API/Controllers/EmployeeController.cs
  -------
  The HTTP layer. Notice how thin it is — it just calls the service and
  converts the result to an HTTP status code (200, 201, 400, 404).

  FILE 6: EmployeeManager.API/Program.cs
  -------
  The big one. Read the comments — they explain every section.
  Key things to understand:
  - How DI wires interfaces to implementations (AddScoped lines)
  - How JWT authentication is configured
  - How CORS allows the React app to call the API
  - The middleware pipeline order

  EXERCISE: Set a breakpoint in EmployeeController.GetAll() (click left of
  the line number). Press F5 to debug. Then go to the browser and refresh
  the employee list. The breakpoint will hit — step through with F10.


================================================================================
STEP 2: UNDERSTAND HOW REACT CONNECTS TO .NET (30 minutes)
================================================================================

Before diving into React syntax, understand the CONNECTION between the two.

  FILE: EmployeeManager.Client/src/services/api.js
  -------
  This is the React equivalent of HttpClient. Read it carefully:
  - axios.create({ baseURL: '/api' }) — sets the base URL
  - The request interceptor adds "Authorization: Bearer {token}" automatically
  - The response interceptor catches 401 and redirects to login

  MENTAL MODEL:
    .NET has:  HttpClient + DelegatingHandler
    React has: Axios instance + Interceptors
    They do the exact same thing.

  NOW OPEN BROWSER DEVTOOLS (F12):
  1. Go to the Network tab
  2. Click around in the app (load employees, create one, delete one)
  3. You'll see requests like:
       GET  /api/employee         → 200 (returns JSON array)
       POST /api/employee         → 201 (returns created employee)
       DELETE /api/employee/{id}  → 204 (no body)
  4. Click on a request → Headers tab → see "Authorization: Bearer eyJ..."
  5. Click on a request → Response tab → see the JSON your .NET API returned

  This is the bridge between React and .NET. Everything else is just UI.


================================================================================
STEP 3: LEARN REACT BY READING THE SIMPLEST FILE FIRST (1-2 hours)
================================================================================

React can seem overwhelming. The key is: READ ONE FILE AT A TIME, in order
from simple to complex.

  --- READ THIS FIRST ---

  FILE 1: EmployeeManager.Client/src/components/Login.js
  -------
  This is the simplest component. It has:
  - useState for form data (username, password)
  - A form with two inputs
  - A handleSubmit that calls the API
  - localStorage to save the token

  MAP TO .NET:
    useState({...})     = declaring a ViewModel with properties
    handleSubmit()      = a Controller action that processes the form
    onChange={handler}   = like an event handler in WinForms/Blazor
    return (<div>...)   = the View/Razor template

  EXERCISE: While the app is running, open Login.js and change the <h2> text
  from "NoviManager" to "My App". Save the file. The browser updates
  INSTANTLY (no rebuild needed). This is called Hot Reload — React's version.

  --- THEN THIS ---

  FILE 2: EmployeeManager.Client/src/components/ProtectedRoute.js
  -------
  The shortest file. It checks if a token exists in localStorage.
  If yes → show the page. If no → redirect to /login.
  This is like [Authorize] in .NET — but on the client side.

  --- THEN THIS ---

  FILE 3: EmployeeManager.Client/src/App.js
  -------
  This defines ALL the routes (URL → Component mapping).
  It's like your entire routing table in one place.
  
  MAP TO .NET:
    <Route path="/login" element={<Login />} />
    is the same as:
    [Route("/login")] on a Controller

  --- THEN THE BIG ONES ---

  FILE 4: EmployeeManager.Client/src/components/EmployeeList.js
  -------
  This is where it gets real. Take your time. It has:
  - useEffect to fetch data when the page loads
  - useState for the employee list
  - .map() to render a table row for each employee
  - Delete button that calls the API
  - Navigation to the edit/create forms

  EXERCISE: Add console.log(employees) right after the setEmployees line.
  Open browser DevTools (F12) → Console tab. Refresh the page.
  You'll see the employee array logged — this is the data from YOUR .NET API.

  FILE 5: EmployeeManager.Client/src/components/EmployeeForm.js
  -------
  The most complex file. It handles both Create and Edit in one component.
  Read it last. Key things:
  - useParams() reads the :id from the URL (like [FromRoute] in .NET)
  - If id exists → it's Edit mode, fetch the existing employee
  - If no id → it's Create mode, start with empty form
  - handleChange updates ONE field at a time using [name]: value


================================================================================
STEP 4: EXPERIMENT (The Real Learning)
================================================================================

Reading alone won't teach you React. You need to CHANGE things and see
what happens. Try these in order:

  EXPERIMENT 1 (Easy — 5 min):
  Open EmployeeList.js. Find the table header row.
  Change "Department" to "Dept". Save. See it update instantly.

  EXPERIMENT 2 (Easy — 10 min):
  In EmployeeList.js, find where it renders employee rows.
  Add a new <td> that shows employee.salary in green if > 50000, red if not.
  Hint: style={{ color: emp.salary > 50000 ? 'green' : 'red' }}

  EXPERIMENT 3 (Medium — 15 min):
  In Login.js, add a "Show Password" checkbox that toggles the password
  input between type="password" and type="text".
  You'll need: const [showPassword, setShowPassword] = useState(false);

  EXPERIMENT 4 (Medium — 20 min):
  Follow Exercise 2 in REACT-GUIDE.md (Add a Search Box).
  This teaches you the most important React pattern: state → filter → render.


================================================================================
STEP 5: KEY CONCEPTS CHEAT SHEET
================================================================================

When you see something confusing, refer to this:

  const [x, setX] = useState(initial)
  ├── x         = the current value (read-only)
  ├── setX(new) = update the value AND re-render the component
  └── initial   = the starting value (only used on first render)

  useEffect(() => { ... }, [])
  ├── The function runs AFTER the component appears on screen
  ├── []  = run ONCE (like page load)
  ├── [id] = run again every time "id" changes
  └── Used for: API calls, timers, subscriptions

  {items.map(item => <div key={item.id}>{item.name}</div>)}
  ├── .map() transforms each item into a piece of UI
  ├── key={...} is required — React uses it to track changes
  └── This is React's version of @foreach in Razor

  const handleChange = (e) => { setForm({...form, [e.target.name]: e.target.value}) }
  ├── e.target       = the input element that triggered the event
  ├── e.target.name  = the "name" attribute of the input
  ├── e.target.value = what the user typed
  ├── ...form        = copy all existing fields
  └── [name]: value  = overwrite just the changed field

  async/await in React works EXACTLY like C#:
    const response = await api.get('/employee');
    const data = response.data;    // this is the JSON body


================================================================================
VS CODE TIPS FOR DAILY USE
================================================================================

  SPLIT VIEW (very useful for this project):
    Open Program.cs on the left, api.js on the right (Ctrl+\)
    See how the backend and frontend connect side by side

  TERMINAL TIPS:
    Ctrl+`              Open/close terminal
    Ctrl+Shift+`        Open a NEW terminal (use one for backend, one for frontend)
    Click the dropdown in terminal panel to switch between terminals

  WHEN SOMETHING BREAKS:
    - Check the terminal running "npm start" — React errors show there
    - Check the terminal running "dotnet run" — .NET errors show there
    - Check browser DevTools Console (F12) — JavaScript errors show there
    - Check browser DevTools Network tab — failed API calls show there in red

  USEFUL EXTENSIONS YOU ALREADY HAVE:
    C# Dev Kit          — IntelliSense for .cs files, debugging, go-to-definition
    ESLint              — Shows JavaScript errors/warnings as you type
    ES7 React Snippets  — Type "rafce" + Tab to generate a React component skeleton
