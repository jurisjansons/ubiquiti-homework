import { type RouterOutputs } from "~/trpc/shared";

import { useSession } from "next-auth/react";

import { List } from "@mui/material";
import ListItem from "./Item";

interface SortableListProps {
  listId: string;
  items: RouterOutputs["item"]["list"];
  handleReload(): void;
}

export default function TaskList({
  items,
  handleReload,
  listId,
}: SortableListProps) {
  const session = useSession();

  return (
    <List dense>
      {items.map((item) => (
        <ListItem
          key={item.id}
          listId={listId}
          editable={
            item.list.userId === session.data?.user?.id ||
            item.list.shares.find(
              (share) => share.userId === session.data?.user?.id
            )?.type === "WRITE"
          }
          item={item}
          handleReload={handleReload}
        />
      ))}
    </List>
  );
}
