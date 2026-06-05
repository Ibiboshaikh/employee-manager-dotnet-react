using EmployeeManager.Domain.Models;
using EmployeeManager.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EmployeeManager.Extensions;

namespace EmployeeManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IEmployeeRepository _employeeRepository;
        
        public ProfileController(IEmployeeRepository employeeRepository)
        {
            _employeeRepository = employeeRepository;
        }

        [HttpGet]
        public async Task<ActionResult<Employee>> GetMe()
        {
            var userName = User.GetUsername();
            if(string.IsNullOrEmpty(userName))
            {
                return Unauthorized();
            }

            var me = await _employeeRepository.GetByUsernameAsync(userName);
            if (me == null)
            {
                return NotFound();
            }
            me.PasswordHash = null; // Don't return the password hash
            return Ok(me);
        }

        [HttpPut]
        public async Task<ActionResult<Employee>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userName = User.GetUsername();
            if(string.IsNullOrEmpty(userName))
            {
                return Unauthorized();
            }

            var me = await _employeeRepository.GetByUsernameAsync(userName);
            if (me == null)
            {
                return NotFound();
            }

            me.PhoneNumber = request.PhoneNumber ?? me.PhoneNumber;
            me.FirstName = request.FirstName ?? me.FirstName;
            me.LastName = request.LastName ?? me.LastName;

            await _employeeRepository.UpdateAsync(me);

            me.PasswordHash = null; // Don't return the password hash
            return Ok(me);
        }

        [HttpPost("Avatar")]
        public async Task<ActionResult> UploadAvatar(IFormFile file, [FromServices] IWebHostEnvironment env)
        {
            var userName = User.GetUsername();
            if(string.IsNullOrEmpty(userName))
            {
                return Unauthorized();
            }

            if(file is null || file.Length == 0)
            {
                return BadRequest(new {message="No file uploaded."});
            }

            if (file.Length > 3_000_000)   // 3 MB
            {
                return BadRequest(new { message = "File too large (max 3MB)." });   
            }

            if (!file.ContentType.StartsWith("image/"))
            {
                return BadRequest(new { message = "Only image files allowed." });
            }

            var me = await _employeeRepository.GetByUsernameAsync(userName);
            if (me == null)
            {
                return NotFound();
            }

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var avatarsDir = Path.Combine(env.WebRootPath ?? "wwwroot", "avatars");
            Directory.CreateDirectory(avatarsDir);

            var fileName = $"{me.Id}{ext}";
            var fullPath = Path.Combine(avatarsDir, fileName);

            await using (var stream =  System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            me.AvatarUrl = $"/avatars/{fileName}";
            await _employeeRepository.UpdateAsync(me);

            me.PasswordHash = null; // Don't return the password hash
            return Ok(me);
        }
    }
}