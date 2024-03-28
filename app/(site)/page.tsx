import getPlaylists from "@/actions/getPlaylists";
import Header from "@/components/Header";
import PageContent from "./components/PageContent";

export const revalidate = 0;

export default async function Home() {
  const playlists = await getPlaylists();

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="mb-2">
          <h1 className="text-white text-3xl font-semibold">
            Welcome Back to Photofy!
          </h1>
        </div>
      </Header>
      <div className="mt-2 mb-7 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-semibold">Newest Playlists</h1>
        </div>
        <PageContent playlists={playlists}/>
      </div>
    </div>
  );
}
