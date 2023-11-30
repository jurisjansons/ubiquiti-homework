import { type RouterOutputs } from "~/trpc/shared";
import { MODALS } from "../_constants/modals";
import { grey } from "@mui/material/colors";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useAppStore } from "~/lib/store";
import { toast } from "react-toastify";

import {
  Checkbox,
  ListItem as MuiListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
  Stack,
  Menu,
  MenuItem,
  Divider,
  List,
  Tooltip,
  Typography,
} from "@mui/material";

import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import FunctionsIcon from "@mui/icons-material/Functions";

interface ListItemProps {
  listId: string;
  item:
    | RouterOutputs["item"]["list"][0]
    | RouterOutputs["item"]["list"][0]["children"][0];
  handleReload: () => void;
  editable?: boolean;
}

export default function ListItem({
  item,
  handleReload,
  editable,
  listId,
}: ListItemProps) {
  const { openModal } = useAppStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const sum =
    "children" in item
      ? item.children?.reduce((total, child) => {
          return total + (child.price ?? 0);
        }, 0)
      : 0;

  const deleteItem = api.item.delete.useMutation({
    onSuccess: () => {
      toast.success("Item deleted successfully");
      handleReload();
      handleClose();
    },
  });

  const toggleCompleted = api.item.toggleCompleted.useMutation({
    onSuccess: () => {
      toast.success("Item completed successfully");
      handleReload();
    },
  });
  const toggleStarred = api.item.toggleStarred.useMutation({
    onSuccess: () => {
      toast.success(
        item.userStarred.length
          ? "Item removed from favorites"
          : "Item added to favorites"
      );
      handleReload();
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return [
    <MuiListItem
      key={`item-${item.id}`}
      sx={{
        opacity: item.completed ? 0.5 : 1,
      }}
    >
      <ListItemIcon>
        <Checkbox
          edge="start"
          disabled={toggleCompleted.isLoading || !editable}
          checked={item.completed}
          onChange={() =>
            toggleCompleted.mutate({
              itemId: item.id,
            })
          }
        />
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{
          variant: "body1",
        }}
        secondaryTypographyProps={{
          variant: "caption",
          style: {
            fontSize: 10,
          },
        }}
        sx={{
          textDecoration: item.completed ? "line-through" : "none",
        }}
        primary={`${item.name}${item.price ? ` (${item.price}€)` : ""}`}
        secondary={listId === "starred" ? `List: ${item.list.name}` : undefined}
      />
      <Stack direction="row" spacing={1}>
        {!item.parentId && sum > 0 && (
          <Stack direction="row" alignItems="center">
            <FunctionsIcon fontSize="small" sx={{ color: grey[600] }} />
            <Typography color={grey[600]}>{sum.toFixed(2)}€</Typography>
          </Stack>
        )}
        <IconButton
          disabled={
            toggleStarred.isLoading || (!editable && !item.userStarred.length)
          }
          onClick={() =>
            toggleStarred.mutate({
              itemId: item.id,
            })
          }
        >
          <Tooltip
            title={
              item.userStarred.length
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            {toggleStarred.isLoading ? (
              <CircularProgress size={20} />
            ) : item.userStarred.length ? (
              <StarIcon />
            ) : (
              <StarBorderIcon />
            )}
          </Tooltip>
        </IconButton>
        <IconButton disabled={!editable} onClick={handleClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="list-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {!item.parentId && (
            <MenuItem
              disabled={listId === "starred"}
              onClick={() => {
                openModal({
                  type: MODALS.ITEM,
                  listId: item.listId,
                  onSuccess: () => {
                    handleReload();
                  },
                  parentId: item.id,
                });
                handleClose();
              }}
            >
              <ListItemIcon>
                <SubdirectoryArrowRightIcon />
              </ListItemIcon>
              <ListItemText>Add subitem</ListItemText>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              openModal({
                type: MODALS.ITEM,
                listId: item.listId,
                onSuccess: () => {
                  handleReload();
                },
                item,
              });
              handleClose();
            }}
          >
            <ListItemIcon>
              <DriveFileRenameOutlineIcon />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              openModal({
                type: MODALS.APPROVE,
                title: "Delete item",
                text: "Are you sure you want to delete this item?",
                onApprove: () => {
                  deleteItem.mutate({ itemId: item.id });
                },
              });
            }}
            disabled={deleteItem.isLoading}
          >
            <ListItemIcon>
              {deleteItem.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <DeleteIcon />
              )}
            </ListItemIcon>
            <ListItemText>Delete item</ListItemText>
          </MenuItem>
        </Menu>
      </Stack>
    </MuiListItem>,
    <List key={`children-${item.id}`} disablePadding sx={{ pl: 4 }}>
      {"children" in item &&
        item.children?.map((child) => (
          <ListItem
            key={child.id}
            listId={listId}
            editable={editable}
            item={child}
            handleReload={() => handleReload()}
          />
        ))}
    </List>,
  ];
}
