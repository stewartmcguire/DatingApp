using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class Seed
{
    public static async Task SeedUsers(UserManager<AppUser> userManager)
    {
        if (await userManager.Users.AnyAsync()) return;

        var memberData = await File.ReadAllTextAsync("Data/UserSeedData.json");
        var members = JsonSerializer.Deserialize<List<SeedUserDto>>(memberData);

        if (members == null)
        {
            Console.WriteLine("No members found in the seed data.");
            return;
        }

        foreach (var member in members)
        {
            var user = new AppUser
            {
                Id = member.Id,
                Email = member.Email,
                UserName = member.Email,
                DisplayName = member.DisplayName,
                ImageUrl = member.ImageUrl,
                Member = new Member
                {
                    Id = member.Id,
                    DisplayName = member.DisplayName,
                    Description = member.Description,
                    DateOfBirth = member.DateOfBirth,
                    ImageUrl = member.ImageUrl,
                    Gender = member.Gender,
                    City = member.City,
                    Country = member.Country,
                    Created = member.Created
                }
            };

            user.Member.Photos.Add(new Photo
            {
                Url = member.ImageUrl!,
                MemberId = member.Id
            });

            var result1 = await userManager.CreateAsync(user, "Pa$$w0rd");
            if (!result1.Succeeded)
            {
                Console.WriteLine($"Failed to create user {user.UserName}: {string.Join(", ", result1.Errors.Select(e => e.Description))}");
                continue;
            }
            await userManager.AddToRoleAsync(user, "Member");
        }

        var admin = new AppUser
        {
            Email = "admin@test.com",
            UserName = "admin@test.com",
            DisplayName = "Admin"
        };

        var result = await userManager.CreateAsync(admin, "Pa$$w0rd");
        if (!result.Succeeded)
        {
            Console.WriteLine($"Failed to create user {admin.UserName}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }
        await userManager.AddToRolesAsync(admin, ["Admin", "Moderator"]);
    }
}