import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useRef } from "react";

export function useImageUpload() {
  const generateUploadUrl = useMutation(
    api.functions.storage.generateUploadUrl
  );
  const removeFile = useMutation(api.functions.storage.remove);
  const [storageId, setStorageId] = useState<Id<"_storage">>();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    inputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPreviewUrl(URL.createObjectURL(file));
    const url = await generateUploadUrl();
    const response = await fetch(url, {
      method: "POST",
      body: file,
    });
    const { storageId } = (await response.json()) as {
      storageId: Id<"_storage">;
    };
    setStorageId(storageId);
    setUploading(false);
  };

  const remove = async () => {
    if (storageId) {
      await removeFile({ storageId });
    }
    clear();
  };

  const clear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setStorageId(undefined);
    setPreviewUrl(undefined);
  };

  return {
    inputProps: {
      type: "file",
      className: "hidden",
      ref: inputRef,
      onChange: handleImageChange,
    },
    open,
    remove,
    clear,
    uploading,
    previewUrl,
    storageId,
  };
}
