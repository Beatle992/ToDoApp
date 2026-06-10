using Microsoft.EntityFrameworkCore;
using TodoAppApi.Models;

namespace TodoAppApi.Data;

    public DbSet<Todo> Todos { get; set; }
}
