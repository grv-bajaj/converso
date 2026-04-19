import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getUserCompanions,
  getUserSessions,
  getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import Image from "next/image";
import CompanionsList from "@/components/CompanionsList";
import { isLocalStorageMode } from "@/lib/data-mode";
import MyJourneyLocalMode from "@/components/local/MyJourneyLocalMode";

const Profile = async () => {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  if (isLocalStorageMode) {
    return (
      <MyJourneyLocalMode
        user={{
          id: user.id,
          firstName: user.firstName ?? "Student",
          lastName: user.lastName ?? "",
          imageUrl: user.imageUrl,
          emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
        }}
      />
    );
  }

  const [companionsResult, sessionHistoryResult, bookmarkedCompanionsResult] =
    await Promise.allSettled([
      getUserCompanions(user.id),
      getUserSessions(user.id),
      getBookmarkedCompanions(user.id),
    ]);

  const companions =
    companionsResult.status === "fulfilled" ? companionsResult.value : [];
  const sessionHistory =
    sessionHistoryResult.status === "fulfilled"
      ? sessionHistoryResult.value
      : [];
  const bookmarkedCompanions =
    bookmarkedCompanionsResult.status === "fulfilled"
      ? bookmarkedCompanionsResult.value
      : [];
  const hasSupabaseError =
    companionsResult.status === "rejected" ||
    sessionHistoryResult.status === "rejected" ||
    bookmarkedCompanionsResult.status === "rejected";

  return (
    <main className="min-lg:w-3/4">
      {hasSupabaseError && (
        <section className="mb-6 rounded-xl border border-amber-400/30 bg-amber-50 p-4 text-sm text-amber-900">
          The Supabase backend is currently unavailable or misconfigured, so
          your journey data could not load. Check that the project is active and
          that the Supabase environment variables are correct.
        </section>
      )}

      <section className="flex justify-between gap-4 max-sm:flex-col items-center">
        <div className="flex gap-4 items-center">
          <Image
            src={user.imageUrl}
            alt={user.firstName!}
            width={110}
            height={110}
          />
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.emailAddresses[0].emailAddress}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="border border-black rouded-lg p-3 gap-2 flex flex-col h-fit">
            <div className="flex gap-2 items-center">
              <Image
                src="/icons/check.svg"
                alt="checkmark"
                width={22}
                height={22}
              />
              <p className="text-2xl font-bold">{sessionHistory.length}</p>
            </div>
            <div>Lessons completed</div>
          </div>
          <div className="border border-black rouded-lg p-3 gap-2 flex flex-col h-fit">
            <div className="flex gap-2 items-center">
              <Image src="/icons/cap.svg" alt="cap" width={22} height={22} />
              <p className="text-2xl font-bold">{companions.length}</p>
            </div>
            <div>Companions created</div>
          </div>
        </div>
      </section>
      <Accordion type="multiple">
        <AccordionItem value="bookmarks">
          <AccordionTrigger className="text-2xl font-bold">
            Bookmarked Companions {`(${bookmarkedCompanions.length})`}
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList
              companions={bookmarkedCompanions}
              title="Bookmarked Companions"
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="recent">
          <AccordionTrigger className="text-2xl font-bold">
            Recent Sessions
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList
              title="Recent Sessions"
              companions={sessionHistory}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="companions">
          <AccordionTrigger className="text-2xl font-bold">
            My Companions {`(${companions.length})`}
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList title="My Companions" companions={companions} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
};
export default Profile;
