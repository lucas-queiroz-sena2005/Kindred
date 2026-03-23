export interface KinUser {
  id: number;
  username: string;
  similarityScore: number;
}

export interface ConnectionStatus {
  status:
    | "connected"
    | "pending_from_user"
    | "pending_from_target"
    | "not_connected"
    | "blocked";
  am_i_blocker?: boolean;
}

/** Matches `kinService.compareKin` JSON (`segments` keys are feature names, not `*Score`). */
export interface CompareDetails {
  overallScore: number;
  segments: Record<"genre" | "decade" | "director", number>;
}
