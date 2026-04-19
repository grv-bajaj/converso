"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import {
  getBrowserAllCompanions,
  getBrowserRecentSessions,
} from "@/lib/browser-local-db";
import { getSubjectColor } from "@/lib/utils";

const HomeLocalMode = () => {
  const { userId } = useAuth();
  const [companions, setCompanions] = useState<any[]>([]);
  const [recentSessionsCompanions, setRecentSessionsCompanions] = useState<any[]>(
    [],
  );

  useEffect(() => {
    setCompanions(getBrowserAllCompanions({ limit: 3 }, userId ?? undefined));
    setRecentSessionsCompanions(
      getBrowserRecentSessions(10, userId ?? undefined),
    );
  }, [userId]);

  return (
    <main>
      <h1>Popular Companions</h1>

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
          companions={recentSessionsCompanions as Companion[]}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
};

export default HomeLocalMode;
