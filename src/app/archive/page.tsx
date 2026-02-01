import { ArchiveScreen } from "../../components/ArchiveScreen";
import { auth } from "@clerk/nextjs/server";

export default async function ArchivePage() {
    const { userID } = await auth();
    if (!userID) {
        redirect('/sign-in');
    }
    return <ArchiveScreen initialEntries={formattedEntries} />;
}
