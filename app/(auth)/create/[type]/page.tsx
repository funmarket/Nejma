import CreateProfileForm from "@/components/auth/CreateProfileForm";

export default function CreateProfilePage({ params }: { params: { type: string } }) {
  const { type } = params;

  if (!['fan', 'artist', 'business'].includes(type)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid profile type.</p>
      </div>
    );
  }

  return <CreateProfileForm accountType={type as 'fan' | 'artist' | 'business'} />;
}
