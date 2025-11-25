import VideoFeed from "@/components/videos/VideoFeed";
import { getVideos, getArtistsForVideos } from "@/lib/actions/video.actions";
import { getActiveUsers } from "@/lib/actions/user.actions";

export default async function Home() {
  const initialVideos = await getVideos({});
  const allUsers = await getActiveUsers();
  const initialArtists = getArtistsForVideos(initialVideos, allUsers);
  
  return <VideoFeed initialVideos={initialVideos} initialArtists={initialArtists} />;
}
