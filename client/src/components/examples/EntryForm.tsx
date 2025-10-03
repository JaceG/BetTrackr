import { useState } from "react";
import EntryForm from "../EntryForm";
import { Button } from "@/components/ui/button";

export default function EntryFormExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Form</Button>
      <EntryForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={(entry) => {
          console.log("Saved entry:", entry);
          setOpen(false);
        }}
      />
    </div>
  );
}
