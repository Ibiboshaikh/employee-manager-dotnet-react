// ============================================================================
// PROGRAM.CS — Application entry point and configuration.
//
// PROJECT: EmployeeManager (API — the outermost layer)
//
// This is where the application STARTS. It's like the "main" function.
// It configures everything the app needs before handling HTTP requests:
//
// 1. SERILOG LOGGING — structured logging to console and daily log files
// 2. DEPENDENCY INJECTION — wires up which class implements which interface
// 3. JWT AUTHENTICATION — configures token validation for secure endpoints
// 4. CORS — allows the React dev server (port 3000) to call the API (port 5000)
// 5. MIDDLEWARE PIPELINE — the order that request processing happens
// 6. DATA SEEDING — creates a default admin user on first run
//
// EXECUTION ORDER:
// 1. Serilog is configured (for logging during startup)
// 2. WebApplicationBuilder is created
// 3. Services are registered (DI container is filled)
// 4. App is built (DI container is finalized)
// 5. Default data is seeded
// 6. Middleware pipeline is configured
// 7. App starts listening for HTTP requests on port 5000
//
// REQUEST PROCESSING ORDER (for each HTTP request):
//   Serilog logs it → CORS checks origin → Auth validates JWT → Authorization
//   checks [Authorize] → Controller method runs → Response is sent back
// ============================================================================

// ── IMPORTS ────────────────────────────────────────────────────────────────
using System.Text;                             // Encoding.UTF8 for JWT key
using EmployeeManager.Application.Services;    // IEmployeeService, IAuthService, etc.
using EmployeeManager.Domain.Models;           // Employee model
using EmployeeManager.Domain.Repositories;     // IEmployeeRepository
using EmployeeManager.Infrastructure.Data;     // JsonDataStore
using EmployeeManager.Infrastructure.Repositories; // EmployeeRepository
using Microsoft.AspNetCore.Authentication.JwtBearer; // JWT authentication scheme
using Microsoft.IdentityModel.Tokens;          // TokenValidationParameters
using Serilog;                                 // Structured logging library

// ── STEP 1: Configure Serilog (Bootstrap Logger) ───────────────────────────
// This creates an EARLY logger that works during startup — before the full
// app is built. It's called a "bootstrap" logger because it logs during bootstrapping.
//
// Why two loggers? The bootstrap logger handles startup messages.
// Once the app is fully built, it's replaced by the full logger (configured below
// in UseSerilog) which reads settings from appsettings.json.
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()    // Write log messages to the terminal/console
    .WriteTo.File("Logs/app-.log", rollingInterval: RollingInterval.Day)
    // ^^^ Write to daily log files: app-20240115.log, app-20240116.log, etc.
    //     RollingInterval.Day creates a new file each day.
    .CreateBootstrapLogger();

// Wrap everything in try/catch so fatal startup errors are logged
try
{
    Log.Information("Starting Employee Manager API...");

    // ── STEP 2: Create the WebApplication Builder ──────────────────────────
    // This is the starting point for configuring the ASP.NET Core application.
    // builder.Services is the DI (Dependency Injection) container.
    // builder.Configuration reads from appsettings.json.
    var builder = WebApplication.CreateBuilder(args);

    // Replace the default Microsoft logger with Serilog.
    // This reads the Serilog configuration from appsettings.json
    // (minimum level, sinks, output formatting, etc.)
    builder.Host.UseSerilog((context, services, configuration) =>
        configuration.ReadFrom.Configuration(context.Configuration));

    // ── STEP 3: Register Services (Dependency Injection) ───────────────────
    //
    // WHAT IS DI (Dependency Injection)?
    // Instead of classes creating their own dependencies (new EmployeeRepository()),
    // we TELL the DI container what to create, and it provides them automatically.
    //
    // LIFETIMES:
    // - Singleton: ONE instance for the entire application (shared by all requests)
    //   → Good for: data stores, caches, configuration
    //
    // - Scoped: ONE instance per HTTP request (new instance for each request)
    //   → Good for: repositories, services (most business objects)
    //
    // - Transient: NEW instance every time it's requested
    //   → Good for: lightweight, stateless services
    //
    // REGISTRATION ORDER matters conceptually:
    //   DataStore → Repository → Service → Controller (auto-registered)
    //   Each layer depends on the one below it.

    // ── JSON DATA STORES (Singleton) ───────────────────────────────────────
    // One instance per entity type, shared across ALL requests.
    // Singleton ensures the SemaphoreSlim lock inside is shared — preventing
    // file corruption from concurrent writes.
    builder.Services.AddSingleton(new JsonDataStore<Employee>(
        Path.Combine(AppContext.BaseDirectory, "Data", "employees.json")));

    builder.Services.AddSingleton(new JsonDataStore<Document>(
        Path.Combine(AppContext.BaseDirectory, "Data", "documents.json")));
    
    // ^^^ AppContext.BaseDirectory = the folder where the compiled DLL lives.
    //     Path.Combine joins path parts: "bin/Debug/net10.0" + "Data" + "employees.json"

    // ── REPOSITORY LAYER (Scoped) ──────────────────────────────────────────
    // "When someone asks for IEmployeeRepository, give them an EmployeeRepository."
    // This is the core of DI: classes depend on INTERFACES, and we configure
    // which IMPLEMENTATION to use HERE — in one central place.
    builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();

    // ── SERVICE LAYER (Scoped) ─────────────────────────────────────────────
    // Same pattern: interface → implementation.
    builder.Services.AddScoped<IEmployeeService, EmployeeService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
    builder.Services.AddScoped<IDocumentService, DocumentService>();
    
    builder.Services.AddSingleton<IRefreshTokenStore, RefreshTokenStore>();
    builder.Services.AddSingleton<IPasswordResetStore, PasswordResetStore>();
    
    // ── STEP 4: Configure JWT Authentication ───────────────────────────────
    //
    // JWT (JSON Web Token) lets us secure API endpoints WITHOUT server-side sessions.
    //
    // FLOW:
    // 1. User logs in → API generates a signed JWT token
    // 2. React stores the token in localStorage
    // 3. React sends "Authorization: Bearer {token}" with every request
    // 4. This middleware VALIDATES the token on every request to [Authorize] endpoints
    //
    // VALIDATION checks:
    // - Is the token signed with our secret key? (not tampered)
    // - Is the issuer correct? (came from our app)
    // - Is the audience correct? (meant for our app)
    // - Has the token expired? (still valid)

    // Read the JWT secret from appsettings.json
    var jwtSecret = builder.Configuration["Jwt:Secret"]!;

    // Register the JWT Bearer authentication scheme
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    // ^^^ Sets JWT Bearer as the DEFAULT authentication scheme.
    //     When [Authorize] is on a controller, it uses THIS scheme.
        .AddJwtBearer(options =>
        {
            // Configure how tokens are validated
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,              // Check that "iss" claim matches
                ValidateAudience = true,             // Check that "aud" claim matches
                ValidateLifetime = true,             // Check that token hasn't expired
                ValidateIssuerSigningKey = true,     // Verify the signature
                ValidIssuer = builder.Configuration["Jwt:Issuer"],      // Expected issuer: "EmployeeManager"
                ValidAudience = builder.Configuration["Jwt:Audience"],  // Expected audience: "EmployeeManagerApp"
                IssuerSigningKey = new SymmetricSecurityKey(             // The key to verify signatures
                    Encoding.UTF8.GetBytes(jwtSecret))
            };
        });

    // Register the authorization services (enables [Authorize] attribute on controllers)
    builder.Services.AddAuthorization();

    // Register controller services (enables [ApiController] and routing)
    builder.Services.AddControllers();

    // ── STEP 5: Configure CORS ─────────────────────────────────────────────
    //
    // CORS (Cross-Origin Resource Sharing) is a BROWSER SECURITY feature.
    //
    // The problem:
    //   React runs on http://localhost:3000
    //   .NET API runs on http://localhost:5000
    //   Different ports = different "origins"
    //   Browsers BLOCK cross-origin requests by default
    //
    // The solution:
    //   The API explicitly tells the browser: "requests from localhost:3000 are OK"
    //   This is done via special HTTP headers in the response.
    //
    // NOTE: CORS is only enforced by BROWSERS. Tools like Postman or curl ignore it.
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowReactApp", policy =>
        {
            policy.WithOrigins("http://localhost:3000")  // Allow React dev server
                  .AllowAnyHeader()                       // Allow any HTTP header
                  .AllowAnyMethod();                      // Allow GET, POST, PUT, DELETE, etc.
        });
    });

    // ── Build the Application ──────────────────────────────────────────────
    // At this point, all services are registered and the DI container is finalized.
    var app = builder.Build();

    // ── STEP 6: Seed Default Data ──────────────────────────────────────────
    // Create a default admin user so someone can log in on first run.
    //
    // CreateScope() is needed because AuthService is registered as Scoped,
    // meaning it needs a "scope" (like an HTTP request context) to be created.
    // We create a temporary scope just for this operation.
    using (var scope = app.Services.CreateScope())
    {
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
        await authService.SeedDefaultUserAsync();
    }
    // 'using' ensures the scope is disposed (cleaned up) after seeding.

    // ── STEP 7: Configure Middleware Pipeline ──────────────────────────────
    //
    // MIDDLEWARE is code that runs for EVERY HTTP request, in ORDER.
    // Think of it as a series of checkpoints a request must pass through.
    //
    // ORDER MATTERS! Each middleware sees the request, optionally modifies it,
    // then passes it to the next middleware. The order below is standard:
    //
    //   Request → Serilog → CORS → Authentication → Authorization → Controller
    //   Response ← Serilog ← CORS ← Authentication ← Authorization ← Controller

    // Log every HTTP request (method, URL, status code, duration)
    app.UseSerilogRequestLogging();

    // Serve static files (the React production build) from wwwroot/
    // IMPORTANT: These MUST come BEFORE routing/auth/controllers.
    // If placed after MapControllers, static file requests would unnecessarily
    // go through the auth pipeline and potentially get 401'd.
    // UseDefaultFiles serves index.html for the root URL ("/")
    // UseStaticFiles serves CSS, JS, images, etc.
    // The static-file middleware binds its file provider ONCE, here. If wwwroot
    // doesn't exist at this moment, ASP.NET binds a null provider and serves 404
    // for everything underneath — even files written there later (e.g. uploaded
    // avatars). Worse, WebRootPath may already be cached as null from build time.
    // So create the folder and hand UseStaticFiles an explicit provider.
    var webRoot = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
    Directory.CreateDirectory(Path.Combine(webRoot, "avatars"));
    var webRootProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(webRoot);

    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = webRootProvider });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = webRootProvider });

    // Check CORS headers (allow/deny cross-origin requests)
    app.UseCors("AllowReactApp");

    // Validate JWT tokens in the Authorization header
    app.UseAuthentication();

    // Check [Authorize] attributes on controllers/actions
    app.UseAuthorization();

    // Map incoming URLs to controller action methods
    // e.g., GET /api/employee → EmployeeController.GetAll()
    app.MapControllers();

    Log.Information("Employee Manager API is running on http://localhost:5000");

    // Start the web server and listen for HTTP requests on port 5000.
    // This call BLOCKS — the app runs until you press Ctrl+C or it crashes.
    app.Run("http://localhost:5000");
}
catch (Exception ex)
{
    // If the application fails to start (e.g., port in use, config error),
    // log the fatal error before the process exits.
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    // Ensure all buffered log messages are written to their destinations
    // before the process exits. Without this, the last few log messages
    // might be lost.
    Log.CloseAndFlush();
}
