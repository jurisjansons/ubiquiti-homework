import { type RouterOutputs } from "~/trpc/shared";
import { type ModalBaseProps } from "~/app/_constants/modals";

import { useCallback } from "react";
import { api } from "~/trpc/react";
import { useAppStore } from "~/lib/store";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";

import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

const schema = yup
  .object({
    name: yup.string().required().max(300),
  })
  .required();

export type CreateListModalProps = ModalBaseProps & {
  list?: RouterOutputs["list"]["list"][0];
  onSuccess: () => void;
};

export default function ListModal({
  id,
  onSuccess,
  list,
}: CreateListModalProps) {
  const { closeModal } = useAppStore();

  const createList = api.list.create.useMutation({
    onSuccess: () => {
      toast.success("List created successfully");
      onSuccess();
      onClose();
    },
  });
  const updateList = api.list.update.useMutation({
    onSuccess: () => {
      toast.success("List updated successfully");
      onSuccess();
      onClose();
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: list?.name ?? "",
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = useCallback(
    async (data: yup.InferType<typeof schema>) => {
      if (list) {
        updateList.mutate({ id: list.id, ...data });
      } else {
        createList.mutate(data);
      }
    },
    [list]
  );

  const onClose = () => {
    reset();
    closeModal(id);
  };

  return (
    <Dialog open={true} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{list ? "Edit list" : "Create a new list"}</DialogTitle>
        <DialogContent>
          <Stack>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  placeholder="Name"
                  fullWidth
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()}>Cancel</Button>
          <LoadingButton loading={createList.isLoading} type="submit">
            {list ? "Save" : "Create"}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
