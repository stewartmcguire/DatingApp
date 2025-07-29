using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class MessagesController(IMessageRepository messageRepository, IMemberRepository memberRepository) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var sender = await memberRepository.GetMemberByIdAsync(User.GetMemberId());
        var recipient = await memberRepository.GetMemberByIdAsync(createMessageDto.RecipientId);

        if (recipient == null || sender == null || sender.Id == createMessageDto.RecipientId)
        {
            return BadRequest("Cannot send this message");
        }

        var message = new Message
        {
            SenderId = sender.Id,
            RecipientId = recipient.Id,
            Content = createMessageDto.Content
        };
        messageRepository.AddMessage(message);

        if (await messageRepository.SaveAllAsync())
        {
            return Ok(message.ToDto());
        }
        return BadRequest("Failed to send message");
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MessageDto>>> GetMessagesByContainer(
        [FromQuery] MessageParams messageParams
    )
    {
        messageParams.MemberId = User.GetMemberId();
        var messages = await messageRepository.GetMessagesForMember(messageParams);
        return Ok(messages);
    }

    [HttpGet("thread/{recipientId}")]
    public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetMessageThread(string recipientId)
    {
        var currentMemberId = User.GetMemberId();
        var messages = await messageRepository.GetMessageThread(currentMemberId, recipientId);
        return Ok(messages);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(string id)
    {
        var memberId = User.GetMemberId();
        var message = await messageRepository.GetMessage(id);
        if (message == null)
        {
            return BadRequest("Message not found");
        }

        if (message.SenderId != memberId && message.RecipientId != memberId)
        {
            return BadRequest("You cannot delete this message");
        }
        if (message.SenderId == memberId) message.SenderDeleted = true;
        if (message.RecipientId == memberId) message.RecipientDeleted = true;
        if (message is { SenderDeleted: true, RecipientDeleted: true })
        {
            messageRepository.DeleteMessage(message);
        }
        if (await messageRepository.SaveAllAsync())
        {
            return Ok();
        }
        return BadRequest("Failed to delete message");
    }
}
