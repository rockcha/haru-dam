import DailyTaskSection from "@/components/DailyTasksSection"
import TodayTaskSection from "@/components/TodayTaskSection"
import { UpcomingSchedules } from "@/components/UpcomingSchedules"
import BookmarkSection from "@/components/BookmarkSection"
import MusicSection from "@/components/MusicSection"
import MemoSection from "@/components/MemoSection"
export function Home() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <section>
        <UpcomingSchedules />
      </section>
      <section>
        <BookmarkSection />
      </section>
      <section className="flex flex-col gap-2 md:flex-row">
        <DailyTaskSection />
        <TodayTaskSection />
      </section>
      <section className="flex flex-col gap-2 md:flex-row">
        <MusicSection />
        <MemoSection />
      </section>
    </div>
  )
}

export default Home
