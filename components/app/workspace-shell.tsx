import { AppShell } from "@/components/app/app-shell";
import type { Database } from "@/types/database";

type Gym = Database["public"]["Tables"]["gyms"]["Row"];

type WorkspaceShellProps = {
  children: React.ReactNode;
  ownerName: string;
  gym: Gym;
};

export function WorkspaceShell({ children, ownerName, gym }: WorkspaceShellProps) {
  return (
    <AppShell ownerName={ownerName} gymName={gym.name}>
      {children}
    </AppShell>
  );
}
