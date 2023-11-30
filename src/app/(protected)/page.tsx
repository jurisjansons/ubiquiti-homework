"use client";

import { type RouterOutputs } from "~/trpc/shared";
import { MODALS } from "../_constants/modals";

import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { useAppStore } from "~/lib/store";
import { toast } from "react-toastify";

import Image from "next/image";
import {
  Box,
  Tabs,
  Tab,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fab,
  Divider,
  Typography,
  Toolbar,
} from "@mui/material";

import Header from "../_components/Header";
import LoadingListItemIcon from "../_components/LoadingListItemIcon";
import List from "../_components/List";

import StarIcon from "@mui/icons-material/Star";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import ShareIcon from "@mui/icons-material/Share";

export default function Lists() {
  const { openModal } = useAppStore();
  const session = useSession();

  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedListId, setSelectedListId] = useState("starred");
  const [selectedList, setSelectedList] =
    useState<RouterOutputs["list"]["list"][0]>();

  const getLists = api.list.list.useQuery();
  const getItems = api.item.list.useQuery({
    listId: selectedListId,
    showCompleted: showCompleted,
  });
  const deleteList = api.list.delete.useMutation({
    onSuccess: () => {
      toast.success("List deleted successfully");
      setSelectedListId("starred");
      handleCloseMenu();
      void getLists.refetch();
    },
  });

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedListId(newValue);
  };

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  useEffect(() => {
    if (selectedListId !== "starred") {
      setSelectedList(
        getLists.data?.find((list) => list.id === selectedListId)
      );
    } else {
      setSelectedList(undefined);
    }
  }, [selectedListId, getLists.data]);

  return (
    <>
      <Header />
      <Stack sx={{ p: 3 }}>
        <Toolbar />
        <Stack
          sx={{ borderBottom: 1, borderColor: "divider" }}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Tabs value={selectedListId} onChange={handleChange}>
            <Tab icon={<StarIcon />} value="starred" />
            {getLists.data?.map((list) => {
              return (
                <Tab
                  key={list.id}
                  label={
                    <Stack direction="row" spacing={1}>
                      {list.shares.find(
                        (share) => share.userId === session.data?.user?.id
                      ) && <ShareIcon fontSize="small" />}
                      <Typography>{list.name}</Typography>
                    </Stack>
                  }
                  value={list.id}
                />
              );
            })}
          </Tabs>
          <Box>
            <IconButton onClick={handleOpenMenu}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="list-menu"
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleCloseMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem
                onClick={() => {
                  openModal({
                    type: MODALS.LIST,
                    onSuccess: () => {
                      void getLists.refetch();
                    },
                  });
                  handleCloseMenu();
                }}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText>Create new list</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setShowCompleted((current) => !current);
                  handleCloseMenu();
                }}
              >
                <ListItemIcon>
                  {showCompleted ? (
                    <CheckBoxOutlineBlankIcon />
                  ) : (
                    <CheckBoxIcon />
                  )}
                </ListItemIcon>
                <ListItemText>
                  {showCompleted ? "Hide completed" : "Show completed"}
                </ListItemText>
              </MenuItem>

              <MenuItem
                disabled={
                  selectedListId === "starred" ||
                  Boolean(selectedList?.shares.length)
                }
                onClick={() => {
                  const list = getLists.data?.find(
                    (list) => list.id === selectedListId
                  );
                  openModal({
                    type: MODALS.LIST,
                    list: list,
                    onSuccess: () => {
                      void getLists.refetch();
                    },
                  });
                  handleCloseMenu();
                }}
              >
                <ListItemIcon>
                  <DriveFileRenameOutlineIcon />
                </ListItemIcon>
                <ListItemText>Rename list</ListItemText>
              </MenuItem>
              <MenuItem
                disabled={
                  selectedListId === "starred" ||
                  Boolean(selectedList?.shares.length)
                }
                onClick={() => {
                  openModal({
                    type: MODALS.SHARE,
                    listId: selectedListId,
                  });
                  handleCloseMenu();
                }}
              >
                <ListItemIcon>
                  <ShareIcon />
                </ListItemIcon>
                <ListItemText>Share list</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                disabled={
                  selectedListId === "starred" ||
                  Boolean(selectedList?.shares.length) ||
                  deleteList.isLoading
                }
                onClick={() => {
                  openModal({
                    type: MODALS.APPROVE,
                    title: "Delete list",
                    text: "Are you sure you want to delete this list? This action cannot be undone.",
                    onApprove: () => {
                      deleteList.mutate({ id: selectedListId });
                    },
                  });
                }}
              >
                <LoadingListItemIcon loading={deleteList.isLoading}>
                  <DeleteIcon />
                </LoadingListItemIcon>
                <ListItemText>Delete list</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Stack>

        {getItems.data && (
          <List
            key={selectedListId}
            listId={selectedListId}
            items={getItems.data}
            handleReload={() => {
              void getItems.refetch();
            }}
          />
        )}
        {getLists.data?.length === 0 && (
          <Stack alignItems="center">
            <Image
              width={800}
              height={350}
              src="/assets/void.svg"
              alt="No lists"
            />
            <Typography variant="h5">
              There are no item lists yet, create one!
            </Typography>
          </Stack>
        )}
      </Stack>

      <Fab
        color="primary"
        disabled={
          selectedListId === "starred" ||
          (selectedList?.userId !== session.data?.user?.id &&
            selectedList?.shares.find(
              (share) => share.userId === session.data?.user?.id
            )?.type !== "WRITE")
        }
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
        onClick={() => {
          openModal({
            type: MODALS.ITEM,
            listId: selectedListId,
            onSuccess: () => {
              void getItems.refetch();
            },
          });
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
}
