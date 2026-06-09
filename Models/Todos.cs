using System.ComponentModel.DataAnnotations.Schema;

namespace TodoAppApi.Models;

[Table("todos")]
public class Todo
{
    [Column("id")]
    public int Id { get; set; }

    [Column("title")]
    public string Title { get; set; } = "";

    [Column("completed")]
    public bool Completed { get; set; }

    [Column("priority")]
    public int Priority { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("due_date")]
    public DateTime? DueDate { get; set; }

    [Column("group_name")]
    public string GroupName { get; set; } ;
}
