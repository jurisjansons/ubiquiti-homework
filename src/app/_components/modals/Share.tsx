import { type ModalBaseProps } from "~/app/_constants/modals";

import { useCallback } from "react";
import * as yup from "yup";
import { useAppStore } from "~/lib/store";
import { api } from "~/trpc/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";

import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

const schema = yup
  .object({
    userId: yup.string().required(),
  })
  .required();

export type ShareModalProps = ModalBaseProps & {
  listId: string;
};

export default function ShareModal({ id, listId }: ShareModalProps) {
  const { closeModal } = useAppStore();

  const getSharedUsers = api.share.list.useQuery({ listId: listId });
  const getSharableUsers = api.share.usersList.useQuery({ listId: listId });
  const createShare = api.share.create.useMutation({
    onSuccess: () => {
      reset();
      void getSharedUsers.refetch();
      void getSharableUsers.refetch();
    },
  });
  const deleteShare = api.share.delete.useMutation({
    onSuccess: () => {
      void getSharedUsers.refetch();
      void getSharableUsers.refetch();
    },
  });
  const updateShare = api.share.update.useMutation({
    onSuccess: () => {
      void getSharedUsers.refetch();
    },
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      userId: "",
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = useCallback(
    async (data: yup.InferType<typeof schema>) => {
      createShare.mutate({ listId: listId, userId: data.userId });
    },
    [listId]
  );

  const onClose = () => {
    reset();
    closeModal(id);
  };

  return (
    <Dialog open={true} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Share list</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <List>
              {getSharedUsers.data?.map((share) => (
                <ListItem
                  key={share.id}
                  disableGutters
                  secondaryAction={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FormControl size="small" variant="filled" hiddenLabel>
                        <Select
                          disableUnderline
                          value={share.type}
                          sx={{
                            borderRadius: 1,
                          }}
                          disabled={
                            updateShare.isLoading &&
                            updateShare.variables?.shareId === share.id
                          }
                          onChange={(event) => {
                            updateShare.mutate({
                              shareId: share.id,
                              type: event.target.value as "READ" | "WRITE",
                            });
                          }}
                        >
                          <MenuItem value="READ">Read</MenuItem>
                          <MenuItem value="WRITE">Write</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton
                        onClick={() =>
                          deleteShare.mutate({
                            shareId: share.id,
                          })
                        }
                      >
                        {deleteShare.isLoading &&
                        deleteShare.variables?.shareId === share.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      alt={share.user.name ?? ""}
                      src={share.user.image ?? ""}
                    />
                  </ListItemAvatar>
                  <ListItemText>
                    {share.user.name ?? share.user.email}
                  </ListItemText>
                </ListItem>
              ))}
            </List>
            <Stack direction="row" spacing={1}>
              <Controller
                name="userId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    id="combo-box-demo"
                    options={getSharableUsers.data ?? []}
                    loading={getSharableUsers.isLoading}
                    fullWidth
                    getOptionLabel={(option) =>
                      option.name ?? option.email ?? ""
                    }
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            alt={option.name ?? ""}
                            src={option.image ?? ""}
                          />
                          <Typography variant="body2">
                            {option.name ?? option.email}
                          </Typography>
                        </Stack>
                      </li>
                    )}
                    value={
                      getSharableUsers.data?.find(
                        (user) => user.id === field.value
                      ) ?? null
                    }
                    onChange={(event, value) => {
                      field.onChange(value?.id);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="User" />
                    )}
                  />
                )}
              />
              <LoadingButton
                loading={createShare.isLoading}
                variant="contained"
                type="submit"
              >
                Add
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()}>Close</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
