import { type RouterOutputs } from "~/trpc/shared";
import { type ModalBaseProps } from "~/app/_constants/modals";

import { useCallback } from "react";
import * as yup from "yup";
import { useAppStore } from "~/lib/store";
import { api } from "~/trpc/react";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";

import { Controller, useForm } from "react-hook-form";

import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";

import { NumericFormat } from "react-number-format";

import EuroIcon from "@mui/icons-material/Euro";
import TitleIcon from "@mui/icons-material/Title";

const schema = yup
  .object({
    name: yup.string().required().max(500),
    price: yup.number().optional().min(0).max(1000000),
  })
  .required();

export type AddItemModalProps = ModalBaseProps & {
  listId: string;
  parentId?: string;
  item?: Omit<RouterOutputs["item"]["list"][0], "children">;
  onSuccess: () => void;
};

export default function ItemModal({
  id,
  listId,
  parentId,
  item,
  onSuccess,
}: AddItemModalProps) {
  const { closeModal } = useAppStore();

  const createItem = api.item.create.useMutation({
    onSuccess: () => {
      toast.success("Item added successfully");
      onSuccess();
      onClose();
    },
  });
  const updateItem = api.item.update.useMutation({
    onSuccess: () => {
      toast.success("Item updated successfully");
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
      name: item?.name ?? "",
      price: item?.price ?? undefined,
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = useCallback(
    async (data: yup.InferType<typeof schema>) => {
      if (item) {
        updateItem.mutate({ id: item.id, ...data });
      } else {
        createItem.mutate({
          listId: listId,
          name: data.name,
          parentId: parentId,
        });
      }
    },
    [createItem, listId, item, parentId]
  );

  const onClose = () => {
    reset();
    closeModal(id);
  };

  return (
    <Dialog open={true} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{item ? "Edit item" : "Add item to list"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon />
                      </InputAdornment>
                    ),
                  }}
                  autoFocus
                  placeholder="Name"
                  fullWidth
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <NumericFormat
                  {...field}
                  customInput={TextField}
                  allowNegative={false}
                  decimalScale={2}
                  fixedDecimalScale
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EuroIcon />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Price"
                  fullWidth
                  error={Boolean(errors.price)}
                  helperText={errors.price?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()}>Cancel</Button>
          <LoadingButton loading={createItem.isLoading} type="submit">
            {item ? "Save" : "Add"}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
