import { Octokit } from 'octokit';

const GITHUB_OWNER = 'adrgarcha';
const GITHUB_REPO = 'discord-bot';

const octokit = new Octokit();

export interface GitHubRelease {
   id: number;
   tagName: string;
   name: string;
   body: string;
   htmlUrl: string;
   publishedAt: string;
}

export async function fetchLatestRelease(): Promise<GitHubRelease | null> {
   try {
      const { data } = await octokit.rest.repos.getLatestRelease({
         owner: GITHUB_OWNER,
         repo: GITHUB_REPO,
      });

      return {
         id: data.id,
         tagName: data.tag_name,
         name: data.name || data.tag_name,
         body: data.body || 'Sin notas de parche disponibles.',
         htmlUrl: data.html_url,
         publishedAt: data.published_at || new Date().toISOString(),
      } satisfies GitHubRelease;
   } catch (error) {
      console.error(`Error al obtener el último release de GitHub: ${error}`);
      return null;
   }
}
