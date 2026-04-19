import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import {
  getAllCompanions,
  getRecentSessions,
} from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import { isLocalStorageMode } from "@/lib/data-mode";
import HomeLocalMode from "@/components/local/HomeLocalMode";

const Page = async () => {
  if (isLocalStorageMode) {
    return <HomeLocalMode />;
  }

  const [companionsResult, recentSessionsResult] = await Promise.allSettled([
    getAllCompanions({ limit: 3 }),
    getRecentSessions(10),
  ]);

  const companions =
    companionsResult.status === "fulfilled" ? companionsResult.value : [];
  const recentSessionsCompanions =
    recentSessionsResult.status === "fulfilled"
      ? recentSessionsResult.value
      : [];
  const hasSupabaseError =
    companionsResult.status === "rejected" ||
    recentSessionsResult.status === "rejected";

  return (
    <main>
      <h1>Popular Companions</h1>

      {hasSupabaseError && (
        <section className="home-section">
          <div className="rounded-xl border border-amber-400/30 bg-amber-50 p-4 text-sm text-amber-900">
            The Supabase backend is currently unavailable, so live companion
            data cannot load right now. Check that the project at your Supabase
            URL is active and that the environment variables in .env.local are
            correct.
          </div>
        </section>
      )}

      <section className="home-section">
        {companions.map((companion) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>

      <section className="home-section">
        <CompanionsList
          title="Recently completed sessions"
          companions={recentSessionsCompanions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
};

export default Page;
