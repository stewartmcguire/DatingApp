using System;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MessageRepository(AppDbContext context) : IMessageRepository
{
    public void AddGroup(Group group)
    {
        context.Groups.Add(group);
    }

    public void AddMessage(Message message)
    {
        context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        context.Messages.Remove(message);
    }

    public async Task<Connection?> GetConnection(string connectionId)
    {
        return await context.Connections.FindAsync(connectionId);
    }

    public async Task<Group?> GetGroupForConnection(string connectionId)
    {
        return await context.Groups
            .Include(g => g.Connections)
            .Where(g => g.Connections.Any(c => c.ConnectionId == connectionId))
            .FirstOrDefaultAsync();
    }

    public async Task<Message?> GetMessage(string messageId)
    {
        return await context.Messages.FindAsync(messageId);
    }

    public async Task<Group?> GetMessageGroup(string groupName)
    {
        return await context.Groups
            .Include(g => g.Connections)
            .FirstOrDefaultAsync(g => g.Name == groupName);
    }

    public async Task<PaginatedResult<MessageDto>> GetMessagesForMember(MessageParams messageParams)
    {
        var query = context.Messages
            .OrderByDescending(m => m.MessageSent)
            .AsQueryable();

        query = messageParams.Container switch
        {
            "Outbox" => query.Where(m => m.SenderId == messageParams.MemberId && m.SenderDeleted == false),
            _ => query.Where(m => m.RecipientId == messageParams.MemberId && m.RecipientDeleted == false)
        };

        var messagesQuery = query
            .Select(MessageExtensions.ToDtoProjection());

        return await PaginationHelper.CreateAsync(messagesQuery, messageParams.PageNumber, messageParams.PageSize);
    }

    public async Task<IReadOnlyList<MessageDto>> GetMessageThread(string currentMemberId, string recipientId)
    {
        // Mark any messages not read as read
        await context.Messages
            .Where(m => m.RecipientId == currentMemberId && m.SenderId == recipientId
                && m.DateRead == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(m => m.DateRead, DateTime.UtcNow));

        return await context.Messages
            .Where(m => (m.RecipientId == currentMemberId && m.RecipientDeleted == false && m.SenderId == recipientId)
                || (m.SenderId == currentMemberId && m.SenderDeleted == false && m.RecipientId == recipientId))
            .OrderBy(m => m.MessageSent)
            .Select(MessageExtensions.ToDtoProjection())
            .ToListAsync();
    }

    public async Task RemoveConnection(string connectionId)
    {
        await context.Connections
            .Where(c => c.ConnectionId == connectionId)
            .ExecuteDeleteAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }
}
