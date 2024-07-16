import { AutocompleteInteraction, ChatInputCommandInteraction, Client, Collection, SlashCommandBuilder } from 'discord.js';

export interface CustomClient extends Client<true> {
   commands: Collection<string, Command>;
}

export interface Command {
   data: SlashCommandBuilder;
   run: (props: CommandProps) => Promise<void>;
   autocomplete?: (props: AutocompleteProps) => Promise<void>;
}

export interface CommandProps {
   client: Client;
   interaction: ChatInputCommandInteraction;
}

export interface AutocompleteProps {
   interaction: AutocompleteInteraction;
}

export interface Event {
   default: (...args: any) => void;
}
