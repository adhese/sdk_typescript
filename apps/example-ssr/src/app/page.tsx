"use client";
import { fetchAds } from "@adhese/sdk/server";
import { AdSlot } from "./components/AdSlot";

export default async function Home(): Promise<React.ReactNode> {
  const ads = await fetchAds({
    account: "delhaizetest",
    location: "delhaize-be_category",
    slots: [
      {
        format: "flex",
        slot: "",
      },
    ],
    timeout: 2000,
  });

  console.log(ads, null, 2);

  return (
    <main>
      <h1>Adhese SDK - Next.js SSR Example</h1>
      <p className="description">
        This page demonstrates server-side rendering with{" "}
        <code>fetchAds()</code> and client-side hydration with impression
        tracking.
      </p>

      <div className="ad-container">
        {ads.length > 0 ? (
          ads.map((ad) => <AdSlot key={ad.slotName} ad={ad} />)
        ) : (
          <p>
            No ads available. The server may have timed out or there are no
            campaigns.
          </p>
        )}
      </div>
    </main>
  );
}
