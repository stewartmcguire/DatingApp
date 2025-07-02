using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]     // localhost:5001/api/members
    [ApiController]
    public class MembersController(AppDbContext context) : ControllerBase
    {
        private readonly AppDbContext _context = context;

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppUser>>> GetMembers()
        {
            var members = await _context.Users.ToListAsync();
            return Ok(members);
        }

        [HttpGet("{id}")]     // localhost:5001/api/members/john-id
        public async Task<ActionResult<AppUser>> GetMember(string id)
        {
            var member = await _context.Users.FindAsync(id);
            if (member == null) return NotFound();
            return Ok(member);
        }
    }
}
