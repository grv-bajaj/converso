import { getAllCompanions } from "@/lib/actions/companion.actions";
import CompanionCard from "@/components/CompanionCard";
import { getSubjectColor } from "@/lib/utils";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import Link from "next/link";
import Image from "next/image";
import { isLocalStorageMode } from "@/lib/data-mode";
import CompanionsLibraryLocalMode from "@/components/local/CompanionsLibraryLocalMode";

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
  if (isLocalStorageMode) {
    return <CompanionsLibraryLocalMode />;
  }

  const filters = await searchParams;
  const subject = filters.subject ? filters.subject : "";
  const topic = filters.topic ? filters.topic : "";

  const companionsResult = await getAllCompanions({ subject, topic }).then(
    (companions) => ({ status: "fulfilled" as const, companions }),
    (error) => ({ status: "rejected" as const, error }),
  );

  return (
    <main>
      <section className="flex justify-between gap-4 max-sm:flex-col">
        <h1>Companion Library</h1>
        <div className="flex gap-4 max-sm:flex-wrap max-sm:items-stretch">
          <Link
            href="/companions/new"
            className="btn-primary h-10 rounded-full px-5 font-semibold whitespace-nowrap"
          >
            <Image src="/icons/plus.svg" alt="plus" width={12} height={12} />
            Build a New Companion
          </Link>
          <SearchInput />
          <SubjectFilter />
        </div>
      </section>
      {companionsResult.status === "rejected" && (
        <section className="my-6 rounded-xl border border-amber-400/30 bg-amber-50 p-4 text-sm text-amber-900">
          The Supabase backend is currently unavailable, so the library cannot
          load. Check your Supabase project status and environment variables.
        </section>
      )}
      <section className="companions-grid">
        {(companionsResult.status === "fulfilled"
          ? companionsResult.companions
          : []
        ).map((companion) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>
    </main>
  );
};

export default CompanionsLibrary;
