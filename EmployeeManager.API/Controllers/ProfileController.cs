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
    }
}