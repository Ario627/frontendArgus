import { useMutation } from "@tanstack/react-query";
import { uploadPhoto } from "@/features/photo/api/photo.api";

export function useUploadPhoto() {
  return useMutation({ mutationFn: uploadPhoto });
}
