# React - Getting Started Guide (For .NET Developers)

You know C# and .NET. This guide teaches React by mapping every concept to what you already know.


================================================================================
PART 1: SETUP AND TOOLING
================================================================================

## .NET vs React - Tooling Comparison

- .NET SDK          -->  Node.js
- NuGet             -->  npm (Node Package Manager)
- .csproj           -->  package.json
- dotnet restore    -->  npm install
- dotnet run        -->  npm start
- dotnet publish    -->  npm run build
- bin/ folder       -->  build/ folder
- .nuget/ folder    -->  node_modules/ (never commit this)


## How to Create a React Project from Scratch

    npx create-react-app my-app
    cd my-app
    npm start

This is the same as "dotnet new webapi -n MyApp" -- it generates all the starter files.


## What Each File Does

- public/index.html  -->  The single HTML page (like _Layout.cshtml)
- src/index.js       -->  Entry point (like Program.cs)
- src/App.js         -->  Root component (like Startup.cs)
- src/App.css        -->  Global styles
- package.json       -->  Dependencies (like .csproj)
- node_modules/      -->  Downloaded packages (like bin/ -- don't commit)


================================================================================
PART 2: CORE CONCEPTS
================================================================================


## Concept 1: Components = Pages
--------------------------------------------------------------------------------

In .NET MVC, you have Controllers and Views (two separate files).
In React, you have Components -- ONE function that IS both the logic and the UI.

In C# (.NET MVC) you need two files:

    // HomeController.cs
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }

    // Index.cshtml (separate file)
    <h1>Welcome</h1>
    <p>Hello World</p>

In React, everything is in ONE function:

    function HomePage() {
      return (
        <div>
          <h1>Welcome</h1>
          <p>Hello World</p>
        </div>
      );
    }

KEY INSIGHT: In React, there is no separation between "controller" and "view".
The component IS both. The HTML is written directly inside the JavaScript function.


## Concept 2: JSX = HTML Inside JavaScript
--------------------------------------------------------------------------------

JSX looks like HTML but has a few differences:

- class="box"           -->  className="box"       (class is reserved in JS)
- for="name"            -->  htmlFor="name"         (for is reserved in JS)
- onclick="fn()"        -->  onClick={fn}           (camelCase, no quotes)
- style="color: red"    -->  style={{ color: 'red' }}  (object, not string)
- <img src="a.jpg">     -->  <img src="a.jpg" />    (all tags must be closed)

Embedding JavaScript in JSX -- use curly braces {}:

    const name = "Ibrahim";
    const age = 25;

    return (
      <div>
        <h1>Hello, {name}!</h1>
        <p>Age: {age}</p>
        <p>Next year: {age + 1}</p>
      </div>
    );


## Concept 3: State = Variables That Update the Screen
--------------------------------------------------------------------------------

This is the MOST IMPORTANT concept in React.

In C#, if you change a variable, the screen does NOT update automatically.
In React, "state" is a special variable -- when it changes, React
AUTOMATICALLY re-renders the component.

C# (WinForms) approach -- you manually update the UI:

    private int count = 0;

    void HandleClick()
    {
        count++;
        lblCount.Text = count.ToString();  // YOU must update the label manually
    }

React approach -- UI updates automatically:

    import { useState } from 'react';

    function Counter() {
      const [count, setCount] = useState(0);

      function handleClick() {
        setCount(count + 1);
        // React AUTOMATICALLY updates the screen!
      }

      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={handleClick}>Click me</button>
        </div>
      );
    }

THE MAGIC: Calling setCount() tells React: "the data changed, re-run this
function and update the screen automatically."


### useState Patterns You Will Use Every Day

SIMPLE VALUES (string, number, boolean):

    const [name, setName] = useState('');
    const [count, setCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

ARRAYS (list of items):

    const [items, setItems] = useState([]);

    // Set the whole array (after fetching from API):
    setItems(dataFromApi);

    // Add an item to the end:
    setItems([...items, newItem]);

    // Remove an item by ID:
    setItems(items.filter(i => i.id !== idToRemove));

OBJECTS (multiple fields, like a form):

    const [form, setForm] = useState({
      firstName: '',
      lastName: '',
      email: '',
    });

    // Update ONE field (copy all others, change one):
    setForm({ ...form, firstName: 'John' });

    // Update from an input event:
    setForm({ ...form, [e.target.name]: e.target.value });


## Concept 4: useEffect = Run Code When Something Happens
--------------------------------------------------------------------------------

useEffect lets you run code AFTER the component appears on screen.

C# equivalent -- OnInitialized in Blazor:

    protected override void OnInitialized()
    {
        FetchData();  // runs once when the page loads
    }

React equivalent -- useEffect with empty array:

    useEffect(() => {
      fetchData();   // runs once when the component appears
    }, []);

THE DEPENDENCY ARRAY IS EVERYTHING (the second argument):

    // Run ONCE when the component first appears (like OnInitialized)
    useEffect(() => {
      fetchData();
    }, []);                    // empty array = run once

    // Run EVERY TIME 'id' changes (like OnParametersSet)
    useEffect(() => {
      fetchItem(id);
    }, [id]);                  // [id] = re-run when id changes

    // Run after EVERY render (usually WRONG -- avoid this)
    useEffect(() => {
      console.log('rendered');
    });                        // no array = runs too often


## Concept 5: Props = Passing Data to Child Components
--------------------------------------------------------------------------------

Props are how a parent component sends data to a child component.
Like constructor parameters in C#.

C# approach:

    public class Greeting
    {
        public string Name { get; set; }
    }
    var g = new Greeting { Name = "Ibrahim" };

React approach:

    // Define the child component -- receives props as a parameter
    function Greeting({ name }) {
      return <h1>Hi, {name}!</h1>;
    }

    // Use it from a parent component -- pass data as attributes
    function App() {
      return <Greeting name="Ibrahim" />;
    }

RULE: Props flow DOWN (parent to child). A child cannot change its own props.
If you need to change data, use state.


## Concept 6: Handling Events
--------------------------------------------------------------------------------

BUTTON CLICK (no arguments):

    <button onClick={handleClick}>Click me</button>

BUTTON CLICK (with arguments -- wrap in arrow function):

    <button onClick={() => handleDelete(id)}>Delete</button>

COMMON MISTAKE:
    onClick={handleClick()}    <-- WRONG! calls it immediately on render!
    onClick={handleClick}      <-- CORRECT! passes the function reference

FORM SUBMISSION:

    <form onSubmit={handleSubmit}>
      <button type="submit">Save</button>
    </form>

    function handleSubmit(e) {
      e.preventDefault();     // CRITICAL -- prevents page reload
      // your logic here
    }

INPUT CHANGE:

    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
    // e.target = the input element
    // e.target.value = what the user typed


## Concept 7: Conditional Rendering
--------------------------------------------------------------------------------

Show one thing OR another (ternary operator):

    {isLoggedIn ? <Dashboard /> : <Login />}

Show something OR nothing:

    {error && <p className="error">{error}</p>}

Multiple conditions:

    {loading ? (
      <p>Loading...</p>
    ) : employees.length === 0 ? (
      <p>No employees found.</p>
    ) : (
      <table>...</table>
    )}


## Concept 8: Rendering Lists
--------------------------------------------------------------------------------

C# Razor:

    @foreach (var emp in employees)
    {
        <tr>
            <td>@emp.Name</td>
        </tr>
    }

React JSX:

    {employees.map(emp => (
      <tr key={emp.id}>
        <td>{emp.name}</td>
      </tr>
    ))}

IMPORTANT: Always add a "key" prop with a unique value (like an ID).
React uses it to track which items changed. Without it, React shows
a warning and updates inefficiently.


================================================================================
PART 3: ROUTING (NAVIGATION BETWEEN PAGES)
================================================================================

In .NET MVC, URLs map to Controller actions.
In React, URLs map to Components.

- .NET: [Route("/employees")]         -->  React: <Route path="/employees" element={<List />} />
- .NET: [HttpGet("{id}")]             -->  React: <Route path="/edit/:id" element={<Form />} />
- .NET: public IActionResult(int id)  -->  React: const { id } = useParams();
- .NET: return RedirectToAction(...)  -->  React: navigate('/employees');

Setting up routes (in App.js):

    import { BrowserRouter, Routes, Route } from 'react-router-dom';

    function App() {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/edit/:id" element={<EmployeeForm />} />
          </Routes>
        </BrowserRouter>
      );
    }

Navigating programmatically (in any component):

    import { useNavigate, useParams } from 'react-router-dom';

    function MyComponent() {
      const navigate = useNavigate();
      const { id } = useParams();        // reads :id from the URL

      navigate('/employees');             // go to employee list
      navigate(`/employees/edit/${id}`);  // go to edit page
    }


================================================================================
PART 4: MAKING API CALLS
================================================================================

## .NET HttpClient vs React Axios

- C#: new HttpClient { BaseAddress = ... }    -->  axios.create({ baseURL: '...' })
- C#: await client.GetAsync("/emp")           -->  await api.get('/emp')
- C#: await client.PostAsJsonAsync("/emp", d) -->  await api.post('/emp', d)
- C#: await client.PutAsJsonAsync("/emp", d)  -->  await api.put('/emp/1', d)
- C#: await client.DeleteAsync("/emp/1")      -->  await api.delete('/emp/1')
- C#: await resp.ReadFromJsonAsync<T>()       -->  response.data (already parsed)


## The Complete Pattern: Fetch Data on Page Load

    import { useState, useEffect } from 'react';
    import api from '../services/api';

    function EmployeeList() {
      // Step 1: Create state for data and loading
      const [employees, setEmployees] = useState([]);
      const [loading, setLoading] = useState(true);

      // Step 2: Fetch data when the component first appears
      useEffect(() => {
        loadData();
      }, []);

      // Step 3: The async function that calls the API
      const loadData = async () => {
        try {
          const response = await api.get('/employee');
          setEmployees(response.data);       // store the data in state
        } catch (error) {
          console.error('Failed to load', error);
        } finally {
          setLoading(false);                 // hide loading spinner
        }
      };

      // Step 4: Show loading state or data
      if (loading) return <p>Loading...</p>;

      return (
        <ul>
          {employees.map(emp => (
            <li key={emp.id}>{emp.firstName} {emp.lastName}</li>
          ))}
        </ul>
      );
    }


================================================================================
PART 5: FORMS IN REACT
================================================================================

This is the biggest difference from HTML forms. In React, YOU control the
input values through state. This is called "controlled components".


## Simple Form (One Field)

    function SearchBox() {
      const [query, setQuery] = useState('');

      return (
        <input
          value={query}                              // display value FROM state
          onChange={(e) => setQuery(e.target.value)}  // update state on keystroke
        />
      );
    }

THE CYCLE ON EVERY KEYSTROKE:
  1. User types "H"
  2. onChange fires
  3. setQuery("H") updates state
  4. React re-renders the component
  5. Input displays "H" from state
  6. User types "e"
  7. setQuery("He") updates state
  8. Input displays "He"


## Complex Form (Multiple Fields)

Instead of separate useState for each field, use ONE object:

    function EmployeeForm() {
      // ONE state object holds ALL fields
      const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
      });

      // ONE handler works for ALL inputs
      // It reads the input's "name" attribute to know which field to update
      const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
          ...prev,           // copy all existing fields
          [name]: value      // update only the changed field
        }));
      };

      const handleSubmit = (e) => {
        e.preventDefault();  // prevent page reload
        console.log(form);   // { firstName: 'John', lastName: 'Doe', email: '...' }
      };

      return (
        <form onSubmit={handleSubmit}>
          <input name="firstName" value={form.firstName} onChange={handleChange} />
          <input name="lastName"  value={form.lastName}  onChange={handleChange} />
          <input name="email"     value={form.email}     onChange={handleChange} />
          <button type="submit">Save</button>
        </form>
      );
    }

WHY "name" ATTRIBUTE MATTERS:
When the user types in the "firstName" input, e.target.name is "firstName".
Then [name]: value becomes { firstName: "typed value" }.
One handler, unlimited fields. This is the pattern used in EmployeeForm.js.


## Handling Different Input Types

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    };

- Text input:     uses e.target.value (string)
- Email input:    uses e.target.value (string)
- Number input:   uses e.target.value (string -- convert with parseFloat())
- Date input:     uses e.target.value (string "YYYY-MM-DD")
- Checkbox:       uses e.target.checked (boolean true/false)
- Select:         uses e.target.value (string of selected option)


================================================================================
PART 6: PRACTICE EXERCISES
================================================================================

Try these in your project to build muscle memory. Ordered from easy to hard.


## Exercise 1: Add Employee Count Badges (Easy)
--------------------------------------------------------------------------------

GOAL: Show how many employees are Active vs Inactive.

FILE: EmployeeManager.Client/src/components/EmployeeList.js

WHAT TO DO: After the <h3>Employees ({employees.length})</h3> line, add:

    <div style={{ display: 'flex', gap: '10px' }}>
      <span style={{ color: '#4caf50', fontWeight: '600' }}>
        Active: {employees.filter(e => e.isActive).length}
      </span>
      <span style={{ color: '#f44336', fontWeight: '600' }}>
        Inactive: {employees.filter(e => !e.isActive).length}
      </span>
    </div>

WHAT YOU LEARN: Array .filter(), embedding expressions in JSX.


## Exercise 2: Add a Search Box (Medium)
--------------------------------------------------------------------------------

GOAL: Filter the employee table in real-time as you type.

FILE: EmployeeList.js

STEP 1 -- Add state for the search text:

    const [search, setSearch] = useState('');

STEP 2 -- Add an input above the table:

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

STEP 3 -- Create a filtered list:

    const filteredEmployees = employees.filter(emp =>
      `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.department}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

STEP 4 -- Use "filteredEmployees" instead of "employees" in the .map() and count.

WHAT YOU LEARN: useState, controlled inputs, .filter(), real-time search.


## Exercise 3: Add a Phone Number Field (Medium - Full Stack)
--------------------------------------------------------------------------------

GOAL: Add a phone number field to the form and the table.

STEP 1 (BACKEND): Add to Employee.cs in the Domain project:

    public string PhoneNumber { get; set; } = string.Empty;

STEP 2 (FORM): In EmployeeForm.js, add phoneNumber: '' to the initial state,
then add this input:

    <div style={styles.formGroup}>
      <label style={styles.label}>Phone Number</label>
      <input
        type="tel"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleChange}
        style={styles.input}
      />
    </div>

STEP 3 (TABLE): In EmployeeList.js, add <th>Phone</th> to the header
and <td>{emp.phoneNumber}</td> to the row.

STEP 4: Rebuild the backend with "dotnet build".

WHAT YOU LEARN: End-to-end feature development. The handleChange function
works automatically because you used the name attribute.


## Exercise 4: Build a Delete Confirmation Modal (Hard)
--------------------------------------------------------------------------------

GOAL: Replace the ugly window.confirm() with a custom React modal.

FILE: EmployeeList.js

STEP 1 -- Add state to track which employee is being deleted:

    const [deleteTarget, setDeleteTarget] = useState(null);

STEP 2 -- Change the delete button to set the target:

    <button onClick={() => setDeleteTarget(emp)} style={styles.deleteBtn}>
      Delete
    </button>

STEP 3 -- Add the modal JSX at the bottom of the return:

    {deleteTarget && (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: 'white', padding: '30px',
          borderRadius: '8px', width: '400px',
        }}>
          <h3>Confirm Delete</h3>
          <p style={{ margin: '15px 0' }}>
            Are you sure you want to delete
            {deleteTarget.firstName} {deleteTarget.lastName}?
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={async () => {
                await deleteEmployee(deleteTarget.id);
                setEmployees(employees.filter(e => e.id !== deleteTarget.id));
                setDeleteTarget(null);
                toast.success('Deleted successfully');
              }}
              style={styles.deleteBtn}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setDeleteTarget(null)}
              style={{
                padding: '6px 12px', border: '1px solid #ddd',
                borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

WHAT YOU LEARN: Conditional rendering, overlay/modal pattern, managing UI
state with null vs an object.


## Exercise 5: Create a Reusable Navbar Component (Hard)
--------------------------------------------------------------------------------

GOAL: Extract the navbar into its own file and reuse it.

STEP 1 -- Create src/components/Navbar.js:

    import React from 'react';
    import { useNavigate } from 'react-router-dom';

    function Navbar({ title, user }) {
      const navigate = useNavigate();

      const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      };

      return (
        <div style={styles.navbar}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px' }}>Hello, {user.fullName}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      );
    }

    const styles = {
      navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        backgroundColor: '#1a1a2e',
        color: 'white',
        borderRadius: '8px',
        marginBottom: '20px',
      },
      logoutBtn: {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        color: 'white',
        border: '1px solid white',
        borderRadius: '4px',
        cursor: 'pointer',
      },
    };

    export default Navbar;

STEP 2 -- Use it in EmployeeList.js:

    import Navbar from './Navbar';

    // Replace the entire navbar <div> with:
    <Navbar title="NoviManager" user={user} />

WHAT YOU LEARN: Creating components, passing props, component reusability.


================================================================================
PART 7: QUICK REFERENCE
================================================================================

STATE:
    const [value, setValue] = useState(initialValue);
    setValue(newValue);                         // replace
    setValue(prev => prev + 1);                // based on previous
    setValue({ ...old, key: newVal });         // update one field
    setValue(arr.filter(x => x.id !== id));    // remove from array

EFFECTS:
    useEffect(() => { fetchData(); }, []);     // run once on page load
    useEffect(() => { fetchItem(id); }, [id]); // run when id changes

FORMS:
    <input name="field" value={state.field} onChange={handleChange} />

NAVIGATION:
    const navigate = useNavigate();
    navigate('/path');
    const { id } = useParams();    // read :id from URL

LISTS:
    {items.map(item => <div key={item.id}>{item.name}</div>)}

CONDITIONAL RENDERING:
    {condition && <Component />}           // show or nothing
    {condition ? <Yes /> : <No />}         // show one or the other

API CALLS:
    const resp = await api.get('/endpoint');       // GET
    const data = resp.data;                        // response body
    await api.post('/endpoint', bodyObject);       // POST
    await api.put(`/endpoint/${id}`, bodyObject);  // PUT
    await api.delete(`/endpoint/${id}`);           // DELETE


================================================================================
PART 8: WHAT TO LEARN NEXT
================================================================================

Once you are comfortable with the basics, here is the recommended path:

1. TypeScript + React
   - Type safety like C# -- you will love this
   - Catches bugs before you even run the code

2. CSS Modules
   - Scoped styles per component (no conflicts between files)

3. React Context
   - Share state across components without passing props everywhere

4. Custom Hooks
   - Extract reusable logic (like useAuth(), useFetch())

5. React Query (TanStack Query)
   - Better data fetching with caching, retry, loading states

6. Tailwind CSS
   - Utility-first CSS framework (very popular with React)

7. Next.js
   - Full-stack React framework with server-side rendering

MY RECOMMENDATION: Start with TypeScript + React. Coming from C#, you are
used to strong typing. TypeScript makes React feel much more like C#.
