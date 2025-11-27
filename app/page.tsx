import VideoFeed from "@/components/videos/VideoFeed";
import { getVideos, getArtistsForVideos } from "@/lib/actions/video.actions";
import { getActiveUsers } from "@/lib/actions/user.actions";

// This page now primarily serves to provide initial data for the first load.
// The client-side VideoFeed component will take over data fetching based on user interaction.
export default async function Home() {
  const initialVideos = await getVideos({ category: 'music', limit: 10 });
  const allUsers = await getActiveUsers();
  const initialArtists = getArtistsForVideos(initialVideos, allUsers);
  
  return <VideoFeed initialVideos={initialVideos} initialArtists={initialArtists} />;
}
