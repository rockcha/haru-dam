export const SECTION_DESCRIPTIONS = {
  schedules:
    "다가오는 일정이 가까운 순서대로 정렬되어 임박한 일정부터 확인할 수 있어요. 손으로 잡아서 넘기듯이 슬라이드하며 볼 수 있고, 일정 시간이 지나면 자동으로 삭제돼요.",

  bookmark:
    "유형을 새로 추가하고 즐겨찾기를 등록해서, 원하는 링크로 빠르게 이동할 수 있어요.",

  daily:
    "매일 반복해서 하는 루틴을 저장해두면, 매일 고정으로 자동 표시되어 편하게 관리할 수 있어요.",

  today:
    "오늘만 해야 하는 작업을 작성해서 관리할 수 있어요. 일정 시간이 지나면 자동으로 삭제돼요.",

  memo: "간단한 메모를 자유롭게 작성하고 가볍게 기록해둘 수 있어요.",

  music:
    "유튜브 링크를 등록해두면, 원하는 노래를 바로 틀어놓고 들을 수 있어요.",
} as const

export type SectionKey = keyof typeof SECTION_DESCRIPTIONS
