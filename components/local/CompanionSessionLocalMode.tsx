"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CompanionComponent from "@/components/CompanionComponent";
import { getSubjectColor } from "@/lib/utils";
import { getBrowserCompanion } from "@/lib/browser-local-db";

type CompanionSessionLocalModeProps = {
  companionId: string;
  user: {
    id: string;
    firstName: string;
    imageUrl: string;
  };
};

const CompanionSessionLocalMode = ({
  companionId,
  user,
}: CompanionSessionLocalModeProps) => {
  const router = useRouter();
  const [companion, setCompanion] = useState<any | null>(null);

  useEffect(() => {
    const entry = getBrowserCompanion(companionId, user.id);

    if (!entry) {
      router.replace("/companions");
      return;
    }

    setCompanion(entry);
  }, [companionId, router, user.id]);

  if (!companion) {
    return (
      <main>
        <section className="flex justify-center py-20">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-6 py-4 shadow-sm">
            <span className="size-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="size-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="size-3 rounded-full bg-primary animate-bounce" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <article className="flex rounded-border dark:border-white justify-between p-6 max-md:flex-col">
        <div className="flex items-center gap-2">
          <div
            className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden"
            style={{ backgroundColor: getSubjectColor(companion.subject) }}
          >
            <Image
              src={`/icons/${companion.subject}.svg`}
              alt={companion.subject}
              width={35}
              height={35}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="font-bold text-2xl">{companion.name}</p>
              <div className="subject-badge max-sm:hidden">{companion.subject}</div>
            </div>
            <p className="text-lg">{companion.topic}</p>
          </div>
        </div>
        <div className="items-start text-2xl max-md:hidden">
          {companion.duration} minutes
        </div>
      </article>

      <CompanionComponent
        {...companion}
        companionId={companion.id}
        userName={user.firstName}
        userImage={user.imageUrl}
      />
    </main>
  );
};

export default CompanionSessionLocalMode;
