using Microsoft.EntityFrameworkCore;
using TodoAppApi.Data;
using TodoAppApi.Models;

namespace TodoAppApi.Services;

public class TodoService
{
    private readonly AppDbContext _db;

    public TodoService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Todo>> GetAll()
        => await _db.Todos.ToListAsync();

    public async Task<Todo?> GetById(int id)
        => await _db.Todos.FirstOrDefaultAsync(t => t.Id == id);

    public async Task<Todo> Create(Todo todo)
    {
        _db.Todos.Add(todo);
        await _db.SaveChangesAsync();
        return todo;
    }

    public async Task<bool> Delete(int id)
    {
        var todo = await _db.Todos.FindAsync(id);
        if (todo == null) return false;

        _db.Todos.Remove(todo);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> Update(int id, Todo updated)
    {
        var todo = await _db.Todos.FindAsync(id);
        if (todo == null) return false;

        todo.Title = updated.Title;
        todo.Completed = updated.Completed;
        todo.Priority = updated.Priority;

        await _db.SaveChangesAsync();
        return true;
    }
}
