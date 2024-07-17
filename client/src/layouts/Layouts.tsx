import { ReactNode } from "react";
import HomeFooterNav from "../components/HomeFooterNav";

export function MainLayout({
  children,
  messageCount,
  active,
}: {
  children: ReactNode;
  active?: string;
  messageCount?: number;
}) {
  return (
    <div className="bg-gradient-2">
      {children}
      <HomeFooterNav messageCount={messageCount} active={active} />
    </div>
  );
}
