import {
  CircularProgress,
  ListItemIcon,
  type ListItemIconProps,
} from "@mui/material";

type LoadingListItemIconProps = {
  loading: boolean;
} & ListItemIconProps;

export default function LoadingListItemIcon({
  loading,
  ...props
}: LoadingListItemIconProps) {
  const { children, ...rest } = props;
  return (
    <ListItemIcon {...rest}>
      {loading ? <CircularProgress size={20} /> : children}
    </ListItemIcon>
  );
}
