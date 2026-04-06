import DailyTaskSection from "@/components/DailyTasksSection"
import TodayTaskSection from "@/components/TodayTaskSection"
import { UpcomingSchedules } from "@/components/UpcomingSchedules"
import BookmarkSection from "@/components/BookmarkSection"
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
      <section className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-2">
          <DailyTaskSection />
          <MemoSection />
        </div>

        <div className="flex flex-col gap-2">
          <TodayTaskSection />
        </div>
      </section>
    </div>
  )
}

export default Home
