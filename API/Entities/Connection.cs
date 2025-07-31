using System;

namespace API.Entities;

public class Connection(string connectionId, string userId)
{
    public string ConnectionId { get; set; } = connectionId;
    public string UserId { get; set; } = userId;

    // Navigation property for the group this connection belongs to
    public Group Group { get; set; } = null!;
}
