namespace TodoAppFrontend.Models;

public class TodoItem
{
   public int Id { get; set; }
    public string Title { get; set; } = "";
    public bool Completed { get; set; }
    public int Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    
    public string? GroupName { get; set; }

    public int? UserId { get; set; }
}
