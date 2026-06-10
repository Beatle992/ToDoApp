using Microsoft.AspNetCore.Mvc;
using TodoAppApi.Models;
using TodoAppApi.Services;

namespace TodoAppApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodosController : ControllerBase
{
    private readonly TodoService _service;

    public TodosController(TodoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAll());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var todo = await _service.GetById(id);

        if (todo == null)
            return NotFound();

        return Ok(todo);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Todo todo)
    {
        Console.WriteLine($"RECEIVED GROUP: {todo.GroupName}");
    
        var created = await _service.Create(todo);
    
        return CreatedAtAction(
            nameof(GetById),
            new { id = created.Id },
            created
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Todo todo)
    {
        var updated = await _service.Update(id, todo);

        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.Delete(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
