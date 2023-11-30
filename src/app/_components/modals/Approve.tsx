import { type ModalBaseProps } from "~/app/_constants/modals";

import { useAppStore } from "~/lib/store";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export type AproveModalProps = ModalBaseProps & {
  title: string;
  text: string;
  onApprove: () => void;
};

export default function ApproveModal({
  id,
  title,
  text,
  onApprove,
}: AproveModalProps) {
  const { closeModal } = useAppStore();

  const onClose = () => {
    closeModal(id);
  };

  return (
    <Dialog open={true} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onApprove();
            onClose();
          }}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
