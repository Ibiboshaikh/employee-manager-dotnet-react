using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EmployeeManager.Application.Services;
using Microsoft.AspNetCore.Authorization;
using EmployeeManager.Extensions;

namespace EmployeeManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    private (string userName, string role) Caller()
    {
        var u = User.GetUsername();
        var r = User.FindFirstValue(ClaimTypes.Role) ?? "Employee";
        return (u!, r!);
    }

    [HttpGet("mine")]
    public async Task<IActionResult> ListMine()
    {
        var (u, _) = Caller();
        return Ok(await _documentService.ListMineAsync(u));
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ListAll() => Ok(await _documentService.ListAllAsync());
    
    [HttpPost]
    [RequestSizeLimit(10_000_000)]   // hard cap at the framework level
    public async Task<IActionResult> Upload(IFormFile file)
    {
        var (u, _) = Caller();
        var result = await _documentService.UploadAsync(u, file);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Document);
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var (u, r) = Caller();
        var (bytes, doc) = await _documentService.DownloadAsync(u, r, id);
        if (bytes is null || doc is null)
            return NotFound();
        return File(bytes, doc.ContentType, doc.FileName);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var (u, r) = Caller();
        var result = await _documentService.DeleteAsync(u, r, id);
        if (!result.Success)
            return result.Error == "Forbidden." ? Forbid() : NotFound();
        return NoContent();
    }
}