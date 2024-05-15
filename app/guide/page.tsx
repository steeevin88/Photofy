import Header from "@/components/Header";

export default function Guide() {
  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        Guide
      </Header>
      <div className="p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Quick Guide</h2>
        <div className="text-white mb-4">
          <h3 className="text-xl font-semibold mb-2">1. Login</h3>
          <p>Login with your Spotify credentials to get started.</p>
        </div>
        <div className="text-white mb-4">
          <h3 className="text-xl font-semibold mb-2">2. Create a Playlist</h3>
          <p>Click on the &quot;+&quot; icon to create a new playlist. Fill in the required fields: playlist visibility, title, description, and upload an image.</p>
        </div>
        <div className="text-white mb-4">
          <h3 className="text-xl font-semibold mb-2">3. View Playlists</h3>
          <p>After creating a playlist, you can view it on the dashboard. Click on &quot;Home&quot; to see all public playlists that Photofy has created. Click on your playlists in the sidebar or the mainpage to view the songs in each playlist.</p>
        </div>
      </div>
    </div>
  );
}
