"use client";
import { removeBookmark } from "@/lib/actions/companion.actions";
import { addBookmark } from "@/lib/actions/companion.actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { isLocalStorageMode } from "@/lib/data-mode";
import {
  addBrowserBookmark,
  removeBrowserBookmark,
} from "@/lib/browser-local-db";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked: boolean;
}

const cardColorClassByHex: Record<string, string> = {
  "#E5D0FF": "bg-[#E5D0FF]",
  "#FFDA6E": "bg-[#FFDA6E]",
  "#BDE7FF": "bg-[#BDE7FF]",
  "#FFC8E4": "bg-[#FFC8E4]",
  "#FFECC8": "bg-[#FFECC8]",
  "#C8FFDF": "bg-[#C8FFDF]",
};

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked,
}: CompanionCardProps) => {
  const pathname = usePathname();
  const cardColorClass = cardColorClassByHex[color] ?? "bg-card";
  const { userId } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);

  useEffect(() => {
    setIsBookmarked(bookmarked);
  }, [bookmarked]);

  const handleBookmark = async () => {
    if (isLocalStorageMode) {
      if (!userId) return;

      if (isBookmarked) {
        removeBrowserBookmark(id, userId);
        setIsBookmarked(false);
      } else {
        addBrowserBookmark(id, userId);
        setIsBookmarked(true);
      }

      return;
    }

    if (isBookmarked) {
      await removeBookmark(id, pathname);
    } else {
      await addBookmark(id, pathname);
    }
  };
  return (
    <article className={`companion-card text-black ${cardColorClass}`}>
      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject}</div>
        <button
          className="companion-bookmark"
          onClick={handleBookmark}
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <Image
            src={
              isBookmarked
                ? "/icons/bookmark-filled.svg"
                : "/icons/bookmark.svg"
            }
            alt="bookmark"
            width={12.5}
            height={15}
          />
        </button>
      </div>

      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>
      <div className="flex items-center gap-2">
        <Image
          src="/icons/clock.svg"
          alt="duration"
          width={13.5}
          height={13.5}
        />
        <p className="text-sm">{duration} minutes</p>
      </div>

      <Link href={`/companions/${id}`} className="w-full">
        <button className="btn-primary w-full justify-center">
          Launch Lesson
        </button>
      </Link>
    </article>
  );
};

export default CompanionCard;
