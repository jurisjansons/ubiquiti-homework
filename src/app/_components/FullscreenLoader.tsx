import { CircularProgress, Stack } from "@mui/material";

export default function FullscreenLoader() {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
      style={{
        height: "100vh",
      }}
    >
      <CircularProgress />
    </Stack>
  );
}
