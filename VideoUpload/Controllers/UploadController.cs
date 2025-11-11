using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace VideoUpload.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<UploadController> _logger;
    private const long MaxFileSize = 200 * 1024 * 1024; // 200MB

    public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    [HttpPost]
    [RequestSizeLimit(MaxFileSize)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<IActionResult> UploadFiles(IFormFileCollection files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(new { error = "No files provided" });
        }

        var mediaPath = Path.Combine(_environment.WebRootPath, "media");
        if (!Directory.Exists(mediaPath))
        {
            Directory.CreateDirectory(mediaPath);
        }

        var errors = new List<string>();
        var uploadedFiles = new List<string>();

        foreach (var file in files)
        {
            // Validate file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (extension != ".mp4")
            {
                errors.Add($"{file.FileName} is not an MP4 file");
                continue;
            }

            // Validate file size
            if (file.Length > MaxFileSize)
            {
                errors.Add("Please check file issue before uploading");
                continue;
            }

            try
            {
                var filePath = Path.Combine(mediaPath, file.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                uploadedFiles.Add(file.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file {FileName}", file.FileName);
                errors.Add($"Error uploading {file.FileName}: {ex.Message}");
            }
        }

        if (errors.Count > 0 && uploadedFiles.Count == 0)
        {
            // If there are file size errors, show the specific message
            if (errors.Any(e => e.Contains("check file issue")))
            {
                return BadRequest(new { error = "Please check file issue before uploading" });
            }
            return BadRequest(new { error = string.Join(", ", errors) });
        }

        return Ok(new 
        { 
            message = "Upload successful",
            uploadedFiles = uploadedFiles,
            errors = errors
        });
    }

    [HttpGet]
    public IActionResult GetCatalogue()
    {
        var mediaPath = Path.Combine(_environment.WebRootPath, "media");
        if (!Directory.Exists(mediaPath))
        {
            return Ok(new { videoFiles = new List<object>() });
        }

        var files = Directory.GetFiles(mediaPath, "*.mp4");
        var videoFiles = files.Select(f => new
        {
            fileName = Path.GetFileName(f),
            fileSize = new FileInfo(f).Length
        }).OrderBy(f => f.fileName).ToList();

        return Ok(new { videoFiles = videoFiles });
    }
}
