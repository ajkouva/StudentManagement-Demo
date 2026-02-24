import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
