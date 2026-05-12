// ============================================================================
// EMPLOYEECONTROLLER.CS — RESTful API endpoints for Employee CRUD operations.
//
// PROJECT: EmployeeManager (API layer)
//
// This controller handles HTTP requests and delegates to the Service layer.
// Controllers should be THIN — they only handle HTTP concerns:
// - Receive the request
// - Call the appropriate service method
// - Return the appropriate HTTP status code and response body
//
// REST CONVENTIONS:
//   GET    /api/employee       → List all employees      → 200 OK
//   GET    /api/employee/{id}  → Get one employee         → 200 OK / 404 Not Found
//   POST   /api/employee       → Create a new employee    → 201 Created / 400 Bad Request
//   PUT    /api/employee/{id}  → Update an employee       → 200 OK / 400 / 404
//   DELETE /api/employee/{id}  → Delete an employee       → 204 No Content / 404
//
// AUTHENTICATION:
// The [Authorize] attribute means ALL endpoints in this controller require
// a valid JWT token in the "Authorization: Bearer {token}" header.
// Without a valid token, the request is rejected with 401 Unauthorized
// (before it even reaches the controller method).
//
// PATTERN FLOW:
//   HTTP Request → [THIS CONTROLLER] → EmployeeService → Repository → JSON File
//   HTTP Response ← [THIS CONTROLLER] ← EmployeeService ← Repository ← JSON File
// ============================================================================

using EmployeeManager.Application.Services;  // IEmployeeService
using EmployeeManager.Domain.Models;         // Employee model
using Microsoft.AspNetCore.Authorization;    // [Authorize] attribute
using Microsoft.AspNetCore.Mvc;              // ControllerBase, [ApiController], IActionResult, etc.

namespace EmployeeManager.Controllers;

/// <summary>
/// Employee CRUD controller — handles HTTP requests for employee operations.
/// All endpoints require JWT authentication.
/// </summary>
[ApiController]
// ^^^ Enables API-specific behaviors:
//     - Automatic model validation (returns 400 if model is invalid)
//     - Automatic [FromBody] inference for complex types
//     - Problem details for error responses

[Route("api/[controller]")]
// ^^^ URL routing: [controller] is replaced with the class name minus "Controller".
//     EmployeeController → "api/employee"
//     So all endpoints in this class start with /api/employee

[Authorize]
// ^^^ ALL endpoints in this controller require authentication.
//     The JWT middleware (configured in Program.cs) validates the token.
//     If no valid token is present → 401 Unauthorized (auto-response, never reaches the method).

public class EmployeeController : ControllerBase
// ^^^ ControllerBase is the base class for API controllers (no View support).
//     For MVC with Views, you'd use Controller instead.
{
    // The employee service — handles business logic. Injected via DI.
    private readonly IEmployeeService _employeeService;

    /// <summary>
    /// Constructor — IEmployeeService is injected automatically by the DI container.
    /// .NET sees that this controller needs IEmployeeService and creates one
    /// (which in turn gets IEmployeeRepository injected, and so on).
    /// </summary>
    public EmployeeController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    /// <summary>
    /// GET /api/employee
    /// Returns all employees as a JSON array.
    /// Always returns 200 OK (even if the list is empty — that's a valid response).
    ///
    /// React calls this from: EmployeeList.js → getEmployees() → GET /api/employee
    /// </summary>
    [HttpGet]
    // ^^^ Maps HTTP GET requests to this method.
    //     Combined with [Route("api/[controller]")], the full URL is: GET /api/employee
    public async Task<IActionResult> GetAll()
    // ^^^ IActionResult lets us return different HTTP status codes (Ok, NotFound, etc.)
    //     async Task<> because the service method is async (involves file I/O)
    {
        var employees = await _employeeService.GetAllEmployeesAsync();

        // Ok() returns HTTP 200 with the employees as JSON in the response body.
        // ASP.NET automatically serializes the C# objects to JSON.
        return Ok(employees);
    }

    [HttpGet("Count")]
    public async Task<IActionResult> GetCount()
     {
         var employees = await _employeeService.GetAllEmployeesAsync();
         return Ok(new { count = employees.Count() });
     }

    /// <summary>
    /// GET /api/employee/{id}
    /// Returns a single employee by their GUID.
    /// Returns 404 Not Found if the employee doesn't exist.
    ///
    /// React calls this from: EmployeeForm.js → getEmployee(id) → GET /api/employee/{id}
    /// </summary>
    [HttpGet("{id}")]
    // ^^^ {id} is a route parameter. The URL /api/employee/abc123 maps to id = "abc123".
    //     ASP.NET automatically converts the string to a Guid (model binding).
    public async Task<IActionResult> GetById(Guid id)
    {
        var employee = await _employeeService.GetEmployeeByIdAsync(id);

        if (employee == null)
            // NotFound() returns HTTP 404 with a JSON body: { "message": "Employee not found" }
            return NotFound(new { message = "Employee not found" });

        return Ok(employee); // HTTP 200 with the employee JSON
    }

    /// <summary>
    /// POST /api/employee
    /// Creates a new employee. The request body should contain employee data.
    /// ID is auto-generated — do NOT include it in the request body.
    /// Returns 201 Created on success, 400 Bad Request if validation fails.
    ///
    /// React calls this from: EmployeeForm.js → createEmployee(data) → POST /api/employee
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Employee employee)
    // ^^^ [FromBody] tells ASP.NET to read the Employee from the JSON request body.
    //     The React frontend sends: { "firstName": "John", "lastName": "Doe", ... }
    //     ASP.NET deserializes this JSON into an Employee object automatically.
    {
        // Call the service — it validates and returns (employee, error) tuple.
        var (created, error) = await _employeeService.CreateEmployeeAsync(employee);
        // ^^^ Tuple deconstruction: var (a, b) unpacks the tuple into two variables.
        //     created = the Employee object (or null if validation failed)
        //     error = the error message string (or null if success)

        if (error != null)
            // Validation failed — return 400 Bad Request with the error message.
            // React shows this message in a toast notification.
            return BadRequest(new { message = error });

        // Success! Return 201 Created with:
        // - Location header pointing to GET /api/employee/{id} (REST convention)
        // - The created employee as the response body (includes the generated Id)
        return CreatedAtAction(nameof(GetById), new { id = created!.Id }, created);
        // ^^^ nameof(GetById) generates the string "GetById" at compile time.
        //     new { id = created.Id } provides the route values for the Location URL.
        //     created is the response body.
        //     The '!' after created tells the compiler it's not null (we checked error above).
    }

    /// <summary>
    /// PUT /api/employee/{id}
    /// Updates an existing employee.
    /// Returns 200 OK on success, 404 if not found, 400 if validation fails.
    ///
    /// React calls this from: EmployeeForm.js → updateEmployee(id, data) → PUT /api/employee/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Employee employee)
    {
        // Ensure the ID from the URL matches the employee body.
        // This prevents a mismatch between the URL (/api/employee/123)
        // and the body ({ id: "456" }).
        employee.Id = id;

        var (updated, error) = await _employeeService.UpdateEmployeeAsync(employee);

        if (error != null)
        {
            // Different errors get different status codes:
            if (error.Contains("not found"))
                return NotFound(new { message = error });  // 404 Not Found

            return BadRequest(new { message = error });     // 400 Bad Request (validation error)
        }

        return Ok(updated); // 200 OK with the updated employee
    }

    /// <summary>
    /// DELETE /api/employee/{id}
    /// Deletes an employee by ID.
    /// Returns 204 No Content on success (REST convention — no body needed).
    /// Returns 404 Not Found if the employee doesn't exist.
    ///
    /// React calls this from: EmployeeList.js → deleteEmployee(id) → DELETE /api/employee/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _employeeService.DeleteEmployeeAsync(id);

        if (!result)
            return NotFound(new { message = "Employee not found" });

        // NoContent() returns HTTP 204 with no response body.
        // This is the standard REST response for successful deletes.
        return NoContent();
    }
}
