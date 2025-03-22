export interface MenstruationDay {
  date: string;
  type?: 'BLEEDING' | 'FERTILITY' | 'OVULATION';
  note?: string;
}

export interface MenstruationState {
  menstrationDays: MenstruationDay[];
}

export interface ProfileInfo {
  firstName: string;
  // Add other profile fields as needed
}

export interface ProfileState {
  profileInfo: ProfileInfo;
}

export interface Insight {
  _id: string;
  title: string;
  content: string;
}

export interface InsightsState {
  insights: Insight[];
}

export interface RootState {
  menstruation: MenstruationState;
  profile: ProfileState;
  insights: InsightsState;
}
