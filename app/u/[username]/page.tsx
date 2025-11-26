import UserProfile from "@/components/profile/UserProfile";
import { getUserByUsername } from "@/lib/actions/user.actions";
import { getVideosForArtist } from "@/lib/actions/video.actions";

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const user = await getUserByUsername(username);
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>User not found.</p>
      </div>
    );
  }

  const videos = await getVideosForArtist(user.userId);

  return <UserProfile profileUser={user} videos={videos} />;
}
