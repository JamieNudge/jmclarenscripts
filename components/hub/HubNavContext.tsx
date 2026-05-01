'use client';

import { createContext, useContext, type ReactNode } from 'react';

const GoalLabHubContext = createContext(false);

export function HubNavProvider({
  isGoalLabHub,
  children,
}: {
  isGoalLabHub: boolean;
  children: ReactNode;
}) {
  return <GoalLabHubContext.Provider value={isGoalLabHub}>{children}</GoalLabHubContext.Provider>;
}

/** True when the request Host is a GoalLab hub domain (see middleware `x-goal-lab-hub`). */
export function useGoalLabHubNav() {
  return useContext(GoalLabHubContext);
}
