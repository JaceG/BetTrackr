import { useState } from "react";
import ConfirmDialog from "../ConfirmDialog";
import { Button } from "@/components/ui/button";

export default function ConfirmDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)} variant="destructive">
        Delete All
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          console.log("Confirmed delete");
          setOpen(false);
        }}
        title="Clear All Entries?"
        description="This will permanently delete all your betting entries. This action cannot be undone."
      />
    </div>
  );
}
