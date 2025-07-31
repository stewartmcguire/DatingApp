using System;
using System.Data.Common;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Member> Members { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<MemberLike> Likes { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<Connection> Connections { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<IdentityRole>()
            .HasData(
                new IdentityRole { Id = "member-id", Name = "Member", NormalizedName = "MEMBER" },
                new IdentityRole { Id = "moderator-id", Name = "Moderator", NormalizedName = "MODERATOR" },
                new IdentityRole { Id = "admin-id", Name = "Admin", NormalizedName = "ADMIN" }
            );

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Recipient)
            .WithMany(m => m.MessagesReceived)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(m => m.MessagesSent)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MemberLike>()
            .HasKey(l => new { l.SourceMemberId, l.TargetMemberId });
        modelBuilder.Entity<MemberLike>()
            .HasOne(l => l.SourceMember)
            .WithMany(t => t.LikedMembers)
            .HasForeignKey(s => s.SourceMemberId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<MemberLike>()
            .HasOne(l => l.TargetMember)
            .WithMany(t => t.LikedByMembers)
            .HasForeignKey(s => s.TargetMemberId)
            .OnDelete(DeleteBehavior.NoAction);


        var dateTimeCoverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
        );

        var nullableDateTimeCoverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? v.Value.ToUniversalTime() : null,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null
        );

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeCoverter);
                }
                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(nullableDateTimeCoverter);
                }
            }
        }

    }
}
