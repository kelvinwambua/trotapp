import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useConvexFileUpload = () => {
  const generateUploadUrl = useMutation(api.file.generateUploadUrl);
  
  const uploadFile = async (uploadUrl: string, file: Blob) => {
    const result = await fetch(uploadUrl, {
      method: "POST",
      body: file,
    });
    
    if (!result.ok) {
      throw new Error(`Failed to upload file: ${result.statusText}`);
    }
    
    const { storageId } = await result.json();
    return storageId;
  };
  
  return {
    generateUploadUrl,
    uploadFile,
  };
};