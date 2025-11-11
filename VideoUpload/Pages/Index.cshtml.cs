using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace VideoUpload.Pages;

public class IndexModel : PageModel
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(IWebHostEnvironment environment, ILogger<IndexModel> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public List<VideoFileInfo> VideoFiles { get; set; } = new();

    public void OnGet()
    {
        LoadVideoFiles();
    }

    private void LoadVideoFiles()
    {
        var mediaPath = Path.Combine(_environment.WebRootPath, "media");
        if (Directory.Exists(mediaPath))
        {
            var files = Directory.GetFiles(mediaPath, "*.mp4");
            VideoFiles = files.Select(f => new VideoFileInfo
            {
                FileName = Path.GetFileName(f),
                FileSize = new FileInfo(f).Length
            }).OrderBy(f => f.FileName).ToList();
        }
    }
}

public class VideoFileInfo
{
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
}
