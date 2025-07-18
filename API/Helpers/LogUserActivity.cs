using System;
using API.Data;
using API.Extensions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace API.Helpers;

public class LogUserActivity : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var resultContext = await next(); // Execute the action

        if (resultContext.HttpContext.User.Identity?.IsAuthenticated != true) return;

        // Log user activity here, e.g., update last active time
        var userId = resultContext.HttpContext.User.GetMemberId();
        var dbContext = resultContext.HttpContext.RequestServices
            .GetRequiredService<AppDbContext>();
        await dbContext.Members
            .Where(m => m.Id == userId)
            .ExecuteUpdateAsync(m => m.SetProperty(x => x.LastActive, DateTime.UtcNow));

    }
}
