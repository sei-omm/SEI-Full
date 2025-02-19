import React from "react";
import Input from "../Input";
import { AiOutlineDelete } from "react-icons/ai";

interface IProps {
  handleDeleteItem: () => void;
}

export default function AddMultiBookFormItem({ handleDeleteItem }: IProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="!min-w-6 pt-5">
        <AiOutlineDelete
          onClick={handleDeleteItem}
          className="cursor-pointer"
        />
      </div>
      <Input
        name="book_name"
        required
        title="Type Book Name"
        label="Book Name *"
        placeholder="Type Book Name"
      />
      <Input
        name="edition"
        required
        title="Type Book Edition / Vol"
        label="Edition / Vol *"
        placeholder="Type Edition or Vol"
      />
      <Input
        name="author"
        required
        title="Type Author Name"
        label="Author Name *"
        placeholder="Type Author Name"
      />
      <Input
        type="number"
        name="row_number"
        required
        title="Type Row Number"
        label="Row Number *"
        placeholder="Type Row Number"
      />
      <Input
        name="shelf"
        required
        title="Type Shelf"
        label="Shelf *"
        placeholder="Type Shelf"
      />
    </div>
  );
}
