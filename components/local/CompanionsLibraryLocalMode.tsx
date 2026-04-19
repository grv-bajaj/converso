"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CompanionCard from "@/components/CompanionCard";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import { getBrowserAllCompanions } from "@/lib/browser-local-db";
import { getSubjectColor } from "@/lib/utils";

const CompanionsLibraryLocalMode = () => {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject") ?? "";
  const topic = searchParams.get("topic") ?? "";

  const [companions, setCompanions] = useState<any[]>([]);

  useEffect(() => {
    setCompanions(
      getBrowserAllCompanions(
        { subject, topic, limit: 100, page: 1 },
        userId ?? undefined,
      ),
    );
  }, [subject, topic, userId]);

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

      <section className="companions-grid">
        {companions.map((companion) => (
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

export default CompanionsLibraryLocalMode;
