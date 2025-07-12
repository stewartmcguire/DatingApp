using System;
using System.Security.Claims;
using Microsoft.AspNetCore.StaticAssets;

namespace API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetMemberId(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new Exception("User does not have a member ID.");
    }
}
