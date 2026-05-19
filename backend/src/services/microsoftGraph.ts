import axios from 'axios';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

export class MicrosoftGraphService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async get(endpoint: string) {
    const response = await axios.get(`${GRAPH_ENDPOINT}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.data;
  }

  async getEmails(top: number = 50) {
    return this.get(`/me/messages?$top=${top}&$select=subject,from,receivedDateTime,bodyPreview`);
  }

  async getTeamsMessages() {
    // Note: Fetching all messages from all channels/chats can be complex.
    // This is a simplified version that fetches recent chats.
    return this.get('/me/chats?$expand=messages($top=20)');
  }

  async getRecentChannelMessages() {
    // This would ideally iterate through joined teams and channels.
    // For MVP, we'll focus on chats or a specific set of channels if provided.
    const joinedTeams = await this.get('/me/joinedTeams');
    const messages = [];
    
    for (const team of joinedTeams.value.slice(0, 3)) { // Limit to 3 teams for brevity
      const channels = await this.get(`/teams/${team.id}/channels`);
      for (const channel of channels.value.slice(0, 2)) {
        const channelMessages = await this.get(`/teams/${team.id}/channels/${channel.id}/messages?$top=20`);
        messages.push({
          teamName: team.displayName,
          channelName: channel.displayName,
          messages: channelMessages.value
        });
      }
    }
    return messages;
  }
}
