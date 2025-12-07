import { ApiClient, HelixStream } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';

const clientId = process.env.TWITCH_CLIENT_ID!;
const clientSecret = process.env.TWITCH_SECRET!;

const authProvider = new AppTokenAuthProvider(clientId, clientSecret);

const twitch = new ApiClient({ authProvider });

export async function getTwitchChannelStream(channelName: string): Promise<HelixStream | null> {
   try {
      const user = await twitch.users.getUserByName(channelName);

      if (!user) {
         throw new Error(`User ${channelName} not found`);
      }

      const stream = await twitch.streams.getStreamByUserId(user.id);
      return stream;
   } catch (error) {
      console.error(`Error fetching stream for channel ${channelName}:`, error);
      throw error;
   }
}
